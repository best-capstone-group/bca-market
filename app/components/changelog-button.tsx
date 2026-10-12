'use client';

import { Scroll } from 'lucide-react';

export default function ChangelogButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-changelog'));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="View changelog"
      title="View changelog"
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-600 shadow-sm transition hover:scale-105 hover:bg-zinc-100 cursor-pointer"
    >
      <Scroll className="h-5 w-5 text-zinc-500" />
    </button>
  );
}