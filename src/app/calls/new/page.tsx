import CallForm from "@/components/CallForm";

export default async function NewCallPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; company?: string; phone?: string }>;
}) {
  const params = await searchParams;
  const prefill = {
    contact_name: params.name,
    company: params.company,
    phone: params.phone,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Log New Call</h1>
      <CallForm prefill={prefill} />
    </div>
  );
}
