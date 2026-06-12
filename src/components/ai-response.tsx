"use client";

import { code } from "@streamdown/code";
import { createMathPlugin } from "@streamdown/math";
import {
  BookMarked,
  Check,
  CircleHelp,
  Copy,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import {
  Children,
  isValidElement,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { Streamdown, type Components, type ExtraProps } from "streamdown";

import { SafeLink } from "@/components/safe-link";

const streamdownPlugins = {
  code,
  math: createMathPlugin({ singleDollarTextMath: true }),
};

export type DisplaySource = {
  title: string;
  url: string;
};

type AiResponseProps = {
  content: string;
  sources?: DisplaySource[];
  streaming: boolean;
  syllabusBasis?: string;
};

function elementProps<T extends ExtraProps>(props: T): Omit<T, "node"> {
  const result = { ...props };
  Reflect.deleteProperty(result, "node");
  return result;
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(nodeText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeText(node.props.children);
  }

  return "";
}

function LearningCallout({ children, kind }: { children: ReactNode; kind: string }) {
  const styles = {
    analogy: {
      icon: Lightbulb,
      shell: "border-amber-200 bg-amber-50/80 text-amber-950",
      iconShell: "bg-amber-100 text-amber-700",
    },
    recap: {
      icon: Sparkles,
      shell: "border-emerald-200 bg-emerald-50/80 text-emerald-950",
      iconShell: "bg-emerald-100 text-emerald-700",
    },
    check: {
      icon: CircleHelp,
      shell: "border-sky-200 bg-sky-50/80 text-sky-950",
      iconShell: "bg-sky-100 text-sky-700",
    },
    limit: {
      icon: GraduationCap,
      shell: "border-zinc-200 bg-zinc-50 text-zinc-700",
      iconShell: "bg-zinc-200 text-zinc-600",
    },
  } as const;
  const style = styles[kind as keyof typeof styles] ?? styles.limit;
  const Icon = style.icon;

  return (
    <aside className={`my-5 flex gap-3 rounded-2xl border p-4 sm:p-5 ${style.shell}`}>
      <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl ${style.iconShell}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-[15px] leading-7 [&>p]:m-0">{children}</div>
    </aside>
  );
}

function calloutKind(children: ReactNode): string | null {
  const text = nodeText(children).trim().toLowerCase();

  if (text.startsWith("analogy:")) return "analogy";
  if (text.startsWith("in simple words:")) return "recap";
  if (text.startsWith("quick self-check:") || text.startsWith("quick self check:")) return "check";
  if (text.startsWith("where the analogy stops:")) return "limit";
  return null;
}

function MarkdownParagraph(props: ComponentPropsWithoutRef<"p"> & ExtraProps) {
  const { children } = props;
  const kind = calloutKind(children);

  if (kind) {
    return <LearningCallout kind={kind}>{children}</LearningCallout>;
  }

  return (
    <p {...elementProps(props)} className="my-3 text-[15px] leading-7 text-zinc-700 sm:text-base sm:leading-8">
      {children}
    </p>
  );
}

function MarkdownBlockquote(props: ComponentPropsWithoutRef<"blockquote"> & ExtraProps) {
  const { children } = props;
  const kind = calloutKind(children);

  if (kind) {
    const content = Children.map(children, (child) =>
      isValidElement<{ children?: ReactNode }>(child) ? child.props.children : child
    );
    return <LearningCallout kind={kind}>{content}</LearningCallout>;
  }

  return (
    <blockquote {...elementProps(props)} className="my-5 border-l-4 border-emerald-300 pl-4 italic text-zinc-600">
      {children}
    </blockquote>
  );
}

const markdownComponents: Components = {
  h1: (props) => (
    <h1 {...elementProps(props)} className="mb-4 mt-8 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
      {props.children}
    </h1>
  ),
  h2: (props) => (
    <h2 {...elementProps(props)} className="mb-3 mt-9 scroll-mt-20 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
      {props.children}
    </h2>
  ),
  h3: (props) => (
    <h3 {...elementProps(props)} className="mb-2 mt-7 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
      {props.children}
    </h3>
  ),
  h4: (props) => (
    <h4 {...elementProps(props)} className="mb-2 mt-6 text-base font-semibold text-zinc-900 sm:text-lg">
      {props.children}
    </h4>
  ),
  p: MarkdownParagraph,
  blockquote: MarkdownBlockquote,
  strong: (props) => (
    <strong {...elementProps(props)} className="font-semibold text-zinc-950">
      {props.children}
    </strong>
  ),
  ul: (props) => (
    <ul {...elementProps(props)} className="my-4 space-y-2.5 pl-1">
      {props.children}
    </ul>
  ),
  ol: (props) => (
    <ol {...elementProps(props)} className="my-4 space-y-3 pl-1 [counter-reset:lesson-step]">
      {props.children}
    </ol>
  ),
  li: (props) => (
    <li
      {...elementProps(props)}
      className="relative ml-5 pl-2 text-[15px] leading-7 text-zinc-700 marker:font-semibold marker:text-emerald-700 sm:text-base sm:leading-8"
    >
      {props.children}
    </li>
  ),
  hr: (props) => <hr {...elementProps(props)} className="my-7 border-zinc-200" />,
  table: (props) => (
    <div className="my-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <table {...elementProps(props)} className="w-full min-w-[520px] border-collapse text-left text-sm">
        {props.children}
      </table>
    </div>
  ),
  thead: (props) => (
    <thead {...elementProps(props)} className="bg-zinc-100 text-zinc-900">
      {props.children}
    </thead>
  ),
  tbody: (props) => (
    <tbody {...elementProps(props)} className="divide-y divide-zinc-200">
      {props.children}
    </tbody>
  ),
  tr: (props) => (
    <tr {...elementProps(props)} className="transition-colors hover:bg-emerald-50/40">
      {props.children}
    </tr>
  ),
  th: (props) => (
    <th {...elementProps(props)} className="border-r border-zinc-200 px-4 py-3 font-semibold last:border-r-0">
      {props.children}
    </th>
  ),
  td: (props) => (
    <td {...elementProps(props)} className="border-r border-zinc-200 px-4 py-3 align-top leading-6 text-zinc-700 last:border-r-0">
      {props.children}
    </td>
  ),
  a: SafeLink,
  inlineCode: (props) => (
    <code
      {...elementProps(props)}
      className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-900"
    >
      {props.children}
    </code>
  ),
};

function parseLegacyContent(content: string): {
  body: string;
  sources?: DisplaySource[];
  syllabusBasis?: string;
} {
  const metadataMarker = "\n\n---\n**Syllabus basis:** ";
  const markerIndex = content.lastIndexOf(metadataMarker);
  if (markerIndex === -1) {
    return { body: content };
  }

  const body = content.slice(0, markerIndex).trim();
  const metadata = content.slice(markerIndex + metadataMarker.length);
  const sourcesMarker = "\n\n**Sources:**\n";
  const sourcesIndex = metadata.indexOf(sourcesMarker);
  const syllabusBasis = (sourcesIndex === -1 ? metadata : metadata.slice(0, sourcesIndex)).trim();
  const sourceText = sourcesIndex === -1 ? "" : metadata.slice(sourcesIndex + sourcesMarker.length);
  const sources = Array.from(sourceText.matchAll(/\d+\.\s+\[([^\]]+)]\(([^)]+)\)/g)).map(
    ([, title, url]) => ({ title, url })
  );

  return { body, syllabusBasis, sources };
}

function sourceHost(url: string): string {
  if (url.startsWith("/")) {
    return "Course PDF";
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Reference";
  }
}

function EvidencePanel({
  sources,
  syllabusBasis,
}: {
  sources: DisplaySource[];
  syllabusBasis?: string;
}) {
  if (!syllabusBasis && sources.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 sm:p-5" aria-label="Lesson references">
      {syllabusBasis && (
        <div className="flex gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-zinc-200">
            <BookMarked className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-950">Where this fits in your syllabus</h3>
            <Streamdown
              className="mt-1 text-sm leading-6 text-zinc-600 [&_p]:m-0"
              components={{ a: SafeLink, p: MarkdownParagraph }}
              mode="static"
            >
              {syllabusBasis}
            </Streamdown>
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div className={syllabusBasis ? "mt-5 border-t border-zinc-200 pt-5" : ""}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Verified sources
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {sources.map((source, index) => (
              <SafeLink
                key={`${source.url}-${index}`}
                href={source.url}
                variant="source"
                className="group flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-900">{source.title}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">{sourceHost(source.url)}</span>
                </span>
                <ExternalLink className="size-3.5 shrink-0 text-zinc-400 transition-colors group-hover:text-emerald-700" aria-hidden="true" />
              </SafeLink>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function AiResponse({ content, sources, streaming, syllabusBasis }: AiResponseProps) {
  const [copied, setCopied] = useState(false);
  const legacy = parseLegacyContent(content);
  const body = legacy.body;
  const resolvedSources = sources ?? legacy.sources ?? [];
  const resolvedBasis = syllabusBasis ?? legacy.syllabusBasis;

  async function copyResponse() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  }

  return (
    <div>
      <Streamdown
        className="logic-response"
        components={markdownComponents}
        controls={{ code: { copy: true, download: false }, table: false, mermaid: false }}
        linkSafety={{ enabled: false }}
        mode={streaming ? "streaming" : "static"}
        plugins={streamdownPlugins}
      >
        {body}
      </Streamdown>

      {!streaming && (
        <>
          <EvidencePanel sources={resolvedSources} syllabusBasis={resolvedBasis} />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => void copyResponse()}
              className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
              {copied ? "Copied" : "Copy lesson"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
