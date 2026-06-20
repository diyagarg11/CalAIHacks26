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
  { id: "alg", title: "Algebra I", emoji: "\u{1F4D0}", lessons: 18, progress: 62, mode: "visual", color: C.visual },
  { id: "bio", title: "Intro to Biology", emoji: "\u{1F9EC}", lessons: 22, progress: 31, mode: "text", color: C.text },
  { id: "hist", title: "World History", emoji: "\u{1F3DB}️", lessons: 15, progress: 78, mode: "audio", color: C.audio },
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
