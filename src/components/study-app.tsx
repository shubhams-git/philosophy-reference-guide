"use client";

import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Eraser,
  KeyRound,
  ListChecks,
  Menu,
  MessagesSquare,
  RefreshCcw,
  Sigma,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  allUnits,
  DEFAULT_TOPIC_ID,
  getStudyMode,
  getTopicById,
  isStudyModeId,
  studyModes,
  syllabusBlocks,
  type StudyModeId,
  type SyllabusUnit,
} from "@/lib/syllabus";

const STORAGE_KEY = "logic-study-chatbot:v1";

type StoredState = {
  accessCode?: string;
  completedTopicIds?: string[];
  messages?: UIMessage[];
  selectedTopicId?: string;
  studyMode?: StudyModeId;
};

type QuickAction = {
  label: string;
  icon: typeof BookOpen;
  mode: StudyModeId;
  prompt: (topic: SyllabusUnit) => string;
};

const quickActions: QuickAction[] = [
  {
    label: "Explain",
    icon: BookOpen,
    mode: "learn",
    prompt: (topic) =>
      `Explain "${topic.title}" for my philosophy logic syllabus. Start with the core idea, define the key terms, give one simple example, and finish with two checkpoints.`,
  },
  {
    label: "Quiz Me",
    icon: ClipboardCheck,
    mode: "quiz",
    prompt: (topic) =>
      `Quiz me on "${topic.title}". Ask five mixed questions from the listed sections. Wait for my answers before revealing the key.`,
  },
  {
    label: "Worked Example",
    icon: Sigma,
    mode: "proof",
    prompt: (topic) =>
      `Give me a worked example for "${topic.title}". Show every step and explain why each rule or move is valid.`,
  },
  {
    label: "Proof Practice",
    icon: Brain,
    mode: "proof",
    prompt: (topic) =>
      `Create one proof or validity exercise for "${topic.title}". Let me attempt it first, then check my answer step by step.`,
  },
  {
    label: "Summarize",
    icon: ListChecks,
    mode: "review",
    prompt: (topic) =>
      `Summarize "${topic.title}" as revision notes. Include key distinctions, common mistakes, and a compact memory hook.`,
  },
];

const chatTransport = new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest: ({ messages, body }) => ({
    body: {
      messages,
      ...body,
    },
  }),
});

function restoreStoredState(): StoredState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as StoredState;
  } catch {
    return {};
  }
}

function isKnownTopic(topicId: string | undefined) {
  return allUnits.some((unit) => unit.id === topicId);
}

export function StudyApp() {
  const [hydrated, setHydrated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [input, setInput] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState(DEFAULT_TOPIC_ID);
  const [studyMode, setStudyMode] = useState<StudyModeId>("learn");
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [mobileSyllabusOpen, setMobileSyllabusOpen] = useState(false);

  const {
    clearError,
    error,
    messages,
    regenerate,
    sendMessage,
    setMessages,
    status,
    stop,
  } = useChat({
    experimental_throttle: 50,
    transport: chatTransport,
    onError: () => undefined,
  });

  const selectedTopic = getTopicById(selectedTopicId);
  const selectedMode = getStudyMode(studyMode);
  const progress = Math.round((completedTopicIds.length / allUnits.length) * 100);
  const canSubmit = status === "ready" || status === "error";

  const requestBody = useMemo(
    () => ({
      accessCode,
      studyMode,
      topicId: selectedTopic.id,
    }),
    [accessCode, selectedTopic.id, studyMode]
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      const stored = restoreStoredState();

      if (stored.accessCode) {
        setAccessCode(stored.accessCode);
      }

      if (stored.selectedTopicId && isKnownTopic(stored.selectedTopicId)) {
        setSelectedTopicId(stored.selectedTopicId);
      }

      if (stored.studyMode && isStudyModeId(stored.studyMode)) {
        setStudyMode(stored.studyMode);
      }

      if (Array.isArray(stored.completedTopicIds)) {
        setCompletedTopicIds(
          stored.completedTopicIds.filter((topicId) => isKnownTopic(topicId))
        );
      }

      if (Array.isArray(stored.messages)) {
        setMessages(stored.messages);
      }

      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [setMessages]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const state: StoredState = {
      accessCode,
      completedTopicIds,
      messages,
      selectedTopicId,
      studyMode,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    accessCode,
    completedTopicIds,
    hydrated,
    messages,
    selectedTopicId,
    studyMode,
  ]);

  function selectTopic(topicId: string) {
    setSelectedTopicId(topicId);
    setMobileSyllabusOpen(false);
  }

  function toggleCompleted(topicId: string) {
    setCompletedTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId]
    );
  }

  async function sendStudyMessage(text: string, modeOverride?: StudyModeId) {
    const trimmed = text.trim();
    if (!trimmed || !canSubmit) {
      return;
    }

    clearError();
    await sendMessage(
      { text: trimmed },
      {
        body: {
          ...requestBody,
          studyMode: modeOverride ?? studyMode,
        },
      }
    );
  }

  async function handlePromptSubmit(message: { text: string }) {
    const text = message.text.trim();
    if (!text) {
      return;
    }

    setInput("");
    await sendStudyMessage(text);
  }

  async function runQuickAction(action: QuickAction) {
    setStudyMode(action.mode);
    await sendStudyMessage(action.prompt(selectedTopic), action.mode);
  }

  function resetChat() {
    setMessages([]);
    clearError();
  }

  const syllabusNav = (
    <SyllabusNav
      completedTopicIds={completedTopicIds}
      onSelectTopic={selectTopic}
      onToggleCompleted={toggleCompleted}
      selectedTopicId={selectedTopic.id}
    />
  );

  return (
    <div className="flex h-svh min-h-[640px] flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/95 px-3 backdrop-blur md:px-5">
        <Sheet open={mobileSyllabusOpen} onOpenChange={setMobileSyllabusOpen}>
          <SheetTrigger asChild>
            <Button
              className="lg:hidden"
              size="icon"
              variant="outline"
              aria-label="Open syllabus"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(92vw,380px)] gap-0 p-0"
          >
            <SheetHeader className="border-b border-border/70">
              <SheetTitle>Syllabus</SheetTitle>
            </SheetHeader>
            {syllabusNav}
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <MessagesSquare className="size-4 shrink-0 text-primary" />
            <h1 className="truncate text-sm font-semibold tracking-wide">
              Philosophy Logic Study Chatbot
            </h1>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            Gemini 3.5 Flash via Vercel AI Gateway
          </p>
        </div>

        <div className="hidden min-w-48 items-center gap-2 md:flex">
          <KeyRound className="size-4 text-muted-foreground" />
          <Input
            value={accessCode}
            onChange={(event) => setAccessCode(event.currentTarget.value)}
            type="password"
            placeholder="Access code"
            className="h-8"
            aria-label="Access code"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetChat}
          disabled={!messages.length && !error}
        >
          <Eraser className="size-3.5" />
          New chat
        </Button>
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 border-r border-border/70 lg:block">
          {syllabusNav}
        </aside>

        <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
          <TopicHeader
            completed={completedTopicIds.includes(selectedTopic.id)}
            mode={selectedMode.label}
            onToggleComplete={() => toggleCompleted(selectedTopic.id)}
            progress={progress}
            topic={selectedTopic}
          />

          <div className="min-h-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_84%),transparent_34rem)]">
            <Conversation className="h-full">
              <ConversationContent className="mx-auto w-full max-w-4xl gap-5 px-4 py-6 md:px-6">
                {messages.length === 0 ? (
                  <ConversationEmptyState className="min-h-[55vh]">
                    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
                      <div className="rounded-full border border-primary/30 bg-primary/10 p-3 text-primary">
                        <BookOpen className="size-7" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-balance text-xl font-semibold md:text-2xl">
                          Start with {selectedTopic.title}
                        </h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Choose a quick action or ask a specific question. The
                          tutor will use the syllabus as the map and teach from
                          standard logic where the outline needs explanation.
                        </p>
                      </div>
                    </div>
                  </ConversationEmptyState>
                ) : (
                  messages.map((message) => (
                    <Message
                      key={message.id}
                      from={message.role}
                      className={cn(
                        message.role === "assistant" && "max-w-full",
                        message.role === "user" && "max-w-[86%]"
                      )}
                    >
                      <MessageContent
                        className={cn(
                          message.role === "assistant" &&
                            "w-full rounded-lg border border-border/70 bg-card/60 p-4 shadow-sm",
                          message.role === "user" &&
                            "bg-primary text-primary-foreground"
                        )}
                      >
                        {message.parts.map((part, index) => {
                          if (part.type !== "text") {
                            return null;
                          }

                          return message.role === "assistant" ? (
                            <MessageResponse
                              key={`${message.id}-${index}`}
                              className="text-sm leading-6"
                            >
                              {part.text}
                            </MessageResponse>
                          ) : (
                            <p
                              key={`${message.id}-${index}`}
                              className="whitespace-pre-wrap text-sm leading-6"
                            >
                              {part.text}
                            </p>
                          );
                        })}
                      </MessageContent>
                    </Message>
                  ))
                )}
              </ConversationContent>
              {messages.length > 0 && (
                <ConversationDownload
                  messages={messages}
                  filename="logic-study-session.md"
                  className="right-5 top-5"
                />
              )}
              <ConversationScrollButton />
            </Conversation>
          </div>

          <div className="border-t border-border/70 bg-background/95 p-3 backdrop-blur md:p-4">
            <div className="mx-auto flex max-w-4xl flex-col gap-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <Tabs
                  value={studyMode}
                  onValueChange={(value) => {
                    if (isStudyModeId(value)) {
                      setStudyMode(value);
                    }
                  }}
                >
                  <TabsList className="grid h-auto w-full grid-cols-5 xl:w-fit">
                    {studyModes.map((mode) => (
                      <TabsTrigger
                        key={mode.id}
                        value={mode.id}
                        className="min-w-0 px-2 text-xs"
                      >
                        <span className="truncate">{mode.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void runQuickAction(action)}
                        disabled={!canSubmit}
                      >
                        <Icon className="size-3.5" />
                        {action.label}
                      </Button>
                    );
                  })}
                  {messages.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            void regenerate({
                              body: requestBody,
                            })
                          }
                          disabled={!canSubmit}
                          aria-label="Regenerate response"
                        >
                          <RefreshCcw className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Regenerate last answer</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <KeyRound className="size-4 text-muted-foreground" />
                <Input
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.currentTarget.value)}
                  type="password"
                  placeholder="Access code"
                  className="h-8"
                  aria-label="Access code"
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error.message}
                </div>
              )}

              <PromptInput
                onSubmit={(message) => void handlePromptSubmit(message)}
                className="rounded-lg border border-border/80 bg-card shadow-sm"
              >
                <PromptInputBody>
                  <PromptInputTextarea
                    value={input}
                    onChange={(event) => setInput(event.currentTarget.value)}
                    placeholder={`Ask about ${selectedTopic.title}`}
                    className="min-h-20 resize-none"
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputTools className="min-w-0 flex-1">
                    <span className="truncate text-xs text-muted-foreground">
                      {selectedMode.instruction}
                    </span>
                  </PromptInputTools>
                  <PromptInputSubmit
                    status={status}
                    onStop={() => void stop()}
                    disabled={status === "ready" && !input.trim()}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function TopicHeader({
  completed,
  mode,
  onToggleComplete,
  progress,
  topic,
}: {
  completed: boolean;
  mode: string;
  onToggleComplete: () => void;
  progress: number;
  topic: SyllabusUnit;
}) {
  return (
    <div className="border-b border-border/70 bg-background/95 px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{topic.blockTitle}</Badge>
            <Badge className="bg-accent text-accent-foreground" variant="outline">
              Unit {topic.unitNumber}
            </Badge>
            <Badge variant="outline">{mode}</Badge>
          </div>
          <div>
            <h2 className="text-pretty text-lg font-semibold leading-7 md:text-xl">
              {topic.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {topic.sections.join(" / ")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline">{progress}% complete</Badge>
          <Button
            type="button"
            variant={completed ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleComplete}
          >
            {completed ? (
              <CheckCircle2 className="size-3.5 text-primary" />
            ) : (
              <Circle className="size-3.5" />
            )}
            {completed ? "Done" : "Mark done"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SyllabusNav({
  completedTopicIds,
  onSelectTopic,
  onToggleCompleted,
  selectedTopicId,
}: {
  completedTopicIds: string[];
  onSelectTopic: (topicId: string) => void;
  onToggleCompleted: (topicId: string) => void;
  selectedTopicId: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/70 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Syllabus map</p>
            <p className="text-xs text-muted-foreground">
              {allUnits.length} units across 4 blocks
            </p>
          </div>
          <Badge variant="outline">
            {completedTopicIds.length}/{allUnits.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-4">
          {syllabusBlocks.map((blockItem) => (
            <section key={blockItem.id} className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {blockItem.title}
              </div>
              <div className="space-y-1">
                {blockItem.units.map((unit) => {
                  const selected = unit.id === selectedTopicId;
                  const completed = completedTopicIds.includes(unit.id);

                  return (
                    <div
                      key={unit.id}
                      className={cn(
                        "group flex items-start gap-2 rounded-lg border border-transparent p-2 transition-colors",
                        selected
                          ? "border-primary/35 bg-primary/10"
                          : "hover:bg-muted/70"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectTopic(unit.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-xs font-medium text-muted-foreground">
                          Unit {unit.unitNumber}
                        </span>
                        <span className="mt-0.5 block text-sm leading-5">
                          {unit.title}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleCompleted(unit.id)}
                        className="mt-0.5 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                        aria-label={
                          completed
                            ? `Mark ${unit.title} incomplete`
                            : `Mark ${unit.title} complete`
                        }
                      >
                        {completed ? (
                          <CheckCircle2 className="size-4 text-primary" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              <Separator />
            </section>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border/70 p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          The syllabus PDF is treated as an outline. The tutor can add standard
          logic explanations, but it will identify them as outside the outline.
        </p>
      </div>
    </div>
  );
}
