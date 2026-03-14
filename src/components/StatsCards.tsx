import Link from "next/link";
import { getStats } from "@/lib/actions";

export default async function StatsCards() {
  const stats = await getStats();

  const cards = [
    { label: "Calls Today", value: stats.callsToday, icon: "📞", href: undefined },
    { label: "This Week", value: stats.callsThisWeek, icon: "📊", href: undefined },
    { label: "Conversion", value: `${stats.conversionRate}%`, icon: "🎯", href: undefined },
    { label: "Follow-ups Due", value: stats.followUpsDue, icon: "⏰", href: "/calls?followup=today" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const inner = (
          <>
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <span>{card.icon}</span>
              <span>{card.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
          </>
        );
        const baseClass = "bg-zinc-900 border border-zinc-800 rounded-xl p-5";
        return card.href ? (
          <Link key={card.label} href={card.href} className={`${baseClass} hover:border-zinc-600 transition-colors block`}>
            {inner}
          </Link>
        ) : (
          <div key={card.label} className={baseClass}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
