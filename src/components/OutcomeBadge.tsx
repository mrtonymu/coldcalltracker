import { memo } from "react";

const colors: Record<string, string> = {
  no_answer: "bg-zinc-700 text-zinc-300",
  voicemail: "bg-blue-900 text-blue-300",
  callback: "bg-amber-900 text-amber-300",
  interested: "bg-emerald-900 text-emerald-300",
  not_interested: "bg-rose-900 text-rose-300",
  closed: "bg-purple-900 text-purple-300",
  whatsapp: "bg-green-900 text-green-300",
};

const labels: Record<string, string> = {
  no_answer: "No Answer",
  voicemail: "Voicemail",
  callback: "Callback",
  interested: "Interested",
  not_interested: "Not Interested",
  closed: "Closed",
  whatsapp: "WhatsApp",
};

function OutcomeBadge({ outcome }: { outcome: string | null }) {
  if (!outcome) return <span className="text-zinc-500 text-sm">—</span>;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[outcome] || "bg-zinc-700 text-zinc-300"}`}>
      {labels[outcome] || outcome}
    </span>
  );
}

export default memo(OutcomeBadge);
