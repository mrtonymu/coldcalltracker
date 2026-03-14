import Link from "next/link";
import { getStats } from "@/lib/actions";
import { Phone, BarChart3, Target, Clock } from "lucide-react";
import { ReactNode } from "react";

export default async function StatsCards() {
  const stats = await getStats();

  const cards: { label: string; value: string | number; icon: ReactNode; href?: string }[] = [
    { label: "Calls Today", value: stats.callsToday, icon: <Phone className="w-4 h-4" /> },
    { label: "This Week", value: stats.callsThisWeek, icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Conversion", value: `${stats.conversionRate}%`, icon: <Target className="w-4 h-4" /> },
    { label: "Follow-ups Due", value: stats.followUpsDue, icon: <Clock className="w-4 h-4" />, href: "/calls?followup=today" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const inner = (
          <>
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              {card.icon}
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
