import { Router } from "express";
import { students } from "../db.js";

export const studentRouter = Router();

studentRouter.get("/", (_req, res) => res.json({ students: students.all() }));

studentRouter.get("/:id", (req, res) => {
  const s = students.find(req.params.id);
  if (!s) return res.status(404).json({ error: "unknown student" });
  res.json({ student: s });
});

// PATCH /api/students/:id/format — teacher override of the adaptive engine's pick.
studentRouter.patch("/:id/format", (req, res) => {
  const { format } = req.body || {};
  if (!["text", "audio", "visual"].includes(format))
    return res.status(400).json({ error: "format must be text | audio | visual" });
  const s = students.setPreferredFormat(req.params.id, format, "teacher_override");
  if (!s) return res.status(404).json({ error: "unknown student" });
  res.json({ student: s });
});
