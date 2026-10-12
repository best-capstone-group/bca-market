'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { payStipends, LeaderboardEntry, StipendRecipient } from "@/app/actions/payStipends";
import { X } from "lucide-react";

type Step = 'form' | 'done';

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StipendButton({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');

  const [threshold, setThreshold] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const [preview, setPreview] = useState<StipendRecipient[] | null>(null);
  const [totalPaid, setTotalPaid] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setStep('form');
    setThreshold("");
    setTotalAmount("");
    setPreview(null);
    setTotalPaid(null);
    setError(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handlePay = async () => {
    const thresholdNum = parseFloat(threshold);
    const totalAmountNum = parseFloat(totalAmount);

    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      setError("Please enter a valid positive threshold.");
      return;
    }
    if (isNaN(totalAmountNum) || totalAmountNum <= 0) {
      setError("Please enter a valid positive total amount.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await payStipends({
        threshold: thresholdNum,
        totalAmount: totalAmountNum,
        leaderboard,
      });
      setPreview(result.recipients);
      setTotalPaid(result.totalPaid);
      setStep('done');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors cursor-pointer"
      >
        Pay Stipends
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between p-6 pb-4">
              <h2 className="text-lg font-semibold text-zinc-900">Pay Stipends</h2>
              <button
                onClick={handleClose}
                className="ml-4 shrink-0 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X className="h-4 w-4 cursor-pointer" />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col gap-4">
              {step === 'form' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Net worth threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Total amount to distribute
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5 text-sm text-rose-700">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePay}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isSubmitting ? "Paying..." : "Confirm"}
                    </button>
                  </div>
                </>
              )}

              {step === 'done' && preview && (
                <>
                  <div className="bg-violet-50 border border-violet-100 px-4 py-3 text-sm text-violet-800 flex justify-between">
                    <span className="font-medium">Total paid</span>
                    <span className="tabular-nums font-semibold">{fmt(totalPaid ?? 0)}</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-zinc-100 divide-y divide-zinc-100 text-sm">
                    {preview.map((r) => (
                      <div key={r.userId} className="flex items-center justify-between px-3 py-2">
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 truncate">{r.name}</p>
                          <p className="text-xs text-zinc-400 tabular-nums">
                            net worth: {fmt(r.netWorth)}
                          </p>
                        </div>
                        <span className="ml-4 shrink-0 font-semibold text-violet-700 tabular-nums">
                          +{fmt(r.stipend)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleClose}
                    className="rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
