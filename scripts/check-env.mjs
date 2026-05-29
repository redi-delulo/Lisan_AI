import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env.local')
const requiredVariables = ['GROQ_API_KEY']
const placeholderValues = new Set(['your_groq_api_key_here'])

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
      const value = rawValue.replace(/^['"]|['"]$/g, '')

      values[key] = value
      return values
    }, {})
}

const localEnv = parseEnvFile(envPath)
const missingVariables = []
const placeholderVariables = []

for (const key of requiredVariables) {
  const value = localEnv[key] || process.env[key] || ''
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    missingVariables.push(key)
    continue
  }

  if (placeholderValues.has(normalizedValue)) {
    placeholderVariables.push(key)
  }
}

if (!existsSync(envPath) && missingVariables.length > 0) {
  console.error('Missing .env.local file in the project root.')
  console.error('Create .env.local from .env.example and add the required values:')
  console.error(`  ${missingVariables.join('\n  ')}`)
  process.exit(1)
}

if (missingVariables.length > 0) {
  console.error(`Missing required environment variable(s): ${missingVariables.join(', ')}`)
  console.error('Update .env.local with the missing value(s), or export them in your shell.')
  process.exit(1)
}

if (placeholderVariables.length > 0) {
  console.error(`Placeholder environment value(s) found for: ${placeholderVariables.join(', ')}`)
  console.error('Replace placeholder values in .env.local with real credentials.')
  process.exit(1)
}

console.log('Environment check passed')
