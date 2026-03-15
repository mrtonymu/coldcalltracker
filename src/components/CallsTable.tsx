"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getCalls } from "@/lib/actions";
import { Call } from "@/lib/supabase";
import OutcomeBadge from "./OutcomeBadge";
import { formatMYT } from "@/lib/timezone";
import { ClipboardList, CheckCircle, RefreshCw, CheckCheck, Phone } from "lucide-react";
import { useActiveCall } from "@/contexts/ActiveCallContext";

const outcomeFilters = [
  { value: "", label: "All" },
  { value: "no_answer", label: "No Answer" },
  { value: "voicemail", label: "Voicemail" },
  { value: "not_interested", label: "Not Interested" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "callback", label: "Callback" },
  { value: "interested", label: "Interested" },
  { value: "closed", label: "Closed" },
  { value: "no_answer,voicemail", label: "Retry" },
];

function formatAttempt(count: number) {
  if (count <= 1) return null;
  if (count === 2) return "2nd";
  if (count === 3) return "3rd";
  return `${count}th`;
}

function isOverdue(isoStr: string) {
  return new Date(isoStr) < new Date();
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function CallsTable({
  limit,
  initialFollowUpFilter,
}: {
  limit?: number;
  initialFollowUpFilter?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [calls, setCalls] = useState<Call[]>([]);
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState(searchParams.get("filter") || "");
  const [over1Min, setOver1Min] = useState(false);
  const [followUpFilter, setFollowUpFilter] = useState(initialFollowUpFilter ?? false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const hasActiveFilters = search || outcomeFilter || over1Min || followUpFilter;

  const clearFilters = () => {
    setSearch("");
    setOutcomeFilter("");
    setOver1Min(false);
    setFollowUpFilter(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      getCalls(
        search || undefined,
        outcomeFilter || undefined,
        over1Min ? 60 : undefined,
        !!limit,
        followUpFilter || undefined,
        limit || undefined
      )
        .then((data) => setCalls(data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, outcomeFilter, over1Min, followUpFilter, limit, pathname]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search contacts, companies, phones..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 sm:py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-1.5 flex-wrap items-center">
            {outcomeFilters.map((f) => (
              <button
                type="button"
                key={f.value}
                onClick={() => setOutcomeFilter(f.value)}
                className={`px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
                  outcomeFilter === f.value
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOver1Min((v) => !v)}
              aria-label="Filter calls longer than 1 minute"
              className={`px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
                over1Min
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              ⏱ &gt;1 min
            </button>
            <button
              type="button"
              onClick={() => setFollowUpFilter((v) => !v)}
              aria-label="Filter today's follow-ups"
              className={`px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
                followUpFilter
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              ⏰ Follow-ups
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-white transition-colors"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : calls.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No calls found</p>
          <Link href="/calls/new" className="text-emerald-500 hover:text-emerald-400 text-sm mt-1 inline-block">
            Log your first call →
          </Link>
        </div>
      ) : limit ? (
        // Dashboard: flat list (recent calls)
        <CallRows calls={calls} router={router} formatDate={formatDate} outcomeFilter={outcomeFilter} showPhone />
      ) : outcomeFilter === "no_answer,voicemail" ? (
        // Retry view: split into needs retry / already retried
        (() => {
          const needsRetry = calls
            .filter((c) => c.attempt_count <= 1)
            .sort((a, b) => new Date(b.called_at || b.created_at).getTime() - new Date(a.called_at || a.created_at).getTime());
          const retried = calls
            .filter((c) => c.attempt_count >= 2)
            .sort((a, b) => new Date(b.outcome_updated_at || b.called_at || b.created_at).getTime() - new Date(a.outcome_updated_at || a.called_at || a.created_at).getTime());
          return (
            <div className="space-y-8">
              {needsRetry.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" /> Needs Retry
                    </span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {needsRetry.length}
                    </span>
                  </div>
                  <CallRows calls={needsRetry} router={router} formatDate={formatDate} showQuickLog outcomeFilter={outcomeFilter} />
                </div>
              )}

              {retried.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" /> Second Attempt
                    </span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {retried.length}
                    </span>
                  </div>
                  <CallRows calls={retried} router={router} formatDate={formatDate} />
                </div>
              )}
            </div>
          );
        })()
      ) : (
        // Full page: split into pending / called sections
        (() => {
          const pending = calls.filter((c) => !c.called_at);
          const called = calls
            .filter((c) => c.called_at)
            .sort((a, b) => new Date(b.called_at!).getTime() - new Date(a.called_at!).getTime());
          return (
            <div className="space-y-8">
              {pending.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" /> Not Yet Called
                    </span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {pending.length}
                    </span>
                  </div>
                  <CallRows calls={pending} router={router} formatDate={formatDate} showQuickLog outcomeFilter={outcomeFilter} />
                </div>
              )}

              {called.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5 inline" /> Called
                    </span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {called.length}
                    </span>
                  </div>
                  <CallRows calls={called} router={router} formatDate={formatDate} />
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}

function PhoneLink({ phone, callId, contactName }: { phone: string; callId: string; contactName: string }) {
  const { startCall, activeCall } = useActiveCall();
  const isActive = activeCall?.callId === callId;

  return (
    <a
      href={`tel:${phone}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isActive) startCall(callId, contactName);
      }}
      className={`inline-flex items-center gap-1 text-xs hover:text-emerald-400 transition-colors ${
        isActive ? "text-emerald-400" : "text-zinc-500"
      }`}
    >
      <Phone className="w-3 h-3" />
      {phone}
    </a>
  );
}

function CallRows({
  calls,
  router,
  formatDate,
  showQuickLog,
  showPhone,
  outcomeFilter,
}: {
  calls: Call[];
  router: ReturnType<typeof import("next/navigation").useRouter>;
  formatDate: (d: string) => string;
  showQuickLog?: boolean;
  showPhone?: boolean;
  outcomeFilter?: string;
}) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th className="pb-2 pr-4">Contact</th>
              <th className="pb-2 pr-4">Company</th>
              <th className="pb-2 pr-4">Outcome</th>
              <th className="pb-2 pr-4">Notes</th>
              <th className="pb-2 pr-4">Follow-up</th>
              <th className="pb-2 pr-4">Date / Duration</th>
              <th className="pb-2">Last Updated</th>
              {showQuickLog && <th className="pb-2"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr
                key={call.id}
                onClick={() => router.push(`/calls/${call.id}${outcomeFilter ? `?filter=${encodeURIComponent(outcomeFilter)}` : ""}`)}
                className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors cursor-pointer"
              >
                <td className="py-3 pr-4">
                  <div className="text-white font-medium">
                    {call.contact_name}
                    {formatAttempt(call.attempt_count) && (
                      <span className="text-xs text-zinc-500 ml-1.5">({formatAttempt(call.attempt_count)})</span>
                    )}
                  </div>
                  {call.phone && (
                    <PhoneLink phone={call.phone} callId={call.id} contactName={call.contact_name} />
                  )}
                </td>
                <td className="py-3 pr-4 text-zinc-400 text-sm">{call.company || "—"}</td>
                <td className="py-3 pr-4"><OutcomeBadge outcome={call.outcome} /></td>
                <td className="py-3 pr-4 text-sm text-zinc-500 max-w-45">
                  {call.notes
                    ? call.notes.length > 60
                      ? call.notes.slice(0, 60) + "..."
                      : call.notes
                    : null}
                </td>
                <td className="py-3 pr-4 text-sm">
                  {call.follow_up_at ? (
                    <span className={isOverdue(call.follow_up_at) ? "text-rose-400 font-medium" : "text-zinc-400"}>
                      {isOverdue(call.follow_up_at) ? "⚠ " : ""}{formatMYT(call.follow_up_at)}
                    </span>
                  ) : (
                    <span className="text-zinc-700">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-sm text-zinc-500">
                  {call.called_at ? (
                    <div>
                      <div>{formatDate(call.called_at)}</div>
                      {call.duration_seconds != null && (
                        <div className="text-xs text-zinc-600">{formatDuration(call.duration_seconds)}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-700">—</span>
                  )}
                </td>
                <td className="py-3 text-sm text-zinc-500">
                  {call.outcome_updated_at ? (
                    <div>{formatDate(call.outcome_updated_at)}</div>
                  ) : (
                    <span className="text-zinc-700">—</span>
                  )}
                </td>
                {showQuickLog && (
                  <td className="py-3 pl-2">
                    <Link
                      href={`/calls/new?name=${encodeURIComponent(call.contact_name)}&company=${encodeURIComponent(call.company || "")}&phone=${encodeURIComponent(call.phone || "")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap"
                    >
                      Log →
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {calls.map((call) => (
          <div key={call.id} className="relative">
            <Link
              href={`/calls/${call.id}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 active:bg-zinc-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-medium">
                    {call.contact_name}
                    {formatAttempt(call.attempt_count) && (
                      <span className="text-xs text-zinc-500 ml-1.5">({formatAttempt(call.attempt_count)})</span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {call.company || ""}
                    {call.phone && (
                      <> · <PhoneLink phone={call.phone} callId={call.id} contactName={call.contact_name} /></>
                    )}
                  </div>
                </div>
                <OutcomeBadge outcome={call.outcome} />
              </div>
              {call.notes && (
                <div className="mt-1.5 text-xs text-zinc-500 line-clamp-1">
                  {call.notes.length > 60 ? call.notes.slice(0, 60) + "..." : call.notes}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                <span>{call.called_at ? formatDate(call.called_at) : "Not yet called"}</span>
                {call.duration_seconds != null && <span>{formatDuration(call.duration_seconds)}</span>}
                {call.outcome_updated_at && <span>Updated: {formatDate(call.outcome_updated_at)}</span>}
                {call.follow_up_at && (
                  <span className={isOverdue(call.follow_up_at) ? "text-rose-400 font-medium" : ""}>
                    {isOverdue(call.follow_up_at) ? "⚠ " : ""}Follow-up: {formatMYT(call.follow_up_at)}
                  </span>
                )}
              </div>
            </Link>
            {showQuickLog && (
              <Link
                href={`/calls/new?name=${encodeURIComponent(call.contact_name)}&company=${encodeURIComponent(call.company || "")}&phone=${encodeURIComponent(call.phone || "")}`}
                className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800 rounded-md transition-colors"
              >
                Log →
              </Link>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
