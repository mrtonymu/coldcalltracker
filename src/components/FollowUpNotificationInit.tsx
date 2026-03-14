"use client";

import { useFollowUpNotifications } from "@/hooks/useFollowUpNotifications";

export default function FollowUpNotificationInit() {
  useFollowUpNotifications();
  return null;
}
