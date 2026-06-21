// Pure decision logic for the initial-assessment diagnostic.
// Framework-free and side-effect-free so it's trivially testable.

// Teacher-set accommodation flags. Crucially, not every flag MANDATES a format —
// we distinguish three kinds so the diagnostic only short-circuits when a flag
// truly forces a single format:
//   - mandate:  forces exactly one format -> skip the diagnostic, assign directly
//   - exclude:  rules a format out, but others remain testable
//   - constraint: a delivery requirement that rides along with ANY format
export const ACCOMMODATION_RULES = {
  audio_narration_required: { label: "Audio narration required", mandate: "audio" },
  captions_required:        { label: "Captions required",        constraint: true },
  no_flashing:              { label: "No flashing / rapid transitions", exclude: "visual" },
  extended_time:            { label: "Extended quiz time",       constraint: true },
};

// The diagnostic tests audio vs. text only; visual is deferred to the first
// real lessons (see README — fairness + content-pipeline cost). Visual is
// recorded as `null` ("untested") so the adaptive engine knows to sample it.
export const DIAGNOSTIC_FORMATS = ["text", "audio"];

export function resolveAccommodation(flags = []) {
  let mandatedFormat = null;
  const excludedFormats = [];
  const constraints = [];
  for (const flag of flags) {
    const rule = ACCOMMODATION_RULES[flag];
    if (!rule) continue;
    if (rule.mandate) mandatedFormat = rule.mandate;
    if (rule.exclude) excludedFormats.push(rule.exclude);
    if (rule.constraint) constraints.push(flag);
  }
  return { mandatedFormat, excludedFormats, constraints, applied: flags };
}

// scores: { text: {correct,total,seconds}, audio: {correct,total,seconds} }
// Returns the winning format. Higher comprehension % wins; ties broken by
// faster completion, then by a stable default.
export function decideFormat(scores) {
  const pct = (s) => (s && s.total ? s.correct / s.total : -1);
  const entries = DIAGNOSTIC_FORMATS.map((f) => ({ format: f, ...scores[f], pct: pct(scores[f]) }));
  entries.sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct;
    const sa = a.seconds ?? Infinity;
    const sb = b.seconds ?? Infinity;
    if (sa !== sb) return sa - sb; // faster wins the tie
    return a.format === "text" ? -1 : 1; // stable default
  });
  return entries[0].format;
}

// Builds a row for the diagnostic_assessments table from raw per-format results.
// `scores` carries the baseline the adaptive engine's preference tracker reads.
export function buildAssessmentRecord({ studentId, accommodation, scores, createdAt }) {
  const visualSeed = { visual: null }; // explicitly untested, not "scored 0"

  if (accommodation.mandatedFormat) {
    return {
      student_id: studentId,
      created_at: createdAt,
      status: "skipped_accommodation",
      decided_by: "accommodation",
      assigned_format: accommodation.mandatedFormat,
      scores: { text: null, audio: null, ...visualSeed },
      accommodation: { applied: accommodation.applied, mandatedFormat: accommodation.mandatedFormat },
    };
  }

  const assigned = decideFormat(scores);
  const withPct = {};
  for (const f of DIAGNOSTIC_FORMATS) {
    const s = scores[f];
    withPct[f] = s ? { ...s, pct: Math.round((s.correct / s.total) * 100) } : null;
  }
  return {
    student_id: studentId,
    created_at: createdAt,
    status: "completed",
    decided_by: "diagnostic",
    assigned_format: assigned,
    scores: { ...withPct, ...visualSeed },
    accommodation: accommodation.applied.length
      ? { applied: accommodation.applied, mandatedFormat: null }
      : null,
  };
}
