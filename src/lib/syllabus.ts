export type StudyModeId = "learn" | "socratic" | "quiz" | "proof" | "review";

export type SyllabusUnit = {
  id: string;
  blockId: string;
  blockTitle: string;
  unitNumber: number;
  title: string;
  sections: string[];
};

export type SyllabusBlock = {
  id: string;
  title: string;
  units: SyllabusUnit[];
};

export type StudyMode = {
  id: StudyModeId;
  label: string;
  instruction: string;
};

const block = (
  id: string,
  title: string,
  units: Array<Omit<SyllabusUnit, "blockId" | "blockTitle">>
): SyllabusBlock => ({
  id,
  title,
  units: units.map((unit) => ({ ...unit, blockId: id, blockTitle: title })),
});

export const syllabusBlocks: SyllabusBlock[] = [
  block("classical-logic", "Block 1: Classical Logic", [
    {
      id: "classical-categorical-propositions",
      unitNumber: 1,
      title:
        "Types of Categorical Propositions: A, E, I, O and Square of Opposition",
      sections: [
        "Terms and their kinds",
        "Denotation and connotation of terms",
        "Meaning and supposition of terms",
        "Propositions",
        "Square of opposition",
      ],
    },
    {
      id: "classical-categorical-syllogism",
      unitNumber: 2,
      title: "Categorical Syllogism",
      sections: [
        "Reason and inference: meaning and objections",
        "Kinds of inference",
        "Deductive reasoning and syllogism",
        "Kinds of syllogism",
      ],
    },
    {
      id: "classical-figure-mood-syllogisms",
      unitNumber: 3,
      title: "Figure, Mood and the Possible Types of Syllogisms",
      sections: [
        "Moods of categorical syllogism",
        "Figures of syllogism",
        "Incomplete syllogism and compound syllogism",
        "Dilemma",
        "Avoiding dilemma",
      ],
    },
    {
      id: "classical-validity-invalidity",
      unitNumber: 4,
      title: "Validity, Invalidity and List of Valid Syllogisms",
      sections: [
        "Rules of categorical syllogism",
        "Special applications of general rules",
        "Reduction of arguments to first figure",
        "Antilogism or inconsistent triad",
        "Venn diagram technique",
        "Boolean analysis",
      ],
    },
  ]),
  block("sentential-logic-1", "Block 2: Sentential Logic 1: Introduction", [
    {
      id: "sentential-introduction-argument-forms",
      unitNumber: 1,
      title: "Introduction to the Form of Arguments in Modern Logic",
      sections: [
        "A short story of logic",
        "Classical logic and symbolic logic",
        "Why use symbols?",
        "The nature of argument",
        "Truth and validity",
        "Argument forms",
        "Truth-table",
        "Kinds of sentence forms and sentences",
        "Testing the validity of argument forms",
      ],
    },
    {
      id: "sentential-connectives",
      unitNumber: 2,
      title: "Conjunction, Disjunction, Conditional and Biconditional",
      sections: [
        "Negation",
        "Conjunction",
        "Disjunction",
        "Implication",
        "Biconditional",
      ],
    },
    {
      id: "sentential-inference-validity",
      unitNumber: 3,
      title: "Rules of Inference and the Nature of Validity of Arguments",
      sections: [
        "Tools of testing arguments",
        "Methods of testing the validity of arguments",
        "Application of elementary rules of inference",
      ],
    },
    {
      id: "sentential-fallacies",
      unitNumber: 4,
      title: "Fallacies",
      sections: [
        "Classification of fallacies",
        "Fallacies of relevance",
        "Fallacies of induction",
        "Fallacies of presumption",
        "Fallacies of ambiguity",
      ],
    },
  ]),
  block("sentential-logic-2", "Block 3: Sentential Logic 2: Proving Validity", [
    {
      id: "sentential-proof-rules",
      unitNumber: 1,
      title: "Proving Validity Using Rules of Inference",
      sections: [
        "Necessity of rules of inference",
        "Meaning of proof of validity",
        "Nine rules of inference",
        "Using rules of inference to test validity",
        "Converting verbal forms of argument into symbols",
        "Examples for using rules of inference",
        "Rules of replacement",
      ],
    },
    {
      id: "sentential-conditional-proof",
      unitNumber: 2,
      title: "Conditional Proof",
      sections: [
        "Conditional proof (C.P.)",
        "Exercises I",
        "The strengthened rule of C.P.",
        "Exercises II",
      ],
    },
    {
      id: "sentential-indirect-proof",
      unitNumber: 3,
      title: "Indirect Proof",
      sections: [
        "Meaning of indirect proof",
        "Application of indirect proof",
        "Examples",
        "Exercises on indirect proof",
        "Indirect proof and proof of tautology",
      ],
    },
    {
      id: "sentential-proving-invalidity",
      unitNumber: 4,
      title: "Proving Invalidity",
      sections: [
        "Proving invalidity",
        "Advantages of the method of proving invalidity",
        "Assumptions of proving invalidity",
        "Second method of proving invalidity; examples",
      ],
    },
  ]),
  block("predicate-logic", "Block 4: Predicate Logic", [
    {
      id: "predicate-quantifiers",
      unitNumber: 1,
      title:
        "Introducing the Quantifiers 'All' and 'Some' and their Symbolic Representation",
      sections: [
        "Symbolization of propositions",
        "Logical relations involving quantifiers",
        "Fall-out of universal and existential quantifiers",
        "Examples",
      ],
    },
    {
      id: "predicate-quantification-rules",
      unitNumber: 2,
      title:
        "Rules of Universal Instantiation and Generalization, Existential Instantiation and Generalization, and Rules of Quantifier Equivalence",
      sections: [
        "Rules of quantification",
        "Rules of quantifier equivalence",
        "Application of the quantification rules",
        "Examples",
        "Quantification rules and arguments",
      ],
    },
    {
      id: "predicate-proofs-validity",
      unitNumber: 3,
      title: "Proofs of Validity",
      sections: [
        "Quantification and equivalence relation",
        "Rules of quantification and non-syllogism",
        "Exercises",
        "Multiply general propositions",
        "The strengthened rule of C.P. and quantification",
      ],
    },
    {
      id: "predicate-proving-invalidity",
      unitNumber: 4,
      title: "Proving Invalidity",
      sections: [
        "Methods of proving invalidity 1",
        "Methods of proving invalidity 2",
        "Exercises",
      ],
    },
    {
      id: "predicate-symbolic-logic-applications",
      unitNumber: 5,
      title: "Applications of Symbolic Logic",
      sections: [
        "Application of symbolic logic with digital logic",
        "Boolean algebra",
        "Logic gates",
        "Role of symbolic logic in multi-value logic",
        "Application of fuzzy logic",
      ],
    },
  ]),
];

export const studyModes: StudyMode[] = [
  {
    id: "learn",
    label: "Learn",
    instruction:
      "Teach directly with short explanations, definitions, examples, and checkpoints.",
  },
  {
    id: "socratic",
    label: "Socratic",
    instruction:
      "Ask one focused question at a time, wait for the learner's answer, then respond with hints or correction.",
  },
  {
    id: "quiz",
    label: "Quiz",
    instruction:
      "Generate exam-style questions, wait for answers, then grade and explain the reasoning.",
  },
  {
    id: "proof",
    label: "Proof Lab",
    instruction:
      "Prioritize symbolic translations, truth tables, derivations, countermodels, and step-by-step proof checking.",
  },
  {
    id: "review",
    label: "Review",
    instruction:
      "Summarize key distinctions, common mistakes, memory anchors, and revision prompts.",
  },
];

export const allUnits = syllabusBlocks.flatMap((blockItem) => blockItem.units);

export const DEFAULT_TOPIC_ID = allUnits[0].id;

export function getTopicById(topicId: string | undefined): SyllabusUnit {
  return allUnits.find((unit) => unit.id === topicId) ?? allUnits[0];
}

export function getStudyMode(modeId: string | undefined): StudyMode {
  return studyModes.find((mode) => mode.id === modeId) ?? studyModes[0];
}

export function isStudyModeId(value: string): value is StudyModeId {
  return studyModes.some((mode) => mode.id === value);
}

export function curriculumSnapshot() {
  return syllabusBlocks
    .map((blockItem) => {
      const units = blockItem.units
        .map((unit) => {
          const sections = unit.sections.map((section) => `    - ${section}`);
          return [
            `  Unit ${unit.unitNumber}: ${unit.title}`,
            ...sections,
          ].join("\n");
        })
        .join("\n");

      return `${blockItem.title}\n${units}`;
    })
    .join("\n\n");
}
