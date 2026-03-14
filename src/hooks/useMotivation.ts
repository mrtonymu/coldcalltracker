"use client";

import { useState, useEffect } from "react";
import { getMotivationData, getAchievements, unlockAchievement } from "@/lib/actions";
import {
  humorMessages,
  seriousMessages,
  darkDayMessages,
  badgeConfigs,
  randomPick,
  type MotivationMessage,
  type BadgeConfig,
} from "@/lib/motivationContent";

export type MotivationState = {
  type: "toast" | "modal";
  content: MotivationMessage;
  badge?: BadgeConfig;
} | null;

// Module-level flag: only run once per browser tab session
let hasCheckedThisSession = false;

const SESSION_KEY = "motivation_shown";
const MAX_SHOWS_PER_DAY = 3;

function getTodayShownCount(): number {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    const today = new Date().toISOString().split("T")[0];
    return date === today ? count : 0;
  } catch {
    return 0;
  }
}

function incrementShownCount(): void {
  try {
    const today = new Date().toISOString().split("T")[0];
    const current = getTodayShownCount();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ date: today, count: current + 1 }));
  } catch {
    // sessionStorage unavailable — non-critical
  }
}

export function useMotivation() {
  const [state, setState] = useState<MotivationState>(null);

  useEffect(() => {
    if (hasCheckedThisSession) return;
    if (getTodayShownCount() >= MAX_SHOWS_PER_DAY) return;
    hasCheckedThisSession = true;

    async function check() {
      try {
        const [motivData, achievements] = await Promise.all([
          getMotivationData(),
          getAchievements(),
        ]);

        const unlockedKeys = new Set(achievements.map((a) => a.key));

        // --- Badge checks (priority order) ---

        // Resilience badge
        if (motivData.justBounced && !unlockedKeys.has("resilience")) {
          await unlockAchievement("resilience");
          incrementShownCount();
          setState({ type: "modal", content: { title: badgeConfigs.resilience.name, message: badgeConfigs.resilience.description, emoji: badgeConfigs.resilience.emoji }, badge: badgeConfigs.resilience });
          return;
        }

        // Rejection milestone badges
        const rejectionBadges = [
          { key: "rejection_master_100", threshold: 100 },
          { key: "rejection_master_50", threshold: 50 },
          { key: "rejection_master_10", threshold: 10 },
        ];
        for (const { key, threshold } of rejectionBadges) {
          if (motivData.totalNegatives >= threshold && !unlockedKeys.has(key)) {
            await unlockAchievement(key);
            incrementShownCount();
            setState({ type: "modal", content: { title: badgeConfigs[key].name, message: badgeConfigs[key].description, emoji: badgeConfigs[key].emoji }, badge: badgeConfigs[key] });
            return;
          }
        }

        // Ghost Hunter badge
        if (motivData.consecutiveNoAnswer >= 10 && !unlockedKeys.has("ghost_hunter_10")) {
          await unlockAchievement("ghost_hunter_10");
          incrementShownCount();
          setState({ type: "modal", content: { title: badgeConfigs.ghost_hunter_10.name, message: badgeConfigs.ghost_hunter_10.description, emoji: badgeConfigs.ghost_hunter_10.emoji }, badge: badgeConfigs.ghost_hunter_10 });
          return;
        }

        // Voicemail King badge
        if (motivData.consecutiveVoicemail >= 8 && !unlockedKeys.has("voicemail_king")) {
          await unlockAchievement("voicemail_king");
          incrementShownCount();
          setState({ type: "modal", content: { title: badgeConfigs.voicemail_king.name, message: badgeConfigs.voicemail_king.description, emoji: badgeConfigs.voicemail_king.emoji }, badge: badgeConfigs.voicemail_king });
          return;
        }

        // --- Motivational triggers (no new badge) ---

        const diff = motivData.todayNegativeRatio - motivData.histAvgNegativeRatio;

        // Dark day: today 40%+ worse than history & at least 5 calls
        if (diff >= 0.4 && motivData.todayCallCount >= 5) {
          if (!unlockedKeys.has("dark_day")) await unlockAchievement("dark_day");
          incrementShownCount();
          const content = randomPick(darkDayMessages);
          setState({ type: "modal", content, badge: unlockedKeys.has("dark_day") ? undefined : badgeConfigs.dark_day });
          return;
        }

        // 10+ consecutive negatives — Modal with random humor or serious
        if (motivData.consecutiveNegatives >= 10) {
          incrementShownCount();
          const pool = [...humorMessages, ...seriousMessages];
          setState({ type: "modal", content: randomPick(pool) });
          return;
        }

        // Today 20%+ worse than history & at least 3 calls — Toast (serious)
        if (diff >= 0.2 && motivData.todayCallCount >= 3) {
          incrementShownCount();
          setState({ type: "toast", content: randomPick(seriousMessages) });
          return;
        }

        // 5+ consecutive negatives — Toast (humor)
        if (motivData.consecutiveNegatives >= 5) {
          incrementShownCount();
          setState({ type: "toast", content: randomPick(humorMessages) });
          return;
        }
      } catch {
        // Non-critical — silently ignore
      }
    }

    check();
  }, []);

  return {
    toast: state?.type === "toast" ? state : null,
    modal: state?.type === "modal" ? state : null,
    dismiss: () => setState(null),
  };
}
