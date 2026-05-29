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
- [Groq SDK](https://www.npmjs.com/package/groq-sdk) - Groq API client for AI-powered language responses

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
   Add your Groq API key to `.env.local` and optionally adjust the Groq model/API base URL, then verify the required values are present:
   ```bash
   npm run check:env
   ```

   Environment variables used by Lisan AI:

   | Variable | Required | Purpose |
   | --- | --- | --- |
   | `GROQ_API_KEY` | Yes | Authenticates server-side requests to the Groq API. |
   | `GROQ_MODEL` | No | Overrides the Groq chat model used by the API route; defaults to `llama-3.3-70b-versatile`. Do not use the decommissioned `mixtral-8x7b-32768` model. |
   | `NEXT_PUBLIC_API_URL` | No | Overrides the client API base path; defaults to `/api`. |

   If your Vercel deployment still has `GROQ_MODEL=mixtral-8x7b-32768`, update it to `llama-3.3-70b-versatile` or delete the variable so the app can use the default model, then redeploy.

   To verify a Vercel deployment is wired to the server-side Groq key, open this endpoint after redeploying:
   ```bash
   curl https://your-vercel-domain.vercel.app/api/language-tutor
   ```
   The response should include `"groqConfigured":true` and the active model. It never returns the secret API key.

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

After starting the development server, you can:

1. Sign up or log in to your account
2. Choose your target language and proficiency level
3. Start interactive lessons and conversation practice sessions
4. Track your progress and review your performance

For more detailed instructions, please refer to the project documentation in this repository.

## Contributing

We welcome contributions to the Lisan AI project! Please read our [Contributing Guidelines](link-to-contributing-guidelines) for details on how to submit pull requests, report issues, and suggest improvements.


