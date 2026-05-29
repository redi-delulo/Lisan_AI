import type { NextApiRequest, NextApiResponse } from 'next'

const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
const geminiModel = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

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

interface AuthUser {
  id: string;
  email?: string;
}

const allowedSkillLevels = ['Beginner', 'Intermediate', 'Advanced'] as const
type SkillLevel = (typeof allowedSkillLevels)[number]

type RateLimitEntry = { count: number; resetAt: number }
const rateLimitWindowMs = 60_000
const maxRequestsPerWindow = 12
const rateLimitStore = new Map<string, RateLimitEntry>()

function normalizeSkillLevel(value: unknown): SkillLevel {
  return allowedSkillLevels.includes(value as SkillLevel) ? (value as SkillLevel) : 'Beginner'
}

function getClientId(req: NextApiRequest, userId?: string) {
  const forwardedFor = req.headers['x-forwarded-for']
  const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]
  return userId || ip || req.socket.remoteAddress || 'anonymous'
}

function checkRateLimit(clientId: string) {
  const now = Date.now()
  const current = rateLimitStore.get(clientId)

  if (!current || current.resetAt < now) {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + rateLimitWindowMs })
    return
  }

  if (current.count >= maxRequestsPerWindow) {
    const seconds = Math.ceil((current.resetAt - now) / 1000)
    throw new Error(`Too many AI requests. Please try again in ${seconds} seconds.`)
  }

  current.count += 1
}

function getPublicErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    if (error.message.includes('API key')) {
      return 'Gemini API authentication failed. Please check GEMINI_API_KEY in your environment variables.'
    }
    return error.message
  }

  return fallbackMessage
}

async function verifySupabaseUser(req: NextApiRequest): Promise<AuthUser> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    throw new Error('Authentication is required.')
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured.')
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Invalid or expired session.')
  }

  return response.json() as Promise<AuthUser>
}

async function saveChatMessage(userId: string, role: 'user' | 'assistant', content: string) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/chat_history`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, role, content }),
  })

  if (!response.ok) {
    console.error('Failed to persist chat message:', await response.text())
  }
}

async function generateGeminiText(prompt: string, systemInstruction?: string): Promise<string> {
  if (!geminiApiKey) {
    throw new Error('Server is missing GEMINI_API_KEY configuration')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 700,
        },
      }),
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error?.message || 'Gemini API request failed'
    throw new Error(message)
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim()

  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }

  return text
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      geminiConfigured: Boolean(geminiApiKey),
      model: geminiModel,
      supabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
      chatPersistenceConfigured: Boolean(supabaseUrl && supabaseServiceRoleKey),
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  let authUser: AuthUser
  try {
    authUser = await verifySupabaseUser(req)
    checkRateLimit(getClientId(req, authUser.id))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication is required.'
    return res.status(message.startsWith('Too many') ? 429 : 401).json({ error: message })
  }

  const { action, skillLevel, userInput } = req.body
  const normalizedSkillLevel = normalizeSkillLevel(skillLevel)

  switch (action) {
    case 'conversation':
      if (typeof userInput !== 'string' || !userInput.trim() || userInput.length > 2000) {
        return res.status(400).json({ error: 'A message between 1 and 2000 characters is required.' })
      }

      try {
        const trimmedInput = userInput.trim()
        const aiResponse = await generateAIResponse(trimmedInput, normalizedSkillLevel)
        await Promise.all([
          saveChatMessage(authUser.id, 'user', trimmedInput),
          saveChatMessage(authUser.id, 'assistant', aiResponse),
        ])
        return res.status(200).json({ message: aiResponse })
      } catch (error) {
        console.error('Error generating AI response:', error)
        return res.status(500).json({ error: getPublicErrorMessage(error, 'Failed to generate AI response') })
      }
    case 'vocabulary':
      try {
        const wordExercises = await generateWordExercises(normalizedSkillLevel)
        return res.status(200).json(wordExercises)
      } catch (error) {
        console.error('Error generating word exercises:', error)
        return res.status(500).json({ error: getPublicErrorMessage(error, 'Failed to generate word exercises') })
      }
    case 'grammar':
      try {
        const grammarExercise = await generateGrammarExercise(normalizedSkillLevel)
        return res.status(200).json(grammarExercise)
      } catch (error) {
        console.error('Error generating grammar exercise:', error)
        return res.status(500).json({ error: getPublicErrorMessage(error, 'Failed to generate grammar exercise') })
      }
    default:
      return res.status(400).json({ error: 'Invalid action' })
  }
}

async function generateAIResponse(input: string, skillLevel: SkillLevel): Promise<string> {
  const systemPrompt = 'You are Lisan AI Tutor, a professional English and Arabic teacher. Teach clearly and simply. Correct grammar politely. Give examples. Support English and Arabic learning. Ask one practice question at the end. Keep answers helpful and beginner-friendly.'
  return generateGeminiText(`Student level: ${skillLevel}\nStudent message: ${input}`, systemPrompt)
}

async function generateWordExercises(skillLevel: SkillLevel, count: number = 5): Promise<WordExercise[]> {
  const response = await generateGeminiText(`Generate ${count} vocabulary word exercises for a ${skillLevel} English/Arabic learner. Return only valid JSON array items with word, definition, and exampleSentence.`)
  const jsonMatch = response.match(/\[[\s\S]*\]/)
  const parsedResponse = JSON.parse(jsonMatch ? jsonMatch[0] : response) as WordExercise[]

  if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
    throw new Error('Invalid vocabulary response structure')
  }

  return parsedResponse.filter(exercise => exercise.word && exercise.definition && exercise.exampleSentence)
}

async function generateGrammarExercise(skillLevel: SkillLevel): Promise<GrammarExercise> {
  const response = await generateGeminiText(`Generate one ${skillLevel} grammar quiz for an English/Arabic learner. Return only valid JSON with question, options array, and correctAnswer.`)
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  const parsedResponse = JSON.parse(jsonMatch ? jsonMatch[0] : response) as GrammarExercise

  if (!parsedResponse.question || !Array.isArray(parsedResponse.options) || !parsedResponse.correctAnswer) {
    throw new Error('Invalid grammar response structure')
  }

  return parsedResponse
}
