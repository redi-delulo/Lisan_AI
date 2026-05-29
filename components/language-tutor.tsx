"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
  Headphones,
  Home,
  Mic,
  PenTool,
  Send,
  Star,
  Target,
  Trophy,
  User,
  Volume2,
} from "lucide-react"
import { motion } from "framer-motion"

const skillLevels = ["Beginner", "Intermediate", "Advanced"]

const recentLessons = [
  { title: "Grammar", lesson: "Lesson 8", progress: 80, icon: GraduationCap, color: "from-violet-500 to-purple-500", bg: "from-violet-50 to-purple-50" },
  { title: "Vocabulary", lesson: "Lesson 15", progress: 70, icon: BookMarked, color: "from-orange-400 to-orange-600", bg: "from-orange-50 to-amber-50" },
  { title: "Listening", lesson: "Lesson 7", progress: 60, icon: Headphones, color: "from-sky-400 to-blue-500", bg: "from-sky-50 to-blue-50" },
  { title: "Speaking", lesson: "Lesson 5", progress: 75, icon: Mic, color: "from-fuchsia-400 to-purple-500", bg: "from-fuchsia-50 to-purple-50" },
]

type ConversationEntry = {
  speaker: "User" | "AI"
  message: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface WordExercise {
  word: string;
  definition: string;
  exampleSentence: string;
}

interface GrammarExercise {
  question: string;
  options: string[];
  correctAnswer: string;
}

const fallbackWord: WordExercise = {
  word: "Confidence",
  definition: "A feeling of self-assurance.",
  exampleSentence: "She spoke with confidence during her presentation.",
}

export function LanguageTutorComponent() {
  const [skillLevel, setSkillLevel] = useState<string>("Beginner")
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [userInput, setUserInput] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const [currentGrammarExercise, setCurrentGrammarExercise] = useState<GrammarExercise | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [wordError, setWordError] = useState<string | null>(null)
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [wordExercises, setWordExercises] = useState<WordExercise[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  const currentWord = wordExercises[currentWordIndex] || fallbackWord
  const dailyGoalProgress = Math.max(60, progress)
  const completedWords = Math.max(12, Math.round((dailyGoalProgress / 100) * 20))

  useEffect(() => {
    fetchWords()
    fetchExercise()
  }, [skillLevel])

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  const fetchWords = async () => {
    setIsLoadingWord(true)
    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vocabulary", skillLevel }),
      })
      const data = await response.json()
      if (response.ok) {
        setWordExercises(data)
        setCurrentWordIndex(0)
        setWordError(null)
      } else {
        setWordError(data.error || "Failed to fetch words")
        setWordExercises([])
      }
    } catch {
      setWordError("Failed to fetch words")
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
      const data = await response.json()
      if (response.ok) {
        setCurrentGrammarExercise(data)
        setSelectedAnswer(null)
        setIsAnswerCorrect(null)
        setError(null)
      } else {
        setError(data.error || "Failed to fetch exercise")
        setCurrentGrammarExercise(null)
      }
    } catch {
      setError("Failed to fetch exercise")
      setCurrentGrammarExercise(null)
    }
  }

  const handleConversationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = userInput.trim()
    if (!trimmedInput) return

    setError(null)
    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "conversation", userInput: trimmedInput, skillLevel }),
      })
      const data = await response.json()
      if (response.ok) {
        setConversation((entries) => [
          ...entries,
          { speaker: "User", message: trimmedInput },
          { speaker: "AI", message: data.message },
        ])
        setUserInput("")
        updateProgress()
      } else {
        setError(data.error || "Failed to get AI response")
      }
    } catch {
      setError("Failed to get AI response")
    }
  }

  const handleNextWord = () => {
    if (currentWordIndex < wordExercises.length - 1) {
      setCurrentWordIndex(prevIndex => prevIndex + 1)
    } else {
      fetchWords()
    }
    updateProgress()
  }

  const handleNextExercise = () => {
    fetchExercise()
    updateProgress()
  }

  const updateProgress = () => {
    setProgress((prevProgress) => Math.min(prevProgress + 10, 100))
  }

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleAnswerSubmit = () => {
    if (currentGrammarExercise && selectedAnswer) {
      const isCorrect = selectedAnswer === currentGrammarExercise.correctAnswer
      setIsAnswerCorrect(isCorrect)
      if (isCorrect) {
        updateProgress()
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fbf8] text-[#081735]">
      <div className="mx-auto min-h-screen w-full max-w-md bg-white px-5 pb-28 pt-4 shadow-2xl sm:my-6 sm:rounded-[2.5rem]">
        <div className="mb-6 flex items-center justify-between px-2 text-sm font-bold text-[#07142f]">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="h-3 w-1.5 rounded-sm bg-[#07142f]" />
            <span className="h-4 w-1.5 rounded-sm bg-[#07142f]" />
            <span className="h-5 w-1.5 rounded-sm bg-[#07142f]" />
            <span className="ml-1 h-4 w-7 rounded border-2 border-[#07142f] p-0.5"><span className="block h-full rounded-sm bg-[#07142f]" /></span>
          </div>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-7 flex items-start justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#16a764] text-white shadow-lg shadow-emerald-200">
              <BookOpen className="h-9 w-9" />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-tight tracking-tight">Welcome back,<br />Ahmed! 👋</p>
              <p className="mt-2 text-sm text-slate-500">Let&apos;s continue your learning journey</p>
            </div>
          </div>
          <div className="relative mt-2 rounded-full bg-white p-2 shadow-sm">
            <Bell className="h-7 w-7 text-[#081735]" />
            <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-[#18b96f] ring-2 ring-white" />
          </div>
        </motion.header>

        <section className="mb-7 grid grid-cols-[1fr_1fr] gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="col-span-2 rounded-[1.8rem] bg-gradient-to-br from-[#0fb86a] to-[#079a56] p-6 text-white shadow-xl shadow-emerald-100"
          >
            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="mb-7 flex items-center gap-3">
                  <Target className="h-9 w-9" />
                  <h2 className="text-2xl font-extrabold">Daily Goal</h2>
                </div>
                <p className="mb-6 text-lg font-medium">Learn 20 new words</p>
                <div className="h-2.5 w-40 rounded-full bg-white/30">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(dailyGoalProgress, 100)}%` }} />
                </div>
                <p className="mt-5 text-xl font-extrabold">{completedWords} / 20 words</p>
              </div>
              <div className="grid h-24 w-24 place-items-center rounded-full border-[10px] border-white/25 border-r-white border-t-white text-2xl font-extrabold">
                {dailyGoalProgress}%
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="rounded-[1.8rem] bg-[#071b44] p-5 text-white shadow-xl shadow-slate-200"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">AI Tutor</h2>
              <Bot className="h-10 w-10 text-emerald-300" />
            </div>
            <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-white text-5xl shadow-inner">🤖</div>
            <a href="#ai-tutor" className="flex items-center justify-center gap-2 rounded-2xl bg-[#19b86d] px-4 py-3 font-bold text-white shadow-lg shadow-emerald-900/20">
              Chat Now <ChevronRight className="h-5 w-5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-100"
          >
            <div className="mb-3 flex items-center gap-3">
              <Flame className="h-8 w-8 fill-orange-400 text-orange-400" />
              <div>
                <p className="text-2xl font-extrabold">12</p>
                <p className="text-sm text-slate-500">Day Streak</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 fill-amber-400 text-amber-400" />
              <div>
                <p className="text-2xl font-extrabold">1250</p>
                <p className="text-sm text-slate-500">XP Points</p>
              </div>
            </div>
          </motion.div>
        </section>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600"
          >
            {error}
          </motion.div>
        )}

        <section className="mb-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight">Continue Learning</h2>
            <button className="text-base font-bold text-[#09a75d]">See all</button>
          </div>
          <div className="rounded-[1.7rem] border border-slate-100 bg-white p-3 shadow-lg shadow-slate-100">
            <div className="grid grid-cols-[42%_1fr] gap-4">
              <div className="grid min-h-32 place-items-center rounded-[1.4rem] bg-gradient-to-br from-emerald-50 to-orange-50 text-6xl">☕</div>
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-extrabold">Daily Conversation</h3>
                <p className="mt-2 text-sm text-slate-500">Lesson 12 • At the Coffee Shop</p>
                <div className="mt-5 h-2 rounded-full bg-slate-200">
                  <div className="h-full w-[65%] rounded-full bg-[#18b86d]" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">65% Completed</p>
                  <a href="#ai-tutor" className="rounded-2xl bg-[#12a85f] px-5 py-3 text-sm font-bold text-white">Continue</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-7 rounded-[1.7rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-lg shadow-emerald-50">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="mb-3 text-lg font-extrabold text-[#08a85b]">Vocabulary of the Day</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold tracking-tight">{currentWord.word}</h2>
                <Volume2 className="h-6 w-6 fill-[#13a760] text-[#13a760]" />
              </div>
            </div>
            <Star className="h-8 w-8 text-[#08a85b]" />
          </div>
          <p className="mb-4 text-xl font-semibold">/{currentWord.word.toLowerCase()}/</p>
          <p className="mb-5 text-lg text-[#081735]">{currentWord.definition}</p>
          <p className="rounded-2xl bg-white/70 p-3 text-sm text-slate-500">{currentWord.exampleSentence}</p>
          {wordError && <p className="mt-3 text-sm font-medium text-amber-600">Using sample word while API loads: {wordError}</p>}
          <div className="mt-5 flex items-center justify-between">
            <Button onClick={() => setCurrentWordIndex(prev => Math.max(0, prev - 1))} disabled={currentWordIndex === 0 || isLoadingWord} variant="ghost" className="rounded-2xl text-[#08a85b]">
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button onClick={handleNextWord} disabled={isLoadingWord} className="rounded-2xl bg-[#12a85f] text-white hover:bg-[#0f944f]">
              {isLoadingWord ? "Loading..." : currentWordIndex < wordExercises.length - 1 ? "Next" : "New Set"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="mb-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight">Recent Lessons</h2>
            <button className="text-base font-bold text-[#09a75d]">See all</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recentLessons.map(({ title, lesson, progress: lessonProgress, icon: Icon, color, bg }) => (
              <div key={title} className={`rounded-[1.3rem] border border-slate-100 bg-gradient-to-br ${bg} p-4 shadow-sm`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-extrabold">{title}</p>
                    <p className="text-sm text-slate-500">{lesson}</p>
                  </div>
                </div>
                <p className="mb-3 text-sm font-bold">{lessonProgress}%</p>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${lessonProgress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight">Your Statistics</h2>
            <button className="text-base font-bold text-[#09a75d]">See all</button>
          </div>
          <div className="grid grid-cols-4 rounded-[1.7rem] border border-slate-100 bg-white p-4 text-center shadow-lg shadow-slate-100">
            {[
              { icon: BookOpen, value: "24", label: "Lessons" },
              { icon: Trophy, value: "1250", label: "XP" },
              { icon: Flame, value: "12", label: "Streak" },
              { icon: Target, value: "75%", label: "Progress" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="border-r border-slate-100 last:border-r-0">
                <Icon className="mx-auto mb-3 h-8 w-8 text-[#14ae68]" />
                <p className="text-xl font-extrabold">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ai-tutor" className="mb-7 rounded-[1.8rem] bg-[#071b44] p-5 text-white shadow-xl shadow-slate-200">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">AI Tutor</p>
              <h2 className="text-2xl font-extrabold">Practice conversation</h2>
            </div>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger className="w-32 rounded-2xl border-white/20 bg-white/10 text-white">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4 max-h-72 overflow-y-auto rounded-3xl bg-white/10 p-4">
            {conversation.length === 0 ? (
              <div className="py-6 text-center text-sm text-white/70">Start a chat with your AI tutor.</div>
            ) : conversation.map((entry, index) => (
              <div key={`${entry.speaker}-${index}`} className={`mb-3 flex ${entry.speaker === "User" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm ${entry.speaker === "User" ? "bg-[#19b86d] text-white" : "bg-white text-[#081735]"}`}>
                  <p className="mb-1 text-xs font-bold opacity-70">{entry.speaker === "User" ? "You" : "Lisan AI"}</p>
                  {entry.message}
                </div>
              </div>
            ))}
            <div ref={conversationEndRef} />
          </div>
          <form onSubmit={handleConversationSubmit} className="flex gap-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              className="h-12 flex-grow rounded-2xl border-white/10 bg-white text-[#081735]"
            />
            <Button type="submit" className="h-12 rounded-2xl bg-[#19b86d] px-4 text-white hover:bg-[#139c5d]">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </section>

        <section className="rounded-[1.8rem] border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-lg shadow-purple-50">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-500">Grammar Coach</p>
              <h2 className="text-2xl font-extrabold">Quick Exercise</h2>
            </div>
            <PenTool className="h-8 w-8 text-purple-500" />
          </div>
          {currentGrammarExercise ? (
            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-4 font-semibold shadow-sm">{currentGrammarExercise.question}</div>
              <div className="space-y-2">
                {currentGrammarExercise.options.map((option) => (
                  <Button
                    key={option}
                    onClick={() => setSelectedAnswer(option)}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className={`w-full justify-start rounded-2xl ${selectedAnswer === option ? "bg-purple-600 text-white" : "bg-white"}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <Button onClick={handleAnswerSubmit} className="w-full rounded-2xl bg-purple-600 text-white hover:bg-purple-700" disabled={!selectedAnswer}>
                Submit Answer
              </Button>
              {isAnswerCorrect !== null && (
                <div className={`rounded-3xl p-4 text-center font-bold ${isAnswerCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {isAnswerCorrect ? "Correct!" : `Incorrect. Correct answer: ${currentGrammarExercise.correctAnswer}`}
                </div>
              )}
              <Button onClick={handleNextExercise} variant="ghost" className="w-full rounded-2xl text-purple-600">
                Next Exercise <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 text-center text-slate-500">Loading grammar exercise...</div>
          )}
        </section>
      </div>

      <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-md -translate-x-1/2 grid-cols-5 rounded-t-[2rem] bg-white px-5 pb-5 pt-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] sm:bottom-6 sm:rounded-[2rem]">
        {[
          { label: "Home", icon: Home, active: true },
          { label: "Lessons", icon: BookOpen },
          { label: "AI Tutor", icon: Bot, special: true },
          { label: "Practice", icon: Mic },
          { label: "Profile", icon: User },
        ].map(({ label, icon: Icon, active, special }) => (
          <a key={label} href={special ? "#ai-tutor" : "#"} className={`flex flex-col items-center gap-1 text-xs font-bold ${active || special ? "text-[#12a85f]" : "text-slate-500"}`}>
            <span className={`${special ? "-mt-10 grid h-16 w-16 place-items-center rounded-full bg-[#18b86d] text-white shadow-xl shadow-emerald-200" : "grid h-8 w-8 place-items-center"}`}>
              <Icon className={special ? "h-9 w-9" : "h-7 w-7"} />
            </span>
            {label}
          </a>
        ))}
      </nav>
    </main>
  )
}
