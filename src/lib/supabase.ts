import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Call = {
  id: string;
  contact_name: string;
  company: string | null;
  phone: string | null;
  outcome: "no_answer" | "voicemail" | "callback" | "interested" | "not_interested" | "closed" | "whatsapp" | null;
  notes: string | null;
  follow_up_at: string | null;
  duration_seconds: number | null;
  called_at: string | null;
  outcome_updated_at: string | null;
  attempt_count: number;
  created_at: string;
  updated_at: string;
};
