"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCall, updateCall, deleteCall } from "@/lib/actions";
import { Call } from "@/lib/supabase";
import { mytLocalToISO, isoToMytLocal } from "@/lib/timezone";

const outcomes = [
  { value: "", label: "Select outcome..." },
  { value: "no_answer", label: "No Answer" },
  { value: "voicemail", label: "Voicemail" },
  { value: "not_interested", label: "Not Interested" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "callback", label: "Callback" },
  { value: "interested", label: "Interested" },
  { value: "closed", label: "Closed" },
];

type Prefill = {
  contact_name?: string;
  company?: string;
  phone?: string;
};

export default function CallForm({
  call,
  prefill,
  onSaved,
}: {
  call?: Call;
  prefill?: Prefill;
  onSaved?: (updated: Call) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    contact_name: call?.contact_name || prefill?.contact_name || "",
    company: call?.company || prefill?.company || "",
    phone: call?.phone || prefill?.phone || "",
    outcome: call?.outcome || "",
    notes: call?.notes || "",
    follow_up_at: call?.follow_up_at ? isoToMytLocal(call.follow_up_at) : "",
    duration_seconds: call?.duration_seconds ?? (null as number | null),
  });

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStopped, setTimerStopped] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleStartTimer = () => {
    setTimerRunning(true);
    setTimerStopped(false);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    setTimerStopped(true);
    setForm((f) => ({ ...f, duration_seconds: timerSeconds }));
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerStopped(false);
    setTimerSeconds(0);
    setForm((f) => ({ ...f, duration_seconds: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        contact_name: form.contact_name,
        company: form.company || null,
        phone: form.phone || null,
        outcome: (form.outcome || null) as Call["outcome"],
        notes: form.notes || null,
        follow_up_at: form.follow_up_at ? mytLocalToISO(form.follow_up_at) : null,
        duration_seconds: form.duration_seconds,
      };
      if (call) {
        const updated = await updateCall(call.id, data);
        if (onSaved) {
          onSaved(updated);
        } else {
          router.push("/calls");
          router.refresh();
        }
      } else {
        await createCall(data);
        router.push("/calls");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save call");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!call || !confirm("Delete this call?")) return;
    await deleteCall(call.id);
    router.push("/calls");
    router.refresh();
  };

  const inputClass =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {/* Call Timer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <label className="block text-sm font-medium text-zinc-400 mb-3">Call Timer</label>
        {!timerRunning && !timerStopped ? (
          <button
            type="button"
            onClick={handleStartTimer}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-lg transition-colors"
          >
            ▶ Start Timer
          </button>
        ) : timerRunning ? (
          <div className="flex items-center gap-4">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {formatTimer(timerSeconds)}
            </span>
            <button
              type="button"
              onClick={handleStopTimer}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors"
            >
              ⏹ Stop
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">
              {formatTimer(timerSeconds)}
            </span>
            <span className="text-xs text-zinc-500">recorded</span>
            <button
              type="button"
              onClick={handleResetTimer}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Contact Name *</label>
        <input
          autoFocus
          required
          type="text"
          placeholder="John Smith"
          className={inputClass}
          value={form.contact_name}
          onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Company</label>
          <input
            type="text"
            placeholder="Acme Corp"
            className={inputClass}
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Phone</label>
          <input
            type="tel"
            placeholder="+1 234 567 890"
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Outcome</label>
          <select
            title="Outcome"
            className={inputClass}
            value={form.outcome}
            onChange={(e) => setForm({ ...form, outcome: e.target.value })}
          >
            {outcomes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Follow-up Date & Time</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={form.follow_up_at}
            onChange={(e) => setForm({ ...form, follow_up_at: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Notes</label>
        <textarea
          rows={3}
          title="Notes"
          placeholder="Call notes..."
          className={inputClass}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : call ? "Update Call" : "Log Call"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        {call && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto px-5 py-2.5 bg-rose-900/50 hover:bg-rose-800 text-rose-300 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
