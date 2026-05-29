import type { AuthSession, DashboardData, Profile } from "./app-types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return ""
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const authHeaders = {
  apikey: supabaseAnonKey,
  "Content-Type": "application/json",
}

function assertSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error || "Request failed"
    throw new Error(message)
  }

  return data as T
}

export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthSession> {
  assertSupabaseConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ email, password, data: { full_name: fullName } }),
  })

  return parseResponse<AuthSession>(response)
}

export async function signInWithEmail(email: string, password: string): Promise<AuthSession> {
  assertSupabaseConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ email, password }),
  })

  return parseResponse<AuthSession>(response)
}

export async function sendPasswordReset(email: string): Promise<void> {
  assertSupabaseConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ email, redirect_to: getAppUrl() || undefined }),
  })

  await parseResponse<unknown>(response)
}

export async function signOut(accessToken: string): Promise<void> {
  assertSupabaseConfig()
  await fetch(`${supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: { ...authHeaders, Authorization: `Bearer ${accessToken}` },
  })
}

export async function fetchCurrentUser(accessToken: string): Promise<AuthSession["user"]> {
  assertSupabaseConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { ...authHeaders, Authorization: `Bearer ${accessToken}` },
  })

  return parseResponse<AuthSession["user"]>(response)
}

async function fetchTable<T>(table: string, accessToken: string, query = "select=*"): Promise<T[]> {
  assertSupabaseConfig()
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseResponse<T[]>(response)
}

export async function upsertProfile(accessToken: string, profile: Profile): Promise<void> {
  assertSupabaseConfig()
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(profile),
  })

  await parseResponse<unknown>(response)
}

export async function fetchDashboardData(accessToken: string): Promise<DashboardData> {
  const [profiles, lessons, vocabulary, progress, streaks, chatHistory] = await Promise.all([
    fetchTable<DashboardData["profile"]>("profiles", accessToken, "select=*&limit=1"),
    fetchTable<DashboardData["lessons"][number]>("lessons", accessToken, "select=*&order=order_index.asc"),
    fetchTable<DashboardData["vocabulary"][number]>("vocabulary", accessToken, "select=*&order=created_at.desc&limit=10"),
    fetchTable<DashboardData["progress"][number]>("progress", accessToken, "select=*"),
    fetchTable<DashboardData["streak"]>("streaks", accessToken, "select=*&limit=1"),
    fetchTable<DashboardData["chatHistory"][number]>("chat_history", accessToken, "select=*&order=created_at.asc&limit=50"),
  ])

  return {
    profile: profiles[0] || null,
    lessons,
    vocabulary,
    progress,
    streak: streaks[0] || null,
    chatHistory,
  }
}
