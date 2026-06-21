import { C } from "./tokens";

export const TEACHER_COURSES = [
  {
    id: "alg", title: "Algebra I", emoji: "📐", period: "Period 3", students: 24, color: C.visual,
    description: "Linear equations, quadratics, polynomials, and systems of equations for 9th grade.",
    kpis: { mastery: 67, masteryTrend: +5, accuracy: 71, accuracyTrend: +4, focus: 6.2, focusTrend: +8, hint: 32, hintTrend: -3 },
    topics: [
      { topic: "Linear Eq.", mastery: 88 }, { topic: "Inequalities", mastery: 74 },
      { topic: "Functions", mastery: 61 }, { topic: "Quadratics", mastery: 43 },
      { topic: "Polynomials", mastery: 52 }, { topic: "Systems", mastery: 69 },
    ],
    chatbot: [
      { week: 1, mins: 42 }, { week: 2, mins: 51 }, { week: 3, mins: 68 }, { week: 4, mins: 73 },
      { week: 5, mins: 61 }, { week: 6, mins: 88 }, { week: 7, mins: 95 }, { week: 8, mins: 84 },
    ],
    accuracyOverTime: [
      { week: "W1", acc: 58 }, { week: "W2", acc: 62 }, { week: "W3", acc: 60 }, { week: "W4", acc: 67 },
      { week: "W5", acc: 71 }, { week: "W6", acc: 74 }, { week: "W7", acc: 73 }, { week: "W8", acc: 78 },
    ],
    reteach: [
      ["Quadratics", "43%", "Most miss factoring before applying the formula."],
      ["Polynomials", "52%", "Sign errors when combining like terms."],
      ["Functions", "61%", "Confusing domain with range."],
    ],
  },
  {
    id: "bio", title: "Intro to Biology", emoji: "🧬", period: "Period 1", students: 19, color: C.text,
    description: "Cell biology, genetics, evolution, and ecosystems — a survey of life science.",
    kpis: { mastery: 54, masteryTrend: +2, accuracy: 63, accuracyTrend: +1, focus: 4.8, focusTrend: -1, hint: 41, hintTrend: +2 },
    topics: [
      { topic: "Cell Structure", mastery: 79 }, { topic: "Photosynthesis", mastery: 66 },
      { topic: "DNA & RNA", mastery: 48 }, { topic: "Genetics", mastery: 41 },
      { topic: "Evolution", mastery: 57 }, { topic: "Ecosystems", mastery: 72 },
    ],
    chatbot: [
      { week: 1, mins: 30 }, { week: 2, mins: 38 }, { week: 3, mins: 45 }, { week: 4, mins: 50 },
      { week: 5, mins: 44 }, { week: 6, mins: 59 }, { week: 7, mins: 63 }, { week: 8, mins: 71 },
    ],
    accuracyOverTime: [
      { week: "W1", acc: 51 }, { week: "W2", acc: 55 }, { week: "W3", acc: 53 }, { week: "W4", acc: 58 },
      { week: "W5", acc: 61 }, { week: "W6", acc: 60 }, { week: "W7", acc: 64 }, { week: "W8", acc: 63 },
    ],
    reteach: [
      ["Genetics", "41%", "Students confuse dominant vs recessive inheritance."],
      ["DNA & RNA", "48%", "Transcription and translation steps mixed up."],
      ["Evolution", "57%", "Natural selection vs. selective breeding conflated."],
    ],
  },
  {
    id: "hist", title: "World History", emoji: "🏛️", period: "Period 5", students: 21, color: C.audio,
    description: "Ancient civilizations through the Cold War — major events, causes, and consequences.",
    kpis: { mastery: 75, masteryTrend: +7, accuracy: 80, accuracyTrend: +6, focus: 7.1, focusTrend: +11, hint: 22, hintTrend: -6 },
    topics: [
      { topic: "Ancient Civ.", mastery: 91 }, { topic: "Middle Ages", mastery: 83 },
      { topic: "Renaissance", mastery: 78 }, { topic: "Revolutions", mastery: 62 },
      { topic: "World Wars", mastery: 55 }, { topic: "Cold War", mastery: 69 },
    ],
    chatbot: [
      { week: 1, mins: 55 }, { week: 2, mins: 62 }, { week: 3, mins: 74 }, { week: 4, mins: 80 },
      { week: 5, mins: 71 }, { week: 6, mins: 93 }, { week: 7, mins: 102 }, { week: 8, mins: 98 },
    ],
    accuracyOverTime: [
      { week: "W1", acc: 64 }, { week: "W2", acc: 68 }, { week: "W3", acc: 67 }, { week: "W4", acc: 73 },
      { week: "W5", acc: 77 }, { week: "W6", acc: 79 }, { week: "W7", acc: 78 }, { week: "W8", acc: 82 },
    ],
    reteach: [
      ["World Wars", "55%", "Causes of WWI vs. WWII frequently confused."],
      ["Revolutions", "62%", "Students struggle with economic drivers of revolution."],
      ["Cold War", "69%", "Proxy wars vs. direct conflict distinction unclear."],
    ],
  },
];

export const COURSES = [
  {
    id: "alg", title: "Algebra I", emoji: "📐", progress: 62, mode: "visual", color: C.visual,
    topics: [
      {
        id: "linear-eq", title: "Linear Equations", mastery: 88, status: "complete",
        description: "Solve one- and two-step equations with a single variable.",
        content: {
          text: "A <b>linear equation</b> is an equation where the variable has no exponents. In the form <code>y = mx + b</code>, <b>m</b> is the slope and <b>b</b> is the y-intercept. To solve for an unknown, keep both sides balanced — whatever you do to one side, do to the other. For <code>2x + 3 = 11</code>, subtract 3 from both sides to get <code>2x = 8</code>, then divide by 2 to find <b>x = 4</b>.",
          audioTranscript: "Think of a linear equation as a recipe for a straight line. The slope is how fast it climbs, and the intercept is where it starts on the y-axis. To solve one, just undo the operations in reverse order — subtraction undoes addition, and division undoes multiplication.",
          concepts: [
            { term: "y = mx + b", definition: "Slope-intercept form of a line" },
            { term: "Slope (m)", definition: "Steepness of the line — rise over run" },
            { term: "y-intercept (b)", definition: "Where the line crosses the y-axis" },
            { term: "Inverse ops", definition: "Undo addition with subtraction, multiply with divide" },
          ],
        },
        questions: [
          { q: "Solve for x:  3x − 5 = 16", options: ["x = 5", "x = 7", "x = 11", "x = 3"], correct: 1, hint: "Add 5 to both sides first, then divide by 3." },
          { q: "What is the y-intercept of  y = 4x − 2?", options: ["4", "2", "−2", "−4"], correct: 2, hint: "In y = mx + b, the y-intercept is b — the standalone number." },
        ],
      },
      {
        id: "inequalities", title: "Inequalities", mastery: 74, status: "complete",
        description: "Represent and solve inequalities on a number line.",
        content: {
          text: "An <b>inequality</b> compares two expressions using &lt;, &gt;, ≤, or ≥ instead of an equals sign. You solve them just like equations with one key difference: <b>flipping the sign</b> when you multiply or divide by a negative number. For example, <code>−2x > 6</code> becomes <code>x &lt; −3</code> after dividing both sides by −2.",
          audioTranscript: "Inequalities work almost exactly like equations. Solve them the same way — but watch for that one sneaky rule: whenever you multiply or divide both sides by a negative number, the inequality sign flips direction. It trips up almost everyone at first.",
          concepts: [
            { term: "< and >", definition: "Strict: does not include the boundary value" },
            { term: "≤ and ≥", definition: "Includes the boundary value (closed circle)" },
            { term: "Sign flip", definition: "Dividing/multiplying by a negative reverses the inequality" },
            { term: "Number line", definition: "Shade the solution region; open/closed circle at boundary" },
          ],
        },
        questions: [
          { q: "Solve:  −3x ≤ 12", options: ["x ≤ −4", "x ≥ −4", "x ≤ 4", "x ≥ 4"], correct: 1, hint: "Divide both sides by −3. Remember: dividing by a negative flips the sign." },
          { q: "Which graph shows  x > 2?", options: ["Open circle at 2, arrow right", "Closed circle at 2, arrow right", "Open circle at 2, arrow left", "Closed circle at 2, arrow left"], correct: 0, hint: "Strict inequality (>) means open circle. 'Greater than' means the arrow goes right." },
        ],
      },
      {
        id: "functions", title: "Functions", mastery: 61, status: "in-progress",
        description: "Understand the input-output relationship and function notation.",
        content: {
          text: "A <b>function</b> is a rule that assigns exactly one output to every input. We write <code>f(x)</code> to mean 'the output when the input is x'. The <b>domain</b> is the set of all valid inputs; the <b>range</b> is all possible outputs. A quick test: if any vertical line crosses the graph more than once, the relation is not a function.",
          audioTranscript: "Picture a function as a machine: you drop a number in, the machine processes it, and exactly one number comes out. No input can produce two different outputs — that's the rule. The set of things you're allowed to put in is the domain, and whatever can come out is the range.",
          concepts: [
            { term: "f(x)", definition: "Function notation: output when input is x" },
            { term: "Domain", definition: "All valid input values" },
            { term: "Range", definition: "All possible output values" },
            { term: "Vertical Line Test", definition: "If a vertical line hits the graph twice, it's not a function" },
          ],
        },
        questions: [
          { q: "If  f(x) = 3x + 1, what is  f(4)?", options: ["13", "12", "9", "7"], correct: 0, hint: "Substitute 4 for x: f(4) = 3(4) + 1." },
          { q: "Which set of pairs represents a function?", options: ["{(1,2),(1,3),(2,4)}", "{(1,2),(2,3),(3,4)}", "{(2,1),(2,3),(2,5)}", "{(1,1),(1,2),(1,3)}"], correct: 1, hint: "A function can't have the same x-value paired with two different y-values." },
        ],
      },
      {
        id: "quadratics", title: "Quadratics", mastery: 43, status: "in-progress",
        description: "Graph and solve quadratic equations using multiple methods.",
        content: {
          text: "A <b>quadratic equation</b> has the form <code>ax² + bx + c = 0</code>. Its graph is a U-shaped curve called a <b>parabola</b>. You can solve quadratics by factoring, completing the square, or using the <b>quadratic formula</b>: <code>x = (−b ± √(b²−4ac)) / 2a</code>. The expression under the root, <code>b²−4ac</code>, is the <b>discriminant</b> — it tells you how many real solutions exist.",
          audioTranscript: "Quadratics introduce the first real challenge of algebra: an x-squared term that creates a curve instead of a line. There are several ways to solve them. Factoring is the fastest when it works. When it doesn't, the quadratic formula always works — it's your safety net. The discriminant tells you upfront if you'll get two solutions, one, or none.",
          concepts: [
            { term: "ax² + bx + c", definition: "Standard form of a quadratic" },
            { term: "Parabola", definition: "The U-shaped graph of any quadratic" },
            { term: "Vertex", definition: "The tip of the parabola — max or min point" },
            { term: "Discriminant", definition: "b²−4ac: positive=2 roots, zero=1, negative=none" },
          ],
        },
        questions: [
          { q: "How many real solutions does  x² + 4 = 0 have?", options: ["0", "1", "2", "3"], correct: 0, hint: "Calculate the discriminant: b²−4ac = 0−4(1)(4) = −16. Negative → no real roots." },
          { q: "Factor:  x² + 5x + 6", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x−2)(x−3)", "(x+2)(x−3)"], correct: 0, hint: "Find two numbers that multiply to 6 and add to 5." },
        ],
      },
      {
        id: "polynomials", title: "Polynomials", mastery: 52, status: "in-progress",
        description: "Add, subtract, and multiply polynomial expressions.",
        content: {
          text: "A <b>polynomial</b> is a sum of terms, each being a number multiplied by a variable raised to a whole-number power. The <b>degree</b> is the highest exponent. To add or subtract polynomials, combine <b>like terms</b> — terms with the same variable and exponent. To multiply, use the distributive property (FOIL for two binomials).",
          audioTranscript: "Polynomials are just fancy sums. When you add or subtract them, only combine terms that look the same — same variable, same exponent. Mixing x-squared with x is like trying to add apples and oranges. For multiplication, you need to distribute every term in the first polynomial across every term in the second.",
          concepts: [
            { term: "Degree", definition: "The highest exponent in the polynomial" },
            { term: "Like terms", definition: "Same variable(s) and same exponent(s)" },
            { term: "Binomial", definition: "A polynomial with exactly two terms" },
            { term: "FOIL", definition: "First, Outer, Inner, Last — for multiplying two binomials" },
          ],
        },
        questions: [
          { q: "Simplify:  (3x² + 2x) + (x² − 5x)", options: ["4x² − 3x", "4x² + 7x", "2x² − 3x", "4x² − 7x"], correct: 0, hint: "Combine the x² terms together and the x terms together." },
          { q: "Expand:  (x + 3)(x − 2)", options: ["x² + x − 6", "x² − x − 6", "x² + x + 6", "x² − 6"], correct: 0, hint: "Use FOIL: First (x·x), Outer (x·−2), Inner (3·x), Last (3·−2)." },
        ],
      },
      {
        id: "systems", title: "Systems of Equations", mastery: 69, status: "not-started",
        description: "Solve pairs of equations using substitution and elimination.",
        content: {
          text: "A <b>system of equations</b> is two or more equations with the same variables. The solution is the point (x, y) that satisfies <em>all</em> equations at once — where the lines intersect on a graph. The two main algebraic methods are <b>substitution</b> (solve one equation for a variable, plug into the other) and <b>elimination</b> (add or subtract equations to cancel a variable).",
          audioTranscript: "A system of equations is really a puzzle: find the one point where two lines cross. Visually you can see it on a graph, but algebraically you use substitution or elimination. Substitution works great when one equation is already solved for a variable. Elimination works great when the coefficients line up nicely to cancel.",
          concepts: [
            { term: "Solution", definition: "The (x, y) point satisfying all equations" },
            { term: "Substitution", definition: "Isolate one variable, substitute into the other equation" },
            { term: "Elimination", definition: "Add/subtract equations to remove one variable" },
            { term: "No solution", definition: "Parallel lines — they never intersect" },
          ],
        },
        questions: [
          { q: "Solve: x + y = 5  and  x − y = 1", options: ["x=3, y=2", "x=2, y=3", "x=4, y=1", "x=1, y=4"], correct: 0, hint: "Add the two equations together to eliminate y, then solve for x." },
          { q: "How many solutions do parallel lines have?", options: ["0", "1", "2", "Infinite"], correct: 0, hint: "Parallel lines never intersect, so there's no point satisfying both equations." },
        ],
      },
    ],
  },
  {
    id: "bio", title: "Intro to Biology", emoji: "🧬", progress: 31, mode: "text", color: C.text,
    topics: [
      {
        id: "cell-structure", title: "Cell Structure", mastery: 79, status: "complete",
        description: "Explore the organelles of animal and plant cells and their functions.",
        content: {
          text: "Cells are the basic unit of life. <b>Animal cells</b> and <b>plant cells</b> share many organelles: the <b>nucleus</b> (control center containing DNA), <b>mitochondria</b> (energy production), <b>ribosomes</b> (protein synthesis), and the <b>endoplasmic reticulum</b> (transport network). Plant cells uniquely have a <b>cell wall</b>, <b>chloroplasts</b>, and a large central <b>vacuole</b>.",
          audioTranscript: "Think of a cell as a tiny city. The nucleus is city hall — it holds all the blueprints. The mitochondria are the power plants. Ribosomes are the factories making proteins. And in plant cells, chloroplasts are solar panels, capturing sunlight to make food. Each organelle has a specific job, and they all work together.",
          concepts: [
            { term: "Nucleus", definition: "Contains DNA; controls cell activities" },
            { term: "Mitochondria", definition: "Produces ATP energy via cellular respiration" },
            { term: "Ribosome", definition: "Synthesizes proteins from mRNA instructions" },
            { term: "Chloroplast", definition: "Plant-only; captures light for photosynthesis" },
          ],
        },
        questions: [
          { q: "Which organelle is responsible for producing ATP?", options: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"], correct: 2, hint: "This organelle is often called the 'powerhouse of the cell'." },
          { q: "Which structure is found in plant cells but NOT animal cells?", options: ["Nucleus", "Cell wall", "Mitochondria", "Ribosome"], correct: 1, hint: "This rigid outer layer gives plants their structure." },
        ],
      },
      {
        id: "photosynthesis", title: "Photosynthesis", mastery: 66, status: "complete",
        description: "Understand how plants convert light energy into glucose.",
        content: {
          text: "<b>Photosynthesis</b> is the process by which plants use sunlight, water, and CO₂ to produce glucose and oxygen. The overall equation is: <code>6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂</code>. It occurs in the <b>chloroplasts</b>, specifically in two stages: the <b>light-dependent reactions</b> (in the thylakoid membrane) and the <b>Calvin cycle</b> (in the stroma).",
          audioTranscript: "Photosynthesis is basically how plants eat. They take in carbon dioxide from the air and water from the ground, then use sunlight as energy to build sugar molecules. The oxygen we breathe is actually a byproduct — a kind of exhaust from the process. It all happens inside chloroplasts, in two sequential stages.",
          concepts: [
            { term: "Reactants", definition: "CO₂ + H₂O + light energy" },
            { term: "Products", definition: "Glucose (C₆H₁₂O₆) + Oxygen (O₂)" },
            { term: "Light reactions", definition: "Convert light energy to ATP; occur in thylakoids" },
            { term: "Calvin Cycle", definition: "Uses ATP to build glucose; occurs in stroma" },
          ],
        },
        questions: [
          { q: "What are the products of photosynthesis?", options: ["CO₂ and H₂O", "Glucose and O₂", "ATP and NADPH", "Starch and CO₂"], correct: 1, hint: "Plants produce food (glucose) and release a gas we breathe." },
          { q: "Where do the light-dependent reactions take place?", options: ["Stroma", "Thylakoid membrane", "Cell wall", "Vacuole"], correct: 1, hint: "These reactions need direct access to light inside the chloroplast." },
        ],
      },
      {
        id: "dna-rna", title: "DNA & RNA", mastery: 48, status: "in-progress",
        description: "Decode the structure of DNA and the steps of protein synthesis.",
        content: {
          text: "<b>DNA</b> (deoxyribonucleic acid) is a double helix made of nucleotides with bases A, T, G, C. It stores the genetic blueprint. <b>Transcription</b> copies a gene from DNA into <b>mRNA</b>. <b>Translation</b> then reads mRNA codons at the ribosome to assemble a chain of amino acids — a <b>protein</b>. The central dogma of biology: <code>DNA → RNA → Protein</code>.",
          audioTranscript: "DNA is the master blueprint locked away in the nucleus. The cell can't take the original blueprint to the construction site — it makes a copy called mRNA. That copy travels out to the ribosome, where it's read three letters at a time. Each three-letter codon codes for one amino acid, and the amino acids chain together to build a protein.",
          concepts: [
            { term: "DNA", definition: "Double helix; stores genetic information (A-T, G-C pairs)" },
            { term: "Transcription", definition: "DNA → mRNA; happens in the nucleus" },
            { term: "Translation", definition: "mRNA → protein; happens at the ribosome" },
            { term: "Codon", definition: "Three-base mRNA sequence coding for one amino acid" },
          ],
        },
        questions: [
          { q: "During transcription, DNA is used as a template to produce…", options: ["A protein", "mRNA", "A ribosome", "ATP"], correct: 1, hint: "Transcription makes a messenger molecule that carries instructions out of the nucleus." },
          { q: "Which base pairs with Adenine in DNA?", options: ["Guanine", "Cytosine", "Thymine", "Uracil"], correct: 2, hint: "Remember: A-T and G-C are the base pairs in DNA." },
        ],
      },
      {
        id: "genetics", title: "Genetics", mastery: 41, status: "in-progress",
        description: "Apply Mendelian inheritance and Punnett squares to predict traits.",
        content: {
          text: "<b>Genetics</b> studies how traits pass from parents to offspring. <b>Gregor Mendel</b> showed that traits are controlled by <b>alleles</b> — variants of a gene. A <b>dominant</b> allele (uppercase) masks a <b>recessive</b> one (lowercase). An organism's genetic makeup is its <b>genotype</b>; its observable traits are its <b>phenotype</b>. A <b>Punnett square</b> predicts the probability of offspring genotypes.",
          audioTranscript: "Mendel figured out inheritance by growing thousands of pea plants. He noticed traits didn't just blend together — they were inherited as distinct units we now call alleles. Dominant alleles win out over recessive ones unless you inherit two recessive copies. A Punnett square is just a grid that maps out all the possible allele combinations from two parents.",
          concepts: [
            { term: "Allele", definition: "A variant form of a gene (e.g. B or b)" },
            { term: "Dominant", definition: "Expressed whenever present (uppercase letter)" },
            { term: "Recessive", definition: "Only expressed when two copies are inherited" },
            { term: "Punnett Square", definition: "Grid showing probable offspring genotypes" },
          ],
        },
        questions: [
          { q: "If both parents are Bb, what fraction of offspring will be recessive (bb)?", options: ["1/4", "1/2", "3/4", "0"], correct: 0, hint: "Draw a Punnett square: Bb × Bb gives BB, Bb, Bb, bb." },
          { q: "An organism with two identical alleles (BB or bb) is called…", options: ["Heterozygous", "Homozygous", "Codominant", "Recessive"], correct: 1, hint: "Homo- means same. Two of the same allele = homozygous." },
        ],
      },
      {
        id: "evolution", title: "Evolution", mastery: 57, status: "not-started",
        description: "Explain natural selection and the evidence supporting evolution.",
        content: {
          text: "<b>Evolution</b> is the change in heritable traits in a population over generations. <b>Natural selection</b>, described by Darwin, occurs when individuals with favorable traits survive and reproduce more, passing those traits on. Evidence for evolution includes the <b>fossil record</b>, <b>comparative anatomy</b> (homologous structures), <b>molecular biology</b> (shared DNA sequences), and <b>biogeography</b>.",
          audioTranscript: "Darwin's big idea was elegantly simple: organisms that happen to have traits fitting their environment survive and reproduce more than those that don't. Over many generations, those helpful traits become more common. Evolution isn't directed or intentional — it's just differential survival. The fossil record and DNA comparisons across species give us strong evidence this has been happening for billions of years.",
          concepts: [
            { term: "Natural Selection", definition: "Survival and reproduction of the best-adapted individuals" },
            { term: "Adaptation", definition: "Heritable trait that increases fitness in an environment" },
            { term: "Fossil Record", definition: "Preserved remains showing changes in life over time" },
            { term: "Homologous structures", definition: "Same bone arrangement across species — shared ancestry" },
          ],
        },
        questions: [
          { q: "Which observation directly supports natural selection?", options: ["All organisms share DNA", "Bacteria become resistant to antibiotics over generations", "Fossils exist in rock layers", "Homologous bones exist in mammals"], correct: 1, hint: "Look for an example where a population's traits change because some variants survive better." },
          { q: "What is 'fitness' in evolutionary terms?", options: ["Physical strength", "Ability to avoid predators", "Reproductive success", "Lifespan"], correct: 2, hint: "In evolution, fitness is specifically about leaving more offspring." },
        ],
      },
      {
        id: "ecosystems", title: "Ecosystems", mastery: 72, status: "not-started",
        description: "Analyze energy flow and nutrient cycles in ecological communities.",
        content: {
          text: "An <b>ecosystem</b> is a community of living organisms and their physical environment interacting together. Energy flows through ecosystems in one direction: from <b>producers</b> (plants) → <b>primary consumers</b> → <b>secondary consumers</b> → <b>tertiary consumers</b>. Only about <b>10%</b> of energy transfers to the next level. Nutrients like carbon and nitrogen cycle repeatedly through biotic and abiotic components.",
          audioTranscript: "An ecosystem is everything living and non-living in an area, and how they all interact. Energy enters from the sun, gets captured by plants, and then flows up the food chain — but only about 10% makes it to the next level. The rest is lost as heat. Unlike energy, nutrients like carbon and nitrogen cycle — they get used, decomposed, and reused over and over.",
          concepts: [
            { term: "Producer", definition: "Makes own food via photosynthesis (plants, algae)" },
            { term: "Consumer", definition: "Obtains energy by eating other organisms" },
            { term: "10% Rule", definition: "Only ~10% of energy passes to the next trophic level" },
            { term: "Decomposer", definition: "Breaks down dead matter; returns nutrients to soil" },
          ],
        },
        questions: [
          { q: "If producers store 10,000 kJ of energy, how much reaches secondary consumers?", options: ["1,000 kJ", "100 kJ", "10 kJ", "1 kJ"], correct: 1, hint: "Apply the 10% rule twice: 10% passes from producers to primary consumers, then 10% of that passes to secondary consumers." },
          { q: "Which organism recycles nutrients back into the soil?", options: ["Producer", "Consumer", "Predator", "Decomposer"], correct: 3, hint: "This organism breaks down dead organic material." },
        ],
      },
    ],
  },
  {
    id: "hist", title: "World History", emoji: "🏛️", progress: 78, mode: "audio", color: C.audio,
    topics: [
      {
        id: "ancient-civ", title: "Ancient Civilizations", mastery: 91, status: "complete",
        description: "Explore the rise of Mesopotamia, Egypt, Greece, and Rome.",
        content: {
          text: "The first <b>civilizations</b> emerged around 3500 BCE in <b>Mesopotamia</b> (modern Iraq), followed by <b>Egypt</b> along the Nile. Key innovations included writing (<b>cuneiform</b>, then <b>hieroglyphics</b>), codified law (<b>Hammurabi's Code</b>), and monumental architecture. <b>Ancient Greece</b> gave the world democracy and philosophy; <b>Rome</b> built an empire stretching across three continents and left lasting legal and political traditions.",
          audioTranscript: "Ancient civilizations didn't appear overnight — they developed in river valleys where agriculture could thrive. Mesopotamia and Egypt were first, using rivers for irrigation and trade. Greece and Rome came later, building on those foundations to develop philosophy, democracy, and law. Many of the ideas we take for granted today — democratic elections, codified laws, public infrastructure — trace back to these ancient societies.",
          concepts: [
            { term: "Mesopotamia", definition: "First civilization; between the Tigris and Euphrates rivers" },
            { term: "Hammurabi's Code", definition: "One of the earliest written legal codes (~1754 BCE)" },
            { term: "Athenian Democracy", definition: "Early form of citizen self-governance in ancient Greece" },
            { term: "Roman Republic", definition: "Government with elected representatives and checks on power" },
          ],
        },
        questions: [
          { q: "Where did the world's first civilization emerge?", options: ["Egypt", "China", "Mesopotamia", "India"], correct: 2, hint: "Look for the region between two famous rivers in modern-day Iraq." },
          { q: "What was Hammurabi's Code?", options: ["A military strategy", "An early written legal system", "A trade agreement", "A religious text"], correct: 1, hint: "Hammurabi was a Babylonian king known for establishing written laws for his empire." },
        ],
      },
      {
        id: "middle-ages", title: "Middle Ages", mastery: 83, status: "complete",
        description: "Understand feudalism, the Church, and life in medieval Europe.",
        content: {
          text: "The <b>Middle Ages</b> (c. 500–1500 CE) followed Rome's fall. Europe fragmented into kingdoms held together by <b>feudalism</b> — a hierarchy where kings granted land (<b>fiefs</b>) to lords in exchange for military service, who in turn oversaw serfs. The <b>Catholic Church</b> was the dominant cultural and political force. The <b>Crusades</b> (1095–1291) were religious wars to control the Holy Land, reshaping European-Islamic contact.",
          audioTranscript: "After Rome collapsed, Europe didn't just go dark — it reorganized. Feudalism was a practical solution: lords protected peasants in exchange for their labor and loyalty. The Church filled the power vacuum, providing education, social services, and moral authority across a fragmented continent. The Crusades shook everything up, bringing Europeans into intense contact with Islamic civilization and eventually helping spark the Renaissance.",
          concepts: [
            { term: "Feudalism", definition: "Political system based on land grants in exchange for service" },
            { term: "Fief", definition: "Land granted by a lord to a vassal in the feudal system" },
            { term: "Serf", definition: "Peasant bound to work the land of a lord" },
            { term: "The Crusades", definition: "Series of religious wars (1095–1291) for the Holy Land" },
          ],
        },
        questions: [
          { q: "In feudalism, what did lords provide to kings in exchange for land?", options: ["Taxes", "Military service", "Trade goods", "Religious support"], correct: 1, hint: "Think about what a king would need most to defend and expand his kingdom." },
          { q: "The Crusades were primarily motivated by…", options: ["Trade expansion", "Scientific discovery", "Religious goals to control the Holy Land", "Forming a unified European state"], correct: 2, hint: "The Pope called for the First Crusade in 1095 with a specific religious objective." },
        ],
      },
      {
        id: "renaissance", title: "The Renaissance", mastery: 78, status: "complete",
        description: "Trace the rebirth of art, science, and humanism in 14th–17th century Europe.",
        content: {
          text: "The <b>Renaissance</b> (\"rebirth,\" 14th–17th century) began in Italian city-states and spread across Europe. It marked a shift from medieval religious focus to <b>humanism</b> — interest in individual potential and classical Greco-Roman thought. Key figures: <b>Leonardo da Vinci</b> (art and science), <b>Michelangelo</b> (sculpture and painting), <b>Galileo</b> (astronomy), and <b>Gutenberg</b>, whose <b>printing press</b> (c. 1440) democratized knowledge.",
          audioTranscript: "The Renaissance was Europe rediscovering its past and reinventing itself. Italian merchants got rich through trade and began funding artists and scholars. Humanist thinkers shifted focus from the afterlife to human achievement and earthly life. Gutenberg's printing press was the era's disruptive technology — suddenly ideas could spread across the continent in months instead of decades.",
          concepts: [
            { term: "Humanism", definition: "Focus on human potential, reason, and classical learning" },
            { term: "Printing Press", definition: "Gutenberg's invention (~1440) that mass-spread knowledge" },
            { term: "Patronage", definition: "Wealthy sponsors (patrons) funding artists and scholars" },
            { term: "Scientific Revolution", definition: "Shift to observation-based science; Galileo, Copernicus" },
          ],
        },
        questions: [
          { q: "Where did the Renaissance begin?", options: ["France", "England", "Italy", "Germany"], correct: 2, hint: "Think about where wealthy merchant city-states like Florence and Venice were located." },
          { q: "How did the printing press most impact the Renaissance?", options: ["It enabled faster trade", "It spread ideas rapidly across Europe", "It replaced the Church", "It improved military strategy"], correct: 1, hint: "Think about what happens when books become affordable for the first time." },
        ],
      },
      {
        id: "revolutions", title: "Age of Revolutions", mastery: 62, status: "in-progress",
        description: "Analyze the causes and impacts of the American, French, and Industrial Revolutions.",
        content: {
          text: "The late 18th century saw three interlinked revolutions. The <b>American Revolution</b> (1775–1783) established a republic based on Enlightenment ideals. The <b>French Revolution</b> (1789–1799) overthrew monarchy, introduced mass politics, and ended with Napoleon. The <b>Industrial Revolution</b> (c. 1760–1840) transformed Britain and then the world through mechanized production, urbanization, and new social classes — the <b>bourgeoisie</b> and <b>proletariat</b>.",
          audioTranscript: "Three revolutions in one century remade the Western world. The American and French Revolutions showed that ordinary people could overthrow established rulers — that was a profound shock. The Industrial Revolution changed how people lived and worked, moving them from farms into factories and from villages into cities. All three revolutions were connected by Enlightenment ideas about rights, reason, and progress.",
          concepts: [
            { term: "Enlightenment", definition: "Intellectual movement emphasizing reason, rights, democracy" },
            { term: "Bourgeoisie", definition: "Middle class that rose with industrialization" },
            { term: "Proletariat", definition: "Industrial working class; sold labor for wages" },
            { term: "Nationalism", definition: "Political ideology: shared identity as basis for statehood" },
          ],
        },
        questions: [
          { q: "Which Enlightenment idea most directly influenced the American Revolution?", options: ["Divine right of kings", "Natural rights and social contract", "Mercantilism", "Religious reformation"], correct: 1, hint: "Think about what Locke wrote about the purpose of government and the rights of citizens." },
          { q: "The Industrial Revolution first began in which country?", options: ["France", "Germany", "United States", "Britain"], correct: 3, hint: "This island nation had coal, iron, colonies, and navigable rivers — key ingredients for industrialization." },
        ],
      },
      {
        id: "world-wars", title: "World Wars", mastery: 55, status: "in-progress",
        description: "Examine the causes, key events, and consequences of WWI and WWII.",
        content: {
          text: "<b>WWI</b> (1914–1918) was triggered by Archduke Franz Ferdinand's assassination but driven by deeper causes: militarism, alliances, imperialism, and nationalism (<b>MAIN</b>). It introduced industrial-scale warfare and ended with the <b>Treaty of Versailles</b>, whose harsh terms fueled resentment in Germany. <b>WWII</b> (1939–1945) arose from that resentment, the Great Depression, and the rise of <b>totalitarian regimes</b> (Hitler, Mussolini, Hirohito). It ended with the atomic bombs and the creation of the <b>United Nations</b>.",
          audioTranscript: "WWI and WWII are deeply connected — the second war grew out of the unresolved tensions of the first. WWI introduced terrifying new weapons: machine guns, poison gas, tanks, and aerial bombing. The Treaty of Versailles humiliated Germany and created the conditions Hitler exploited. WWII was even more devastating, killing 70-85 million people and ending with a new kind of weapon — the atomic bomb — that changed everything about global power.",
          concepts: [
            { term: "MAIN", definition: "Militarism, Alliances, Imperialism, Nationalism — WWI causes" },
            { term: "Treaty of Versailles", definition: "1919 peace treaty that punished Germany severely" },
            { term: "Totalitarianism", definition: "Government with absolute control over all aspects of life" },
            { term: "United Nations", definition: "International organization formed in 1945 to prevent future wars" },
          ],
        },
        questions: [
          { q: "What does the acronym MAIN stand for in WWI causes?", options: ["Militarism, Alliances, Imperialism, Nationalism", "Monarchy, Army, Industry, Navy", "Mobilization, Armistice, Invasion, Neutrality", "Maps, Artillery, Infantry, Navy"], correct: 0, hint: "Each letter stands for a systemic force that made Europe ready to explode by 1914." },
          { q: "Which treaty ended WWI and contributed to conditions leading to WWII?", options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Utrecht", "Congress of Vienna"], correct: 1, hint: "This 1919 treaty imposed war guilt, reparations, and territorial losses on Germany." },
        ],
      },
      {
        id: "cold-war", title: "The Cold War", mastery: 69, status: "not-started",
        description: "Trace the ideological conflict between the US and USSR from 1947 to 1991.",
        content: {
          text: "The <b>Cold War</b> (1947–1991) was a geopolitical rivalry between the capitalist <b>United States</b> and communist <b>Soviet Union</b> — never direct combat, but a global competition through proxy wars, arms races, and ideology. Key events: the <b>Berlin Wall</b> (1961–1989), the <b>Cuban Missile Crisis</b> (1962, the closest the world came to nuclear war), the <b>Space Race</b>, and proxy wars in Korea and Vietnam. It ended with the dissolution of the USSR in 1991.",
          audioTranscript: "The Cold War was unlike any previous conflict — two superpowers with enough nuclear weapons to destroy civilization, competing everywhere except in direct combat. They fought through proxy wars, competed for influence in newly independent countries, raced to space, and built enough warheads to blow up the world many times over. The Cuban Missile Crisis in 1962 was the closest anyone came to actually using those weapons.",
          concepts: [
            { term: "Containment", definition: "US policy to prevent communism from spreading (Truman Doctrine)" },
            { term: "Proxy War", definition: "Conflict where superpowers support opposing sides without fighting directly" },
            { term: "MAD", definition: "Mutually Assured Destruction — nuclear deterrence logic" },
            { term: "Détente", definition: "Period of relaxed Cold War tensions in the 1970s" },
          ],
        },
        questions: [
          { q: "What was the US policy of preventing communism from spreading called?", options: ["Détente", "Isolationism", "Containment", "Imperialism"], correct: 2, hint: "This policy was outlined in the Truman Doctrine in 1947." },
          { q: "Which event brought the world closest to nuclear war during the Cold War?", options: ["Korean War", "Vietnam War", "Berlin Blockade", "Cuban Missile Crisis"], correct: 3, hint: "This 1962 standoff involved Soviet missiles placed just 90 miles from Florida." },
        ],
      },
    ],
  },
];

export const TOPICS = [
  { topic: "Linear Eq.", mastery: 88 },
  { topic: "Inequalities", mastery: 74 },
  { topic: "Functions", mastery: 61 },
  { topic: "Quadratics", mastery: 43 },
  { topic: "Polynomials", mastery: 52 },
  { topic: "Systems", mastery: 69 },
];

export const STUDENTS = [
  { id: 1, name: "Maya Chen",    email: "maya.c@school.edu",   mastery: 91, improve: +6, hint: 12, recovery: 84, focus: 7.4, accuracy: 89, mode: "visual", status: "thriving" },
  { id: 2, name: "Liam Patel",   email: "liam.p@school.edu",   mastery: 78, improve: +3, hint: 28, recovery: 71, focus: 5.1, accuracy: 76, mode: "audio",  status: "on-track" },
  { id: 3, name: "Sofia Reyes",  email: "sofia.r@school.edu",  mastery: 44, improve: -2, hint: 61, recovery: 38, focus: 8.9, accuracy: 51, mode: "text",   status: "needs-support" },
  { id: 4, name: "Noah Kim",     email: "noah.k@school.edu",   mastery: 69, improve: +4, hint: 22, recovery: 66, focus: 4.6, accuracy: 71, mode: "visual", status: "on-track" },
  { id: 5, name: "Ava Johnson",  email: "ava.j@school.edu",    mastery: 38, improve: +1, hint: 54, recovery: 41, focus: 6.2, accuracy: 47, mode: "audio",  status: "needs-support" },
  { id: 6, name: "Ethan Brooks", email: "ethan.b@school.edu",  mastery: 85, improve: +5, hint: 15, recovery: 80, focus: 6.8, accuracy: 84, mode: "text",   status: "thriving" },
];

export const CHATBOT_TREND = [
  { week: 1, mins: 42, students: 18 }, { week: 2, mins: 51, students: 20 },
  { week: 3, mins: 68, students: 19 }, { week: 4, mins: 73, students: 21 },
  { week: 5, mins: 61, students: 17 }, { week: 6, mins: 88, students: 22 },
  { week: 7, mins: 95, students: 23 }, { week: 8, mins: 84, students: 20 },
];

export const ACCURACY_TREND = [
  { week: "W1", acc: 58 }, { week: "W2", acc: 62 }, { week: "W3", acc: 60 },
  { week: "W4", acc: 67 }, { week: "W5", acc: 71 }, { week: "W6", acc: 74 },
  { week: "W7", acc: 73 }, { week: "W8", acc: 78 },
];

export const QUESTIONS = [
  { q: "Solve for x:  3x − 5 = 16", options: ["x = 5", "x = 7", "x = 11", "x = 3"], correct: 1,
    hint: "Add 5 to both sides first, then divide by 3." },
  { q: "What is the slope of  y = −2x + 4 ?", options: ["4", "−2", "2", "−4"], correct: 1,
    hint: "In y = mx + b, the slope is the number multiplied by x." },
];
