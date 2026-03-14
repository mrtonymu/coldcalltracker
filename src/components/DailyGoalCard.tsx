import Link from "next/link";
import { getDailyGoalData } from "@/lib/actions";

export default async function DailyGoalCard() {
  const { goal, current } = await getDailyGoalData();
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const remaining = Math.max(0, goal - current);
  const reached = current >= goal;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 col-span-2 lg:col-span-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <span>🎯</span>
          <span>Daily Goal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">
            {current} / {goal} calls ≥1 min
          </span>
          <Link href="/settings" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            Edit
          </Link>
        </div>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
        <div
          className={`progress-bar h-3 rounded-full ${reached ? "bg-emerald-400" : "bg-emerald-600"}`}
          style={{ "--progress-width": `${pct}%` } as React.CSSProperties}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{pct}% complete</span>
        {reached ? (
          <span className="text-emerald-400 font-medium">Goal reached!</span>
        ) : (
          <span>{remaining} more to go</span>
        )}
      </div>
    </div>
  );
}
