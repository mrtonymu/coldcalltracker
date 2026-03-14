"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCall, deleteCall } from "@/lib/actions";
import { Call } from "@/lib/supabase";
import OutcomeBadge from "@/components/OutcomeBadge";
import CallForm from "@/components/CallForm";

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const callsUrl = filter ? `/calls?filter=${encodeURIComponent(filter)}` : "/calls";
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCall(id)
      .then(setCall)
      .catch(() => setError("Failed to load call"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-rose-400">{error}</div>;
  }

  if (!call) {
    return <div className="text-zinc-500">Call not found</div>;
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDelete = async () => {
    if (!confirm("Delete this call?")) return;
    setDeleting(true);
    await deleteCall(call.id);
    router.push(callsUrl);
  };

  if (editing) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-zinc-400 hover:text-white text-sm mb-4 flex items-center gap-1"
        >
          ← Back to detail
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">Edit Call</h1>
        <CallForm
          call={call}
          onSaved={() => {
            router.push(callsUrl);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link href={callsUrl} className="text-zinc-400 hover:text-white text-sm mb-6 flex items-center gap-1">
        ← All Calls
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {call.contact_name}
            {call.attempt_count > 1 && (
              <span className="text-sm text-zinc-500 ml-2">
                ({call.attempt_count === 2 ? "2nd" : call.attempt_count === 3 ? "3rd" : `${call.attempt_count}th`})
              </span>
            )}
          </h1>
          {call.company && <p className="text-zinc-400 mt-0.5">{call.company}</p>}
          {call.phone && <p className="text-zinc-500 text-sm mt-0.5">{call.phone}</p>}
        </div>
        <OutcomeBadge outcome={call.outcome} />
      </div>

      {/* Details grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 mb-4">
        {call.called_at ? (
          <Row label="Called on" value={formatDate(call.called_at)} />
        ) : (
          <Row label="Status" value="Not yet called" />
        )}
        {call.outcome_updated_at && (
          <Row label="Outcome updated" value={formatDate(call.outcome_updated_at)} />
        )}
        {call.duration_seconds != null && (
          <Row label="Duration" value={formatDuration(call.duration_seconds)} />
        )}
        {call.follow_up_at && (
          <Row label="Follow-up" value={formatDate(call.follow_up_at)} highlight />
        )}
      </div>

      {/* Notes */}
      {call.notes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Notes</p>
          <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed">{call.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-zinc-800 hover:bg-rose-900 text-zinc-400 hover:text-rose-300 rounded-lg text-sm font-medium transition-colors"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className={`text-sm ${highlight ? "text-amber-400" : "text-zinc-300"}`}>{value}</span>
    </div>
  );
}
