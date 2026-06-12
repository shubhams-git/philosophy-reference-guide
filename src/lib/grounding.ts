import { allUnits, type SyllabusSection, type SyllabusUnit } from "./syllabus";
import type { RetrievedSource } from "./source-retrieval";

export type ApiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CuratedSource = {
  id: string;
  title: string;
  url: string;
  unitIds: string[];
  keywords: string[];
};

export type GroundingPlan = {
  scope: "casual" | "syllabus" | "outside";
  units: SyllabusUnit[];
  sources: CuratedSource[];
  query: string;
};

export type VerifiedSource = {
  title: string;
  url: string;
};

const unitKeywords: Record<string, string[]> = {
  "classical-categorical-propositions": [
    "term",
    "terms",
    "proposition",
    "categorical proposition",
    "a proposition",
    "e proposition",
    "i proposition",
    "o proposition",
    "square of opposition",
    "denotation",
    "connotation",
    "supposition of terms",
    "universal affirmative",
    "universal negative",
    "particular affirmative",
    "particular negative",
  ],
  "classical-categorical-syllogism": [
    "syllogism",
    "categorical syllogism",
    "deductive reasoning",
    "deductive inference",
    "kinds of inference",
    "major premise",
    "minor premise",
    "middle term",
  ],
  "classical-figure-mood-syllogisms": [
    "mood",
    "figure",
    "enthymeme",
    "sorites",
    "compound syllogism",
    "dilemma",
    "horns of a dilemma",
  ],
  "classical-validity-invalidity": [
    "valid syllogism",
    "invalid syllogism",
    "syllogistic rule",
    "distributed term",
    "venn diagram",
    "antilogism",
    "inconsistent triad",
    "boolean analysis",
    "existential import",
  ],
  "sentential-introduction-argument-forms": [
    "symbolic logic",
    "modern logic",
    "argument form",
    "truth and validity",
    "truth table",
    "sentence form",
    "premise",
    "conclusion",
    "validity",
  ],
  "sentential-connectives": [
    "negation",
    "conjunction",
    "disjunction",
    "conditional",
    "biconditional",
    "implication",
    "connective",
    "if and only if",
    "material implication",
  ],
  "sentential-inference-validity": [
    "rule of inference",
    "rules of inference",
    "modus ponens",
    "modus tollens",
    "hypothetical syllogism",
    "disjunctive syllogism",
    "valid argument",
    "test validity",
  ],
  "sentential-fallacies": [
    "fallacy",
    "fallacies",
    "ad hominem",
    "straw man",
    "appeal to authority",
    "relevance",
    "weak induction",
    "presumption",
    "ambiguity",
  ],
  "sentential-proof-rules": [
    "proof",
    "proof of validity",
    "formal proof",
    "rules of replacement",
    "replacement rule",
    "derivation",
    "symbolize the argument",
    "nine rules",
  ],
  "sentential-conditional-proof": [
    "conditional proof",
    "c.p.",
    "assume the antecedent",
    "strengthened conditional proof",
  ],
  "sentential-indirect-proof": [
    "indirect proof",
    "proof by contradiction",
    "reductio",
    "reductio ad absurdum",
    "tautology proof",
  ],
  "sentential-proving-invalidity": [
    "proving invalidity",
    "counterexample",
    "countermodel",
    "invalid argument",
    "assign truth values",
  ],
  "predicate-quantifiers": [
    "predicate logic",
    "first order logic",
    "quantifier",
    "universal quantifier",
    "existential quantifier",
    "all and some",
    "symbolize predicates",
  ],
  "predicate-quantification-rules": [
    "universal instantiation",
    "universal generalization",
    "existential instantiation",
    "existential generalization",
    "quantifier equivalence",
    "quantification rule",
  ],
  "predicate-proofs-validity": [
    "predicate proof",
    "quantifier proof",
    "multiple generality",
    "multiply general propositions",
    "proof with quantifiers",
    "quantification and equivalence",
  ],
  "predicate-proving-invalidity": [
    "predicate invalidity",
    "first order countermodel",
    "domain interpretation",
    "proving invalidity predicate",
  ],
  "predicate-symbolic-logic-applications": [
    "digital logic",
    "boolean algebra",
    "logic gate",
    "logic gates",
    "and gate",
    "or gate",
    "not gate",
    "multi-value logic",
    "many-valued logic",
    "fuzzy logic",
  ],
};

export const curatedSources: CuratedSource[] = [
  {
    id: "pima-categorical-propositions",
    title: "Pima Open: Classes and Categorical Propositions",
    url: "https://pimaopen.pressbooks.pub/intrologic/chapter/3-1-classes-and-categorical-propositions/",
    unitIds: ["classical-categorical-propositions"],
    keywords: ["categorical", "a e i o", "classes", "proposition"],
  },
  {
    id: "pima-square-opposition",
    title: "Pima Open: The Square of Opposition",
    url: "https://pimaopen.pressbooks.pub/intrologic/chapter/3-2-the-square-of-opposition/",
    unitIds: ["classical-categorical-propositions"],
    keywords: ["square of opposition", "contrary", "contradictory", "subaltern"],
  },
  {
    id: "pima-categorical-syllogisms",
    title: "Pima Open: Categorical Syllogisms",
    url: "https://pimaopen.pressbooks.pub/intrologic/chapter/3-5-categorical-syllogisms/",
    unitIds: [
      "classical-categorical-syllogism",
      "classical-figure-mood-syllogisms",
      "classical-validity-invalidity",
    ],
    keywords: ["syllogism", "mood", "figure", "venn diagram", "validity"],
  },
  {
    id: "forall-arguments",
    title: "forall x: Calgary - Arguments",
    url: "https://forallx.openlogicproject.org/html/Ch1.html",
    unitIds: ["sentential-introduction-argument-forms"],
    keywords: ["argument", "premise", "conclusion", "validity"],
  },
  {
    id: "forall-connectives",
    title: "forall x: Calgary - Connectives",
    url: "https://forallx.openlogicproject.org/html/Ch5.html",
    unitIds: ["sentential-connectives"],
    keywords: ["negation", "conjunction", "disjunction", "conditional", "biconditional"],
  },
  {
    id: "forall-truth-tables",
    title: "forall x: Calgary - Complete Truth Tables",
    url: "https://forallx.openlogicproject.org/html/Ch11.html",
    unitIds: [
      "sentential-introduction-argument-forms",
      "sentential-inference-validity",
      "sentential-proving-invalidity",
    ],
    keywords: ["truth table", "tautology", "contradiction", "contingent", "counterexample"],
  },
  {
    id: "forall-tfl-rules",
    title: "forall x: Calgary - Basic Rules for TFL",
    url: "https://forallx.openlogicproject.org/html/Ch17.html",
    unitIds: [
      "sentential-inference-validity",
      "sentential-proof-rules",
      "sentential-conditional-proof",
      "sentential-indirect-proof",
    ],
    keywords: ["proof", "inference", "derivation", "conditional proof", "indirect proof"],
  },
  {
    id: "openstax-fallacies",
    title: "OpenStax: Informal Fallacies",
    url: "https://openstax.org/books/introduction-philosophy/pages/5-5-informal-fallacies",
    unitIds: ["sentential-fallacies"],
    keywords: ["fallacy", "ad hominem", "straw man", "ambiguity", "presumption"],
  },
  {
    id: "forall-fol-language",
    title: "forall x: Calgary - Building Blocks of FOL",
    url: "https://forallx.openlogicproject.org/html/Ch23.html",
    unitIds: ["predicate-quantifiers"],
    keywords: ["predicate", "quantifier", "first order", "universal", "existential"],
  },
  {
    id: "forall-fol-rules",
    title: "forall x: Calgary - Basic Rules for FOL",
    url: "https://forallx.openlogicproject.org/html/Ch36.html",
    unitIds: [
      "predicate-quantification-rules",
      "predicate-proofs-validity",
      "predicate-proving-invalidity",
    ],
    keywords: ["quantifier rule", "instantiation", "generalization", "predicate proof"],
  },
  {
    id: "sep-classical-logic",
    title: "Stanford Encyclopedia of Philosophy: Classical Logic",
    url: "https://plato.stanford.edu/entries/logic-classical/",
    unitIds: [
      "sentential-introduction-argument-forms",
      "sentential-inference-validity",
      "predicate-quantifiers",
    ],
    keywords: ["classical logic", "logical consequence", "validity"],
  },
  {
    id: "sep-propositional-logic",
    title: "Stanford Encyclopedia of Philosophy: Propositional Logic",
    url: "https://plato.stanford.edu/entries/logic-propositional/",
    unitIds: [
      "sentential-introduction-argument-forms",
      "sentential-connectives",
      "sentential-proof-rules",
    ],
    keywords: ["propositional logic", "sentential logic", "truth functional"],
  },
  {
    id: "sep-many-valued-logic",
    title: "Stanford Encyclopedia of Philosophy: Many-Valued Logic",
    url: "https://plato.stanford.edu/entries/logic-manyvalued/",
    unitIds: ["predicate-symbolic-logic-applications"],
    keywords: ["many-valued", "multi-value", "truth value"],
  },
  {
    id: "sep-fuzzy-logic",
    title: "Stanford Encyclopedia of Philosophy: Fuzzy Logic",
    url: "https://plato.stanford.edu/entries/logic-fuzzy/",
    unitIds: ["predicate-symbolic-logic-applications"],
    keywords: ["fuzzy logic", "degree of truth"],
  },
  {
    id: "libretexts-logic-circuits",
    title: "Engineering LibreTexts: Logic Circuits",
    url: "https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/Foundations_of_Computation_%28Critchlow_and_Eck%29/01%3A_Logic_and_Proof/1.03%3A_Application_-_Logic_Circuits",
    unitIds: ["predicate-symbolic-logic-applications"],
    keywords: ["boolean algebra", "digital logic", "logic gate", "circuit"],
  },
];

const casualPattern = /^(hi|hello|hey|thanks|thank you|good morning|good evening|who are you|what can you do)[!.?\s]*$/i;

function scoreText(text: string, phrases: string[]): number {
  return phrases.reduce((score, phrase) => {
    if (!text.includes(phrase)) {
      return score;
    }

    return score + Math.max(1, phrase.split(/\s+/).length);
  }, 0);
}

function isSubstantiveSection(section: SyllabusSection): boolean {
  return !/^(objectives?|introduction|exercises?( i| ii)?|let us sum up|key words|further readings and references)$/i.test(
    section.title
  );
}

function conversationQuery(messages: ApiChatMessage[]): string {
  return messages
    .slice(-6)
    .map((message, index, recent) => {
      const weight = index === recent.length - 1 ? 3 : 1;
      return Array.from({ length: weight }, () => message.content).join(" ");
    })
    .join(" ")
    .toLowerCase();
}

export function buildGroundingPlan(messages: ApiChatMessage[]): GroundingPlan {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")?.content.trim() ?? "";
  const query = conversationQuery(messages);

  const scoredUnits = allUnits
    .map((unit) => ({
      unit,
      score: scoreText(query, [
        unit.title.toLowerCase(),
        ...unitKeywords[unit.id],
        ...unit.sections
          .filter(isSubstantiveSection)
          .map((entry) => entry.title.toLowerCase()),
      ]),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.unit.pdfPage - b.unit.pdfPage)
    .slice(0, 3);

  const units = scoredUnits.map((entry) => entry.unit);
  if (units.length === 0 && /\b(logic|logical reasoning)\b/i.test(latestUserMessage)) {
    const introductoryUnit = allUnits.find(
      (unit) => unit.id === "sentential-introduction-argument-forms"
    );
    if (introductoryUnit) {
      units.push(introductoryUnit);
    }
  }
  const scope = casualPattern.test(latestUserMessage)
    ? "casual"
    : units.length > 0
      ? "syllabus"
      : "outside";

  const sources = curatedSources
    .map((source) => ({
      source,
      score:
        source.unitIds.filter((id) => units.some((unit) => unit.id === id)).length * 8 +
        scoreText(query, source.keywords),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.source);

  return { scope, units, sources, query: latestUserMessage };
}

function scoreSection(section: SyllabusSection, query: string): number {
  const title = section.title.toLowerCase();
  const words = title
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !["introduction", "objectives", "exercises", "further", "readings", "references"].includes(word));

  return scoreText(query.toLowerCase(), [title, ...words]);
}

function syllabusBasis(plan: GroundingPlan): string {
  if (plan.scope === "casual") {
    return "[Full syllabus outline, Blocks 1-4, PDF pages 2-9](/logic_curriculum_syllabus.pdf#page=2)";
  }

  if (plan.units.length === 0) {
    return "Outside the listed curriculum; no direct unit match. [Full syllabus reviewed, PDF pages 2-9](/logic_curriculum_syllabus.pdf#page=2).";
  }

  return plan.units
    .map((unit) => {
      const relevantSections = unit.sections
        .map((entry) => ({ entry, score: scoreSection(entry, plan.query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ entry }) => `${entry.number} ${entry.title}`);
      const sectionText = relevantSections.length
        ? `; ${relevantSections.join(", ")}`
        : "";

      return `[${unit.blockTitle} > Unit ${unit.unitNumber}: ${unit.title}${sectionText}; PDF page ${unit.pdfPage}](/logic_curriculum_syllabus.pdf#page=${unit.pdfPage})`;
    })
    .join("<br />");
}

export function finalizeGroundedAnswer({
  text,
  plan,
  retrievedSources,
}: {
  text: string;
  plan: GroundingPlan;
  retrievedSources: RetrievedSource[];
}): { text: string; syllabusBasis: string; sources: VerifiedSource[] } {
  const sources = retrievedSources.map(({ title, url }) => ({ title, url }));
  const basis = syllabusBasis(plan);

  if (plan.scope !== "casual" && sources.length === 0) {
    const warning =
      plan.scope === "outside"
        ? "**Outside syllabus:** This question is not directly covered by the listed curriculum."
        : "**Evidence unavailable:** I could not verify an authoritative source for this answer.";

    return {
      text: `${warning}\n\nI cannot give a confident substantive answer until a source can be verified.`,
      syllabusBasis: basis,
      sources: [],
    };
  }

  let answer = text.trim().replace(/\[S(\d+)]/g, (marker, value: string) => {
    const index = Number(value) - 1;
    const source = sources[index];
    return source ? `[${index + 1}](${source.url})` : marker;
  });
  if (plan.scope === "outside" && !answer.startsWith("**Outside syllabus:**")) {
    answer = `**Outside syllabus:** This question is not directly covered by the listed curriculum.\n\n${answer}`;
  }

  return {
    text: answer,
    syllabusBasis: basis,
    sources: sources.length
      ? sources
      : [{ title: "Logic Curriculum Syllabus", url: "/logic_curriculum_syllabus.pdf" }],
  };
}
