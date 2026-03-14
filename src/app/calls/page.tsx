import { Suspense } from "react";
import CallsTable from "@/components/CallsTable";

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ followup?: string }>;
}) {
  const params = await searchParams;
  const followUpFilter = params.followup === "today";

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">All Calls</h1>
      <Suspense fallback={<div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg h-16 animate-pulse" />)}</div>}>
        <CallsTable initialFollowUpFilter={followUpFilter} />
      </Suspense>
    </div>
  );
}
