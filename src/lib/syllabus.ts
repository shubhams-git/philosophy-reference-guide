export type SyllabusSection = {
  number: string;
  title: string;
};

export type SyllabusUnit = {
  id: string;
  blockId: string;
  blockTitle: string;
  unitNumber: number;
  title: string;
  pdfPage: number;
  sections: SyllabusSection[];
};

export type SyllabusBlock = {
  id: string;
  title: string;
  pdfPages: readonly [number, number];
  units: SyllabusUnit[];
};

const section = (number: string, title: string): SyllabusSection => ({
  number,
  title,
});

const block = (
  id: string,
  title: string,
  pdfPages: readonly [number, number],
  units: Array<Omit<SyllabusUnit, "blockId" | "blockTitle">>
): SyllabusBlock => ({
  id,
  title,
  pdfPages,
  units: units.map((unit) => ({ ...unit, blockId: id, blockTitle: title })),
});

export const syllabusBlocks: SyllabusBlock[] = [
  block("classical-logic", "Block 1: Classical Logic", [2, 3], [
    {
      id: "classical-categorical-propositions",
      unitNumber: 1,
      title:
        "Types of Categorical Propositions: A, E, I, O and Square of Opposition",
      pdfPage: 2,
      sections: [
        section("1.0", "Objectives"),
        section("1.1", "Introduction"),
        section("1.2", "Terms and their Kinds"),
        section("1.3", "Denotation and Connotation of Terms"),
        section("1.4", "Meaning and Supposition of Terms"),
        section("1.5", "Propositions"),
        section("1.6", "Square of Opposition"),
        section("1.7", "Let Us Sum Up"),
        section("1.8", "Key Words"),
        section("1.9", "Further Readings and References"),
      ],
    },
    {
      id: "classical-categorical-syllogism",
      unitNumber: 2,
      title: "Categorical Syllogism",
      pdfPage: 2,
      sections: [
        section("2.0", "Objectives"),
        section("2.1", "Introduction"),
        section("2.2", "Reason and Inference: Meaning and Objections"),
        section("2.3", "Kinds of Inference"),
        section("2.4", "Deductive Reasoning and Syllogism"),
        section("2.5", "Kinds of Syllogism"),
        section("2.6", "Let Us Sum Up"),
        section("2.7", "Key Words"),
        section("2.8", "Further Readings and References"),
      ],
    },
    {
      id: "classical-figure-mood-syllogisms",
      unitNumber: 3,
      title: "Figure, Mood and the Possible Types of Syllogisms",
      pdfPage: 2,
      sections: [
        section("3.0", "Objectives"),
        section("3.1", "Introduction"),
        section("3.2", "Moods of Categorical Syllogism"),
        section("3.3", "Figures of Syllogism"),
        section("3.4", "Incomplete Syllogism and Compound Syllogism"),
        section("3.5", "Dilemma"),
        section("3.6", "Avoiding Dilemma"),
        section("3.7", "Let Us Sum Up"),
        section("3.8", "Key Words"),
        section("3.9", "Further Readings and References"),
      ],
    },
    {
      id: "classical-validity-invalidity",
      unitNumber: 4,
      title: "Validity, Invalidity and List of Valid Syllogisms",
      pdfPage: 3,
      sections: [
        section("4.0", "Objectives"),
        section("4.1", "Introduction"),
        section("4.2", "The Rules of Categorical Syllogism"),
        section("4.3", "Special Applications of General Rules"),
        section("4.4", "Reduction of Arguments to I Figure"),
        section("4.5", "Antilogism or Inconsistent Triad"),
        section("4.6", "Venn Diagram Technique"),
        section("4.7", "Boolean Analysis"),
        section("4.8", "Let Us Sum Up"),
        section("4.9", "Key Words"),
        section("4.10", "Further Readings and References"),
      ],
    },
  ]),
  block("sentential-logic-1", "Block 2: Sentential Logic 1: Introduction", [4, 5], [
    {
      id: "sentential-introduction-argument-forms",
      unitNumber: 1,
      title: "Introduction to the Form of Arguments in Modern Logic",
      pdfPage: 4,
      sections: [
        section("1.0", "Objectives"),
        section("1.1", "Introduction"),
        section("1.2", "A Short Story of Logic"),
        section("1.3", "Classical Logic and Symbolic Logic"),
        section("1.4", "Why use Symbols?"),
        section("1.5", "The Nature of Argument"),
        section("1.6", "Truth and Validity"),
        section("1.7", "Argument Forms"),
        section("1.8", "Truth-Table"),
        section("1.9", "Kinds of Sentence Forms and Sentences"),
        section("1.10", "Testing the Validity of Argument Forms"),
        section("1.11", "Exercises"),
        section("1.12", "Let Us Sum Up"),
        section("1.13", "Key Words"),
        section("1.14", "Further Readings and References"),
      ],
    },
    {
      id: "sentential-connectives",
      unitNumber: 2,
      title: "Conjunction, Disjunction, Conditional and Biconditional",
      pdfPage: 4,
      sections: [
        section("2.0", "Objectives"),
        section("2.1", "Introduction"),
        section("2.2", "Negation"),
        section("2.3", "Conjunction"),
        section("2.4", "Disjunction"),
        section("2.5", "Exercises"),
        section("2.6", "Implication"),
        section("2.7", "Biconditional"),
        section("2.8", "Let Us Sum Up"),
        section("2.9", "Key Words"),
        section("2.10", "Further Readings and References"),
      ],
    },
    {
      id: "sentential-inference-validity",
      unitNumber: 3,
      title: "Rules of Inference and the Nature of Validity of Arguments",
      pdfPage: 5,
      sections: [
        section("3.0", "Objectives"),
        section("3.1", "Introduction - Tools of Testing Arguments"),
        section("3.2", "Methods of Testing the Validity of Arguments"),
        section("3.3", "Application of Elementary Rules of Inference"),
        section("3.4", "Exercises"),
        section("3.5", "Let Us Sum Up"),
        section("3.6", "Key words"),
        section("3.7", "Further Readings and References"),
      ],
    },
    {
      id: "sentential-fallacies",
      unitNumber: 4,
      title: "Fallacies",
      pdfPage: 5,
      sections: [
        section("4.0", "Objective"),
        section("4.1", "Introduction"),
        section("4.2", "Classification of Fallacies"),
        section("4.3", "Fallacies of Relevance"),
        section("4.4", "Fallacies of Induction"),
        section("4.5", "Fallacies of Presumption"),
        section("4.6", "Fallacies of Ambiguity"),
        section("4.7", "Exercises"),
        section("4.8", "Let Us Sum Up"),
        section("4.9", "Key Words"),
        section("4.10", "Further Readings and References"),
      ],
    },
  ]),
  block("sentential-logic-2", "Block 3: Sentential Logic 2: Proving Validity", [6, 7], [
    {
      id: "sentential-proof-rules",
      unitNumber: 1,
      title: "Proving Validity Using Rules of Inference",
      pdfPage: 6,
      sections: [
        section("1.0", "Objectives"),
        section("1.1", "Introduction"),
        section("1.2", "Necessity of Rules of Inference"),
        section("1.3", "Meaning of Proof of Validity"),
        section("1.4", "Nine Rules of Inference"),
        section("1.5", "Usage of Rules of Inference to test Validity"),
        section("1.6", "Converting Verbal Forms of Argument into Symbols"),
        section("1.7", "Examples for Using Rules of Inference"),
        section("1.8", "Rules of Replacement"),
        section("1.9", "Let Us Sum Up"),
        section("1.10", "Key Words"),
        section("1.11", "Further Readings and References"),
      ],
    },
    {
      id: "sentential-conditional-proof",
      unitNumber: 2,
      title: "Conditional Proof",
      pdfPage: 6,
      sections: [
        section("2.0", "Objectives"),
        section("2.1", "Introduction"),
        section("2.2", "Conditional Proof (C.P.)"),
        section("2.3", "Exercises I"),
        section("2.4", "The Strengthened Rule of C. P."),
        section("2.5", "Exercises II"),
        section("2.6", "Let Us Sum Up"),
        section("2.7", "Key Words"),
        section("2.8", "Further Readings and References"),
      ],
    },
    {
      id: "sentential-indirect-proof",
      unitNumber: 3,
      title: "Indirect Proof",
      pdfPage: 7,
      sections: [
        section("3.0", "Objectives"),
        section("3.1", "Introduction"),
        section("3.2", "The Meaning of Indirect Proof"),
        section("3.3", "Application of Indirect Proof"),
        section("3.4", "Examples"),
        section("3.5", "Exercises on Indirect Proof"),
        section("3.6", "Indirect Proof and Proof of Tautology"),
        section("3.7", "Let Us Sum Up"),
        section("3.8", "Key Words"),
        section("3.9", "Further Readings and References"),
      ],
    },
    {
      id: "sentential-proving-invalidity",
      unitNumber: 4,
      title: "Proving Invalidity",
      pdfPage: 7,
      sections: [
        section("4.0", "Objectives"),
        section("4.1", "Introduction"),
        section("4.2", "Proving Invalidity"),
        section("4.3", "Advantages of the Method of Proving Invalidity"),
        section("4.4", "Assumptions of Proving Invalidity"),
        section("4.5", "Second Method of Proving Invalidity; Examples"),
        section("4.6", "Exercises"),
        section("4.7", "Let Us Sum Up"),
        section("4.8", "Key Words"),
        section("4.9", "Further Readings and References"),
      ],
    },
  ]),
  block("predicate-logic", "Block 4: Predicate Logic", [8, 9], [
    {
      id: "predicate-quantifiers",
      unitNumber: 1,
      title:
        "Introducing the Quantifiers 'All' and 'Some' and their Symbolic Representation",
      pdfPage: 8,
      sections: [
        section("1.0", "Objectives"),
        section("1.1", "Introduction"),
        section("1.2", "Symbolization of Propositions"),
        section("1.3", "Logical Relations involving Quantifiers"),
        section("1.4", "Fall-out of Universal and Existential Quantifiers"),
        section("1.5", "Examples"),
        section("1.6", "Exercises"),
        section("1.7", "Let Us Sum Up"),
        section("1.8", "Key Words"),
        section("1.9", "Further Readings and References"),
      ],
    },
    {
      id: "predicate-quantification-rules",
      unitNumber: 2,
      title:
        "Rules of Universal Instantiation and Generalization, Existential Instantiation and Generalization, and Rules of Quantifier Equivalence",
      pdfPage: 8,
      sections: [
        section("2.0", "Objectives"),
        section("2.1", "Introduction"),
        section("2.2", "Rules of Quantification"),
        section("2.3", "Rules of Quantifier Equivalence"),
        section("2.4", "Application of the Quantification Rules"),
        section("2.5", "Examples"),
        section("2.6", "Exercises"),
        section("2.7", "Quantification Rules and Arguments"),
        section("2.8", "Let Us Sum Up"),
        section("2.9", "Key Words"),
        section("2.10", "Further Readings and References"),
      ],
    },
    {
      id: "predicate-proofs-validity",
      unitNumber: 3,
      title: "Proofs of Validity",
      pdfPage: 9,
      sections: [
        section("3.0", "Objectives"),
        section("3.1", "Introduction"),
        section("3.2", "Quantification and Equivalence Relation"),
        section("3.3", "Rules of Quantification and Non-syllogism"),
        section("3.4", "Exercises"),
        section("3.5", "Multiply General Propositions"),
        section("3.6", "The Strengthened Rule of C. P. and Quantification"),
        section("3.7", "Let Us Sum Up"),
        section("3.8", "Key Words"),
        section("3.9", "Further Readings and References"),
      ],
    },
    {
      id: "predicate-proving-invalidity",
      unitNumber: 4,
      title: "Proving Invalidity",
      pdfPage: 9,
      sections: [
        section("4.0", "Objectives"),
        section("4.1", "Introduction"),
        section("4.2", "Methods of Proving Invalidity-1"),
        section("4.3", "Methods of proving Invalidity-2"),
        section("4.4", "Exercises"),
        section("4.5", "Let Us Sum Up"),
        section("4.6", "Key Words"),
        section("4.7", "Further Readings and References"),
      ],
    },
    {
      id: "predicate-symbolic-logic-applications",
      unitNumber: 5,
      title: "Applications of Symbolic Logic",
      pdfPage: 9,
      sections: [
        section("5.0", "Objectives"),
        section("5.1", "Introduction"),
        section("5.2", "Application of Symbolic Logic with Digital Logic"),
        section("5.3", "Boolean Algebra"),
        section("5.4", "Logic Gates"),
        section("5.5", "Role of symbolic logic in Multi-Value logic"),
        section("5.6", "Application of Fuzzy Logic"),
        section("5.7", "Let Us Sum Up"),
        section("5.8", "Key Words"),
        section("5.9", "Further Readings and References"),
      ],
    },
  ]),
];

export const allUnits = syllabusBlocks.flatMap((item) => item.units);

export function curriculumSnapshot(): string {
  return syllabusBlocks
    .map((item) => {
      const units = item.units
        .map((unit) => {
          const sections = unit.sections.map(
            (entry) => `    - ${entry.number} ${entry.title}`
          );

          return [
            `  Unit ${unit.unitNumber}: ${unit.title} (PDF page ${unit.pdfPage})`,
            ...sections,
          ].join("\n");
        })
        .join("\n");

      return `${item.title} (PDF pages ${item.pdfPages[0]}-${item.pdfPages[1]})\n${units}`;
    })
    .join("\n\n");
}
