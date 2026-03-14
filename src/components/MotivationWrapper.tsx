"use client";

import { useMotivation } from "@/hooks/useMotivation";
import MotivationToast from "./MotivationToast";
import MotivationModal from "./MotivationModal";

export default function MotivationWrapper() {
  const { toast, modal, dismiss } = useMotivation();

  return (
    <>
      {toast && <MotivationToast content={toast.content} onDismiss={dismiss} />}
      {modal && <MotivationModal content={modal.content} badge={modal.badge} onDismiss={dismiss} />}
    </>
  );
}
