'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";

export interface LeaderboardEntry {
  id: number;
  name: string;
  netWorth: number;
}

export interface StipendRecipient {
  userId: number;
  name: string;
  netWorth: number;
  stipend: number;
}

export interface PayStipendResult {
  recipients: StipendRecipient[];
  totalPaid: number;
}

export async function payStipends(input: {
  threshold: number;
  totalAmount: number;
  leaderboard: LeaderboardEntry[];
}): Promise<PayStipendResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.admin) throw new Error("Unauthorized");

  if (input.threshold <= 0) throw new Error("Threshold must be positive");
  if (input.totalAmount <= 0) throw new Error("Total amount must be positive");
  if (!input.leaderboard?.length) throw new Error("Leaderboard data is missing");

  const treasuryId = Number(process.env.TREASURY_ACCOUNT_ID);
  if (!treasuryId) throw new Error("Treasury account not configured");

  const qualifying = input.leaderboard.filter((u) => u.netWorth < input.threshold);

  if (qualifying.length === 0) {
    throw new Error("No users qualify for a stipend at that threshold.");
  }

  const n = qualifying.length;
  const totalParts = (n * (n + 1)) / 2;

  const recipients: StipendRecipient[] = qualifying.map((user, i) => {
    const parts = i + 1;
    const stipend = (parts / totalParts) * input.totalAmount;
    return { userId: user.id, name: user.name, netWorth: user.netWorth, stipend };
  });

  const totalPaid = recipients.reduce((s, r) => s + r.stipend, 0);

  await prisma.$transaction([
    ...recipients.map((r) =>
      prisma.user.update({
        where: { id: r.userId },
        data: { money: { increment: new Prisma.Decimal(r.stipend) } },
      })
    ),
    prisma.user.update({
      where: { id: treasuryId },
      data: { money: { decrement: new Prisma.Decimal(totalPaid) } },
    }),
  ]);

  revalidatePath("/leaderboard");
  revalidatePath("/");

  return { recipients, totalPaid };
}
