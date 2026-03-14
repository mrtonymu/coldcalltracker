"use client";

import type { MotivationMessage, BadgeConfig } from "@/lib/motivationContent";

interface Props {
  content: MotivationMessage;
  badge?: BadgeConfig;
  onDismiss: () => void;
}

export default function MotivationModal({ content, badge, onDismiss }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {badge ? (
          <>
            <div className="text-6xl mb-4">{badge.emoji}</div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-900/40 border border-emerald-700/50 rounded-full px-3 py-1 mb-3">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                成就解锁
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{badge.name}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">{badge.description}</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">{content.emoji}</div>
            <h2 className="text-lg font-bold text-white mb-2">{content.title}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">{content.message}</p>
          </>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
        >
          继续打电话
        </button>
      </div>
    </div>
  );
}
