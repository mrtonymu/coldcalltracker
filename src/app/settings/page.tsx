"use client";

import { useState, useEffect } from "react";
import { getSetting, setSetting } from "@/lib/actions";

export default function SettingsPage() {
  const [goal, setGoal] = useState("50");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSetting("daily_goal").then((v) => {
      if (v) setGoal(v);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(goal, 10);
    if (isNaN(n) || n < 1) return;
    setSaving(true);
    try {
      await setSetting("daily_goal", String(n));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Daily Call Goal (≥1 min)
          </label>
          <input
            type="number"
            min="1"
            max="500"
            title="Daily call goal"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Number of calls ≥1 minute you aim to complete each day
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saved ? "Saved!" : saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
