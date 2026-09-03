'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'banner_dismissed';

export default function UpdateBanner() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => {
      setShouldRender(false);
    }, 400);
  };

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-zinc-950/25 backdrop-blur-xs transition-opacity duration-400 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      />

      <div className="fixed top-4 sm:top-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-2xl rounded-lg border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-2xl transition-all duration-500 ease-out ${isOpen
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-20 opacity-0 scale-95'
            }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                  Welcome to BCA Market!
                </h2>
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-zinc-600">
                  Welcome to the 2026-2027 school year! If you have any questions, need assistance, 
                  or would like to report a concern regarding a market, 
                  please feel free to contact us at <a href="mailto:bcamarketsupport@gmail.com" className="text-blue-600 hover:underline">bcamarketsupport@gmail.com</a>. 
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              type="button"
              aria-label="Dismiss message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              <X className="h-5 w-5 cursor-pointer" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={handleDismiss}
              type="button"
              className="rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
