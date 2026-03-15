"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

type ActiveCall = {
  callId: string;
  contactName: string;
  startTime: number; // Date.now() when call started
};

type ActiveCallContextType = {
  activeCall: ActiveCall | null;
  startCall: (callId: string, contactName: string) => void;
  stopCall: () => void;
};

const ActiveCallContext = createContext<ActiveCallContextType | null>(null);

export function ActiveCallProvider({ children }: { children: ReactNode }) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const router = useRouter();

  const startCall = useCallback((callId: string, contactName: string) => {
    setActiveCall({ callId, contactName, startTime: Date.now() });
  }, []);

  const stopCall = useCallback(() => {
    if (!activeCall) return;
    const duration = Math.round((Date.now() - activeCall.startTime) / 1000);
    const callId = activeCall.callId;
    setActiveCall(null);
    router.push(`/calls/${callId}?duration=${duration}`);
  }, [activeCall, router]);

  return (
    <ActiveCallContext.Provider value={{ activeCall, startCall, stopCall }}>
      {children}
    </ActiveCallContext.Provider>
  );
}

export function useActiveCall() {
  const context = useContext(ActiveCallContext);
  if (!context) throw new Error("useActiveCall must be used within ActiveCallProvider");
  return context;
}
