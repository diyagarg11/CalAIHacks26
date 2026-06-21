// The neutral diagnostic lesson. Two different topics — one per format — so
// students aren't just reading then re-listening to the same text.
// Quiz questions are per-format; grading functions take a format argument.

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
        {
          q: "Why did Leland Stanford build the university?",
          options: [
            "He wanted to win a bet",
            "He was bored and very rich",
            "To honor his son who passed away",
            "His horse told him to",
          ],
          correct: 2,
        },
        {
          q: "What nickname does Stanford's campus have?",
          options: ["The Mansion", "The Farm", "The Ranch", "The Stable"],
          correct: 1,
        },
        {
          q: "What is Stanford's mascot?",
          options: [
            "A cardinal bird",
            "A horse",
            "The color red, called the Cardinal",
            "A tree",
          ],
          correct: 2,
        },
        {
          q: "Which famous company was started by two Stanford students?",
          options: ["Apple", "Google", "Twitter", "TikTok"],
          correct: 1,
        },
      ],
    },

    audio: {
      kind: "audio",
      title: "UC Berkeley",
      script:
        "Okay, UC Berkeley. Founded in 1868 — which was before cars, before airplanes, basically before most fun things — Berkeley was the very first campus in the entire University of California system. It sits right across the bay from San Francisco, which already makes it pretty cool. Here's something wild: over 107 Nobel Prize winners have come from Berkeley. That is more Nobel Prizes than most entire countries. Statistically, if you walk across Berkeley's campus, you will probably bump into someone who has won a Nobel Prize. Watch where you're going. In 1964, students at Berkeley started something called the Free Speech Movement. The school told students they couldn't hand out political pamphlets on campus. The students said, no thanks, we will protest instead. They protested so loudly and for so long that the rules changed — not just at Berkeley, but at universities all over the country. Classic Berkeley. Oh, and the sports teams are called the Golden Bears. School colors are blue and gold. Their biggest rival is Stanford, which Berkeley fans cheerfully call The Farm. You know, as a joke.",
      quiz: [
        {
          q: "When was UC Berkeley founded?",
          options: ["1776", "1868", "1920", "1492"],
          correct: 1,
        },
        {
          q: "Roughly how many Nobel Prize winners has Berkeley produced?",
          options: [
            "About 5",
            "About 25",
            "Over 107",
            "None — they all went to Stanford",
          ],
          correct: 2,
        },
        {
          q: "What did students fight for in the Free Speech Movement?",
          options: [
            "Free burritos on Fridays",
            "The right to hand out political pamphlets on campus",
            "Longer winter break",
            "Better Wi-Fi in the library",
          ],
          correct: 1,
        },
        {
          q: "What are UC Berkeley's sports teams called?",
          options: [
            "The Blue Bears",
            "The California Grizzlies",
            "The Golden Bears",
            "The Bay Bears",
          ],
          correct: 2,
        },
      ],
    },
  },
};

// Sent to the client WITHOUT the answer key. Scoring happens server-side.
export function publicLesson() {
  const formats = {};
  for (const [k, v] of Object.entries(DIAGNOSTIC_LESSON.formats)) {
    const { quiz, ...rest } = v;
    formats[k] = { ...rest, quiz: quiz.map(({ q, options }) => ({ q, options })) };
  }
  return {
    id: DIAGNOSTIC_LESSON.id,
    topic: DIAGNOSTIC_LESSON.topic,
    estimatedSeconds: DIAGNOSTIC_LESSON.estimatedSeconds,
    formats,
  };
}

export function gradeQuiz(format, answers = []) {
  const key = DIAGNOSTIC_LESSON.formats[format].quiz;
  let correct = 0;
  key.forEach((item, i) => {
    if (answers[i] === item.correct) correct += 1;
  });
  return { correct, total: key.length };
}

const GRADE_STOP = new Set("the a an of to in is are it its and or for that this with as on at by be was were i my you".split(" "));
const normG = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const toksG = (s) => normG(s).split(" ").filter((w) => w && !GRADE_STOP.has(w));

// Score transcript overlap against a single option (0–1).
function overlapScore(transcript, option) {
  const heard = new Set(toksG(transcript));
  const optToks = toksG(option);
  if (!optToks.length) return 0;
  return optToks.filter((w) => heard.has(w)).length / optToks.length;
}

// Best-match: find which option the transcript most clearly describes.
// Returns true only if the correct option wins by a clear margin (0.15) over
// the second-best, AND its own score clears a minimum threshold (0.3).
// This prevents "said all options" from counting as correct.
function spokenCorrect(transcript, options, correctIdx) {
  if (!transcript) return false;
  const scores = options.map((opt) => overlapScore(transcript, opt));
  const best = Math.max(...scores);
  if (best < 0.3) return false;
  const bestIdx = scores.indexOf(best);
  if (bestIdx !== correctIdx) return false;
  const secondBest = scores.filter((_, i) => i !== bestIdx).reduce((a, b) => Math.max(a, b), 0);
  return best - secondBest >= 0.15;
}

export function gradeQuizMixed(format, answers = []) {
  const key = DIAGNOSTIC_LESSON.formats[format].quiz;
  let correct = 0;
  key.forEach((item, i) => {
    const ans = answers[i];
    if (typeof ans === "number") {
      if (ans === item.correct) correct++;
    } else if (typeof ans === "string") {
      if (spokenCorrect(ans, item.options, item.correct)) correct++;
    }
  });
  return { correct, total: key.length };
}

// Returns a per-question breakdown for the result screen.
// answers: number[] for text (MCQ index), string[] for audio (raw transcript).
export function buildBreakdown(format, answers = []) {
  const quiz = DIAGNOSTIC_LESSON.formats[format].quiz;
  return quiz.map((item, i) => {
    const ans = answers[i];
    const correctAnswer = item.options[item.correct];
    let userAnswer, wasCorrect;
    if (typeof ans === "number") {
      userAnswer = item.options[ans] ?? null;
      wasCorrect = ans === item.correct;
    } else {
      userAnswer = typeof ans === "string" ? ans : null;
      wasCorrect = spokenCorrect(userAnswer, item.options, item.correct);
    }
    return { q: item.q, userAnswer: userAnswer || "", correctAnswer, wasCorrect };
  });
}
