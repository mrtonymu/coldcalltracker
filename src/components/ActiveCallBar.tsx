"use client";

import { useEffect, useState } from "react";
import { useActiveCall } from "@/contexts/ActiveCallContext";
import { PhoneOff } from "lucide-react";

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ActiveCallBar() {
  const { activeCall, stopCall } = useActiveCall();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeCall) {
      setElapsed(0);
      return;
    }

    const update = () => setElapsed(Math.round((Date.now() - activeCall.startTime) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeCall]);

  if (!activeCall) return null;

  return (
    <div className="fixed bottom-14 sm:bottom-0 left-0 right-0 z-50 bg-emerald-600 text-white px-4 py-3 sm:safe-area-bottom">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <span className="font-medium truncate">{activeCall.contactName}</span>
          <span className="font-mono text-emerald-100 tabular-nums">{formatTimer(elapsed)}</span>
        </div>
        <button
          onClick={stopCall}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors shrink-0 min-h-[44px]"
        >
          <PhoneOff className="w-4 h-4" />
          Stop & Log
        </button>
      </div>
    </div>
  );
}
