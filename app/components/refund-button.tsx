'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Market } from "../generated/prisma/browser";
import { refundMarket } from '@/app/actions/refundMarket';
import { requestMarketResolution } from "@/app/actions/requestMarketResolution";

import styles from './animations.module.css'

export default function RefundButton({
    market,
    isRequest = false,
    initialMessage = "",
}: {
    market: Market;
    isRequest?: boolean;
    initialMessage?: string;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState(initialMessage);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (isRequest) {
                await requestMarketResolution({
                    marketId: market.id,
                    requestType: 'REFUND',
                    message: message.trim() || undefined,
                });
                setOpen(false);
                router.refresh();
            } else {
                await refundMarket(market, message.trim() || undefined);
                setOpen(false);
                router.refresh();
                router.push("/");
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                className={`rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 cursor-pointer ${styles.pulseGlowOrange}`}
                onClick={() => {
                    setMessage(initialMessage || "");
                    setError(null);
                    setOpen(true);
                }}
            >
                {isRequest ? "Request Refund" : "Refund"}
            </button>

            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
                        <h2 className="text-xl text-zinc-950 font-semibold mb-2">
                            {isRequest ? "Request Market Refund" : "Confirm Refund"}
                        </h2>
                        <p className="text-zinc-600 mb-4 text-sm">
                            {isRequest && "Request admins to refund all money."}
                        </p>

                        <div className="mb-6">
                            <label className="mb-1 block text-sm font-medium text-zinc-700">
                                Message (Optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                className="min-h-20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 text-sm"
                            />
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-sm text-rose-700">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                className="rounded-lg bg-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-300 cursor-pointer"
                                onClick={() => {
                                    setOpen(false);
                                    setMessage("");
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                                onClick={handleConfirm}
                            >
                                {isSubmitting
                                    ? isRequest
                                        ? "Submitting..."
                                        : "Refunding..."
                                    : isRequest
                                        ? "Request Refund"
                                        : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}