import { BookOpen, Headphones, Eye } from "lucide-react";

// Palette taken directly from the Cal Hacks logo:
//   top circle    → warm peach  #F5A87A
//   bottom-left   → powder blue #90D2E6
//   bottom-right  → pale yellow #EEEA9C
//   center overlap→ soft teal   #8CCFB8
//
// "Soft" tokens = literal logo colors (used for backgrounds & tints).
// "Base" tokens = same hue, deepened enough to read on white (buttons, text).
// Neutrals warmed to match the logo's friendly, warm overall feel.
export const C = {
  paper: "#FFFDF5",        // warm cream — echoes logo warmth
  surface: "#FFFFFF",
  ink: "#2A1E14",          // warm near-black (not cold blue-black)
  sub: "#6B6050",          // warm mid-gray
  faint: "#A09488",        // warm light gray
  line: "#EAE3D5",         // warm border

  // ── Peach (logo top circle ~#F5A87A) ──────────────────────
  brand: "#D96840",        // readable deep peach for buttons/links
  brandSoft: "#F5A87A",    // = actual logo peach circle

  text: "#D96840",
  textSoft: "#F5A87A",

  // ── Sky blue (logo bottom-left ~#90D2E6) ──────────────────
  audio: "#3898B8",        // readable deep sky blue
  audioSoft: "#90D2E6",    // = actual logo blue circle

  // ── Yellow → teal (logo bottom-right #EEEA9C, overlap #8CCFB8) ──
  visual: "#4AADA0",       // teal (overlap) — yellow isn't readable on white
  visualSoft: "#EEEA9C",   // = actual logo yellow circle as background tint

  good: "#4AADA0",         // teal = success
  warn: "#C89818",         // amber
  bad: "#CC4460",          // error red
  badSoft: "#FAE8EC",
};

export const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";
export const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
export const MONO = "'Space Mono', ui-monospace, monospace";

export const MODES = {
  text:   { key: "text",   label: "Text",   verb: "Read it",  color: C.text,   soft: C.textSoft,   Icon: BookOpen },
  audio:  { key: "audio",  label: "Audio",  verb: "Hear it",  color: C.audio,  soft: C.audioSoft,  Icon: Headphones },
  visual: { key: "visual", label: "Visual", verb: "See it",   color: C.visual, soft: C.visualSoft, Icon: Eye },
};

export const STATUS = {
  thriving:        { label: "Thriving",      color: C.good, soft: C.visualSoft },
  "on-track":      { label: "On track",      color: C.brand, soft: C.brandSoft },
  "needs-support": { label: "Needs support", color: C.bad,  soft: C.badSoft },
};
