"use client";

import { useEffect } from "react";
import type { MotivationMessage } from "@/lib/motivationContent";

interface Props {
  content: MotivationMessage;
  onDismiss: () => void;
}

export default function MotivationToast({ content, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{content.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            {content.title}
          </p>
          <p className="text-sm text-zinc-200 leading-relaxed">{content.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0 mt-0.5"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
