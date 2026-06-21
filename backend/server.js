import "dotenv/config";
import express from "express";
import cors from "cors";
import { assessmentRouter } from "./routes/assessment.js";
import { contentRouter } from "./routes/content.js";
import { studentRouter } from "./routes/students.js";
import { speechRouter } from "./routes/speech.js";
import { uploadRouter } from "./routes/upload.js";
import { hasKey } from "./lib/anthropic.js";
import { hasDeepgram } from "./lib/deepgram.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, multimodalEnabled: hasKey(), speechEnabled: hasDeepgram() })
);
app.use("/api/assessment", assessmentRouter);
app.use("/api/content", contentRouter);
app.use("/api/students", studentRouter);
app.use("/api/speech", speechRouter);
app.use("/api/upload", uploadRouter);

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`triad backend on http://localhost:${PORT}`);
  console.log(`  multimodal pipeline: ${hasKey() ? "ENABLED" : "disabled (set ANTHROPIC_API_KEY)"}`);
  console.log(`  speech (Deepgram):   ${hasDeepgram() ? "ENABLED" : "disabled (set DEEPGRAM_API_KEY)"}`);
});
