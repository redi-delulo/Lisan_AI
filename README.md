# Lisan AI

Lisan AI is an innovative Next.js application designed to help users learn and practice languages with the assistance of artificial intelligence. This interactive platform provides personalized language learning experiences, making it easier and more engaging for users to improve their language skills.

## Features

- Personalized language learning paths
- AI-powered conversation practice
- Vocabulary and grammar exercises
- Progress tracking and performance analytics
- Multi-language support
- Responsive design for desktop and mobile devices

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for server-side rendering and static site generation
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Gemini API](https://ai.google.dev/gemini-api/docs) - Google Gemini API for AI-powered language responses

## Getting Started

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/alidiamond1/AI-Language-Tutor.git
   cd AI-Language-Tutor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local` and optionally adjust the Gemini model, then verify the required values are present:
   ```bash
   npm run check:env
   ```

   Environment variables used by Lisan AI:

   | Variable | Required | Purpose |
   | --- | --- | --- |
   | `GEMINI_API_KEY` | Yes | Authenticates server-side requests to the Gemini API. |
   | `GEMINI_MODEL` | No | Overrides the Gemini model used by the API route; defaults to `gemini-2.5-flash`. |
   | `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL for real authentication and user data. |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key used with row-level security. |
   | `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only key used by the API route to persist AI chat history. |
   | `NEXT_PUBLIC_API_URL` | No | Overrides the client API base path; defaults to `/api`. |
   | `NEXT_PUBLIC_APP_URL` | Yes | Public app URL used for auth redirects and SEO metadata, for example `https://your-app.vercel.app`. |

   Run `lib/database.sql` in the Supabase SQL editor to create the production tables and row-level-security policies for `users`, `profiles`, `lessons`, `vocabulary`, `quizzes`, `chat_history`, `progress`, `streaks`, and `translations`.

   To verify a Vercel deployment is wired to the server-side Gemini key, open this endpoint after redeploying:
   ```bash
   curl https://your-vercel-domain.vercel.app/api/language-tutor
   ```
   The response should include `"geminiConfigured":true` and the active model. It never returns the secret API key.

4. Run production checks before deploying:
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```
   The build script also runs `npm run check:env && npm run typecheck` automatically through `prebuild`, so Vercel fails fast when required Gemini/Supabase/App URL variables are missing and catches stale references such as removed `setError` or undefined component types before publishing. Add these variables in Vercel Project Settings → Environment Variables for Production/Preview/Development, then redeploy the latest commit after clearing the Vercel build cache if an old symbol is still reported.

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

7. Deploy to Vercel after adding all environment variables in Project Settings:
   ```bash
   vercel --prod
   ```

## Usage

After starting the development server, you can:

1. Sign up or log in to your account
2. Choose your target language and proficiency level
3. Start interactive lessons and conversation practice sessions
4. Track your progress and review your performance

For more detailed instructions, please refer to the project documentation in this repository.

## Contributing

We welcome contributions to the Lisan AI project! Please read our [Contributing Guidelines](link-to-contributing-guidelines) for details on how to submit pull requests, report issues, and suggest improvements.


