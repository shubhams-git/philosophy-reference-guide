import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import {
  curriculumSnapshot,
  getStudyMode,
  getTopicById,
} from "@/lib/syllabus";

export const maxDuration = 60;

const MODEL_ID = "google/gemini-3.5-flash";

type ChatRequestBody = {
  messages?: UIMessage[];
  topicId?: string;
  studyMode?: string;
  accessCode?: string;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function validateAccess(req: Request, body: ChatRequestBody) {
  const configuredCode = process.env.APP_ACCESS_CODE;

  if (!configuredCode) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        response: jsonError("APP_ACCESS_CODE is not configured.", 500),
      };
    }

    return { ok: true as const };
  }

  const submittedCode =
    req.headers.get("x-app-access-code") ?? body.accessCode ?? "";

  if (submittedCode !== configuredCode) {
    return {
      ok: false,
      response: jsonError("Invalid access code.", 401),
    };
  }

  return { ok: true as const };
}

function buildSystemPrompt(topicId: string | undefined, modeId: string | undefined) {
  const topic = getTopicById(topicId);
  const mode = getStudyMode(modeId);

  return [
    "You are Logic Syllabus Tutor, a precise study companion for a philosophy logic curriculum.",
    "",
    "Grounding rules:",
    "- The attached PDF is only a syllabus outline. Do not claim it contains full explanations, examples, or readings beyond the topic headings.",
    "- Use the syllabus as the study map, then teach from standard logic knowledge when the learner asks for explanation, practice, or examples.",
    "- If you add context outside the syllabus, label it as extra background or a standard logic convention.",
    "- Stay focused on philosophy logic, argument analysis, syllogisms, truth tables, fallacies, proof methods, quantifiers, Boolean algebra, and logic gates.",
    "- Show work step by step for symbolic translations, truth tables, syllogism validity, derivations, countermodels, and proof checking.",
    "- For mistakes, explain the exact rule or distinction involved before giving the corrected answer.",
    "- Prefer compact tables, numbered derivations, and short checkpoints over long essays.",
    "- Ask at most one clarifying question when needed; otherwise proceed with the most useful study response.",
    "",
    `Current study mode: ${mode.label}`,
    `Mode instruction: ${mode.instruction}`,
    "",
    "Current syllabus focus:",
    `${topic.blockTitle}`,
    `Unit ${topic.unitNumber}: ${topic.title}`,
    "Sections:",
    ...topic.sections.map((section) => `- ${section}`),
    "",
    "Full syllabus map:",
    curriculumSnapshot(),
  ].join("\n");
}

export async function POST(req: Request) {
  let body: ChatRequestBody;

  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const access = validateAccess(req, body);
  if (!access.ok) {
    return access.response;
  }

  if (!Array.isArray(body.messages)) {
    return jsonError("Request body must include a messages array.", 400);
  }

  const result = streamText({
    model: MODEL_ID,
    system: buildSystemPrompt(body.topicId, body.studyMode),
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      if (error == null) {
        return "Unknown model error.";
      }

      if (error instanceof Error) {
        return error.message;
      }

      return "The model request failed.";
    },
  });
}
