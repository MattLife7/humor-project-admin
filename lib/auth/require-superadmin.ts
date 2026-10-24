import { createClient } from "@/lib/supabase/server";

export async function requireSuperadmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      profile: null,
      authorized: false,
      reason: "not_authenticated" as const,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, is_superadmin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_superadmin) {
    return {
      supabase,
      user,
      profile,
      authorized: false,
      reason: "not_superadmin" as const,
    };
  }

  return {
    supabase,
    user,
    profile,
    authorized: true,
    reason: null,
  };
}