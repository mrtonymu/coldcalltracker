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
      <CallsTable initialFollowUpFilter={followUpFilter} />
    </div>
  );
}
