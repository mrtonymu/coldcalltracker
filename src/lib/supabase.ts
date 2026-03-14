import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
