import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9._-]/gi, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
});

export const uploadRouter = Router();

// POST /api/upload  — accepts 1–10 PDFs
uploadRouter.post("/", upload.array("files", 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: "At least one PDF is required" });

  const files = req.files.map((f) => ({
    id: f.filename,
    name: f.originalname,
    size: f.size,
    uploadedAt: new Date().toISOString(),
  }));

  res.json({ ok: true, files });
});

// GET /api/upload  — list previously uploaded files
uploadRouter.get("/", (_, res) => {
  const files = fs.readdirSync(UPLOAD_DIR)
    .filter((f) => f.endsWith(".pdf"))
    .map((f) => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, f));
      const name = f.replace(/^\d+-/, "");
      return { id: f, name, size: stat.size, uploadedAt: stat.mtime.toISOString() };
    })
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  res.json({ files });
});
