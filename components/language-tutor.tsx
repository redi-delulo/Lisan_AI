"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  Crown,
  Eye,
  EyeOff,
  Flame,
  Globe2,
  GraduationCap,
  Headphones,
  Home,
  Languages,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Mic,
  Moon,
  PenTool,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Trophy,
  User,
} from "lucide-react"
import { motion } from "framer-motion"
import type { AppView, AuthSession, AuthView, ChatMessage, DashboardData, SkillLevel } from "@/lib/app-types"
import { clearUserCache, readCachedDashboard, writeCachedDashboard } from "@/lib/cache"
import {
  fetchCurrentUser,
  fetchDashboardData,
  isSupabaseConfigured,
  sendPasswordReset,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  upsertProfile,
} from "@/lib/supabase-rest"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
const sessionKey = "lisan-ai:session"
const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"]

const emptyDashboard: DashboardData = {
  profile: null,
  lessons: [],
  vocabulary: [],
  progress: [],
  streak: null,
  chatHistory: [],
}

const appNav: Array<{ id: AppView; label: string; icon: typeof Home }> = [
  { id: "home", label: "Home", icon: Home },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "ai", label: "AI Tutor", icon: Bot },
  { id: "progress", label: "Progress", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
]

const allPages: Array<{ id: AppView; label: string; icon: typeof Home }> = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "ai", label: "AI Tutor", icon: Bot },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "vocabulary", label: "Vocabulary", icon: Languages },
  { id: "grammar", label: "Grammar", icon: PenTool },
  { id: "speaking", label: "Speaking", icon: Mic },
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "translation", label: "Translation", icon: Globe2 },
  { id: "quiz", label: "Quiz", icon: GraduationCap },
  { id: "progress", label: "Progress", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "premium", label: "Premium", icon: Crown },
]

interface AiResponse {
  message?: string
  error?: string
}

function loadStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  const value = window.localStorage.getItem(sessionKey)
  if (!value) return null

  try {
    return JSON.parse(value) as AuthSession
  } catch {
    window.localStorage.removeItem(sessionKey)
    return null
  }
}

function storeSession(session: AuthSession | null) {
  if (typeof window === "undefined") return
  if (session) {
    window.localStorage.setItem(sessionKey, JSON.stringify(session))
  } else {
    window.localStorage.removeItem(sessionKey)
  }
}

function getDisplayName(session: AuthSession | null, dashboard: DashboardData) {
  return dashboard.profile?.full_name || session?.user.user_metadata?.full_name || session?.user.email?.split("@")[0] || "Learner"
}

function EmptyState({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      <Button onClick={onAction} className="mt-5 rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700">
        {action}
      </Button>
    </div>
  )
}

function SkeletonCard() {
  return <div className="h-36 animate-pulse rounded-[1.75rem] bg-slate-100 dark:bg-slate-800" />
}

export function LanguageTutorComponent() {
  const [authView, setAuthView] = useState<AuthView>("welcome")
  const [session, setSession] = useState<AuthSession | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard)
  const [activeView, setActiveView] = useState<AppView>("home")
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("Beginner")
  const [conversation, setConversation] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState("")
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const conversationEndRef = useRef<HTMLDivElement>(null)

  const displayName = getDisplayName(session, dashboard)
  const completedLessons = dashboard.progress.filter((item) => Number(item.percent_complete) >= 100).length
  const overallProgress = dashboard.progress.length
    ? Math.round(dashboard.progress.reduce((total, item) => total + Number(item.percent_complete || 0), 0) / dashboard.progress.length)
    : 0
  const xpPoints = dashboard.progress.reduce((total, item) => total + Number(item.xp_points || 0), 0)
  const currentStreak = dashboard.streak?.current_streak || 0
  const latestVocabulary = dashboard.vocabulary[0]
  const currentProfile = dashboard.profile

  const authShellClass = isDarkMode ? "dark bg-slate-950" : "bg-[#f8fbf8]"

  useEffect(() => {
    const storedSession = loadStoredSession()
    if (!storedSession) {
      setIsLoading(false)
      return
    }

    setSession(storedSession)
    const cached = readCachedDashboard(storedSession.user.id)
    if (cached) {
      setDashboard(cached)
      setConversation(cached.chatHistory)
      setSkillLevel(cached.profile?.skill_level || "Beginner")
    }
    refreshSessionAndData(storedSession)
  }, [])

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, isSendingMessage])

  async function refreshSessionAndData(currentSession = session) {
    if (!currentSession) return
    setIsLoading(true)
    try {
      const user = await fetchCurrentUser(currentSession.access_token)
      const updatedSession = { ...currentSession, user }
      setSession(updatedSession)
      storeSession(updatedSession)
      const data = await fetchDashboardData(updatedSession.access_token)
      setDashboard(data)
      setConversation(data.chatHistory)
      setSkillLevel(data.profile?.skill_level || "Beginner")
      writeCachedDashboard(user.id, data)
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Unable to load your data." })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAuthSuccess(nextSession: AuthSession, fullName?: string) {
    setSession(nextSession)
    storeSession(nextSession)
    if (fullName) {
      await upsertProfile(nextSession.access_token, {
        id: nextSession.user.id,
        full_name: fullName,
        native_language: "Arabic",
        target_language: "English",
        skill_level: "Beginner",
      })
    }
    setNotice({ type: "success", message: "Welcome to Lisan AI." })
    await refreshSessionAndData(nextSession)
  }

  async function handleLogout() {
    if (session?.access_token) {
      await signOut(session.access_token).catch(() => undefined)
      clearUserCache(session.user.id)
    }
    setSession(null)
    storeSession(null)
    setDashboard(emptyDashboard)
    setConversation([])
    setActiveView("home")
    setAuthView("welcome")
  }

  async function handleConversationSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) {
      setNotice({ type: "error", message: "Please log in to use the AI tutor." })
      return
    }

    const trimmedInput = userInput.trim()
    if (!trimmedInput || isSendingMessage) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
      created_at: new Date().toISOString(),
    }

    setUserInput("")
    setIsSendingMessage(true)
    setConversation((entries) => [...entries, userMessage])

    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: "conversation", userInput: trimmedInput, skillLevel }),
      })
      const data = await response.json().catch(() => ({ error: "Invalid API response" })) as AiResponse
      if (!response.ok || typeof data.message !== "string") {
        throw new Error(data.error || "The AI tutor could not answer. Please try again.")
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        created_at: new Date().toISOString(),
      }
      setConversation((entries) => [...entries, assistantMessage])
      setNotice({ type: "success", message: "AI answer generated." })
      await refreshSessionAndData(session)
    } catch (error) {
      setConversation((entries) => entries.filter((item) => item.id !== userMessage.id))
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Unable to generate an answer." })
    } finally {
      setIsSendingMessage(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fbf8] p-6">
        <div className="max-w-lg rounded-[2rem] bg-white p-8 shadow-xl">
          <ShieldCheck className="mb-4 h-12 w-12 text-emerald-600" />
          <h1 className="text-2xl font-extrabold text-slate-950">Connect Supabase to continue</h1>
          <p className="mt-3 text-slate-600">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables, then redeploy.</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className={authShellClass}>
        <AuthScreens
          view={authView}
          setView={setAuthView}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          notice={notice}
          setNotice={setNotice}
          onAuthSuccess={handleAuthSuccess}
        />
      </main>
    )
  }

  return (
    <main className={`${isDarkMode ? "dark bg-slate-950" : "bg-[#f7fbf8]"} min-h-screen text-slate-950 dark:text-white`}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-72 border-r border-slate-200 bg-white/90 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:block">
          <Brand />
          <DesktopNav activeView={activeView} setActiveView={setActiveView} />
        </aside>

        {showSidebar && (
          <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setShowSidebar(false)}>
            <aside className="h-full w-80 bg-white p-6 dark:bg-slate-950" onClick={(e) => e.stopPropagation()}>
              <Brand />
              <DesktopNav activeView={activeView} setActiveView={(view) => { setActiveView(view); setShowSidebar(false) }} />
            </aside>
          </div>
        )}

        <section className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-10 lg:pb-10">
          <TopBar
            displayName={displayName}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            setShowSidebar={setShowSidebar}
            onLogout={handleLogout}
          />

          {notice && <Notice type={notice.type} message={notice.message} onClose={() => setNotice(null)} />}

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          ) : (
            <>
              {activeView === "home" && (
                <DashboardView
                  displayName={displayName}
                  completedLessons={completedLessons}
                  xpPoints={xpPoints}
                  currentStreak={currentStreak}
                  overallProgress={overallProgress}
                  dashboard={dashboard}
                  setActiveView={setActiveView}
                />
              )}
              {activeView === "ai" && (
                <AiTutorView
                  conversation={conversation}
                  isSendingMessage={isSendingMessage}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  handleConversationSubmit={handleConversationSubmit}
                  skillLevel={skillLevel}
                  setSkillLevel={setSkillLevel}
                  conversationEndRef={conversationEndRef}
                />
              )}
              {activeView === "lessons" && <CollectionView title="Lessons" items={dashboard.lessons} empty="No lessons yet." action="Start AI Tutor" onAction={() => setActiveView("ai")} />}
              {activeView === "vocabulary" && <VocabularyView latestVocabulary={latestVocabulary} onAction={() => setActiveView("ai")} />}
              {activeView === "grammar" && <EmptyState title="No grammar quizzes yet" description="Ask Lisan AI to create a grammar quiz and your saved quizzes will appear here." action="Create with AI" onAction={() => setActiveView("ai")} />}
              {activeView === "speaking" && <EmptyState title="Speaking practice is ready" description="Start an AI conversation and practice reading your answers aloud." action="Open AI Tutor" onAction={() => setActiveView("ai")} />}
              {activeView === "listening" && <EmptyState title="No listening practice yet" description="Create listening lessons in your database or ask Lisan AI for listening exercises." action="Ask AI Tutor" onAction={() => setActiveView("ai")} />}
              {activeView === "translation" && <EmptyState title="No translations yet" description="Use the AI Tutor to translate words or sentences between English and Arabic." action="Translate with AI" onAction={() => setActiveView("ai")} />}
              {activeView === "quiz" && <EmptyState title="No quizzes yet" description="Generate quizzes with AI and save them to your database." action="Ask AI for a quiz" onAction={() => setActiveView("ai")} />}
              {activeView === "progress" && <ProgressView dashboard={dashboard} overallProgress={overallProgress} />}
              {activeView === "profile" && <ProfileView profile={currentProfile} email={session.user.email || ""} onLogout={handleLogout} />}
              {activeView === "settings" && <ProfileView profile={currentProfile} email={session.user.email || ""} onLogout={handleLogout} />}
              {activeView === "premium" && <EmptyState title="Premium is not active" description="Connect your subscription provider to unlock premium plans without hardcoded offers." action="Back to Dashboard" onAction={() => setActiveView("home")} />}
            </>
          )}
        </section>
      </div>

      <MobileNav activeView={activeView} setActiveView={setActiveView} />
    </main>
  )
}

function Brand() {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none">
        <BookOpen className="h-7 w-7" />
      </div>
      <div>
        <p className="text-xl font-extrabold">Lisan AI</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">English & Arabic tutor</p>
      </div>
    </div>
  )
}

function AuthScreens({ view, setView, isDarkMode, setIsDarkMode, notice, setNotice, onAuthSuccess }: {
  view: AuthView
  setView: (view: AuthView) => void
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
  notice: { type: "success" | "error"; message: string } | null
  setNotice: (notice: { type: "success" | "error"; message: string } | null) => void
  onAuthSuccess: (session: AuthSession, fullName?: string) => Promise<void>
}) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const title = view === "signup" ? "Create Your Account" : view === "login" ? "Welcome Back" : view === "forgot" ? "Reset Password" : "Learn English and Arabic with Lisan AI"
  const subtitle = view === "signup"
    ? "Join Lisan AI and start your learning journey today."
    : view === "login"
      ? "Log in to continue your lessons and AI chats."
      : view === "forgot"
        ? "Enter your email and we will send a reset link."
        : "Practice conversation, vocabulary, grammar, speaking, and translation with a professional AI tutor."

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNotice(null)
    setIsSubmitting(true)
    try {
      if (view === "signup") {
        if (!fullName.trim()) throw new Error("Full name is required.")
        if (password.length < 8) throw new Error("Password must be at least 8 characters.")
        if (password !== confirmPassword) throw new Error("Passwords do not match.")
        if (!acceptTerms) throw new Error("Please accept the Terms of Service and Privacy Policy.")
        const session = await signUpWithEmail(email.trim(), password, fullName.trim())
        if (!session.access_token) {
          setNotice({ type: "success", message: "Check your email to confirm your account, then log in." })
          setView("login")
          return
        }
        await onAuthSuccess(session, fullName.trim())
      } else if (view === "login") {
        const session = await signInWithEmail(email.trim(), password)
        await onAuthSuccess(session)
      } else if (view === "forgot") {
        await sendPasswordReset(email.trim())
        setNotice({ type: "success", message: "Password reset email sent." })
        setView("login")
      }
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Authentication failed." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (view === "welcome") {
    return (
      <div className="grid min-h-screen place-items-center px-5 py-8 text-slate-950 dark:text-white">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="fixed right-5 top-5 rounded-full bg-white p-3 shadow dark:bg-slate-900">
          {isDarkMode ? <Sun /> : <Moon />}
        </button>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="mx-auto mb-8 grid h-36 w-36 place-items-center rounded-[3rem] bg-emerald-50 text-7xl dark:bg-emerald-950">🤖</div>
          <h1 className="text-4xl font-extrabold leading-tight">{title}</h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8 grid gap-3">
            <Button onClick={() => setView("signup")} className="h-14 rounded-2xl bg-emerald-600 text-lg text-white hover:bg-emerald-700">Create account</Button>
            <Button onClick={() => setView("login")} variant="outline" className="h-14 rounded-2xl bg-white text-lg dark:bg-slate-900">Log in</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-8 text-slate-950 dark:text-white">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => setView("welcome")} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-900">←</button>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-full bg-white p-3 shadow dark:bg-slate-900">{isDarkMode ? <Sun /> : <Moon />}</button>
      </div>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 grid h-28 w-40 place-items-center rounded-[2rem] bg-emerald-50 text-6xl dark:bg-emerald-950">🤖</div>
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {notice && <Notice type={notice.type} message={notice.message} onClose={() => setNotice(null)} />}
      <form onSubmit={handleSubmit} className="space-y-5">
        {view === "signup" && (
          <Field label="Full Name" icon={<User />} value={fullName} onChange={setFullName} placeholder="Enter your full name" autoComplete="name" />
        )}
        <Field label="Email Address" icon={<Mail />} type="email" value={email} onChange={setEmail} placeholder="Enter your email address" autoComplete="email" />
        {view !== "forgot" && (
          <PasswordField label="Password" value={password} onChange={setPassword} placeholder={view === "signup" ? "Create a password" : "Enter your password"} show={showPassword} setShow={setShowPassword} />
        )}
        {view === "signup" && (
          <>
            <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm your password" show={showPassword} setShow={setShowPassword} />
            <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><ShieldCheck /></div>
                <div><p className="font-bold">Your data is safe with us.</p><p className="text-sm text-slate-500">We never cache secrets or expose API keys.</p></div>
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="h-5 w-5 rounded" />
              I agree to the <span className="font-semibold text-emerald-600">Terms</span> and <span className="font-semibold text-emerald-600">Privacy Policy</span>
            </label>
          </>
        )}
        <Button disabled={isSubmitting} className="h-14 w-full rounded-2xl bg-emerald-600 text-lg text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700">
          {isSubmitting ? <Loader2 className="animate-spin" /> : view === "signup" ? "Sign Up" : view === "forgot" ? "Send Reset Link" : "Log In"}
        </Button>
      </form>
      <div className="mt-7 text-center text-slate-500">
        {view === "login" && <button onClick={() => setView("forgot")} className="font-semibold text-emerald-600">Forgot password?</button>}
        <p className="mt-4">
          {view === "signup" ? "Already have an account? " : "Need an account? "}
          <button onClick={() => setView(view === "signup" ? "login" : "signup")} className="font-semibold text-emerald-600">
            {view === "signup" ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  )
}

function Field({ label, icon, value, onChange, placeholder, type = "text", autoComplete }: { label: string; icon: React.ReactNode; value: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>
      <span className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {icon}
        <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white" />
      </span>
    </label>
  )
}

function PasswordField({ label, value, onChange, placeholder, show, setShow }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; show: boolean; setShow: (show: boolean) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>
      <span className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Lock />
        <input required type={show ? "text" : "password"} minLength={8} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white" />
        <button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</button>
      </span>
    </label>
  )
}

function Notice({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
  return (
    <div className={`mb-5 flex items-center justify-between rounded-2xl border p-4 text-sm font-semibold ${type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  )
}

function TopBar({ displayName, isDarkMode, setIsDarkMode, setShowSidebar, onLogout }: { displayName: string; isDarkMode: boolean; setIsDarkMode: (value: boolean) => void; setShowSidebar: (value: boolean) => void; onLogout: () => void }) {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button onClick={() => setShowSidebar(true)} className="rounded-full bg-white p-3 shadow dark:bg-slate-900 lg:hidden"><Menu /></button>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-600 text-white"><BookOpen /></div>
        <div><p className="text-2xl font-extrabold">Welcome back, {displayName}</p><p className="text-sm text-slate-500">Let&apos;s continue your learning journey</p></div>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-full bg-white p-3 shadow dark:bg-slate-900"><Bell /></button>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-full bg-white p-3 shadow dark:bg-slate-900">{isDarkMode ? <Sun /> : <Moon />}</button>
        <button onClick={onLogout} className="hidden rounded-full bg-white p-3 shadow dark:bg-slate-900 sm:block"><LogOut /></button>
      </div>
    </header>
  )
}

function DesktopNav({ activeView, setActiveView }: { activeView: AppView; setActiveView: (view: AppView) => void }) {
  return <nav className="space-y-2">{allPages.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveView(id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold ${activeView === id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}><Icon className="h-5 w-5" />{label}</button>)}</nav>
}

function MobileNav({ activeView, setActiveView }: { activeView: AppView; setActiveView: (view: AppView) => void }) {
  return <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-md -translate-x-1/2 grid-cols-5 rounded-t-[2rem] bg-white px-4 pb-4 pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] dark:bg-slate-950 lg:hidden">{appNav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveView(id)} className={`flex flex-col items-center gap-1 text-xs font-bold ${activeView === id ? "text-emerald-600" : "text-slate-500"}`}><span className={`${id === "ai" ? "-mt-9 grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-200" : "grid h-8 w-8 place-items-center"}`}><Icon className={id === "ai" ? "h-8 w-8" : "h-6 w-6"} /></span>{label}</button>)}</nav>
}

function DashboardView({ displayName, completedLessons, xpPoints, currentStreak, overallProgress, dashboard, setActiveView }: { displayName: string; completedLessons: number; xpPoints: number; currentStreak: number; overallProgress: number; dashboard: DashboardData; setActiveView: (view: AppView) => void }) {
  return (
    <div className="space-y-7">
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard icon={BookOpen} label="Lessons Completed" value={completedLessons} />
        <StatCard icon={Trophy} label="XP Points" value={xpPoints} />
        <StatCard icon={Flame} label="Day Streak" value={currentStreak} />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "AI Tutor", icon: Bot, view: "ai" as AppView },
          { label: "Lessons", icon: BookOpen, view: "lessons" as AppView },
          { label: "Vocabulary", icon: Languages, view: "vocabulary" as AppView },
          { label: "Practice", icon: Mic, view: "speaking" as AppView },
        ].map(({ label, icon: Icon, view }) => (
          <button key={label} onClick={() => setActiveView(view)} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <Icon className="mx-auto mb-2 h-7 w-7 text-emerald-600" />
            <span className="text-sm font-bold">{label}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-xl shadow-emerald-100 dark:shadow-none">
          <div className="flex items-start justify-between"><div><Target className="mb-4 h-10 w-10" /><h2 className="text-2xl font-extrabold">Daily Goal</h2><p className="mt-3 text-emerald-50">Complete one real lesson or AI practice session.</p></div><div className="grid h-24 w-24 place-items-center rounded-full border-[10px] border-white/20 border-r-white border-t-white text-xl font-extrabold">{overallProgress}%</div></div>
        </div>
        <div className="rounded-[2rem] bg-[#071b44] p-6 text-white"><h2 className="text-2xl font-extrabold">AI Tutor</h2><p className="mt-3 text-slate-300">Generate real answers using your backend API key.</p><Button onClick={() => setActiveView("ai")} className="mt-6 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">Chat Now <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
      </div>
      {dashboard.lessons.length === 0 ? <EmptyState title={`No lessons yet, ${displayName}`} description="Create lessons in your Supabase database or ask the AI tutor to help you start learning." action="Start Learning" onAction={() => setActiveView("ai")} /> : <CollectionView title="Continue Learning" items={dashboard.lessons} empty="No lessons yet." action="Start Learning" onAction={() => setActiveView("ai")} />}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: number }) {
  return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Icon className="mb-4 h-8 w-8 text-emerald-600" /><p className="text-3xl font-extrabold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>
}

function CollectionView({ title, items, empty, action, onAction }: { title: string; items: Array<{ id: string; title: string; description?: string | null; category?: string | null }>; empty: string; action: string; onAction: () => void }) {
  if (!items.length) return <EmptyState title={empty} description="When you add real database records, they will appear here automatically." action={action} onAction={onAction} />
  return <section><h2 className="mb-4 text-2xl font-extrabold">{title}</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><p className="font-extrabold">{item.title}</p><p className="mt-2 text-sm text-slate-500">{item.description || item.category}</p></div>)}</div></section>
}

function VocabularyView({ latestVocabulary, onAction }: { latestVocabulary?: { word: string; definition: string; example_sentence?: string | null; pronunciation?: string | null }; onAction: () => void }) {
  if (!latestVocabulary) return <EmptyState title="No vocabulary saved yet" description="Save vocabulary records in Supabase or ask Lisan AI to create words for your level." action="Ask AI for vocabulary" onAction={onAction} />
  return <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-7 dark:border-emerald-900 dark:bg-emerald-950/40"><p className="font-bold text-emerald-600">Vocabulary of the Day</p><h2 className="mt-3 text-4xl font-extrabold">{latestVocabulary.word}</h2><p className="mt-3 text-lg">{latestVocabulary.pronunciation}</p><p className="mt-4 text-slate-600 dark:text-slate-300">{latestVocabulary.definition}</p><p className="mt-4 rounded-2xl bg-white/70 p-4 text-sm dark:bg-slate-900/70">{latestVocabulary.example_sentence}</p></div>
}

function AiTutorView({ conversation, isSendingMessage, userInput, setUserInput, handleConversationSubmit, skillLevel, setSkillLevel, conversationEndRef }: { conversation: ChatMessage[]; isSendingMessage: boolean; userInput: string; setUserInput: (value: string) => void; handleConversationSubmit: (event: React.FormEvent) => void; skillLevel: SkillLevel; setSkillLevel: (value: SkillLevel) => void; conversationEndRef: React.RefObject<HTMLDivElement> }) {
  return <section className="rounded-[2rem] bg-[#071b44] p-5 text-white shadow-xl"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-emerald-300">AI Tutor</p><h2 className="text-2xl font-extrabold">Practice English or Arabic</h2></div><select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as SkillLevel)} className="rounded-2xl bg-white/10 px-4 py-3 text-white outline-none">{skillLevels.map((level) => <option key={level} value={level} className="text-slate-950">{level}</option>)}</select></div><div className="mb-4 h-[55vh] overflow-y-auto rounded-3xl bg-white/10 p-4">{conversation.length === 0 ? <div className="grid h-full place-items-center text-center text-white/70">No chat history yet. Send your first message to generate a real AI answer.</div> : conversation.map((entry) => <div key={entry.id} className={`mb-3 flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm ${entry.role === "user" ? "bg-emerald-600 text-white" : "bg-white text-slate-950"}`}><p className="mb-1 text-xs font-bold opacity-70">{entry.role === "user" ? "You" : "Lisan AI"}</p>{entry.content}</div></div>)}{isSendingMessage && <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-950">Generating your answer...</div>}<div ref={conversationEndRef} /></div><form onSubmit={handleConversationSubmit} className="flex gap-2"><Input value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={isSendingMessage} placeholder="Ask Lisan AI..." className="h-12 rounded-2xl bg-white text-slate-950" /><Button disabled={isSendingMessage || !userInput.trim()} className="h-12 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">{isSendingMessage ? <Loader2 className="animate-spin" /> : <Send />}</Button></form></section>
}

function ProgressView({ dashboard, overallProgress }: { dashboard: DashboardData; overallProgress: number }) {
  return <section><h2 className="mb-4 text-2xl font-extrabold">Progress</h2><div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><p className="text-5xl font-extrabold text-emerald-600">{overallProgress}%</p><p className="mt-2 text-slate-500">Overall progress from your saved database records.</p>{dashboard.progress.length === 0 && <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800">No progress data yet.</p>}</div></section>
}

function ProfileView({ profile, email, onLogout }: { profile: DashboardData["profile"]; email: string; onLogout: () => void }) {
  return <section className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-2xl font-extrabold">Profile & Settings</h2><p className="mt-4 text-slate-500">{email}</p><p className="mt-2 text-slate-500">{profile?.full_name || "No profile name saved."}</p><Button onClick={onLogout} className="mt-6 rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">Logout</Button></section>
}
