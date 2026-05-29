export type SkillLevel = "Beginner" | "Intermediate" | "Advanced"

export type AuthView = "welcome" | "login" | "signup" | "forgot"
export type AppView = "home" | "ai" | "lessons" | "vocabulary" | "grammar" | "speaking" | "listening" | "translation" | "quiz" | "progress" | "profile" | "settings" | "premium"

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    name?: string
  }
}

export interface AuthSession {
  access_token: string
  refresh_token?: string
  expires_at?: number
  user: AuthUser
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url?: string | null
  native_language?: string | null
  target_language?: string | null
  skill_level?: SkillLevel | null
}

export interface Lesson {
  id: string
  title: string
  description?: string | null
  category?: string | null
  level?: SkillLevel | null
  order_index?: number | null
}

export interface VocabularyItem {
  id: string
  word: string
  definition: string
  example_sentence?: string | null
  pronunciation?: string | null
}

export interface ProgressRecord {
  id: string
  lesson_id?: string | null
  category?: string | null
  percent_complete: number
  xp_points?: number | null
}

export interface StreakRecord {
  id: string
  current_streak: number
  longest_streak?: number | null
  last_activity_date?: string | null
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  created_at?: string
}

export interface DashboardData {
  profile: Profile | null
  lessons: Lesson[]
  vocabulary: VocabularyItem[]
  progress: ProgressRecord[]
  streak: StreakRecord | null
  chatHistory: ChatMessage[]
}
