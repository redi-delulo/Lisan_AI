"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Flame,
  GraduationCap,
  Home,
  Languages,
  LayoutDashboard,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Play,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Upload,
  User,
  Users,
  WalletCards,
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
  | "tutors"
  | "tutor-detail"
  | "booking"
  | "dashboard"
  | "profile"
  | "admin"
  | "pricing"
  | "about"
  | "forgot-password"
  | "change-password"

type ConversationEntry = {
  speaker: "User" | "AI"
  message: string
}

type ToastState = {
  message: string
  id: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

const assets = {
  logo: "/logo/lisan-ai-logo.png",
  favicon: "/icons/favicon.png",
  hero: "/images/lisan-saas-hero.png",
  aiChat: "/illustrations/ai-chat-graphic.png",
  robot: "/illustrations/ai-robot-tutor.png",
  speaking: "/illustrations/speaking-coach.png",
  grammar: "/illustrations/grammar-coach.png",
  vocabulary: "/illustrations/vocabulary-builder.png",
  listening: "/illustrations/listening-lab.png",
  progress: "/illustrations/progress-achievement.png",
  empty: "/illustrations/empty-state.png",
  premium: "/illustrations/premium-upgrade.png",
  badgeGrammar: "/icons/badge-grammar.png",
  badgeSpeaking: "/icons/badge-speaking.png",
  badgeStreak: "/icons/badge-streak.png",
  badgePremium: "/icons/badge-premium.png",
}

const routeLabels: Record<AppRoute, string> = {
  welcome: "Lisan AI Tutor",
  signup: "Create Account",
  signin: "Sign In",
  home: "Home",
  chat: "AI Tutor",
  lessons: "Learn",
  tutors: "Find Tutors",
  "tutor-detail": "Tutor Profile",
  booking: "Book Tutor",
  dashboard: "Dashboard",
  profile: "Profile",
  admin: "Admin",
  pricing: "Pricing",
  about: "About",
  "forgot-password": "Forgot Password",
  "change-password": "Change Password",
}

const bottomNavItems: Array<{ route: AppRoute; label: string; icon: typeof Home }> = [
  { route: "home", label: "Home", icon: Home },
  { route: "lessons", label: "Learn", icon: BookOpen },
  { route: "tutors", label: "Tutors", icon: Users },
  { route: "chat", label: "Chat", icon: MessageCircle },
  { route: "profile", label: "Profile", icon: User },
]

const desktopNavItems: Array<{ route: AppRoute; label: string }> = [
  { route: "home", label: "Home" },
  { route: "chat", label: "AI Tutor" },
  { route: "tutors", label: "Find Tutors" },
  { route: "pricing", label: "Pricing" },
  { route: "about", label: "About" },
]

const tutors = [
  {
    name: "Mekdes Alemu",
    initials: "MA",
    specialty: "Conversational English",
    rating: "4.9",
    description: "Expert in daily conversations, fluency & pronunciation.",
    lessons: "640+ Lessons",
    students: "120+ Students",
    avatar: assets.speaking,
  },
  {
    name: "Aisha Mohamed",
    initials: "AM",
    specialty: "Arabic Speaking",
    rating: "4.8",
    description: "Specializing in Arabic speaking, listening & conversation.",
    lessons: "760+ Lessons",
    students: "150+ Students",
    avatar: assets.grammar,
  },
  {
    name: "Omar Hassan",
    initials: "OH",
    specialty: "Modern Standard Arabic",
    rating: "4.9",
    description: "Master MSA grammar, reading, and writing with ease.",
    lessons: "980+ Lessons",
    students: "200+ Students",
    avatar: assets.listening,
  },
  {
    name: "Sara Ahmed",
    initials: "SA",
    specialty: "English Coach",
    rating: "4.8",
    description: "Build confidence in speaking, writing & exam preparation.",
    lessons: "1200+ Lessons",
    students: "250+ Students",
    avatar: assets.vocabulary,
  },
]

function getRouteFromPath(pathname: string): AppRoute {
  const value = pathname.replace(/^\//, "") || "welcome"
  return Object.prototype.hasOwnProperty.call(routeLabels, value) ? (value as AppRoute) : "welcome"
}

function routePath(route: AppRoute) {
  return route === "welcome" ? "/" : `/${route}`
}

function AppLogo({ centered = false, compact = false }: { centered?: boolean; compact?: boolean }) {
  return (
    <Link href="/home" className={cn("flex items-center gap-3", centered && "justify-center")} aria-label="Lisan AI Tutor home">
      <img src={assets.logo} alt="Lisan AI Tutor logo" className={cn("h-14 w-14 object-contain", compact && "h-11 w-11")} />
      {!compact && (
        <span className="leading-none">
          <span className="block text-[26px] font-black tracking-tight text-[var(--navy)]">
            Lisan <span className="text-[var(--orange)]">AI</span> Tutor
          </span>
          <span className="mt-1 block text-center text-sm font-extrabold text-[var(--green-dark)]">ሊሳን AI ቲውተር</span>
        </span>
      )}
    </Link>
  )
}

function Shell({ route, children, showBottomNav = true }: { route: AppRoute; children: ReactNode; showBottomNav?: boolean }) {
  return (
    <div className="min-h-screen bg-white text-[var(--text-main)]">
      <DesktopNavbar activeRoute={route} />
      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>
      {showBottomNav && <BottomNav activeRoute={route} />}
    </div>
  )
}

function DesktopNavbar({ activeRoute }: { activeRoute: AppRoute }) {
  return (
    <nav className="sticky top-0 z-40 hidden border-b border-[var(--border)] bg-white/95 backdrop-blur lg:block">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <AppLogo compact />
        <div className="flex items-center gap-2">
          {desktopNavItems.map((item) => (
            <Link key={item.route} href={routePath(item.route)} className={cn("rounded-full px-4 py-2 text-sm font-extrabold", activeRoute === item.route ? "bg-[var(--warning-bg)] text-[var(--orange-dark)]" : "text-[var(--navy)] hover:bg-[var(--soft-blue)]")}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="text-sm font-extrabold text-[var(--navy)]">Login</Link>
          <Button asChild className="btn-primary h-11 px-5"><Link href="/signup">Sign Up</Link></Button>
        </div>
      </div>
    </nav>
  )
}

function BottomNav({ activeRoute }: { activeRoute: AppRoute }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-[28px] border border-b-0 border-[var(--border)] bg-white/97 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-12px_34px_rgba(8,43,95,0.12)] backdrop-blur lg:hidden" aria-label="Mobile navigation">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const active = activeRoute === item.route || (activeRoute === "dashboard" && item.route === "home")
          return (
            <Link key={item.route} href={routePath(item.route)} className={cn("grid min-h-14 place-items-center gap-0.5 rounded-2xl text-[12px] font-bold", active ? "text-[var(--orange-dark)]" : "text-[var(--text-secondary)]")}>
              <Icon className="h-6 w-6" />
              <span>{item.label}</span>
              <span className={cn("h-1 w-8 rounded-full", active ? "bg-[var(--orange)]" : "bg-transparent")} />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]", className)}>{children}</div>
}

function TopHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <AppLogo compact={false} />
      <div className="flex items-center gap-3">
        <button className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white text-[var(--navy)] shadow-[var(--shadow-card)]" aria-label="Notifications">
          <Bell className="h-6 w-6" />
          <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--orange)] text-[10px] font-black text-white">3</span>
        </button>
        <Link href="/profile" aria-label="Open profile" className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-[var(--soft-blue)] ring-4 ring-white shadow-[var(--shadow-card)]">
          <span className="text-2xl">👩🏽</span>
        </Link>
      </div>
      {(title || subtitle) && <span className="sr-only">{title} {subtitle}</span>}
    </header>
  )
}

function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const router = useRouter()
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <button onClick={() => router.back()} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[var(--navy)] shadow-[var(--shadow-card)]" aria-label="Go back">
        <ArrowLeft className="h-6 w-6" />
      </button>
      <div className="text-center">
        <h1 className="text-2xl font-black text-[var(--navy)]">{title}</h1>
        {subtitle && <p className="text-sm font-semibold text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[var(--navy)] shadow-[var(--shadow-card)]">{right || <User className="h-6 w-6" />}</div>
    </header>
  )
}

export function LanguageTutorComponent() {
  const pathname = usePathname()
  const route = getRouteFromPath(pathname || "/")
  const router = useRouter()
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [userInput, setUserInput] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const conversationEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, isSendingMessage])

  const showToast = (message = "Great job!") => {
    const id = Date.now()
    setToast({ message, id })
    window.setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 2400)
  }

  const signIn = () => {
    window.localStorage.setItem("lisan-authenticated", "true")
    router.push("/dashboard")
    showToast("Profile updated successfully.")
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
        body: JSON.stringify({ action: "conversation", userInput: trimmedInput, skillLevel: "Beginner" }),
      })
      const data = await response.json().catch(() => ({ error: "Invalid API response" }))
      if (response.ok && typeof data?.response === "string") {
        setConversation((entries) => [...entries, { speaker: "AI", message: data.response }])
      } else if (response.ok && typeof data?.message === "string") {
        setConversation((entries) => [...entries, { speaker: "AI", message: data.message }])
      } else {
        setChatError(typeof data.error === "string" ? data.error : "AI Tutor is unavailable right now")
      }
    } catch {
      setChatError("AI Tutor is unavailable right now")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const content = (() => {
    switch (route) {
      case "signup": return <SignUpScreen onSubmit={signIn} />
      case "signin": return <SignInScreen onSubmit={signIn} />
      case "home": return <HomeScreen />
      case "chat": return <ChatScreen conversation={conversation} userInput={userInput} setUserInput={setUserInput} onSubmit={handleConversationSubmit} isSending={isSendingMessage} error={chatError} endRef={conversationEndRef} showToast={showToast} />
      case "lessons": return <LearnScreen />
      case "tutors": return <TutorsScreen />
      case "tutor-detail": return <TutorDetailScreen />
      case "booking": return <BookingScreen showToast={showToast} />
      case "dashboard": return <DashboardScreen />
      case "profile": return <ProfileScreen showToast={showToast} />
      case "admin": return <AdminScreen />
      case "pricing": return <PricingScreen />
      case "about": return <AboutScreen />
      case "forgot-password": return <PasswordScreen title="Forgot Password" button="Send Message" />
      case "change-password": return <PasswordScreen title="Change Password" button="Save Changes" />
      default: return <WelcomeScreen />
    }
  })()

  return (
    <Shell route={route} showBottomNav={!(["welcome", "signin", "signup", "forgot-password", "change-password"] as AppRoute[]).includes(route)}>
      {content}
      {toast && <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[var(--deep-navy)] px-5 py-3 text-sm font-extrabold text-white shadow-2xl">{toast.message}</div>}
    </Shell>
  )
}

function WelcomeScreen() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col items-center justify-between overflow-hidden rounded-[36px] bg-white px-5 py-8 text-center lg:min-h-[760px]">
      <AppLogo centered />
      <div className="relative mt-4 w-full">
        <div className="absolute inset-x-4 top-10 h-64 rounded-[40%] bg-[var(--soft-blue)]" />
        <img src={assets.hero} alt="Student learning English and Arabic with an AI tutor" className="relative mx-auto h-auto w-full max-w-xl object-contain" />
      </div>
      <div className="w-full">
        <h1 className="text-[40px] font-black leading-tight tracking-tight text-[var(--navy)] sm:text-5xl">
          Learn Smarter.<br /><span className="text-[var(--orange)]">Speak</span> <span className="text-[var(--green-dark)]">Confidently.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-[var(--text-secondary)]">Smart AI practice, live tutors, and full support for <strong className="text-[var(--navy)]">English</strong>, <strong className="text-[var(--green-dark)]">Arabic</strong>, and <strong className="text-[var(--navy)]">Amharic</strong>.</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniFeature image={assets.robot} title="AI Tutor" text="Practice anytime, anywhere" />
          <MiniFeature icon={<GraduationCap className="h-7 w-7" />} tone="orange" title="Live Teachers" text="Learn with certified expert teachers" />
          <MiniFeature icon={<Languages className="h-7 w-7" />} tone="green" title="Amharic Support" text="Full Amharic language support" />
        </div>
        <div className="mt-7 space-y-4">
          <Button asChild className="btn-primary h-[58px] w-full text-lg"><Link href="/signup">Get Started <ChevronRight className="ml-2 h-6 w-6" /></Link></Button>
          <Button asChild variant="outline" className="btn-secondary h-[58px] w-full text-lg"><Link href="/signin">Sign In</Link></Button>
        </div>
      </div>
      <div className="mt-8 flex w-full items-center justify-center gap-4 text-sm font-bold text-[var(--navy)]">
        <ShieldCheck className="h-6 w-6 text-[var(--green)]" /> Trusted by learners worldwide <span className="rounded-full border border-[var(--border)] px-3 py-2 text-[var(--green-dark)]">+2K</span>
      </div>
    </section>
  )
}

function MiniFeature({ title, text, image, icon, tone = "navy" }: { title: string; text: string; image?: string; icon?: ReactNode; tone?: "navy" | "orange" | "green" }) {
  const toneClass = tone === "orange" ? "bg-[var(--orange)] text-white" : tone === "green" ? "bg-[var(--green)] text-white" : "bg-[var(--navy)] text-white"
  return <Card className="flex items-center gap-3 rounded-3xl p-3 text-left"><span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", toneClass)}>{image ? <img src={image} alt="" className="h-11 w-11 object-contain" /> : icon}</span><span><strong className="block text-sm font-black text-[var(--navy)]">{title}</strong><span className="text-xs font-semibold text-[var(--text-secondary)]">{text}</span></span></Card>
}

function HomeScreen() {
  return (
    <div className="mx-auto max-w-6xl">
      <TopHeader />
      <section className="grid items-center gap-8 overflow-hidden rounded-[36px] bg-[var(--soft-blue)] p-5 md:grid-cols-[1fr_.95fr] md:p-10">
        <div>
          <h1 className="text-[34px] font-black leading-tight tracking-tight text-[var(--navy)] md:text-6xl">Learn English &<br /><span className="text-[var(--orange)]">Arabic</span><br /><span className="text-[var(--navy)]">with AI and Live Tutors</span></h1>
          <p className="mt-5 max-w-xl text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">Smart AI practice, real conversations, and expert teachers — all in one place, anytime, anywhere.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LanguageChip label="🇺🇸 English" />
            <LanguageChip label="العربية Arabic" />
            <LanguageChip label="🇪🇹 አማርኛ Amharic" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Button asChild className="btn-primary h-[58px] text-lg"><Link href="/dashboard">Start Learning <ChevronRight className="ml-2 h-6 w-6" /></Link></Button>
            <Button asChild variant="outline" className="btn-secondary h-[58px] text-lg"><Link href="/booking">Book Tutor <CalendarDays className="ml-2 h-5 w-5" /></Link></Button>
          </div>
        </div>
        <div className="relative">
          <img src={assets.hero} alt="Smiling student using Lisan AI Tutor with books and AI chat" className="mx-auto w-full max-w-lg object-contain" />
        </div>
      </section>
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <FeatureCard image={assets.robot} title="AI Tutor" text="Practice speaking, writing, grammar and vocabulary with our smart AI tutor available 24/7." />
        <FeatureCard icon={<GraduationCap className="h-9 w-9" />} tone="orange" title="Live Teachers" text="Learn with certified English teachers through 1-on-1 live sessions tailored for you." />
        <FeatureCard icon={<Languages className="h-9 w-9" />} tone="green" title="Amharic Support" text="Full support in Amharic to help you understand and learn with confidence." />
      </section>
      <Card className="mt-8 grid items-center gap-5 p-5 sm:grid-cols-[1fr_1fr_160px]">
        <ProgressStat icon={<Flame className="h-10 w-10 fill-[var(--green)] text-[var(--green)]" />} value="7" label="Day Streak" caption="Keep it up!" />
        <ProgressStat icon={<BookOpen className="h-9 w-9 text-[var(--navy)]" />} value="120" label="Lessons Completed" caption="Great progress!" />
        <img src={assets.progress} alt="Progress achievement trophy" className="mx-auto h-28 w-36 object-contain" />
      </Card>
    </div>
  )
}

function LanguageChip({ label }: { label: string }) {
  return <span className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-extrabold text-[var(--navy)] shadow-[var(--shadow-card)]">{label}</span>
}

function FeatureCard({ title, text, image, icon, tone = "navy" }: { title: string; text: string; image?: string; icon?: ReactNode; tone?: "navy" | "orange" | "green" }) {
  const toneClass = tone === "orange" ? "bg-[var(--orange)]" : tone === "green" ? "bg-[var(--green)]" : "bg-[var(--navy)]"
  return <Card className="min-h-64 p-7"><span className={cn("mb-7 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg", toneClass)}>{image ? <img src={image} alt="AI robot tutor" className="h-14 w-14 object-contain" /> : icon}</span><h3 className="text-xl font-black text-[var(--navy)]">{title}</h3><p className="mt-4 text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">{text}</p></Card>
}

function ProgressStat({ icon, value, label, caption }: { icon: ReactNode; value: string; label: string; caption: string }) {
  return <div className="flex items-center gap-4"><span>{icon}</span><span><strong className="block text-4xl font-black text-[var(--navy)]">{value}</strong><span className="block text-sm font-semibold text-[var(--navy)]">{label}</span><span className="block text-sm font-extrabold text-[var(--green-dark)]">{caption}</span></span></div>
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-8 rounded-[36px] bg-[var(--soft-blue)] p-5 lg:grid-cols-[.9fr_1.1fr] lg:p-10">
      <div className="hidden text-center lg:block">
        <AppLogo centered />
        <img src={assets.aiChat} alt="AI tutor chat illustration" className="mx-auto mt-8 max-h-[520px] w-full object-contain" />
      </div>
      <Card className="mx-auto w-full max-w-xl p-6 sm:p-8">
        <AppLogo centered />
        <div className="my-8 text-center">
          <h1 className="text-3xl font-black text-[var(--navy)]">{title}</h1>
          <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)]">{subtitle}</p>
        </div>
        {children}
      </Card>
    </section>
  )
}

function SignInScreen({ onSubmit }: { onSubmit: () => void }) {
  return (
    <AuthShell title="Sign In" subtitle="Learn Smarter. Speak Confidently.">
      <form onSubmit={(event) => { event.preventDefault(); onSubmit() }} className="space-y-4">
        <LabeledInput label="Email Address" name="email" type="email" placeholder="Enter your email address" icon={Mail} required />
        <LabeledInput label="Password" name="password" type="password" placeholder="Enter your password" icon={Lock} required />
        <div className="text-right"><Link href="/forgot-password" className="text-sm font-extrabold text-[var(--orange-dark)]">Forgot Password?</Link></div>
        <Button className="btn-primary h-[58px] w-full text-lg">Sign In</Button>
      </form>
      <p className="mt-6 text-center text-sm font-semibold text-[var(--text-secondary)]">Don&apos;t have an account? <Link href="/signup" className="font-black text-[var(--orange-dark)]">Create Account</Link></p>
    </AuthShell>
  )
}

function SignUpScreen({ onSubmit }: { onSubmit: () => void }) {
  return (
    <AuthShell title="Create Account" subtitle="Start practicing English, Arabic, and Amharic support today.">
      <form onSubmit={(event) => { event.preventDefault(); onSubmit() }} className="space-y-4">
        <LabeledInput label="Full Name" name="full_name" placeholder="Enter your full name" icon={User} required />
        <LabeledInput label="Email Address" name="email" type="email" placeholder="Enter your email address" icon={Mail} required />
        <LabeledInput label="Password" name="password" type="password" placeholder="Create a password" icon={Lock} required />
        <SelectField label="Role" name="role" options={["Student", "Teacher"]} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Native language" name="native_language" options={["Amharic", "Arabic", "English"]} />
          <SelectField label="Target language" name="target_language" options={["English", "Arabic"]} />
        </div>
        <Button className="btn-primary h-[58px] w-full text-lg">Create Account</Button>
      </form>
      <p className="mt-6 text-center text-sm font-semibold text-[var(--text-secondary)]">Already have an account? <Link href="/signin" className="font-black text-[var(--orange-dark)]">Sign In</Link></p>
    </AuthShell>
  )
}

function LabeledInput({ label, icon: Icon, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: typeof Mail }) {
  return <label className="block"><span className="mb-2 block text-sm font-black text-[var(--navy)]">{label}</span><span className="relative block"><Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" /><Input {...props} className={cn("h-[54px] rounded-2xl border-[var(--border)] bg-white pl-12 text-base font-semibold shadow-sm focus-visible:ring-[var(--orange)]", className)} /></span></label>
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="block"><span className="mb-2 block text-sm font-black text-[var(--navy)]">{label}</span><select name={name} className="h-[54px] w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-base font-semibold text-[var(--navy)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--orange)]">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function ChatScreen({ conversation, userInput, setUserInput, onSubmit, isSending, error, endRef, showToast }: { conversation: ConversationEntry[]; userInput: string; setUserInput: (value: string) => void; onSubmit: (event: FormEvent) => void; isSending: boolean; error: string | null; endRef: React.RefObject<HTMLDivElement>; showToast: (message?: string) => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader title="AI Tutor" right={<Settings className="h-6 w-6" />} />
      <Card className="mb-5 flex items-center gap-4 p-4">
        <span className="relative grid h-20 w-20 place-items-center rounded-full bg-[var(--navy)]"><img src={assets.robot} alt="AI Tutor robot avatar" className="h-16 w-16 object-contain" /><span className="absolute bottom-2 right-1 h-4 w-4 rounded-full border-2 border-white bg-[var(--green)]" /></span>
        <div><h2 className="text-2xl font-black text-[var(--navy)]">AI Tutor</h2><p className="font-semibold text-[var(--text-secondary)]">Your personal English & Arabic tutor</p><p className="font-extrabold text-[var(--green-dark)]">● Online</p></div>
      </Card>
      <div className="space-y-5 pb-40">
        <AiBubble> <p>Hello! 👋<br />Let&apos;s practice together!<br />How are you today?</p><AudioWave /></AiBubble>
        <UserBubble text="I’m good! I want to practice speaking English and Arabic." />
        <AiBubble><p>Great! Let’s start with a sentence.<br />Please try to say this in English:</p><p className="mt-3 text-xl" dir="rtl">أنا أتعلم اللغة الإنجليزية كل يوم.</p><p>(I learn English every day.)</p></AiBubble>
        <UserBubble text="I learn English every days." bold />
        <AiBubble><GrammarFeedback /></AiBubble>
        {conversation.map((entry, index) => entry.speaker === "User" ? <UserBubble key={index} text={entry.message} /> : <AiBubble key={index}><p>{entry.message}</p></AiBubble>)}
        {isSending && <AiBubble><p>Thinking...</p></AiBubble>}
        {error && <Card className="border-[var(--error)] text-sm font-bold text-[var(--error)]">{error}</Card>}
        <div ref={endRef} />
      </div>
      <div className="fixed inset-x-0 bottom-[88px] z-30 mx-auto max-w-3xl px-4 lg:bottom-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {[["Pronunciation", assets.badgeSpeaking], ["Grammar", assets.badgeGrammar], ["Translate", ""], ["More", ""]].map(([label, image]) => <button key={label} onClick={() => showToast(label)} className="flex min-h-12 shrink-0 items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--navy)] shadow-[var(--shadow-card)]">{image ? <img src={image} alt="" className="h-6 w-6" /> : <MoreHorizontal className="h-5 w-5" />}{label}</button>)}
        </div>
        <form onSubmit={onSubmit} className="flex items-center gap-3 rounded-[28px] border border-[var(--border)] bg-white p-3 shadow-[0_12px_38px_rgba(8,43,95,0.16)]">
          <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--navy)] shadow-sm" aria-label="Microphone"><Mic className="h-7 w-7" /></button>
          <Input value={userInput} onChange={(event) => setUserInput(event.target.value)} placeholder="Type a message..." aria-label="Type a message" className="h-12 border-0 text-base font-semibold shadow-none focus-visible:ring-0" />
          <button type="button" className="hidden h-12 w-12 place-items-center rounded-full bg-white text-[var(--orange)] shadow-sm sm:grid" aria-label="Voice record"><Mic className="h-6 w-6" /></button>
          <button disabled={isSending} className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[var(--orange-light)] to-[var(--orange-dark)] text-white shadow-[var(--shadow-button)]" aria-label="Send Message"><Send className="h-6 w-6 fill-white" /></button>
        </form>
      </div>
    </div>
  )
}

function AiBubble({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-3"><img src={assets.robot} alt="AI Tutor avatar" className="h-14 w-14 rounded-full bg-[var(--navy)] p-1" /><div className="max-w-[82%] rounded-[24px] border border-[var(--border)] bg-white p-4 text-lg font-semibold leading-relaxed text-[var(--navy)] shadow-[var(--shadow-card)]">{children}<span className="mt-2 block text-right text-xs font-bold text-[var(--text-secondary)]">9:43 AM</span></div></div>
}

function UserBubble({ text, bold = false }: { text: string; bold?: boolean }) {
  return <div className="flex items-start justify-end gap-3"><div className={cn("max-w-[78%] rounded-[24px] bg-[var(--success-bg)] p-4 text-lg leading-relaxed text-[var(--navy)] shadow-[var(--shadow-card)]", bold ? "font-black" : "font-semibold")}>{text}<span className="mt-1 block text-right text-xs font-bold text-[var(--text-secondary)]">9:42 AM ✓✓</span></div><span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--success-bg)] text-3xl">👩🏽</span></div>
}

function AudioWave() {
  return <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--navy)] px-4 py-3 text-white"><span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><Play className="h-5 w-5 fill-white" /></span><span className="flex flex-1 items-center gap-1">{Array.from({ length: 28 }).map((_, i) => <span key={i} className="w-1 rounded-full bg-[var(--green)]" style={{ height: `${10 + ((i * 7) % 22)}px` }} />)}</span><span className="text-sm font-bold">0:04</span></div>
}

function GrammarFeedback() {
  return <div className="border-l-4 border-[var(--orange)] pl-4"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-xl font-black text-[var(--orange-dark)]">✨ Grammar Feedback</h3><span className="rounded-full bg-[var(--success-bg)] px-4 py-2 text-sm font-black text-[var(--green-dark)]">Good Try!</span></div><p>Correction: <strong className="text-[var(--green-dark)]">I learn English every day.</strong></p><p className="mt-2">Explanation: Use “day” singular because it refers to each day.</p><p className="mt-3">💡 Tip: Remember to use singular with “every” + time.</p></div>
}

function TutorsScreen() {
  return (
    <div className="mx-auto max-w-6xl">
      <TopHeader />
      <section className="mb-6"><h1 className="text-[32px] font-black text-[var(--navy)]">Live Tutors</h1><p className="mt-1 font-semibold text-[var(--text-secondary)]">Connect with expert tutors and achieve your goals.</p></section>
      <div className="flex gap-3"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" /><Input placeholder="Search tutors by name or specialty..." className="h-14 rounded-2xl border-[var(--border)] pl-12 font-semibold" /></div><button className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]" aria-label="Filter tutors"><Settings className="h-6 w-6" /></button></div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2">{["All Tutors", "🇺🇸 English", "العربية Arabic", "🇪🇹 Amharic", "● Online"].map((chip, i) => <button key={chip} className={cn("min-h-12 shrink-0 rounded-2xl border px-4 text-sm font-black", i === 0 ? "border-[var(--navy)] bg-[var(--navy)] text-white" : "border-[var(--border)] bg-white text-[var(--navy)] shadow-[var(--shadow-card)]")}>{chip}</button>)}</div>
      <div className="mt-8 flex items-center justify-between"><h2 className="text-2xl font-black text-[var(--navy)]">✦ Top Tutors</h2><Link href="/tutors" className="font-black text-[var(--orange-dark)]">View All <ChevronRight className="inline h-5 w-5" /></Link></div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{tutors.map((tutor) => <TopTutorCard key={tutor.name} tutor={tutor} />)}</div>
      <div className="mt-6 space-y-4">{tutors.map((tutor) => <TutorCard key={tutor.name} tutor={tutor} />)}</div>
    </div>
  )
}

function TopTutorCard({ tutor }: { tutor: typeof tutors[number] }) {
  return <Link href="/tutor-detail"><Card className="relative p-4 text-center"><img src={tutor.avatar} alt={`${tutor.name} tutor profile photo`} className="mx-auto h-20 w-20 rounded-full object-cover" /><span className="absolute right-7 top-20 h-4 w-4 rounded-full border-2 border-white bg-[var(--green)]" /><h3 className="mt-3 text-sm font-black text-[var(--navy)]">{tutor.name}</h3><p className="text-xs font-semibold text-[var(--text-secondary)]">{tutor.specialty}</p><p className="mt-2 text-lg font-black text-[var(--navy)]">{tutor.rating} <Star className="inline h-4 w-4 fill-[var(--orange)] text-[var(--orange)]" /></p></Card></Link>
}

function TutorCard({ tutor }: { tutor: typeof tutors[number] }) {
  return <Card className="grid gap-4 p-4 sm:grid-cols-[140px_1fr_170px]"><div className="relative"><img src={tutor.avatar} alt={`${tutor.name} tutor profile photo`} className="h-36 w-full rounded-2xl object-cover sm:w-36" /><span className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white bg-[var(--green)]" /></div><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-2xl font-black text-[var(--navy)]">{tutor.name}</h3><span className="rounded-lg bg-[var(--green)] px-2 py-1 text-sm font-black text-white">{tutor.rating} ★</span></div><p className="mt-2 text-lg font-bold text-[var(--navy)]">{tutor.specialty}</p><p className="mt-1 max-w-md font-semibold text-[var(--text-secondary)]">{tutor.description}</p><div className="mt-4 flex flex-wrap gap-4 text-sm font-extrabold text-[var(--navy)]"><span><BookOpen className="mr-1 inline h-5 w-5" />{tutor.lessons}</span><span><Users className="mr-1 inline h-5 w-5" />{tutor.students}</span></div></div><div className="flex flex-col justify-center gap-3"><span className="green-badge self-start sm:self-end">● Online</span><Button asChild className="btn-primary h-12"><Link href="/booking">Book Now</Link></Button><Button asChild variant="outline" className="btn-secondary h-12"><Link href="/tutor-detail">View Profile</Link></Button></div></Card>
}

function TutorDetailScreen() {
  const tutor = tutors[0]
  return <div className="mx-auto max-w-4xl"><PageHeader title="Tutor Profile" /><Card className="grid gap-6 md:grid-cols-[220px_1fr]"><img src={tutor.avatar} alt="Mekdes Alemu tutor profile photo" className="h-56 w-full rounded-3xl object-cover" /><div><span className="green-badge">● Online</span><h1 className="mt-4 text-4xl font-black text-[var(--navy)]">{tutor.name}</h1><p className="mt-2 text-xl font-bold text-[var(--navy)]">{tutor.specialty}</p><p className="mt-4 font-semibold leading-7 text-[var(--text-secondary)]">{tutor.description} Learn English & Arabic with structured lessons, friendly feedback, and practical speaking goals.</p><div className="mt-5 flex gap-4"><ProgressStat icon={<Star className="h-8 w-8 fill-[var(--orange)] text-[var(--orange)]" />} value="4.9" label="Rating" caption="Great job!" /><ProgressStat icon={<BookOpen className="h-8 w-8 text-[var(--navy)]" />} value="640+" label="Lessons" caption="Great progress!" /></div><Button asChild className="btn-primary mt-6 h-[58px] w-full sm:w-auto sm:px-10"><Link href="/booking">Book Now</Link></Button></div></Card></div>
}

function BookingScreen({ showToast }: { showToast: (message?: string) => void }) {
  return <div className="mx-auto max-w-4xl"><PageHeader title="Book Tutor" /><Card className="grid gap-6 md:grid-cols-[.9fr_1.1fr]"><div className="rounded-3xl bg-[var(--soft-blue)] p-5"><TutorCard tutor={tutors[0]} /></div><form onSubmit={(event) => { event.preventDefault(); showToast("Your lesson is booked.") }} className="space-y-4"><input type="hidden" name="teacher_id" value="1" /><LabeledInput label="Date picker" name="scheduled_date" type="date" icon={CalendarDays} required /><LabeledInput label="Time picker" name="scheduled_time" type="time" icon={CalendarDays} required /><SelectField label="Duration" name="duration_hours" options={["1", "1.5", "2"]} /><Card className="flex items-center justify-between rounded-3xl p-4"><span className="font-black text-[var(--navy)]">Total price</span><strong className="text-3xl font-black text-[var(--orange-dark)]">$18</strong></Card><Button className="btn-primary h-[58px] w-full text-lg">Book Now</Button></form></Card></div>
}

function DashboardScreen() {
  return <div className="mx-auto max-w-6xl"><TopHeader /><section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><Card className="bg-[var(--soft-blue)]"><h1 className="text-3xl font-black text-[var(--navy)]">Welcome back, learner 👋</h1><p className="mt-2 font-semibold text-[var(--text-secondary)]">Continue Learning and Speak with confidence today.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button asChild className="btn-primary h-14"><Link href="/chat">Try AI Tutor</Link></Button><Button asChild variant="outline" className="btn-secondary h-14"><Link href="/tutors">Find Tutors</Link></Button></div></Card><Card><img src={assets.progress} alt="Student progress achievement" className="mx-auto h-44 object-contain" /></Card></section><section className="mt-6 grid gap-4 md:grid-cols-4"><StatMini icon={BookOpen} value="120" label="Lessons" /><StatMini icon={MessageCircle} value="18" label="Recent AI conversations" /><StatMini icon={CalendarDays} value="2" label="Upcoming bookings" /><StatMini icon={Flame} value="7" label="Day streak" /></section><section className="mt-6 grid gap-5 lg:grid-cols-2"><Card><h2 className="text-xl font-black">Recent AI conversations</h2>{["Practice pronunciation", "Improve your grammar", "Translate and understand"].map((item) => <p key={item} className="mt-4 rounded-2xl bg-[var(--soft-blue)] p-4 font-bold text-[var(--navy)]">{item}</p>)}</Card><Card><h2 className="text-xl font-black">Upcoming bookings</h2><p className="mt-4 rounded-2xl bg-[var(--success-bg)] p-4 font-bold text-[var(--green-dark)]">Mekdes Alemu • Tomorrow • 4:00 PM</p><p className="mt-3 rounded-2xl bg-[var(--warning-bg)] p-4 font-bold text-[var(--orange-dark)]">Aisha Mohamed • Friday • 6:00 PM</p></Card></section></div>
}

function StatMini({ icon: Icon, value, label }: { icon: typeof BookOpen; value: string; label: string }) {
  return <Card className="p-4"><Icon className="h-7 w-7 text-[var(--orange)]" /><strong className="mt-3 block text-3xl font-black text-[var(--navy)]">{value}</strong><span className="text-sm font-bold text-[var(--text-secondary)]">{label}</span></Card>
}

function LearnScreen() {
  const items = [["Practice with AI", assets.robot], ["Speak with confidence", assets.speaking], ["Improve your grammar", assets.grammar], ["Build your vocabulary", assets.vocabulary], ["Practice pronunciation", assets.listening], ["Translate and understand", assets.aiChat]]
  return <div className="mx-auto max-w-6xl"><TopHeader /><h1 className="text-3xl font-black">Continue Learning</h1><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(([title, image]) => <Card key={title}><img src={image} alt={`${title} illustration`} className="h-40 w-full object-contain" /><h2 className="mt-4 text-xl font-black text-[var(--navy)]">{title}</h2><p className="mt-2 font-semibold text-[var(--text-secondary)]">Short mobile-friendly lessons with AI support and teacher guidance.</p><Button asChild className="btn-primary mt-5 h-12 w-full"><Link href="/chat">Start Learning</Link></Button></Card>)}</div></div>
}

function ProfileScreen({ showToast }: { showToast: (message?: string) => void }) {
  return <div className="mx-auto max-w-3xl"><PageHeader title="Profile" /><Card><form onSubmit={(event) => { event.preventDefault(); showToast("Profile updated successfully.") }} className="space-y-5"><div className="text-center"><span className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-[var(--soft-blue)] text-6xl shadow-[var(--shadow-card)]">👩🏽</span><label className="mt-4 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-5 font-black text-[var(--navy)] shadow-[var(--shadow-card)]"><Camera className="h-5 w-5" />Upload/change photo<input type="file" name="profile_photo" accept="image/*" className="sr-only" /></label></div><LabeledInput label="Full name" name="full_name" placeholder="Ahmed Ali" icon={User} /><SelectField label="Native language" name="native_language" options={["Amharic", "Arabic", "English"]} /><SelectField label="Target language" name="target_language" options={["English", "Arabic"]} /><SelectField label="Level" name="level" options={["Beginner", "Intermediate", "Advanced"]} /><Button className="btn-primary h-[58px] w-full text-lg">Save Changes</Button></form></Card></div>
}

function AdminScreen() {
  const rows = [["Mekdes Alemu", "Ahmed Ali", "Booked", "Online"], ["Aisha Mohamed", "Sara K.", "Completed", "Paid"], ["Omar Hassan", "Dawit M.", "Pending", "Review"]]
  return <div className="mx-auto max-w-6xl"><PageHeader title="Admin" right={<LayoutDashboard className="h-6 w-6" />} /><div className="grid gap-4 md:grid-cols-3"><StatMini icon={Users} value="2,048" label="Users count" /><StatMini icon={GraduationCap} value="42" label="Teachers count" /><StatMini icon={CalendarDays} value="318" label="Bookings" /></div><Card className="mt-6 overflow-hidden"><h2 className="mb-4 text-2xl font-black text-[var(--navy)]">Bookings table</h2><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="bg-[var(--soft-blue)] text-sm text-[var(--navy)]"><tr><th className="p-4">Teacher</th><th className="p-4">Student</th><th className="p-4">Status</th><th className="p-4">Payment</th></tr></thead><tbody>{rows.map((row) => <tr key={row.join()} className="border-t border-[var(--border)]"><td className="p-4 font-black">{row[0]}</td><td className="p-4 font-bold text-[var(--text-secondary)]">{row[1]}</td><td className="p-4"><span className="green-badge">{row[2]}</span></td><td className="p-4"><span className="rounded-full bg-[var(--warning-bg)] px-3 py-1 text-sm font-black text-[var(--orange-dark)]">{row[3]}</span></td></tr>)}</tbody></table></div></Card></div>
}

function PricingScreen() {
  return <div className="mx-auto max-w-5xl"><PageHeader title="Pricing" /><div className="grid gap-5 md:grid-cols-3">{["Starter", "Premium", "Live Tutor"].map((plan, index) => <Card key={plan} className={cn(index === 1 && "ring-2 ring-[var(--orange)]")}><img src={index === 1 ? assets.premium : assets.badgePremium} alt={`${plan} plan illustration`} className="mx-auto h-32 object-contain" /><h2 className="mt-4 text-2xl font-black">{plan}</h2><p className="mt-2 font-semibold text-[var(--text-secondary)]">AI practice, grammar feedback, and friendly progress tracking.</p><Button className="btn-primary mt-6 h-12 w-full">Get Started</Button></Card>)}</div></div>
}

function AboutScreen() {
  return <div className="mx-auto max-w-4xl"><PageHeader title="About" /><Card><img src={assets.aiChat} alt="Lisan AI Tutor multilingual learning illustration" className="mx-auto h-72 object-contain" /><h1 className="mt-6 text-4xl font-black text-[var(--navy)]">Learn English & Arabic</h1><p className="mt-4 text-lg font-semibold leading-8 text-[var(--text-secondary)]">Lisan AI Tutor helps students learn English and Arabic with AI practice, Amharic support, and live expert tutors in one easy learning platform.</p></Card></div>
}

function PasswordScreen({ title, button }: { title: string; button: string }) {
  return <AuthShell title={title} subtitle="We will help you keep learning safely."><form className="space-y-4"><LabeledInput label="Email Address" name="email" type="email" icon={Mail} placeholder="Enter your email address" /><Button className="btn-primary h-[58px] w-full">{button}</Button></form></AuthShell>
}
