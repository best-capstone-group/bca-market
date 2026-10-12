'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/app/generated/prisma/client";
import { inngest } from "@/lib/inngest";

export type RequestResolutionInput = {
  marketId: number;
  requestType: 'RESOLVE' | 'REFUND';
  winningOutcomeId?: number;
  message?: string;
};

export async function requestMarketResolution(input: RequestResolutionInput): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);

  const market = await prisma.market.findUnique({
    where: { id: input.marketId },
    include: {
      outcomes: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  });

  if (!market) {
    throw new Error(`Market ${input.marketId} not found`);
  }

  if (market.creatorId !== userId && !session.user.admin) {
    throw new Error("Only the market requester can submit a resolution request");
  }

  const isClosed = market.status === 'CLOSED' || (market.status === 'OPEN' && new Date() >= new Date(market.closeTime));
  if (!isClosed) {
    throw new Error("Market must be closed before submitting a resolution request");
  }

  if (market.status === 'RESOLVED') {
    throw new Error("Market is already resolved");
  }

  let winningOutcomeName: string | undefined;

  if (input.requestType === 'RESOLVE') {
    if (!input.winningOutcomeId) {
      throw new Error("Winning outcome is required for resolution request");
    }
    const outcome = market.outcomes.find(o => o.id === input.winningOutcomeId);
    if (!outcome) {
      throw new Error("Winning outcome not found in market");
    }
    winningOutcomeName = outcome.name;
  }

  const trimmedMessage = input.message?.trim() || null;

  await prisma.market.update({
    where: { id: input.marketId },
    data: {
      resolutionRequestedAt: new Date(),
      resolutionRequestType: input.requestType,
      resolutionRequestOutcomeId: input.requestType === 'RESOLVE' ? input.winningOutcomeId : null,
      resolutionRequestMessage: trimmedMessage,
    }
  });

  const admins = await prisma.user.findMany({
    where: { admin: true },
    select: { id: true, email: true }
  });

  const creatorName = `${market.creator.firstName || ''} ${market.creator.lastName || ''}`.trim() || market.creator.email;

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        type: NotificationType.MARKET_REQUEST,
        title: `Resolution Request: ${market.title}`,
        body: `${creatorName} requested ${input.requestType === 'REFUND' ? 'a refund' : `resolution to "${winningOutcomeName}"`}.`
      }))
    });
  }

  try {
    await inngest.send({
      name: 'market/resolution-requested',
      data: {
        marketId: market.id,
        title: market.title,
        creatorId: market.creatorId,
        creatorName,
        requestType: input.requestType,
        winningOutcomeName,
        message: trimmedMessage || undefined,
      }
    });
  } catch (err) {
    console.error("Failed to send inngest event for resolution request:", err);
  }

  revalidatePath(`/markets/${input.marketId}`);
  revalidatePath("/");
}
