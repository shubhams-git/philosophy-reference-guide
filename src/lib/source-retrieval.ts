import { load } from "cheerio";

import type { CuratedSource } from "./grounding";

export type RetrievedSource = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
};

const MAX_SOURCES = 2;
const MAX_EXCERPT_CHARACTERS = 4_500;
const FETCH_TIMEOUT_MS = 8_000;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function relevantExcerpt(html: string, source: CuratedSource, query: string): string {
  const $ = load(html);
  $("script, style, noscript, svg, nav, header, footer, form, aside").remove();

  const terms = [...source.keywords, ...query.toLowerCase().split(/[^a-z0-9]+/)]
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length >= 4);

  const candidates = $("main p, main li, article p, article li, h1, h2, h3, body p")
    .toArray()
    .map((element, index) => {
      const text = normalizeText($(element).text());
      const lower = text.toLowerCase();
      const score = terms.reduce(
        (total, term) => total + (lower.includes(term) ? Math.max(1, term.split(/\s+/).length) : 0),
        0
      );
      return { index, score, text };
    })
    .filter((entry) => entry.text.length >= 60 && entry.text.length <= 1_600)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const selected: string[] = [];
  let length = 0;
  for (const entry of candidates) {
    if (selected.includes(entry.text)) {
      continue;
    }

    if (length + entry.text.length > MAX_EXCERPT_CHARACTERS) {
      continue;
    }

    selected.push(entry.text);
    length += entry.text.length;
    if (selected.length >= 8) {
      break;
    }
  }

  return selected.join("\n\n");
}

async function retrieveSource(
  source: CuratedSource,
  query: string,
  requestSignal: AbortSignal
): Promise<RetrievedSource | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const abort = () => controller.abort();
  requestSignal.addEventListener("abort", abort, { once: true });

  try {
    const response = await fetch(source.url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "LogicTutor/1.0 (academic source retrieval)",
      },
      next: { revalidate: 86_400 },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const excerpt = relevantExcerpt(await response.text(), source, query);
    if (!excerpt) {
      return null;
    }

    return { id: source.id, title: source.title, url: source.url, excerpt };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
    requestSignal.removeEventListener("abort", abort);
  }
}

export async function retrieveSources(
  sources: CuratedSource[],
  query: string,
  requestSignal: AbortSignal
): Promise<RetrievedSource[]> {
  const results = await Promise.all(
    sources
      .slice(0, MAX_SOURCES)
      .map((source) => retrieveSource(source, query, requestSignal))
  );

  return results.filter((source): source is RetrievedSource => source !== null);
}
