"use client";

import { useEffect, useRef } from "react";
import { getTodayFollowUps } from "@/lib/actions";
import { formatMYT } from "@/lib/timezone";

const NOTIFIED_KEY = "followup_notified";

function getNotifiedIds(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(NOTIFIED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markNotified(id: string) {
  try {
    const ids = getNotifiedIds();
    ids.add(id);
    sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify([...ids]));
  } catch {
    // non-critical
  }
}

function sendNotification(id: string, name: string, company: string | null, time: string) {
  if (Notification.permission !== "granted") return;
  const n = new Notification("📞 Follow-up 提醒", {
    body: `${name}${company ? ` · ${company}` : ""} — ${time}`,
    icon: "/favicon.ico",
    tag: id,
  });
  n.onclick = () => {
    window.focus();
    window.location.href = `/calls/${id}`;
  };
  markNotified(id);
}

export function useFollowUpNotifications() {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    async function init() {
      // Request permission
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission !== "granted") return;

      await checkAndSchedule();
    }

    async function checkAndSchedule() {
      const calls = await getTodayFollowUps();
      const notified = getNotifiedIds();
      const now = Date.now();

      for (const call of calls) {
        if (!call.follow_up_at || notified.has(call.id)) continue;
        const followUpMs = new Date(call.follow_up_at).getTime();
        const delay = followUpMs - now;
        const timeStr = formatMYT(call.follow_up_at);

        if (delay <= 0) {
          // Already past due — send immediately
          sendNotification(call.id, call.contact_name, call.company, timeStr);
        } else {
          // Schedule for future
          const t = setTimeout(() => {
            sendNotification(call.id, call.contact_name, call.company, timeStr);
          }, delay);
          timeoutsRef.current.push(t);
        }
      }
    }

    init();

    // Re-check every 60s to catch newly added follow-ups
    const interval = setInterval(checkAndSchedule, 60_000);

    return () => {
      clearInterval(interval);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);
}
