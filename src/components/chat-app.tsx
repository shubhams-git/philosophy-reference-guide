"use client";

import {
  ArrowUp,
  BookOpenCheck,
  BrainCircuit,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Square,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { ChatMessage, type DisplayMessage } from "@/components/chat-message";

const STORAGE_KEY = "logic-tutor-chat-v2";

const starterPrompts = [
  "Explain proofs from the beginning",
  "Teach me truth tables with an analogy",
  "What makes an argument valid?",
] as const;

type ChatStatus = "idle" | "streaming" | "verifying";

type StoredChat = {
  messages?: DisplayMessage[];
};

function isDisplaySource(value: unknown): value is NonNullable<DisplayMessage["sources"]>[number] {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    "url" in value &&
    typeof value.title === "string" &&
    typeof value.url === "string"
  );
}

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isDisplayMessage(value: unknown): value is DisplayMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "role" in value &&
    "content" in value &&
    typeof value.id === "string" &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    (!("syllabusBasis" in value) ||
      value.syllabusBasis === undefined ||
      typeof value.syllabusBasis === "string") &&
    (!("sources" in value) ||
      value.sources === undefined ||
      (Array.isArray(value.sources) && value.sources.every(isDisplaySource))) &&
    (!("searchEntryPointHtml" in value) ||
      value.searchEntryPointHtml === undefined ||
      typeof value.searchEntryPointHtml === "string")
  );
}

function parseEventBlock(block: string): { type: string; data: unknown } | null {
  const lines = block.split("\n");
  const type = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!type || !data) {
    return null;
  }

  try {
    return { type, data: JSON.parse(data) };
  } catch {
    return null;
  }
}

function errorMessage(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return "The response could not be completed.";
}

function buildRequestMessages(messages: DisplayMessage[]): Array<{
  role: DisplayMessage["role"];
  content: string;
}> {
  const selected: Array<{ role: DisplayMessage["role"]; content: string }> = [];
  let totalCharacters = 0;

  for (let index = messages.length - 1; index >= 0 && selected.length < 20; index--) {
    const { role, content } = messages[index];
    if (totalCharacters + content.length > 12_000) {
      break;
    }

    selected.unshift({ role, content });
    totalCharacters += content.length;
  }

  while (selected[0]?.role === "assistant") {
    selected.shift();
  }

  return selected;
}

export function ChatApp() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      try {
        const stored = JSON.parse(
          window.localStorage.getItem(STORAGE_KEY) ?? "{}"
        ) as StoredChat;
        if (Array.isArray(stored.messages)) {
          setMessages(stored.messages.filter(isDisplayMessage));
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }

      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }));
  }, [hydrated, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: status === "idle" ? "smooth" : "auto" });
  }, [messages, status]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );

  function updateAssistant(
    messageId: string,
    content: string,
    metadata?: Pick<DisplayMessage, "searchEntryPointHtml" | "sources" | "syllabusBasis">
  ): void {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? { ...message, content, ...metadata }
          : message
      )
    );
  }

  function removeAssistant(messageId: string): void {
    setMessages((current) => current.filter((message) => message.id !== messageId));
  }

  async function readEventStream(
    response: Response,
    assistantId: string,
    controller: AbortController
  ): Promise<void> {
    if (!response.body) {
      throw new Error("The server returned an empty response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamedText = "";
    let receivedFinal = false;

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");

      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const parsed = parseEventBlock(block);
        if (!parsed || controller.signal.aborted) {
          continue;
        }

        if (parsed.type === "delta") {
          if (
            typeof parsed.data === "object" &&
            parsed.data !== null &&
            "phase" in parsed.data &&
            parsed.data.phase === "verifying"
          ) {
            setStatus("verifying");
            continue;
          }

          if (
            typeof parsed.data === "object" &&
            parsed.data !== null &&
            "text" in parsed.data &&
            typeof parsed.data.text === "string"
          ) {
            streamedText += parsed.data.text;
            updateAssistant(assistantId, streamedText);
          }
        }

        if (
          parsed.type === "final" &&
          typeof parsed.data === "object" &&
          parsed.data !== null &&
          "text" in parsed.data &&
          typeof parsed.data.text === "string"
        ) {
          receivedFinal = true;
          const searchEntryPointHtml =
            "searchEntryPointHtml" in parsed.data &&
            typeof parsed.data.searchEntryPointHtml === "string"
              ? parsed.data.searchEntryPointHtml
              : undefined;
          const syllabusBasis =
            "syllabusBasis" in parsed.data &&
            typeof parsed.data.syllabusBasis === "string"
              ? parsed.data.syllabusBasis
              : undefined;
          const sources =
            "sources" in parsed.data &&
            Array.isArray(parsed.data.sources) &&
            parsed.data.sources.every(isDisplaySource)
              ? parsed.data.sources
              : undefined;
          updateAssistant(assistantId, parsed.data.text, {
            searchEntryPointHtml,
            sources,
            syllabusBasis,
          });
        }

        if (parsed.type === "error") {
          throw new Error(errorMessage(parsed.data));
        }
      }

      if (done) {
        break;
      }
    }

    if (!receivedFinal && !controller.signal.aborted) {
      throw new Error("The response ended before its sources were verified.");
    }
  }

  async function submitMessage(event?: FormEvent<HTMLFormElement>): Promise<void> {
    event?.preventDefault();
    const content = input.trim();
    if (!content || status !== "idle") {
      return;
    }

    const userMessage: DisplayMessage = {
      id: createId(),
      role: "user",
      content,
    };
    const assistantMessage: DisplayMessage = {
      id: createId(),
      role: "assistant",
      content: "",
    };
    const requestMessages = buildRequestMessages([...messages, userMessage]);
    const controller = new AbortController();

    abortControllerRef.current = controller;
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setError(null);
    setStatus("streaming");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "The chat request failed.");
      }

      await readEventStream(response, assistantMessage.id, controller);
    } catch (caught) {
      removeAssistant(assistantMessage.id);
      if (controller.signal.aborted) {
        setError("Response stopped before source verification completed.");
      } else {
        setError(caught instanceof Error ? caught.message : "The chat request failed.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setStatus("idle");
    }
  }

  function stopGeneration(): void {
    abortControllerRef.current?.abort();
  }

  function startNewChat(): void {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([]);
    setInput("");
    setError(null);
    setStatus("idle");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  }

  function chooseStarterPrompt(prompt: string): void {
    setInput(prompt);
    composerRef.current?.focus();
  }

  return (
    <div className="flex h-svh min-h-[560px] flex-col bg-[#f7f8f6] text-zinc-950">
      <header className="z-20 shrink-0 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
              <BrainCircuit className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-950">Logic Tutor</h1>
              <p className="text-xs text-zinc-500">Learn slowly. Reason clearly.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={startNewChat}
            disabled={!hydrated || (messages.length === 0 && status === "idle")}
            className="flex size-9 items-center justify-center rounded-xl border border-transparent text-zinc-500 transition-colors hover:border-zinc-200 hover:bg-white hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Start new chat"
            title="New chat"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-3 py-6 sm:px-6 sm:py-10">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center pb-16 sm:pb-24">
              <div className="w-full max-w-2xl text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
                  <BookOpenCheck className="size-6" aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Your personal study companion
                </p>
                <h2 className="mx-auto mt-3 max-w-xl text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                  Logic, explained one clear step at a time.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-600 sm:text-base">
                  Ask about arguments, proofs, truth tables, fallacies, or predicate logic. Every lesson uses plain language, examples, and an analogy.
                </p>
                <div className="mt-7 grid gap-2.5 text-left sm:grid-cols-3">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => chooseStarterPrompt(prompt)}
                      className="group flex min-h-20 items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium leading-5 text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:text-zinc-950 hover:shadow-md"
                    >
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl space-y-8 pb-8">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  streaming={
                    message.role === "assistant" &&
                    index === messages.length - 1 &&
                    status === "streaming"
                  }
                />
              ))}
              {status === "verifying" && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800" role="status">
                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                  Checking the explanation against academic sources...
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="z-20 shrink-0 border-t border-zinc-200/80 bg-gradient-to-t from-white via-white to-white/90 px-3 pb-3 pt-3 sm:px-6 sm:pb-5">
        <div className="mx-auto w-full max-w-4xl">
          {error && (
            <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <form
            onSubmit={(event) => void submitMessage(event)}
            className="flex min-h-14 items-end gap-2 rounded-2xl border border-zinc-300 bg-white p-2 shadow-[0_12px_40px_-20px_rgba(24,24,27,0.45)] transition-shadow focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100"
          >
            <textarea
              ref={composerRef}
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              onKeyDown={handleComposerKeyDown}
              rows={1}
              maxLength={4000}
              placeholder="Ask me to explain any logic concept..."
              aria-label="Chat message"
              className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm leading-5 text-zinc-900 outline-none placeholder:text-zinc-400 [field-sizing:content] sm:text-[15px]"
            />
            {status === "idle" ? (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                aria-label="Send message"
                title="Send"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopGeneration}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-red-600"
                aria-label="Stop response"
                title="Stop"
              >
                <Square className="size-3.5 fill-current" aria-hidden="true" />
              </button>
            )}
          </form>
          <p className="mt-2 text-center text-[11px] text-zinc-400">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </footer>
    </div>
  );
}
