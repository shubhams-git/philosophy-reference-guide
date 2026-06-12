"use client";

import { BookOpenText } from "lucide-react";
import { memo } from "react";

import { AiResponse, type DisplaySource } from "@/components/ai-response";

export type DisplayMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: DisplaySource[];
  syllabusBasis?: string;
  searchEntryPointHtml?: string;
};

export const ChatMessage = memo(function ChatMessage({
  message,
  streaming,
}: {
  message: DisplayMessage;
  streaming: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end py-1">
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-zinc-900 px-4 py-3 text-sm leading-6 text-white shadow-sm sm:max-w-[72%] sm:px-5">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_16px_50px_-32px_rgba(24,24,27,0.35)]">
      <header className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 sm:px-6">
        <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <BookOpenText className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-950">Logic Tutor</p>
          <p className="text-xs text-zinc-500">Beginner-friendly explanation</p>
        </div>
      </header>
      <div className="min-w-0 px-4 py-5 sm:px-6 sm:py-7">
        {message.content ? (
          <AiResponse
            content={message.content}
            sources={message.sources}
            streaming={streaming}
            syllabusBasis={message.syllabusBasis}
          />
        ) : (
          <div className="flex h-10 items-center gap-3 text-sm text-zinc-500" aria-label="Generating response">
            <span className="flex gap-1.5">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="size-2 animate-pulse rounded-full bg-emerald-400 [animation-delay:150ms]" />
              <span className="size-2 animate-pulse rounded-full bg-emerald-300 [animation-delay:300ms]" />
            </span>
            Building your explanation...
          </div>
        )}
        {message.searchEntryPointHtml && (
          <div
            className="google-search-entry mt-4 overflow-hidden text-sm"
            dangerouslySetInnerHTML={{ __html: message.searchEntryPointHtml }}
          />
        )}
      </div>
    </article>
  );
});
