import { Router } from "express";
import express from "express";
import { speak, transcribe, hasDeepgram } from "../lib/deepgram.js";

export const speechRouter = Router();

speechRouter.get("/status", (_req, res) =>
  res.json({ ttsEnabled: hasDeepgram(), sttEnabled: hasDeepgram() })
);

// POST /api/speech/tts  { text } -> audio/mpeg
// (req.body is already parsed by the global express.json middleware)
speechRouter.post("/tts", async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "text required" });
  try {
    const audio = await speak(text);
    res.set("Content-Type", "audio/mpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(audio);
  } catch (err) {
    if (err.code === "NO_KEY")
      return res.status(503).json({ error: "DEEPGRAM_API_KEY not set" });
    console.error("tts failed:", err.message);
    res.status(502).json({ error: "tts failed" });
  }
});

// POST /api/speech/transcribe  (raw audio body) -> { transcript }
// express.raw captures any audio content-type into req.body as a Buffer.
speechRouter.post(
  "/transcribe",
  express.raw({ type: () => true, limit: "20mb" }),
  async (req, res) => {
    if (!req.body || !req.body.length)
      return res.status(400).json({ error: "empty audio body" });
    try {
      const transcript = await transcribe(req.body, req.get("content-type"));
      res.json({ transcript });
    } catch (err) {
      if (err.code === "NO_KEY")
        return res.status(503).json({ error: "DEEPGRAM_API_KEY not set" });
      console.error("transcribe failed:", err.message);
      res.status(502).json({ error: "transcribe failed" });
    }
  }
);
