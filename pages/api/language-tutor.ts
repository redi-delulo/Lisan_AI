import type { NextApiRequest, NextApiResponse } from 'next'
import { Groq } from 'groq-sdk'

const groqApiKey = process.env.GROQ_API_KEY?.trim()
const defaultGroqModel = 'llama-3.3-70b-versatile'
const deprecatedModelReplacements: Record<string, string> = {
  'mixtral-8x7b-32768': defaultGroqModel,
}
const requestedGroqModel = process.env.GROQ_MODEL?.trim() || defaultGroqModel
const groqModel = deprecatedModelReplacements[requestedGroqModel] || requestedGroqModel
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null
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

function normalizeSkillLevel(value: unknown): SkillLevel {
  return allowedSkillLevels.includes(value as SkillLevel) ? (value as SkillLevel) : 'Beginner'
}

function getGroqClient(): Groq {
  if (!groq) {
    throw new Error('Missing GROQ_API_KEY configuration')
  }

  return groq
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status
    return typeof status === 'number' ? status : undefined
  }

  return undefined
}

function getGroqErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }

  if ('code' in error) {
    const code = (error as { code?: unknown }).code
    if (typeof code === 'string') {
      return code
    }
  }

  if ('error' in error) {
    const errorBody = (error as { error?: unknown }).error

    if (typeof errorBody === 'object' && errorBody !== null && 'code' in errorBody) {
      const code = (errorBody as { code?: unknown }).code
      if (typeof code === 'string') {
        return code
      }
    }

    if (typeof errorBody === 'object' && errorBody !== null && 'error' in errorBody) {
      const nestedError = (errorBody as { error?: unknown }).error

      if (typeof nestedError === 'object' && nestedError !== null && 'code' in nestedError) {
        const code = (nestedError as { code?: unknown }).code
        return typeof code === 'string' ? code : undefined
      }
    }
  }

  return undefined
}

function isGroqConfigurationError(error: unknown): boolean {
  const status = getErrorStatus(error)
  const code = getGroqErrorCode(error)

  return status === 401 || status === 403 || status === 404 || code === 'model_decommissioned'
}

function getPublicErrorMessage(error: unknown, fallbackMessage: string): string {
  const status = getErrorStatus(error)
  const code = getGroqErrorCode(error)

  if (status === 401 || status === 403) {
    return 'Groq API authentication failed. Please check your GROQ_API_KEY in .env.local.'
  }

  if (status === 404 || code === 'model_decommissioned') {
    return `Groq model "${requestedGroqModel}" is unavailable. Please remove GROQ_MODEL or set it to "${defaultGroqModel}".`
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

  await fetch(`${supabaseUrl}/rest/v1/chat_history`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, role, content }),
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      groqConfigured: Boolean(groq),
      model: groqModel,
      requestedModel: requestedGroqModel,
      modelRemapped: requestedGroqModel !== groqModel,
      supabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
      chatPersistenceConfigured: Boolean(supabaseUrl && supabaseServiceRoleKey),
    })
  }

  if (req.method === 'POST') {
    if (!groq) {
      return res.status(500).json({ error: 'Server is missing GROQ_API_KEY configuration' })
    }

    let authUser: AuthUser
    try {
      authUser = await verifySupabaseUser(req)
    } catch (error) {
      return res.status(401).json({ error: error instanceof Error ? error.message : 'Authentication is required.' })
    }

    const { action, skillLevel, userInput } = req.body
    const normalizedSkillLevel = normalizeSkillLevel(skillLevel)

    switch (action) {
      case 'conversation':
        if (typeof userInput !== 'string' || !userInput.trim()) {
          return res.status(400).json({ error: 'A message is required' })
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
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function generateAIResponse(input: string, skillLevel: SkillLevel): Promise<string> {
  try {
    const completion = await getGroqClient().chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are Lisan AI, a friendly English language tutor for a ${skillLevel} learner. Give a direct, helpful answer in 2-4 short sentences. Correct mistakes gently and ask one follow-up practice question.`,
        },
        { role: 'user', content: input },
      ],
      model: groqModel,
      temperature: 0.7,
      max_tokens: 220,
    })

    const message = completion.choices[0]?.message?.content?.trim()
    if (!message) {
      throw new Error('The AI API returned an empty response.')
    }

    return message
  } catch (error) {
    if (isGroqConfigurationError(error)) {
      console.error('Configuration error calling Groq API:', error)
      throw error
    }

    console.error('Error calling Groq API:', error)
    throw error
  }
}

async function generateWordExercises(skillLevel: SkillLevel, count: number = 5): Promise<WordExercise[]> {
  const prompt = `Generate ${count} vocabulary word exercises for a ${skillLevel} level English learner. 
  Choose random words that are appropriate for this level, but avoid common words like "hello" or "goodbye".
  For each word, provide the word, its definition, and an example sentence. Format the response as a JSON array with the following structure:
  [
    {
      "word": "example1",
      "definition": "a short definition for example1",
      "exampleSentence": "An example sentence using example1."
    },
    {
      "word": "example2",
      "definition": "a short definition for example2",
      "exampleSentence": "An example sentence using example2."
    }
  ]`

  try {
    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: groqModel,
      temperature: 0.9,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    console.log('Raw AI response for word exercises:', response)

    if (!response) {
      throw new Error('No response from AI')
    }

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      const jsonString = jsonMatch ? jsonMatch[0] : response
      const parsedResponse = JSON.parse(jsonString) as WordExercise[]

      if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
        throw new Error('Invalid response structure')
      }

      return parsedResponse.filter(exercise => 
        exercise.word && exercise.definition && exercise.exampleSentence
      )
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      throw new Error('Failed to parse AI response')
    }
  } catch (error) {
    console.error('Error generating word exercises:', error)
    if (isGroqConfigurationError(error)) {
      throw error
    }
    throw new Error('Failed to generate word exercises')
  }
}

async function generateGrammarExercise(skillLevel: SkillLevel): Promise<GrammarExercise> {
  let prompt = ''
  if (skillLevel === 'Advanced') {
    prompt = `Generate an advanced grammar exercise for an English learner. 
    Focus on complex grammatical structures such as conditionals, passive voice, reported speech, or advanced tenses.
    Provide a challenging question, three options, and the correct answer. Format the response as JSON with the following structure:
    {
      "question": "Complete the sentence with the correct form: If I ___ (know) about the party earlier, I would have attended.",
      "options": ["had known", "knew", "would know"],
      "correctAnswer": "had known"
    }`
  } else {
    prompt = `Generate a ${skillLevel} level grammar exercise for an English learner. 
    Provide a question appropriate for the skill level, three options, and the correct answer. Format the response as JSON with the following structure:
    {
      "question": "Complete the sentence: I ___ (am/is/are) learning English.",
      "options": ["am", "is", "are"],
      "correctAnswer": "am"
    }`
  }

  try {
    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: groqModel,
      temperature: 0.7,
      max_tokens: 300, // Increased max_tokens for more complex responses
    })

    const response = completion.choices[0]?.message?.content
    console.log('Raw AI response for grammar exercise:', response)

    if (!response) {
      throw new Error('No response from AI')
    }

    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : response

      const parsedResponse = JSON.parse(jsonString) as GrammarExercise
      if (!parsedResponse.question || !Array.isArray(parsedResponse.options) || !parsedResponse.correctAnswer) {
        throw new Error('Invalid response structure')
      }
      return parsedResponse
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      throw new Error('Failed to parse AI grammar response')
    }
  } catch (error) {
    console.error('Error generating grammar exercise:', error)
    if (isGroqConfigurationError(error)) {
      throw error
    }
    throw new Error('Failed to generate grammar exercise')
  }
}
