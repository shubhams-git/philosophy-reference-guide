<div align="center">

# Logic Tutor

### A beginner-friendly AI study companion for philosophy logic

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

</div>

I built Logic Tutor as a focused study tool for learning formal logic without being overwhelmed by textbook language. It follows a philosophy logic syllabus, explains ideas from the beginning, uses relatable analogies, and supports its answers with verified academic references.

## What It Does

- Explains logic concepts in simple, respectful language.
- Uses the supplied 4-block, 17-unit syllabus as its curriculum map.
- Adds analogies, worked examples, recaps, and self-check questions.
- Renders mathematical notation, proof tables, citations, and source cards clearly.
- Retrieves relevant academic references before generating an answer.
- Stores chat history locally in the browser.

## How It Works

1. The latest question is matched to relevant syllabus units.
2. The server retrieves excerpts from a curated academic source list.
3. Gemini creates a grounded, beginner-friendly lesson.
4. The UI separates the explanation, citations, syllabus location, and sources.

The Gemini API key remains on the server and is never exposed to browser code.

## Tech Stack

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, Geist, Lucide icons |
| AI | Google Gemini through `@google/genai` |
| Rendering | Streamdown, KaTeX, syntax highlighting |
| Grounding | Curated sources, Cheerio extraction, syllabus matching |

## Run Locally

Requirements: Node.js 20.9 or newer and a [Gemini API key](https://aistudio.google.com/app/apikey).

```bash
git clone https://github.com/shubhams-git/philosophy-reference-guide.git
cd philosophy-reference-guide
npm install
copy .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variable

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Server-side key used by `POST /api/chat` |

Never commit a real API key.

## Useful Commands

```bash
npm run dev    # Start the development server
npm run lint   # Run ESLint
npm run build  # Create a production build
npm run start  # Start the production server
```

## Project Notes

- The syllabus PDF is a curriculum outline, not the source of full explanations.
- Only successfully retrieved references are shown as verified sources.
- The model is instructed to identify questions outside the syllabus.
- AI-generated explanations can still be imperfect, so important academic work should be checked against the cited material.

## Current Architecture

The frontend and `POST /api/chat` backend currently run together as one Next.js application. A later deployment setup can separate the API onto Render and keep the frontend on Vercel.

---

Built as a personal learning project to make formal logic feel more approachable.
