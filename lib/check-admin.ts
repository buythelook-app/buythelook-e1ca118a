import { createSupabaseServerClient } from "./supabase-server"

export async function checkIsAdmin() {
  const supabase = await createSupabaseServerClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { isAdmin: false, user: null, error: "Not authenticated" }
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin, avatar_url")
    .eq("id", user.id)
    .single()

  if (profileError || !profileData) {
    return { isAdmin: false, user: null, error: "Profile not found" }
  }

  return {
    isAdmin: profileData.is_admin || false,
    user: {
      id: user.id,
      email: user.email,
      avatar: profileData.avatar_url,
    },
    error: null,
  }
}
