import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env.local')
const requiredVariables = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]
const recommendedVariables = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
]
const placeholderValues = new Set([
  'your_gemini_api_key_here',
  'https://your-project.supabase.co',
  'your_supabase_anon_key_here',
  'your_supabase_service_role_key_here',
  'https://your-vercel-domain.vercel.app',
])

function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {}
  }

  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return values
      }

      const separatorIndex = trimmedLine.indexOf('=')
      if (separatorIndex === -1) {
        return values
      }

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^[ '"]|[ '"]$/g, '')

      values[key] = value
      return values
    }, {})
}

const localEnv = parseEnvFile(envPath)

function getValue(key) {
  const value = localEnv[key] || process.env[key] || ''

  if (key === 'NEXT_PUBLIC_APP_URL' && !value.trim() && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return value
}

function collectStatus(keys) {
  const missing = []
  const placeholders = []

  for (const key of keys) {
    const normalizedValue = getValue(key).trim()

    if (!normalizedValue) {
      missing.push(key)
      continue
    }

    if (placeholderValues.has(normalizedValue)) {
      placeholders.push(key)
    }
  }

  return { missing, placeholders }
}

const requiredStatus = collectStatus(requiredVariables)
const recommendedStatus = collectStatus(recommendedVariables)
const failures = []

if (requiredStatus.missing.length > 0) {
  failures.push(`Missing required environment variable(s): ${requiredStatus.missing.join(', ')}`)
}

if (requiredStatus.placeholders.length > 0) {
  failures.push(`Placeholder required environment value(s) found for: ${requiredStatus.placeholders.join(', ')}`)
}

if (!existsSync(envPath)) {
  console.warn('No .env.local file found. This is OK on Vercel when variables are configured in Project Settings.')
}

if (recommendedStatus.missing.length > 0) {
  console.warn(`Recommended environment variable(s) not set: ${recommendedStatus.missing.join(', ')}`)
  console.warn('SUPABASE_SERVICE_ROLE_KEY enables server-side chat persistence; NEXT_PUBLIC_APP_URL can fall back to VERCEL_URL on Vercel.')
}

if (recommendedStatus.placeholders.length > 0) {
  console.warn(`Placeholder recommended environment value(s) found for: ${recommendedStatus.placeholders.join(', ')}`)
}

if (failures.length > 0) {
  console.error('Environment check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  console.error('Create .env.local from .env.example locally, or add these values in Vercel Project Settings → Environment Variables.')
  process.exit(1)
}

console.log('Environment check passed')
