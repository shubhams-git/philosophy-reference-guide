# Philosophy Logic Study Chatbot

A personal Next.js study app for the uploaded logic syllabus. It uses the syllabus as a curriculum map and streams responses from Gemini 3.5 Flash through Vercel AI Gateway.

## Features

- Syllabus sidebar with 4 blocks and 17 units from `logic_curriculum_syllabus.pdf`.
- Study modes for direct learning, Socratic questioning, quizzes, proof practice, and review.
- Quick actions for explanations, quizzes, worked examples, proof practice, and summaries.
- Browser-local chat history, selected topic, access code, and completion progress.
- Protected `/api/chat` endpoint using `APP_ACCESS_CODE`.

## Local Development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set `APP_ACCESS_CODE` in `.env.local` if you want the local endpoint protected. For model calls, use Vercel AI Gateway OIDC after linking the project, or set `AI_GATEWAY_API_KEY` locally.

```bash
npx vercel link
npx vercel env pull .env.local
```

## Checks

```bash
npm run lint
npm run build
```

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the GitHub repo in Vercel.
3. Enable AI Gateway for the Vercel project.
4. Add `APP_ACCESS_CODE` in Vercel environment variables.
5. Deploy from the Git integration.

The app calls `google/gemini-3.5-flash` via the Vercel AI SDK model string.
