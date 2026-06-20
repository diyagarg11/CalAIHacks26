import { BookOpen, Headphones, Eye } from "lucide-react";

export const C = {
  paper: "#FBFAF7",
  surface: "#FFFFFF",
  ink: "#1A1B2E",
  sub: "#5B5C72",
  faint: "#8A8B9C",
  line: "#E9E5DD",
  brand: "#5546D6",
  brandSoft: "#EEEBFB",
  text: "#5546D6",
  textSoft: "#EEEBFB",
  audio: "#E8852B",
  audioSoft: "#FCEEDD",
  visual: "#16A89B",
  visualSoft: "#DFF3F1",
  good: "#16A89B",
  warn: "#E8852B",
  bad: "#E0506A",
  badSoft: "#FBE6EA",
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
