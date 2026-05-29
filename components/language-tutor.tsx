"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  Crown,
  Flame,
  Globe2,
  GraduationCap,
  Headphones,
  HeartHandshake,
  HelpCircle,
  Home,
  Languages,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  MoreHorizontal,
  Pause,
  PenLine,
  Play,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Upload,
  User,
  Volume2,
  WalletCards,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AppRoute =
  | "welcome"
  | "signup"
  | "signin"
  | "home"
  | "chat"
  | "lessons"
  | "vocabulary"
  | "grammar"
  | "speaking"
  | "listening"
  | "translation"
  | "progress"
  | "profile"
  | "settings"
  | "quiz"
  | "premium"
  | "forgot-password"
  | "change-password"
  | "achievements"
  | "support"

type ConversationEntry = {
  speaker: "User" | "AI"
  message: string
}

interface WordExercise {
  word: string
  definition: string
  exampleSentence: string
}

interface GrammarExercise {
  question: string
  options: string[]
  correctAnswer: string
}

type ToastState = {
  message: string
  id: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

const routeLabels: Record<AppRoute, string> = {
  welcome: "Lisan AI",
  signup: "Create Account",
  signin: "Welcome Back",
  home: "Home",
  chat: "AI Chat",
  lessons: "Lessons",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  speaking: "Speaking Practice",
  listening: "Listening Practice",
  translation: "Translate",
  progress: "Progress",
  profile: "Profile",
  settings: "Settings",
  quiz: "Quiz",
  premium: "Go Premium",
  "forgot-password": "Forgot Password",
  "change-password": "Change Password",
  achievements: "Achievements",
  support: "Help & Support",
}

const navItems: Array<{ route: AppRoute; label: string; icon: typeof Home }> = [
  { route: "home", label: "Home", icon: Home },
  { route: "lessons", label: "Lessons", icon: BookOpen },
  { route: "chat", label: "Tutor", icon: Bot },
  { route: "progress", label: "Progress", icon: Target },
  { route: "profile", label: "Profile", icon: User },
]

const desktopRoutes: Array<{ route: AppRoute; label: string; icon: typeof Home }> = [
  ...navItems,
  { route: "vocabulary", label: "Vocabulary", icon: Bookmark },
  { route: "grammar", label: "Grammar", icon: GraduationCap },
  { route: "speaking", label: "Speaking", icon: Mic },
  { route: "listening", label: "Listening", icon: Headphones },
  { route: "translation", label: "Translate", icon: Languages },
  { route: "quiz", label: "Quiz", icon: Zap },
  { route: "premium", label: "Premium", icon: Crown },
  { route: "settings", label: "Settings", icon: Settings },
]

const lessons = [
  { title: "Daily Conversation", count: "12 Lessons", progress: 65, icon: MessageCircle, tone: "bg-emerald-100 text-emerald-600" },
  { title: "Travel & Tourism", count: "10 Lessons", progress: 40, icon: Globe2, tone: "bg-blue-100 text-blue-600" },
  { title: "Business English", count: "15 Lessons", progress: 20, icon: WalletCards, tone: "bg-orange-100 text-orange-600" },
  { title: "Grammar Basics", count: "10 Lessons", progress: 70, icon: BookOpen, tone: "bg-green-100 text-green-600" },
  { title: "Pronunciation", count: "12 Lessons", progress: 30, icon: Mic, tone: "bg-rose-100 text-rose-600" },
  { title: "Interview Skills", count: "8 Lessons", progress: 10, icon: Award, tone: "bg-sky-100 text-sky-600" },
]

const grammarTopics = [
  { title: "Your Progress", subtitle: "70% Completed", icon: Target, progress: 70 },
  { title: "Verb Tenses", subtitle: "12 Lessons", icon: CalendarDays },
  { title: "Nouns & Pronouns", subtitle: "8 Lessons", icon: User },
  { title: "Adjectives & Adverbs", subtitle: "10 Lessons", icon: Sparkles },
  { title: "Prepositions", subtitle: "6 Lessons", icon: Globe2 },
  { title: "Conjunctions", subtitle: "6 Lessons", icon: LinkIcon },
]

function LinkIcon(props: React.ComponentProps<typeof ChevronRight>) {
  return <ChevronRight {...props} />
}

const skillProgress = [
  { label: "Grammar", value: 80, color: "bg-emerald-500" },
  { label: "Vocabulary", value: 70, color: "bg-amber-500" },
  { label: "Speaking", value: 65, color: "bg-sky-500" },
  { label: "Listening", value: 60, color: "bg-violet-500" },
]

function getRouteFromPath(pathname: string): AppRoute {
  const value = pathname.replace(/^\//, "") || "welcome"
  return Object.prototype.hasOwnProperty.call(routeLabels, value) ? (value as AppRoute) : "welcome"
}

function routePath(route: AppRoute) {
  return route === "welcome" ? "/" : `/${route}`
}

function RobotMascot({ size = "lg", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizes = {
    sm: "h-14 w-14 text-2xl",
    md: "h-24 w-24 text-5xl",
    lg: "h-36 w-36 text-7xl",
    xl: "h-48 w-48 text-8xl",
  }

  return (
    <div className={cn("relative mx-auto grid place-items-center", sizes[size], className)} aria-label="Lisan AI robot mascot">
      <div className="absolute inset-0 rounded-full bg-emerald-100 blur-2xl" />
      <div className="absolute -top-1 left-1/2 h-4 w-1 -translate-x-1/2 rounded-full bg-emerald-500" />
      <div className="absolute -top-4 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-300" />
      <div className="relative grid h-[74%] w-[78%] place-items-center rounded-[2rem] border-[6px] border-white bg-gradient-to-b from-white to-emerald-50 shadow-2xl shadow-emerald-200">
        <div className="grid h-[48%] w-[72%] grid-cols-2 items-center gap-3 rounded-[1.3rem] bg-[#071A3D] px-4 shadow-inner">
          <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
          <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
        </div>
        <div className="absolute bottom-4 grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-xs text-white">✓</div>
      </div>
      <div className="absolute left-0 top-1/2 h-8 w-5 -translate-y-1/2 rounded-full bg-white shadow-md" />
      <div className="absolute right-0 top-1/2 h-8 w-5 -translate-y-1/2 rounded-full bg-white shadow-md" />
      <Sparkles className="absolute right-2 top-4 h-5 w-5 text-emerald-400" />
      <Sparkles className="absolute bottom-5 left-2 h-4 w-4 text-emerald-300" />
    </div>
  )
}

function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/home" className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
        <BookOpen className="h-6 w-6 fill-white/20" />
      </span>
      {!compact && (
        <span>
          <span className="block text-lg font-extrabold leading-5 text-[#071A3D]">Lisan AI</span>
          <span className="block text-xs font-bold text-emerald-600">English Tutor</span>
        </span>
      )}
    </Link>
  )
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[1.7rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-100/80", className)}>{children}</div>
}

function PageHeader({ title, subtitle, showBack = true, right }: { title: string; subtitle?: string; showBack?: boolean; right?: ReactNode }) {
  const router = useRouter()

  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => router.back()} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#071A3D] shadow-sm" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-extrabold text-[#071A3D]">{title}</h1>
          {subtitle && <p className="text-sm font-medium text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </header>
  )
}

function ProgressLine({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full bg-emerald-500", className)} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  )
}

function EmptyState({ icon: Icon = Sparkles, title, body }: { icon?: typeof Sparkles; title: string; body: string }) {
  return (
    <Card className="grid place-items-center py-10 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-600">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-extrabold text-[#071A3D]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">{body}</p>
    </Card>
  )
}

export function LanguageTutorComponent() {
  const pathname = usePathname()
  const router = useRouter()
  const route = getRouteFromPath(pathname || "/")
  const [skillLevel] = useState("Beginner")
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [userInput, setUserInput] = useState("")
  const [chatError, setChatError] = useState<string | null>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [wordError, setWordError] = useState<string | null>(null)
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [wordExercises, setWordExercises] = useState<WordExercise[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentGrammarExercise, setCurrentGrammarExercise] = useState<GrammarExercise | null>(null)
  const [grammarError, setGrammarError] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("Ahmed Ali")
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const conversationEndRef = useRef<HTMLDivElement>(null)

  const currentWord = wordExercises[currentWordIndex]
  const profileEmail = "ahmed@example.com"

  useEffect(() => {
    const storedAuth = window.localStorage.getItem("lisan-authenticated")
    const storedName = window.localStorage.getItem("lisan-user-name")
    setIsAuthenticated(storedAuth === "true")
    if (storedName) setUserName(storedName)
  }, [])

  useEffect(() => {
    if (["home", "vocabulary", "grammar", "chat"].includes(route)) {
      fetchWords()
      fetchExercise()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillLevel, route])

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, isSendingMessage])

  useEffect(() => {
    if (!isRecording) return undefined
    const interval = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000)
    return () => window.clearInterval(interval)
  }, [isRecording])

  const showToast = (message = "Coming soon") => {
    const id = Date.now()
    setToast({ message, id })
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, 2400)
  }

  const signIn = (name = "Ahmed Ali") => {
    window.localStorage.setItem("lisan-authenticated", "true")
    window.localStorage.setItem("lisan-user-name", name)
    setIsAuthenticated(true)
    setUserName(name)
    router.push("/home")
    showToast("Signed in")
  }

  const signOut = () => {
    window.localStorage.removeItem("lisan-authenticated")
    setIsAuthenticated(false)
    router.push("/")
    showToast("Signed out")
  }

  const fetchWords = async () => {
    setIsLoadingWord(true)
    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vocabulary", skillLevel }),
      })
      const data = await response.json().catch(() => ({ error: "Invalid API response" }))
      if (response.ok && Array.isArray(data)) {
        setWordExercises(data)
        setCurrentWordIndex(0)
        setWordError(null)
      } else {
        setWordError(typeof data.error === "string" ? data.error : "No vocabulary found")
        setWordExercises([])
      }
    } catch {
      setWordError("Vocabulary is unavailable right now")
      setWordExercises([])
    } finally {
      setIsLoadingWord(false)
    }
  }

  const fetchExercise = async () => {
    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "grammar", skillLevel }),
      })
      const data = await response.json().catch(() => ({ error: "Invalid API response" }))
      if (response.ok && data?.question) {
        setCurrentGrammarExercise(data)
        setSelectedAnswer(null)
        setIsAnswerCorrect(null)
        setGrammarError(null)
      } else {
        setGrammarError(typeof data.error === "string" ? data.error : "No grammar exercise found")
        setCurrentGrammarExercise(null)
      }
    } catch {
      setGrammarError("Grammar practice is unavailable right now")
      setCurrentGrammarExercise(null)
    }
  }

  const handleConversationSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedInput = userInput.trim()
    if (!trimmedInput || isSendingMessage) return

    setChatError(null)
    setIsSendingMessage(true)
    setUserInput("")
    setConversation((entries) => [...entries, { speaker: "User", message: trimmedInput }])

    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "conversation", userInput: trimmedInput, skillLevel }),
      })
      const data = await response.json().catch(() => ({ error: "Invalid API response" }))
      if (response.ok && typeof data.message === "string") {
        setConversation((entries) => [...entries, { speaker: "AI", message: data.message }])
      } else {
        setChatError(typeof data.error === "string" ? data.error : "Failed to get AI response")
      }
    } catch {
      setChatError("Failed to get AI response")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const playText = (text?: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast()
      return
    }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  const shellLessRoutes: AppRoute[] = ["welcome", "signin", "signup", "forgot-password", "change-password"]
  const content = useMemo(() => {
    switch (route) {
      case "welcome":
        return <WelcomeScreen isAuthenticated={isAuthenticated} />
      case "signin":
        return <SignInScreen onSubmit={signIn} showToast={showToast} />
      case "signup":
        return <SignUpScreen onSubmit={signIn} showToast={showToast} />
      case "forgot-password":
        return <ForgotPasswordScreen showToast={showToast} />
      case "change-password":
        return <ChangePasswordScreen showToast={showToast} />
      case "home":
        return <HomeScreen isAuthenticated={isAuthenticated} userName={userName} signOut={signOut} words={wordExercises} />
      case "chat":
        return <ChatScreen conversation={conversation} userInput={userInput} setUserInput={setUserInput} onSubmit={handleConversationSubmit} isSending={isSendingMessage} error={chatError} endRef={conversationEndRef} showToast={showToast} playText={playText} />
      case "lessons":
        return <LessonsScreen showToast={showToast} />
      case "vocabulary":
        return <VocabularyScreen words={wordExercises} error={wordError} loading={isLoadingWord} currentWord={currentWord} currentWordIndex={currentWordIndex} setCurrentWordIndex={setCurrentWordIndex} fetchWords={fetchWords} playText={playText} />
      case "grammar":
        return <GrammarScreen exercise={currentGrammarExercise} error={grammarError} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} isAnswerCorrect={isAnswerCorrect} setIsAnswerCorrect={setIsAnswerCorrect} fetchExercise={fetchExercise} />
      case "speaking":
        return <SpeakingScreen isRecording={isRecording} setIsRecording={setIsRecording} seconds={recordingSeconds} setSeconds={setRecordingSeconds} showToast={showToast} />
      case "listening":
        return <ListeningScreen showToast={showToast} />
      case "translation":
        return <TranslationScreen showToast={showToast} playText={playText} />
      case "progress":
        return <ProgressScreen />
      case "profile":
        return <ProfileScreen userName={userName} email={profileEmail} signOut={signOut} />
      case "settings":
        return <SettingsScreen signOut={signOut} showToast={showToast} />
      case "quiz":
        return <QuizScreen showToast={showToast} />
      case "premium":
        return <PremiumScreen showToast={showToast} />
      case "achievements":
        return <AchievementsScreen />
      case "support":
        return <SupportScreen showToast={showToast} />
      default:
        return <WelcomeScreen isAuthenticated={isAuthenticated} />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, isAuthenticated, userName, conversation, userInput, isSendingMessage, chatError, wordExercises, wordError, isLoadingWord, currentWord, currentWordIndex, currentGrammarExercise, grammarError, selectedAnswer, isAnswerCorrect, isRecording, recordingSeconds])

  return (
    <div className="min-h-screen bg-[#F4FBF8] font-sans text-[#071A3D]">
      <div className={cn("mx-auto flex min-h-screen w-full max-w-[1500px]", shellLessRoutes.includes(route) && "max-w-none justify-center bg-white md:bg-[#F4FBF8]")}>
        {!shellLessRoutes.includes(route) && <DesktopSidebar activeRoute={route} signOut={signOut} />}
        <main className={cn("mx-auto w-full max-w-md px-4 pb-24 pt-4 md:max-w-5xl md:px-8 md:pb-10", shellLessRoutes.includes(route) && "grid max-w-md place-items-center px-6 py-6")}>
          {content}
        </main>
        {!shellLessRoutes.includes(route) && <BottomNav activeRoute={route} />}
      </div>
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#071A3D] px-5 py-3 text-sm font-bold text-white shadow-2xl md:bottom-8">
          {toast.message}
        </div>
      )}
    </div>
  )
}

function DesktopSidebar({ activeRoute, signOut }: { activeRoute: AppRoute; signOut: () => void }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-emerald-100 bg-white/90 p-6 shadow-xl shadow-emerald-50 lg:block">
      <AppLogo />
      <nav className="mt-10 space-y-2">
        {desktopRoutes.map((item) => {
          const Icon = item.icon
          const active = activeRoute === item.route
          return (
            <Link key={item.route} href={routePath(item.route)} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition", active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600")}>
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <button onClick={signOut} className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm hover:text-red-500">
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </aside>
  )
}

function BottomNav({ activeRoute }: { activeRoute: AppRoute }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-emerald-100 bg-white/95 px-3 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeRoute === item.route
          return (
            <Link key={item.route} href={routePath(item.route)} className={cn("grid place-items-center gap-1 rounded-2xl py-2 text-[11px] font-bold", active ? "text-emerald-600" : "text-slate-500")}>
              <span className={cn("grid h-9 w-9 place-items-center rounded-2xl", item.route === "chat" ? "-mt-6 h-14 w-14 border-4 border-white bg-emerald-500 text-white shadow-xl shadow-emerald-200" : active ? "bg-emerald-50" : "")}>
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function WelcomeScreen({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="flex min-h-[calc(100vh-3rem)] w-full flex-col items-center justify-between rounded-[2rem] bg-white px-6 py-10 text-center shadow-2xl shadow-slate-200 md:min-h-[760px]">
      <div />
      <div className="w-full">
        <AppLogo />
        <div className="mt-14">
          <RobotMascot size="xl" />
        </div>
        <p className="mx-auto mt-8 max-w-xs text-base font-bold leading-7 text-[#071A3D]">Your smart AI English learning partner.</p>
      </div>
      <div className="w-full space-y-3">
        <Button asChild className="h-12 w-full rounded-2xl bg-emerald-600 font-extrabold text-white hover:bg-emerald-700">
          <Link href={isAuthenticated ? "/home" : "/signup"}>Get Started</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 w-full rounded-2xl border-slate-200 bg-white font-extrabold text-emerald-600">
          <Link href={isAuthenticated ? "/home" : "/signin"}>{isAuthenticated ? "Open Dashboard" : "Sign In"}</Link>
        </Button>
      </div>
    </section>
  )
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="w-full rounded-[2rem] bg-white px-5 py-6 shadow-2xl shadow-slate-200 md:min-h-[760px]">
      <PageHeader title="" showBack right={null} />
      <RobotMascot size="md" />
      <div className="mb-6 mt-4 text-center">
        <h1 className="text-2xl font-extrabold text-[#071A3D]">{title}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function SignInScreen({ onSubmit, showToast }: { onSubmit: () => void; showToast: (message?: string) => void }) {
  return (
    <AuthShell title="Welcome Back!" subtitle="Sign in to continue your learning journey.">
      <form onSubmit={(event) => { event.preventDefault(); onSubmit() }} className="space-y-4">
        <LabeledInput label="Email Address" type="email" placeholder="Enter your email address" icon={Mail} required />
        <LabeledInput label="Password" type="password" placeholder="Enter your password" icon={Lock} required />
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs font-extrabold text-emerald-600">Forgot Password?</Link>
        </div>
        <Button className="h-12 w-full rounded-2xl bg-emerald-600 font-extrabold text-white hover:bg-emerald-700">Sign In</Button>
      </form>
      <SocialButtons showToast={showToast} />
      <p className="mt-8 text-center text-sm text-slate-500">Don&apos;t have an account? <Link href="/signup" className="font-extrabold text-emerald-600">Sign Up</Link></p>
    </AuthShell>
  )
}

function SignUpScreen({ onSubmit, showToast }: { onSubmit: (name?: string) => void; showToast: (message?: string) => void }) {
  const [name, setName] = useState("")
  return (
    <AuthShell title="Create Your Account" subtitle="Join Lisan AI and start your English learning journey today!">
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(name || "Ahmed Ali") }} className="space-y-3">
        <LabeledInput label="Full Name" placeholder="Enter your full name" icon={User} value={name} onChange={(event) => setName(event.target.value)} required />
        <LabeledInput label="Email Address" type="email" placeholder="Enter your email address" icon={Mail} required />
        <LabeledInput label="Password" type="password" placeholder="Create a password" icon={Lock} required />
        <LabeledInput label="Confirm Password" type="password" placeholder="Confirm your password" icon={Lock} required />
        <label className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-slate-600">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-emerald-300 accent-emerald-600" />
          <span>I agree to the <button type="button" onClick={() => showToast()} className="text-emerald-600">Terms of Service</button> and <button type="button" onClick={() => showToast()} className="text-emerald-600">Privacy Policy</button></span>
        </label>
        <Button className="h-12 w-full rounded-2xl bg-emerald-600 font-extrabold text-white hover:bg-emerald-700">Sign Up</Button>
      </form>
      <SocialButtons showToast={showToast} />
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/signin" className="font-extrabold text-emerald-600">Log In</Link></p>
    </AuthShell>
  )
}

function ForgotPasswordScreen({ showToast }: { showToast: (message?: string) => void }) {
  return (
    <AuthShell title="Forgot Password" subtitle="No worries! Reset your password.">
      <form onSubmit={(event) => { event.preventDefault(); showToast("Password reset link sent") }} className="space-y-5">
        <LabeledInput label="Email Address" type="email" placeholder="Enter your email address" icon={Mail} required />
        <Button className="h-12 w-full rounded-2xl bg-emerald-600 font-extrabold text-white hover:bg-emerald-700">Send Reset Link</Button>
      </form>
    </AuthShell>
  )
}

function ChangePasswordScreen({ showToast }: { showToast: (message?: string) => void }) {
  return (
    <AuthShell title="Change Password" subtitle="Enter your new password.">
      <form onSubmit={(event) => { event.preventDefault(); showToast("Password updated") }} className="space-y-4">
        <LabeledInput label="Current Password" type="password" placeholder="Enter current password" icon={Lock} required />
        <LabeledInput label="New Password" type="password" placeholder="Enter new password" icon={Lock} required />
        <LabeledInput label="Confirm Password" type="password" placeholder="Confirm new password" icon={Lock} required />
        <Button className="h-12 w-full rounded-2xl bg-emerald-600 font-extrabold text-white hover:bg-emerald-700">Update Password</Button>
      </form>
    </AuthShell>
  )
}

function LabeledInput({ label, icon: Icon, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: typeof Mail }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold text-[#071A3D]">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input {...props} className={cn("h-12 rounded-2xl border-slate-200 pl-11 text-sm shadow-sm", className)} />
      </span>
    </label>
  )
}

function SocialButtons({ showToast }: { showToast: (message?: string) => void }) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-xs font-medium text-slate-400"><span className="h-px flex-1 bg-slate-100" />or sign up with<span className="h-px flex-1 bg-slate-100" /></div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {['Google', 'Apple', 'Facebook'].map((label) => (
          <button key={label} onClick={() => showToast()} className="h-11 rounded-2xl border border-slate-200 bg-white text-xs font-extrabold shadow-sm" type="button">{label}</button>
        ))}
      </div>
    </div>
  )
}

function HomeScreen({ isAuthenticated, userName, signOut, words }: { isAuthenticated: boolean; userName: string; signOut: () => void; words: WordExercise[] }) {
  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <AppLogo />
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link href="/profile" className="grid h-11 w-11 place-items-center rounded-full bg-orange-100 text-xl shadow-sm">👨🏻</Link>
            <button onClick={signOut} className="hidden rounded-2xl bg-white px-3 py-2 text-xs font-extrabold text-slate-500 shadow-sm sm:block">Sign Out</button>
          </div>
        ) : (
          <Button asChild className="rounded-2xl bg-emerald-600 font-extrabold text-white"><Link href="/signin">Sign In</Link></Button>
        )}
      </header>

      <section className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 text-white shadow-2xl shadow-emerald-100">
          <div className="grid grid-cols-[1fr_140px] items-center gap-2">
            <div>
              <h1 className="text-2xl font-extrabold leading-tight">Welcome back,<br />{userName.split(' ')[0]}! 👋</h1>
              <p className="mt-3 text-sm font-medium text-emerald-50">Let&apos;s continue your English learning journey.</p>
              <Button asChild className="mt-5 rounded-2xl bg-white text-emerald-600 hover:bg-emerald-50"><Link href="/chat">Chat with AI</Link></Button>
            </div>
            <RobotMascot size="md" className="scale-110" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 md:grid-cols-2">
          <StatCard icon={BookOpen} value="24" label="Lessons" />
          <StatCard icon={Flame} value="12" label="Day Streak" className="text-orange-500" />
          <StatCard icon={Trophy} value="1250" label="XP Points" className="text-violet-500" />
          <StatCard icon={Target} value="75%" label="Progress" className="text-blue-500" />
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-[1.1fr_.9fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Continue Learning</h2>
            <Link href="/lessons" className="text-xs font-extrabold text-emerald-600">See all</Link>
          </div>
          <Card className="grid grid-cols-[96px_1fr_auto] items-center gap-4 p-4">
            <div className="grid h-24 place-items-center rounded-[1.4rem] bg-emerald-50 text-5xl">👨‍🏫</div>
            <div>
              <h3 className="font-extrabold">Daily Conversation</h3>
              <p className="mt-1 text-xs font-medium text-slate-500">Lesson 12 • At The Coffee Shop</p>
              <p className="mt-3 text-xs font-extrabold text-emerald-600">40% Completed</p>
              <ProgressLine value={40} />
            </div>
            <Button asChild size="icon" className="rounded-full bg-emerald-500 text-white"><Link href="/lessons"><ChevronRight className="h-5 w-5" /></Link></Button>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-extrabold">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-2">
            <QuickAction route="chat" label="AI Tutor" icon={Bot} />
            <QuickAction route="lessons" label="Lessons" icon={BookOpen} />
            <QuickAction route="vocabulary" label="Vocabulary" icon={Bookmark} />
            <QuickAction route="speaking" label="Practice" icon={Mic} />
          </div>
        </div>
      </section>

      <Card className="mt-6 flex items-center gap-4 bg-emerald-50 p-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">🎯</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Daily Goal</h3>
            <span className="text-xs font-extrabold text-emerald-600">12 / 20 words learned</span>
          </div>
          <ProgressLine value={60} />
          {words.length === 0 && <p className="mt-2 text-xs font-bold text-slate-500">No vocabulary loaded yet. Start your first word set.</p>}
        </div>
        <Button asChild className="rounded-2xl bg-emerald-600 text-white"><Link href="/vocabulary">Start New</Link></Button>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, value, label, className }: { icon: typeof BookOpen; value: string; label: string; className?: string }) {
  return (
    <Card className="grid place-items-center p-3 text-center">
      <Icon className={cn("mb-2 h-6 w-6 text-emerald-500", className)} />
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
    </Card>
  )
}

function QuickAction({ route, label, icon: Icon }: { route: AppRoute; label: string; icon: typeof Bot }) {
  return (
    <Link href={routePath(route)} className="grid place-items-center rounded-3xl bg-white p-4 text-center shadow-xl shadow-slate-100">
      <span className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Icon className="h-6 w-6" /></span>
      <span className="text-xs font-extrabold">{label}</span>
    </Link>
  )
}

function ChatScreen({ conversation, userInput, setUserInput, onSubmit, isSending, error, endRef, showToast, playText }: { conversation: ConversationEntry[]; userInput: string; setUserInput: (value: string) => void; onSubmit: (event: FormEvent) => void; isSending: boolean; error: string | null; endRef: React.RefObject<HTMLDivElement>; showToast: (message?: string) => void; playText: (text?: string) => void }) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col md:min-h-[calc(100vh-5rem)]">
      <PageHeader title="AI Chat" subtitle="Your AI English Tutor" right={<div className="flex gap-2"><button onClick={() => showToast()} className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm"><Settings className="h-5 w-5 text-emerald-600" /></button><button onClick={() => showToast()} className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm"><RefreshCw className="h-5 w-5 text-emerald-600" /></button></div>} />
      <div className="flex-1 space-y-4 overflow-y-auto rounded-[2rem] bg-white p-4 shadow-xl shadow-slate-100">
        {conversation.length === 0 && (
          <div className="flex gap-3">
            <RobotMascot size="sm" className="mx-0 shrink-0" />
            <div className="max-w-[82%] rounded-[1.4rem] rounded-tl-sm bg-white p-4 text-sm font-medium shadow-lg shadow-slate-100 ring-1 ring-slate-100">
              Of course! I&apos;d be happy to help you improve your English speaking. Here are some tips:<br /><br />• Practice speaking daily.<br />• Listen to English conversations.<br />• Learn and use new vocabulary.<br />• Don&apos;t be afraid to make mistakes.
              <button onClick={() => playText("Practice speaking daily. Listen to English conversations. Learn and use new vocabulary.")} className="mt-3 flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-600"><Play className="h-3 w-3" /> Play Audio</button>
            </div>
          </div>
        )}
        {conversation.map((entry, index) => (
          <div key={`${entry.speaker}-${index}`} className={cn("flex gap-3", entry.speaker === "User" && "justify-end")}>
            {entry.speaker === "AI" && <RobotMascot size="sm" className="mx-0 shrink-0" />}
            <div className={cn("max-w-[82%] rounded-[1.4rem] p-4 text-sm font-medium shadow-lg", entry.speaker === "User" ? "rounded-tr-sm bg-violet-100 text-[#071A3D]" : "rounded-tl-sm bg-white shadow-slate-100 ring-1 ring-slate-100")}>{entry.message}
              {entry.speaker === "AI" && <button onClick={() => playText(entry.message)} className="mt-3 flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-600"><Play className="h-3 w-3" /> Play Audio</button>}
            </div>
          </div>
        ))}
        {isSending && <div className="flex items-center gap-3 text-sm font-bold text-slate-500"><RobotMascot size="sm" className="mx-0" /> Lisan AI is typing...</div>}
        {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={onSubmit} className="mt-3 rounded-[1.4rem] bg-white p-2 shadow-xl shadow-slate-100">
        <Input value={userInput} onChange={(event) => setUserInput(event.target.value)} placeholder="Type your message..." className="mb-2 h-11 rounded-2xl border-slate-100" />
        <div className="grid grid-cols-[1fr_1fr_1fr_48px] gap-2">
          <button type="button" onClick={() => showToast()} className="rounded-2xl bg-slate-50 py-2 text-xs font-bold text-slate-600"><Upload className="mx-auto mb-1 h-4 w-4" />Attach</button>
          <button type="button" onClick={() => showToast()} className="rounded-2xl bg-slate-50 py-2 text-xs font-bold text-red-500"><Mic className="mx-auto mb-1 h-4 w-4" />Record</button>
          <button type="button" onClick={() => playText(conversation.at(-1)?.message)} className="rounded-2xl bg-emerald-50 py-2 text-xs font-bold text-emerald-600"><Volume2 className="mx-auto mb-1 h-4 w-4" />Play Text</button>
          <Button size="icon" disabled={isSending} className="h-full rounded-2xl bg-emerald-600 text-white"><Send className="h-5 w-5" /></Button>
        </div>
      </form>
    </div>
  )
}

function LessonsScreen({ showToast }: { showToast: (message?: string) => void }) {
  return (
    <div>
      <PageHeader title="Lessons" subtitle="Choose a topic to learn" right={<button onClick={() => showToast()} className="text-emerald-600"><MoreHorizontal className="h-6 w-6" /></button>} />
      <SearchBar placeholder="Search lessons..." />
      <FilterPills items={["All", "Beginner", "Intermediate", "Advanced"]} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => <LessonCard key={lesson.title} lesson={lesson} />)}
      </div>
    </div>
  )
}

function LessonCard({ lesson }: { lesson: typeof lessons[number] }) {
  const Icon = lesson.icon
  return (
    <Link href="/chat" className="block rounded-[1.5rem] bg-white p-4 shadow-xl shadow-slate-100">
      <div className="grid grid-cols-[56px_1fr_auto] items-center gap-4">
        <span className={cn("grid h-14 w-14 place-items-center rounded-2xl", lesson.tone)}><Icon className="h-7 w-7" /></span>
        <div>
          <h3 className="font-extrabold">{lesson.title}</h3>
          <p className="mt-1 text-xs font-bold text-slate-500">{lesson.count}</p>
        </div>
        <span className="text-xs font-extrabold text-[#071A3D]">{lesson.progress}%</span>
      </div>
      <div className="mt-4 pl-[72px]"><ProgressLine value={lesson.progress} /></div>
    </Link>
  )
}

function VocabularyScreen({ words, error, loading, currentWord, currentWordIndex, setCurrentWordIndex, fetchWords, playText }: { words: WordExercise[]; error: string | null; loading: boolean; currentWord?: WordExercise; currentWordIndex: number; setCurrentWordIndex: (value: number | ((prev: number) => number)) => void; fetchWords: () => void; playText: (text?: string) => void }) {
  return (
    <div>
      <PageHeader title="Vocabulary" subtitle="Expand your word power" />
      <SearchBar placeholder="Search vocabulary..." />
      <FilterPills items={["All", "Basic", "Intermediate", "Advanced"]} />
      {error && <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">{error}</div>}
      {loading ? <EmptyState icon={RefreshCw} title="Loading words" body="Preparing your vocabulary set." /> : words.length === 0 ? <EmptyState icon={Bookmark} title="No vocabulary found" body="Start your first word set when vocabulary is available." /> : (
        <div className="mt-5 space-y-4">
          {currentWord && (
            <Card className="bg-emerald-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-600">Word of the Day</p>
                  <h2 className="mt-2 text-3xl font-extrabold">{currentWord.word}</h2>
                  <p className="mt-2 text-sm font-bold text-slate-500">{currentWord.definition}</p>
                </div>
                <button onClick={() => playText(currentWord.word)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm"><Volume2 className="h-5 w-5" /></button>
              </div>
              <p className="mt-4 rounded-2xl bg-white/80 p-4 text-sm font-medium text-slate-600">{currentWord.exampleSentence}</p>
              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" disabled={currentWordIndex === 0} onClick={() => setCurrentWordIndex((index) => Math.max(0, index - 1))} className="rounded-2xl">Previous</Button>
                <Button onClick={() => currentWordIndex < words.length - 1 ? setCurrentWordIndex((index) => index + 1) : fetchWords()} className="rounded-2xl bg-emerald-600 text-white">{currentWordIndex < words.length - 1 ? "Next" : "New Set"}</Button>
              </div>
            </Card>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {words.map((word) => (
              <Card key={`${word.word}-${word.definition}`} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-extrabold">{word.word}</h3><p className="mt-1 text-xs font-medium text-slate-500">{word.definition}</p></div>
                  <div className="flex gap-2"><button onClick={() => playText(word.word)} className="text-emerald-600"><Volume2 className="h-5 w-5" /></button><button className="text-emerald-600"><Bookmark className="h-5 w-5" /></button></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GrammarScreen({ exercise, error, selectedAnswer, setSelectedAnswer, isAnswerCorrect, setIsAnswerCorrect, fetchExercise }: { exercise: GrammarExercise | null; error: string | null; selectedAnswer: string | null; setSelectedAnswer: (value: string | null) => void; isAnswerCorrect: boolean | null; setIsAnswerCorrect: (value: boolean | null) => void; fetchExercise: () => void }) {
  return (
    <div>
      <PageHeader title="Grammar" subtitle="Learn grammar step by step" />
      <SearchBar placeholder="Search grammar topics..." />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {grammarTopics.map((topic) => {
          const Icon = topic.icon
          return <Card key={topic.title} className="p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Icon className="h-5 w-5" /></span><div className="flex-1"><h3 className="text-sm font-extrabold">{topic.title}</h3><p className="text-xs font-bold text-slate-500">{topic.subtitle}</p>{topic.progress && <ProgressLine value={topic.progress} />}</div><ChevronRight className="h-4 w-4 text-slate-400" /></div></Card>
        })}
      </div>
      <section className="mt-5">
        <h2 className="mb-3 text-lg font-extrabold">Exercises</h2>
        {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">{error}</div>}
        {!exercise ? <EmptyState icon={GraduationCap} title="No exercise found" body="Grammar exercises will appear here when available." /> : (
          <Card>
            <p className="text-sm font-bold text-slate-500">Choose the correct answer</p>
            <h3 className="mt-2 text-lg font-extrabold">{exercise.question}</h3>
            <div className="mt-4 space-y-3">
              {exercise.options.map((option) => (
                <button key={option} onClick={() => { setSelectedAnswer(option); setIsAnswerCorrect(null) }} className={cn("flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm font-bold", selectedAnswer === option ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-white text-slate-600")}>{option}{selectedAnswer === option && <Check className="h-4 w-4" />}</button>
              ))}
            </div>
            {isAnswerCorrect !== null && <p className={cn("mt-4 rounded-2xl p-3 text-sm font-extrabold", isAnswerCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>{isAnswerCorrect ? "Correct! Great job." : `Try again. Correct answer: ${exercise.correctAnswer}`}</p>}
            <div className="mt-5 flex gap-3">
              <Button onClick={() => setIsAnswerCorrect(selectedAnswer === exercise.correctAnswer)} className="flex-1 rounded-2xl bg-emerald-600 text-white">Check Answer</Button>
              <Button onClick={fetchExercise} variant="outline" className="rounded-2xl">New</Button>
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}

function SpeakingScreen({ isRecording, setIsRecording, seconds, setSeconds, showToast }: { isRecording: boolean; setIsRecording: (value: boolean) => void; seconds: number; setSeconds: (value: number) => void; showToast: (message?: string) => void }) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0")
  const secs = String(seconds % 60).padStart(2, "0")
  return (
    <div>
      <PageHeader title="Speaking Practice" subtitle="Improve your speaking skills" />
      <Card className="bg-emerald-50">
        <div className="grid grid-cols-[1fr_110px] items-center gap-3">
          <div><p className="text-sm font-bold text-emerald-700">Today&apos;s Practice</p><h2 className="text-xl font-extrabold">At the Restaurant</h2><p className="mt-2 text-xs font-bold text-slate-500">Level: Intermediate • 5-7 min</p></div>
          <div className="text-6xl">👩‍🍳</div>
        </div>
      </Card>
      <div className="my-8 grid place-items-center">
        <button onClick={() => { setIsRecording(!isRecording); if (!isRecording) setSeconds(0) }} className={cn("grid h-40 w-40 place-items-center rounded-full shadow-2xl", isRecording ? "bg-red-500 text-white shadow-red-100" : "bg-emerald-500 text-white shadow-emerald-100")}><Mic className="h-16 w-16" /></button>
        <p className="mt-4 text-3xl font-extrabold">{minutes}:{secs}</p>
        <p className="text-sm font-bold text-slate-500">{isRecording ? "Recording..." : "Tap microphone to start"}</p>
      </div>
      <div className="grid grid-cols-2 gap-3"><Button onClick={() => setIsRecording(false)} variant="outline" className="h-12 rounded-2xl"><Pause className="mr-2 h-4 w-4" />Pause</Button><Button onClick={() => { setIsRecording(false); showToast("Feedback generated") }} className="h-12 rounded-2xl bg-emerald-600 text-white">Finish</Button></div>
      <Card className="mt-5"><h3 className="font-extrabold">AI Feedback</h3><p className="mt-2 text-sm font-medium text-slate-500">Start a recording to receive pronunciation feedback.</p><div className="mt-4 flex items-center justify-between"><span className="font-bold">Pronunciation score</span><span className="text-2xl font-extrabold text-emerald-600">--</span></div></Card>
    </div>
  )
}

function ListeningScreen({ showToast }: { showToast: (message?: string) => void }) {
  return (
    <div>
      <PageHeader title="Listening Practice" subtitle="Improve your listening skills" />
      <Card className="bg-emerald-50"><div className="grid grid-cols-[1fr_120px] items-center"><div><p className="text-sm font-bold text-emerald-700">Daily Listening</p><h2 className="text-xl font-extrabold">The Importance of Sleep</h2><p className="mt-2 text-xs font-bold text-slate-500">Level: Beginner • 5 min</p></div><Headphones className="h-24 w-24 text-[#071A3D]" /></div><Button onClick={() => showToast()} className="mt-5 rounded-2xl bg-emerald-600 text-white"><Play className="mr-2 h-4 w-4" /> Play Audio</Button></Card>
      <h2 className="mb-3 mt-6 text-lg font-extrabold">Categories</h2>
      <div className="grid grid-cols-2 gap-4">{[{ title: "Conversations", icon: MessageCircle }, { title: "Podcasts", icon: Headphones }, { title: "News", icon: BookOpen }, { title: "Stories", icon: Star }].map((item) => <Card key={item.title} className="p-4"><item.icon className="mb-3 h-7 w-7 text-emerald-600" /><h3 className="font-extrabold">{item.title}</h3><p className="text-xs font-bold text-slate-500">10 Lessons</p></Card>)}</div>
    </div>
  )
}

function TranslationScreen({ showToast, playText }: { showToast: (message?: string) => void; playText: (text?: string) => void }) {
  const [input, setInput] = useState("Good morning, how are you?")
  const [result, setResult] = useState("صباح الخير، كيف حالك؟")
  return (
    <div>
      <PageHeader title="Translate" subtitle="Translate text easily" />
      <Card>
        <label className="text-xs font-extrabold">Enter text in English</label>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-slate-100 p-4 text-sm font-medium outline-none focus:border-emerald-300" />
        <div className="my-4 grid grid-cols-[1fr_40px_1fr] items-center gap-3"><button className="rounded-2xl border border-slate-100 p-3 text-sm font-bold">English</button><Languages className="mx-auto h-5 w-5 text-emerald-600" /><button className="rounded-2xl border border-slate-100 p-3 text-sm font-bold">Arabic</button></div>
        <Button onClick={() => { setResult(input ? "صباح الخير، كيف حالك؟" : ""); showToast("Translated") }} className="h-12 w-full rounded-2xl bg-emerald-600 text-white">Translate</Button>
      </Card>
      <Card className="mt-5"><p className="text-xs font-extrabold text-slate-500">Translation</p><p className="mt-4 min-h-16 text-right text-xl font-extrabold">{result || "Translation will appear here."}</p><div className="mt-4 flex justify-between"><button onClick={() => showToast("Copied") } className="text-emerald-600"><Copy className="h-5 w-5" /></button><button onClick={() => playText(result)} className="text-emerald-600"><Volume2 className="h-5 w-5" /></button></div></Card>
    </div>
  )
}

function ProgressScreen() {
  return (
    <div>
      <PageHeader title="Progress" subtitle="Track your learning progress" />
      <Card><h2 className="mb-5 font-extrabold">Overall Progress</h2><div className="grid grid-cols-[150px_1fr] items-center gap-5"><div className="grid h-36 w-36 place-items-center rounded-full border-[12px] border-emerald-500 bg-white text-3xl font-extrabold shadow-inner">75%</div><div className="space-y-4"><StatMini icon={BookOpen} label="Lessons Completed" value="24" /><StatMini icon={Zap} label="XP Earned" value="1250" /><StatMini icon={Flame} label="Day Streak" value="12" /></div></div></Card>
      <Card className="mt-5"><h2 className="mb-4 font-extrabold">Skills Progress</h2><div className="space-y-4">{skillProgress.map((skill) => <div key={skill.label}><div className="mb-2 flex items-center justify-between text-sm font-bold"><span>{skill.label}</span><span>{skill.value}%</span></div><ProgressLine value={skill.value} className={skill.color} /></div>)}</div></Card>
      <Card className="mt-5"><h2 className="mb-3 font-extrabold">Calendar Streak</h2><div className="grid grid-cols-7 gap-2">{Array.from({ length: 21 }).map((_, index) => <span key={index} className={cn("grid h-9 place-items-center rounded-xl text-xs font-bold", index % 5 === 0 ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-700")}>{index + 1}</span>)}</div></Card>
    </div>
  )
}

function StatMini({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Icon className="h-5 w-5" /></span><div><p className="text-xs font-bold text-slate-500">{label}</p><p className="font-extrabold">{value}</p></div></div>
}

function ProfileScreen({ userName, email, signOut }: { userName: string; email: string; signOut: () => void }) {
  return (
    <div>
      <PageHeader title="Profile" subtitle="Your learning profile" />
      <Card className="grid place-items-center bg-emerald-50 text-center"><div className="grid h-24 w-24 place-items-center rounded-full bg-orange-100 text-6xl shadow-lg">👨🏻</div><h2 className="mt-4 text-xl font-extrabold">{userName}</h2><p className="text-sm font-bold text-slate-500">{email}</p><p className="mt-1 text-xs font-extrabold text-emerald-600">Beginner Level</p></Card>
      <div className="mt-5 grid grid-cols-3 gap-3"><StatCard icon={BookOpen} value="24" label="Lessons" /><StatCard icon={Zap} value="1250" label="XP" /><StatCard icon={Flame} value="12" label="Streak" /></div>
      <div className="mt-5 space-y-3"><ProfileLink href="/settings" icon={PenLine} label="Edit Profile" /><ProfileLink href="/progress" icon={Target} label="Learning Goals" /><ProfileLink href="/achievements" icon={Award} label="Achievements" /><ProfileLink href="/settings" icon={Settings} label="Settings" /><ProfileLink href="/support" icon={HelpCircle} label="Help & Support" /><button onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-sm font-extrabold text-red-500 shadow-lg shadow-slate-100"><LogOut className="h-5 w-5" /> Sign Out <ChevronRight className="ml-auto h-4 w-4" /></button></div>
    </div>
  )
}

function ProfileLink({ href, icon: Icon, label }: { href: string; icon: typeof Settings; label: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-extrabold shadow-lg shadow-slate-100"><Icon className="h-5 w-5 text-[#071A3D]" />{label}<ChevronRight className="ml-auto h-4 w-4 text-slate-400" /></Link>
}

function SettingsScreen({ signOut, showToast }: { signOut: () => void; showToast: (message?: string) => void }) {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Customize your experience" />
      <SettingsGroup title="General"><ToggleRow icon={Moon} label="Dark Mode" /><ToggleRow icon={Bell} label="Notifications" defaultChecked /><SelectRow icon={Globe2} label="Language" value="English" onClick={() => showToast()} /><SelectRow icon={Volume2} label="Audio Speed" value="Normal" onClick={() => showToast()} /></SettingsGroup>
      <SettingsGroup title="Account"><ProfileLink href="/change-password" icon={Lock} label="Change Password" /><button onClick={() => showToast()} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-sm font-extrabold shadow-lg shadow-slate-100"><ShieldCheck className="h-5 w-5" />Privacy Policy<ChevronRight className="ml-auto h-4 w-4" /></button><button onClick={() => showToast()} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-sm font-extrabold shadow-lg shadow-slate-100"><HeartHandshake className="h-5 w-5" />About Lisan AI<ChevronRight className="ml-auto h-4 w-4" /></button></SettingsGroup>
      <Button onClick={signOut} className="mt-6 h-12 w-full rounded-2xl bg-red-500 font-extrabold text-white hover:bg-red-600"><LogOut className="mr-2 h-4 w-4" />Log out</Button>
    </div>
  )
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-5"><h2 className="mb-3 text-sm font-extrabold">{title}</h2><div className="space-y-3">{children}</div></section>
}

function ToggleRow({ icon: Icon, label, defaultChecked = false }: { icon: typeof Moon; label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return <button onClick={() => setChecked(!checked)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-sm font-extrabold shadow-lg shadow-slate-100"><Icon className="h-5 w-5" />{label}<span className={cn("ml-auto flex h-6 w-11 items-center rounded-full p-1 transition", checked ? "bg-emerald-500" : "bg-slate-200")}><span className={cn("h-4 w-4 rounded-full bg-white transition", checked && "translate-x-5")} /></span></button>
}

function SelectRow({ icon: Icon, label, value, onClick }: { icon: typeof Globe2; label: string; value: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-sm font-extrabold shadow-lg shadow-slate-100"><Icon className="h-5 w-5" />{label}<span className="ml-auto text-xs text-slate-500">{value}</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
}

function QuizScreen({ showToast }: { showToast: (message?: string) => void }) {
  const [answer, setAnswer] = useState("Joyful")
  return <div><PageHeader title="Quiz" subtitle="Test your knowledge" right={<span className="text-xs font-extrabold text-emerald-600">Question 2 of 10</span>} /><Card><h2 className="text-lg font-extrabold">Which word is a synonym of “Happy”?</h2><div className="mt-5 space-y-3">{["Sad", "Joyful", "Angry", "Tired"].map((item) => <button key={item} onClick={() => setAnswer(item)} className={cn("flex w-full items-center gap-3 rounded-2xl border p-4 text-sm font-bold", answer === item ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-100")}>{item}{answer === item && <Check className="ml-auto h-4 w-4" />}</button>)}</div><Button onClick={() => showToast(answer === "Joyful" ? "Correct!" : "Try again")} className="mt-6 h-12 w-full rounded-2xl bg-emerald-600 text-white">Next Question</Button></Card></div>
}

function PremiumScreen({ showToast }: { showToast: (message?: string) => void }) {
  return <div><PageHeader title="Go Premium" subtitle="Unlock all features" showBack /><Card><ul className="space-y-3 text-sm font-bold text-slate-600">{["Unlimited AI Chat", "All Lessons Access", "Advanced Practice", "No Ads", "Priority Support"].map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{item}</li>)}</ul></Card><div className="mt-5 grid grid-cols-2 gap-4"><Card className="text-center"><p className="text-sm font-bold text-slate-500">Monthly</p><p className="mt-2 text-2xl font-extrabold">$4.99</p><p className="text-xs text-slate-500">per month</p></Card><Card className="text-center ring-2 ring-emerald-300"><p className="text-sm font-bold text-slate-500">Yearly</p><p className="mt-2 text-2xl font-extrabold">$29.99</p><p className="text-xs text-emerald-600">Save 50%</p></Card></div><Button onClick={() => showToast()} className="mt-6 h-12 w-full rounded-2xl bg-emerald-600 text-white">Continue</Button></div>
}

function AchievementsScreen() {
  const achievements = [{ title: "First Lesson", body: "Complete your first lesson", icon: Trophy }, { title: "7 Day Streak", body: "Learn for 7 days in a row", icon: Flame }, { title: "Vocabulary Master", body: "Learn 100 new words", icon: Award }, { title: "Quiz Master", body: "Score 90% in 5 quizzes", icon: ShieldCheck }]
  return <div><PageHeader title="Achievements" subtitle="Your achievements" /><div className="space-y-3">{achievements.map((item, index) => <Card key={item.title} className={cn("p-4", index < 3 ? "bg-emerald-50" : "bg-slate-50 opacity-80")}><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm"><item.icon className="h-7 w-7" /></span><div><h3 className="font-extrabold">{item.title}</h3><p className="text-xs font-bold text-slate-500">{item.body}</p></div></div></Card>)}</div></div>
}

function SupportScreen({ showToast }: { showToast: (message?: string) => void }) {
  return <div><PageHeader title="Help & Support" subtitle="We&apos;re here to help you." /><Card><h2 className="mb-4 font-extrabold">Frequently Asked Questions</h2>{["How does AI Tutor work?", "How can I improve my speaking?", "How to change language?", "How to reset my progress?"].map((q) => <button key={q} onClick={() => showToast()} className="flex w-full items-center justify-between border-b border-slate-100 py-4 text-left text-sm font-bold last:border-0">{q}<ChevronRight className="h-4 w-4 text-slate-400" /></button>)}</Card><Button onClick={() => showToast()} className="mt-6 h-12 w-full rounded-2xl bg-emerald-600 text-white">Contact Support</Button></div>
}

function SearchBar({ placeholder }: { placeholder: string }) {
  return <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input placeholder={placeholder} className="h-12 rounded-2xl border-slate-200 bg-white pl-11 shadow-sm" /></div>
}

function FilterPills({ items }: { items: string[] }) {
  const [active, setActive] = useState(items[0])
  return <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{items.map((item) => <button key={item} onClick={() => setActive(item)} className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-extrabold", active === item ? "bg-emerald-600 text-white" : "bg-white text-slate-500 shadow-sm")}>{item}</button>)}</div>
}
