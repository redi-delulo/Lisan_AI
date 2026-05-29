import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const requiredFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'components/language-tutor.tsx',
  'pages/api/language-tutor.ts',
  'lib/supabase-rest.ts',
  'lib/database.sql',
  '.env.example',
  'vercel.json',
]

const requiredEnvVariables = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
]

const failures = []

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`Missing required production file: ${file}`)
  }
}

const envExample = existsSync('.env.example') ? readFileSync('.env.example', 'utf8') : ''
for (const key of requiredEnvVariables) {
  if (!envExample.includes(`${key}=`)) {
    failures.push(`.env.example is missing ${key}`)
  }
}

const clientSource = existsSync('components/language-tutor.tsx') ? readFileSync('components/language-tutor.tsx', 'utf8') : ''
const forbiddenClientPatterns = [
  'GEMINI_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'setError(',
  'const userMessage',
  'let userMessage',
  'fallbackWord',
  'outgoingMessage',
]

for (const pattern of forbiddenClientPatterns) {
  if (clientSource.includes(pattern)) {
    failures.push(`Client component contains forbidden/stale pattern: ${pattern}`)
  }
}

const apiSource = existsSync('pages/api/language-tutor.ts') ? readFileSync('pages/api/language-tutor.ts', 'utf8') : ''
for (const requiredApiPattern of ['GEMINI_API_KEY', 'checkRateLimit', 'verifySupabaseUser', 'saveChatMessage']) {
  if (!apiSource.includes(requiredApiPattern)) {
    failures.push(`API route is missing expected production safeguard/integration: ${requiredApiPattern}`)
  }
}

if (failures.length > 0) {
  console.error('Project lint failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

const typecheck = spawnSync('npm', ['run', 'typecheck'], { stdio: 'inherit' })
if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1)
}

console.log('Project lint passed')
