import { Router } from "express";
import { students, assessments } from "../db.js";
import { publicLesson, gradeQuiz, gradeQuizMixed, buildBreakdown } from "../lib/diagnosticLesson.js";
import { resolveAccommodation, buildAssessmentRecord } from "../lib/diagnostic.js";

export const assessmentRouter = Router();

// GET /api/assessment/lesson?studentId=1
// Returns either the diagnostic lesson to run, or — if a teacher-set
// accommodation mandates a format — instructs the client to skip it.
assessmentRouter.get("/lesson", (req, res) => {
  const student = students.find(req.query.studentId);
  const flags = student?.accommodations ?? [];
  const accommodation = resolveAccommodation(flags);

  if (accommodation.mandatedFormat) {
    return res.json({
      skip: true,
      reason: "accommodation",
      mandatedFormat: accommodation.mandatedFormat,
      accommodation,
    });
  }

  // Randomize presentation order to avoid order bias.
  const order = Math.random() < 0.5 ? ["text", "audio"] : ["audio", "text"];
  res.json({ skip: false, order, accommodation, lesson: publicLesson() });
});

// POST /api/assessment/submit
// Body: { studentId, results: { text:{answers,seconds}, audio:{answers,seconds} } }
// Grades each format server-side, decides the assigned format, persists the
// record, and writes preferred_format back onto the student.
assessmentRouter.post("/submit", (req, res) => {
  const { studentId, results = {} } = req.body || {};
  const student = students.find(studentId);
  if (!student) return res.status(404).json({ error: "unknown student" });

  const accommodation = resolveAccommodation(student.accommodations ?? []);

  // Accommodation mandate short-circuits the diagnostic entirely.
  let scores = {};
  if (!accommodation.mandatedFormat) {
    for (const format of ["text", "audio"]) {
      const r = results[format];
      if (!r) return res.status(400).json({ error: `missing results for ${format}` });
      // text uses MCQ indices; audio uses raw transcripts — gradeQuizMixed handles both
      const graded = format === "audio" ? gradeQuizMixed(format, r.answers) : gradeQuiz(format, r.answers);
      scores[format] = { ...graded, seconds: r.seconds ?? null };
    }
  }

  const record = buildAssessmentRecord({
    studentId: student.id,
    accommodation,
    scores,
    createdAt: new Date().toISOString(),
  });

  const stored = assessments.insert(record);
  students.setPreferredFormat(student.id, record.assigned_format, record.decided_by);

  const breakdown = {};
  for (const format of ["text", "audio"]) {
    if (results[format]) breakdown[format] = buildBreakdown(format, results[format].answers);
  }

  res.json({ assessment: { ...stored, breakdown }, student: students.find(student.id) });
});

// GET /api/assessment/history/:studentId — baseline the adaptive engine reads.
assessmentRouter.get("/history/:studentId", (req, res) => {
  res.json({ assessments: assessments.forStudent(req.params.studentId) });
});
