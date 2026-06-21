import { Router } from "express";
import { content } from "../db.js";
import { hasKey } from "../lib/anthropic.js";
import { generateModalities } from "../lib/multimodal.js";

export const contentRouter = Router();

// POST /api/content/generate
// Body: { topic, source }
// Runs the multimodal pipeline (text / audio / visual / quiz), versions the
// result per topic, and returns the stored content unit.
contentRouter.post("/generate", async (req, res) => {
  const { topic, source } = req.body || {};
  if (!topic || !source) return res.status(400).json({ error: "topic and source are required" });

  try {
    const modalities = await generateModalities({ topic, source });
    const stored = content.insert({
      topic,
      source_excerpt: source.slice(0, 280),
      created_at: new Date().toISOString(),
      modalities,
    });
    res.json({ content: stored });
  } catch (err) {
    if (err.code === "NO_KEY") {
      return res.status(503).json({
        error: "Multimodal generation needs ANTHROPIC_API_KEY. Set it in backend/.env to enable this endpoint.",
      });
    }
    console.error("content generation failed:", err);
    res.status(500).json({ error: "generation failed", detail: err.message });
  }
});

contentRouter.get("/units", (req, res) => {
  const { topic } = req.query;
  res.json({ units: topic ? content.forTopic(topic) : content.all() });
});

contentRouter.get("/status", (_req, res) => {
  res.json({ multimodalEnabled: hasKey() });
});
