// Pure diagnostic logic and lesson content — no external dependencies.
// Ported from the Express backend's lib/diagnostic.js + lib/diagnosticLesson.js.

// ── Accommodation rules ──────────────────────────────────────────────────────

export const ACCOMMODATION_RULES: Record<string, { label: string; mandate?: string; exclude?: string; constraint?: boolean }> = {
  audio_narration_required: { label: "Audio narration required", mandate: "audio" },
  captions_required:        { label: "Captions required",        constraint: true },
  no_flashing:              { label: "No flashing / rapid transitions", exclude: "visual" },
  extended_time:            { label: "Extended quiz time",       constraint: true },
};

export const DIAGNOSTIC_FORMATS = ["text", "audio", "visual"] as const;
export type DiagnosticFormat = (typeof DIAGNOSTIC_FORMATS)[number];
export type LearningFormat = "text" | "audio" | "visual";

export interface AccommodationResult {
  mandatedFormat: LearningFormat | null;
  excludedFormats: string[];
  constraints: string[];
  applied: string[];
}

export function resolveAccommodation(flags: string[] = []): AccommodationResult {
  let mandatedFormat: LearningFormat | null = null;
  const excludedFormats: string[] = [];
  const constraints: string[] = [];
  for (const flag of flags) {
    const rule = ACCOMMODATION_RULES[flag];
    if (!rule) continue;
    if (rule.mandate) mandatedFormat = rule.mandate as LearningFormat;
    if (rule.exclude) excludedFormats.push(rule.exclude);
    if (rule.constraint) constraints.push(flag);
  }
  return { mandatedFormat, excludedFormats, constraints, applied: flags };
}

interface FormatScore { correct: number; total: number; seconds?: number | null }

export function decideFormat(scores: Partial<Record<DiagnosticFormat, FormatScore>>): LearningFormat {
  const pct = (s?: FormatScore | null) => (s && s.total ? s.correct / s.total : -1);
  const entries = DIAGNOSTIC_FORMATS.map((f) => ({ format: f, ...(scores[f] ?? {}), pct: pct(scores[f]) }));
  entries.sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct;
    const sa = (a as any).seconds ?? Infinity;
    const sb = (b as any).seconds ?? Infinity;
    if (sa !== sb) return sa - sb;
    return a.format === "text" ? -1 : 1;
  });
  return entries[0].format as LearningFormat;
}

export function buildAssessmentRecord(params: {
  studentId: string;
  accommodation: AccommodationResult;
  scores: Partial<Record<DiagnosticFormat, FormatScore>>;
  createdAt: string;
}) {
  const { studentId, accommodation, scores, createdAt } = params;

  if (accommodation.mandatedFormat) {
    return {
      student_id: studentId,
      created_at: createdAt,
      status: "skipped_accommodation" as const,
      decided_by: "accommodation" as const,
      assigned_format: accommodation.mandatedFormat,
      scores: { text: null, audio: null, visual: null },
      accommodation: { applied: accommodation.applied, mandatedFormat: accommodation.mandatedFormat },
    };
  }

  const assigned = decideFormat(scores);
  const withPct: Record<string, any> = {};
  for (const f of DIAGNOSTIC_FORMATS) {
    const s = scores[f];
    withPct[f] = s ? { ...s, pct: Math.round((s.correct / s.total) * 100) } : null;
  }
  return {
    student_id: studentId,
    created_at: createdAt,
    status: "completed" as const,
    decided_by: "diagnostic" as const,
    assigned_format: assigned,
    scores: { ...withPct },
    accommodation: accommodation.applied.length
      ? { applied: accommodation.applied, mandatedFormat: null }
      : null,
  };
}

// ── Diagnostic lesson ────────────────────────────────────────────────────────

export const DIAGNOSTIC_LESSON = {
  id: "diag-rivals-v1",
  topic: "Cal vs. Stanford",
  estimatedSeconds: 90,
  formats: {
    text: {
      kind: "text",
      title: "Stanford University",
      body: [
        "Stanford University was founded in 1885 by a very rich man named Leland Stanford Sr. and his wife Jane. They built it to honor their son Leland Jr., who passed away at just 15 years old. Instead of buying a sad trophy or naming a park after him, they decided to build an entire university. Overachievers.",
        "The campus sits on 8,180 acres in California — big enough to fit about 6,000 football fields. People call it 'The Farm' because Leland Sr. used to raise horses there. Yes, one of the most famous universities in the world was once basically a horse stable.",
        "Stanford's mascot is the Cardinal. Not a cardinal bird — just the color red. Their teams are called 'the Cardinal.' Two Stanford students named Larry Page and Sergey Brin founded Google while they were there. Another duo — Bill Hewlett and Dave Packard — started HP in a nearby garage. Stanford is basically the place where you either change the world or spend four years arguing about what color your mascot is.",
      ],
      quiz: [
        { q: "Why did Leland Stanford build the university?", options: ["He wanted to win a bet", "He was bored and very rich", "To honor his son who passed away", "His horse told him to"], correct: 2 },
        { q: "What nickname does Stanford's campus have?", options: ["The Mansion", "The Farm", "The Ranch", "The Stable"], correct: 1 },
        { q: "What is Stanford's mascot?", options: ["A cardinal bird", "A horse", "The color red, called the Cardinal", "A tree"], correct: 2 },
        { q: "Which famous company was started by two Stanford students?", options: ["Apple", "Google", "Twitter", "TikTok"], correct: 1 },
      ],
    },
    audio: {
      kind: "audio",
      title: "UC Berkeley",
      script:
        "Okay, UC Berkeley. Founded in 1868 — which was before cars, before airplanes, basically before most fun things — Berkeley was the very first campus in the entire University of California system. It sits right across the bay from San Francisco, which already makes it pretty cool. Here's something wild: over 107 Nobel Prize winners have come from Berkeley. That is more Nobel Prizes than most entire countries. Statistically, if you walk across Berkeley's campus, you will probably bump into someone who has won a Nobel Prize. Watch where you're going. In 1964, students at Berkeley started something called the Free Speech Movement. The school told students they couldn't hand out political pamphlets on campus. The students said, no thanks, we will protest instead. They protested so loudly and for so long that the rules changed — not just at Berkeley, but at universities all over the country. Classic Berkeley. Oh, and the sports teams are called the Golden Bears. School colors are blue and gold. Their biggest rival is Stanford, which Berkeley fans cheerfully call The Farm. You know, as a joke.",
      quiz: [
        { q: "When was UC Berkeley founded?", options: ["1776", "1868", "1920", "1492"], correct: 1 },
        { q: "Roughly how many Nobel Prize winners has Berkeley produced?", options: ["About 5", "About 25", "Over 107", "None — they all went to Stanford"], correct: 2 },
        { q: "What did students fight for in the Free Speech Movement?", options: ["Free burritos on Fridays", "The right to hand out political pamphlets on campus", "Longer winter break", "Better Wi-Fi in the library"], correct: 1 },
        { q: "What are UC Berkeley's sports teams called?", options: ["The Blue Bears", "The California Grizzlies", "The Golden Bears", "The Bay Bears"], correct: 2 },
      ],
    },
    visual: {
      kind: "visual",
      title: "Harvard University — By the Numbers",
      highlights: [
        { label: "Founded",         value: "1636",                  note: "Oldest university in the United States" },
        { label: "Location",        value: "Cambridge, MA",          note: "Across the Charles River from Boston" },
        { label: "Library",         value: "20M+ volumes",           note: "Largest academic library in the world" },
        { label: "Nobel Laureates", value: "161+",                   note: "More than any other university" },
        { label: "Endowment",       value: "$50B+",                  note: "Largest university endowment globally" },
        { label: "School Color",    value: "Crimson",                note: "Teams are called the Harvard Crimson" },
        { label: "Famous Alumni",   value: "Obama · JFK · Portman",  note: "Multiple US presidents attended" },
        { label: "Famous Dropouts", value: "Gates · Zuckerberg",     note: "Left to found Microsoft and Facebook" },
      ],
      quiz: [
        { q: "According to the infographic, when was Harvard founded?", options: ["1776", "1636", "1901", "1492"], correct: 1 },
        { q: "What does the chart show about Harvard's library?", options: ["It has the newest books in the US", "It has over 20 million volumes — the largest academic library in the world", "It was founded before the university", "It only accepts Harvard students"], correct: 1 },
        { q: "Which famous figures are listed as Harvard dropouts in the infographic?", options: ["Obama and JFK", "Bill Gates and Mark Zuckerberg", "Natalie Portman and Barack Obama", "Larry Page and Sergey Brin"], correct: 1 },
        { q: "According to the stat cards, how many Nobel laureates has Harvard produced?", options: ["About 10", "Over 50", "161+", "None — they all went to Stanford"], correct: 2 },
      ],
    },
  },
} as const;

export function publicLesson() {
  const formats: Record<string, any> = {};
  for (const [k, v] of Object.entries(DIAGNOSTIC_LESSON.formats)) {
    const { quiz, ...rest } = v as any;
    formats[k] = { ...rest, quiz: (quiz as any[]).map(({ q, options }: any) => ({ q, options })) };
  }
  return { id: DIAGNOSTIC_LESSON.id, topic: DIAGNOSTIC_LESSON.topic, estimatedSeconds: DIAGNOSTIC_LESSON.estimatedSeconds, formats };
}

export function gradeQuiz(format: DiagnosticFormat, answers: number[]): { correct: number; total: number } {
  const key = DIAGNOSTIC_LESSON.formats[format].quiz as readonly { correct: number }[];
  let correct = 0;
  key.forEach((item, i) => { if (answers[i] === item.correct) correct++; });
  return { correct, total: key.length };
}

const STOP = new Set("the a an of to in is are it its and or for that this with as on at by be was were i my you".split(" "));
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const toks = (s: string) => norm(s).split(" ").filter((w) => w && !STOP.has(w));

// Best-match scoring: finds which option the transcript most clearly describes.
// Requires the correct option to win by a clear margin (0.15) over the second-best,
// AND clear a minimum threshold (0.3) — prevents "said everything" from counting.
function overlapScore(transcript: string, option: string): number {
  const heard = new Set(toks(transcript));
  const optToks = toks(option);
  if (!optToks.length) return 0;
  return optToks.filter((w) => heard.has(w)).length / optToks.length;
}

function spokenCorrect(transcript: string | null, options: readonly string[], correctIdx: number): boolean {
  if (!transcript) return false;
  const scores = options.map((opt) => overlapScore(transcript, opt));
  const best = Math.max(...scores);
  if (best < 0.3) return false;
  const bestIdx = scores.indexOf(best);
  if (bestIdx !== correctIdx) return false;
  const secondBest = scores.filter((_, i) => i !== bestIdx).reduce((a, b) => Math.max(a, b), 0);
  return best - secondBest >= 0.15;
}

export function gradeQuizMixed(format: DiagnosticFormat, answers: (number | string)[]): { correct: number; total: number } {
  const key = DIAGNOSTIC_LESSON.formats[format].quiz as readonly { correct: number; options: readonly string[] }[];
  let correct = 0;
  key.forEach((item, i) => {
    const ans = answers[i];
    if (typeof ans === "number") { if (ans === item.correct) correct++; }
    else if (typeof ans === "string") {
      if (spokenCorrect(ans, item.options, item.correct)) correct++;
    }
  });
  return { correct, total: key.length };
}

export function buildBreakdown(format: DiagnosticFormat, answers: (number | string)[]) {
  const quiz = DIAGNOSTIC_LESSON.formats[format].quiz as readonly { q: string; options: readonly string[]; correct: number }[];
  return quiz.map((item, i) => {
    const ans = answers[i];
    const correctAnswer = item.options[item.correct];
    let userAnswer: string, wasCorrect: boolean;
    if (typeof ans === "number") {
      userAnswer = item.options[ans] ?? "";
      wasCorrect = ans === item.correct;
    } else {
      userAnswer = typeof ans === "string" ? ans : "";
      wasCorrect = spokenCorrect(userAnswer, item.options, item.correct);
    }
    return { q: item.q, userAnswer, correctAnswer, wasCorrect };
  });
}
