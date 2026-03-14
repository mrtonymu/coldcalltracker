import { Suspense } from "react";
import StatsCards from "@/components/StatsCards";
import DailyGoalCard from "@/components/DailyGoalCard";
import CallsTable from "@/components/CallsTable";
import MotivationWrapper from "@/components/MotivationWrapper";

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse h-24" />
      ))}
    </div>
  );
}

function GoalSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse h-20" />
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
        <div className="space-y-4">
          <Suspense fallback={<StatsSkeleton />}>
            <StatsCards />
          </Suspense>
          <Suspense fallback={<GoalSkeleton />}>
            <DailyGoalCard />
          </Suspense>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Recent Calls</h2>
        <Suspense fallback={<div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg h-16 animate-pulse" />)}</div>}>
          <CallsTable limit={5} />
        </Suspense>
      </div>
      <MotivationWrapper />
    </div>
  );
}
