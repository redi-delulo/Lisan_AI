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
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const errorBody = (error as { error?: unknown }).error

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

function createDefaultAIResponse(input: string, skillLevel: SkillLevel): string {
  const levelHint = skillLevel === 'Beginner'
    ? 'I will keep my English simple and clear.'
    : skillLevel === 'Intermediate'
      ? 'I will use natural English and explain tricky words when helpful.'
      : 'I will use richer vocabulary and help you refine advanced expression.'

  return `I had trouble connecting to the AI service, but we can still practice. You wrote: "${input}". ${levelHint} Try writing one more sentence about the same idea, and I will help you improve it.`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    if (!groq) {
      return res.status(500).json({ error: 'Server is missing GROQ_API_KEY configuration' })
    }

    const { action, skillLevel, userInput } = req.body
    const normalizedSkillLevel = normalizeSkillLevel(skillLevel)

    switch (action) {
      case 'conversation':
        if (typeof userInput !== 'string' || !userInput.trim()) {
          return res.status(400).json({ error: 'A message is required' })
        }

        try {
          const aiResponse = await generateAIResponse(userInput.trim(), normalizedSkillLevel)
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
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function generateAIResponse(input: string, skillLevel: SkillLevel): Promise<string> {
  const prompt = `You are a helpful language tutor assisting a ${skillLevel} level student. 
  Respond to the following input in a way that's appropriate for their skill level: "${input}"`

  try {
    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: groqModel,
      temperature: 0.7,
      max_tokens: 150,
    })

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."
  } catch (error) {
    const status = getErrorStatus(error)

    if (status === 401 || status === 403 || status === 404) {
      console.error('Configuration error calling Groq API:', error)
      throw error
    }

    console.error('Error calling Groq API, using fallback response:', error)
    return createDefaultAIResponse(input, skillLevel)
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
      // If parsing fails, create a level-specific default exercise
      return createDefaultExercise(skillLevel)
    }
  } catch (error) {
    console.error('Error generating grammar exercise:', error)
    // Return a level-specific default exercise if generation fails
    return createDefaultExercise(skillLevel)
  }
}

function createDefaultExercise(skillLevel: SkillLevel): GrammarExercise {
  switch (skillLevel) {
    case 'Beginner':
      return {
        question: "Complete the sentence: I ___ a student.",
        options: ["am", "is", "are"],
        correctAnswer: "am"
      }
    case 'Intermediate':
      return {
        question: "Choose the correct past tense: Yesterday, I ___ to the store.",
        options: ["go", "went", "gone"],
        correctAnswer: "went"
      }
    case 'Advanced':
      return {
        question: "Select the correct conditional form: If I ___ about the exam, I would have studied more.",
        options: ["knew", "had known", "would know"],
        correctAnswer: "had known"
      }
    default:
      return {
        question: "Failed to generate a question. Please try again.",
        options: ["Option 1", "Option 2", "Option 3"],
        correctAnswer: "Option 1"
      }
  }
}