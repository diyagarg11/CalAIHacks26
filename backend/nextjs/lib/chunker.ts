const TARGET_CHARS = 800;
const MAX_CHARS = 1200;
const OVERLAP_CHARS = 150;
const MIN_CHUNK_CHARS = 80;

export interface Chunk {
  content: string;
  index: number;
  charStart: number;
  charEnd: number;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitLargeParagraph(para: string): string[] {
  if (para.length <= MAX_CHARS) return [para];
  const sentences = splitSentences(para);
  const pieces: string[] = [];
  let current = "";
  for (const sent of sentences) {
    if (current.length + sent.length + 1 > MAX_CHARS && current) {
      pieces.push(current.trim());
      current = sent;
    } else {
      current = current ? `${current} ${sent}` : sent;
    }
  }
  if (current.trim()) pieces.push(current.trim());
  return pieces.length ? pieces : [para];
}

export function chunkText(text: string): Chunk[] {
  const rawParagraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length >= MIN_CHUNK_CHARS);

  const pieces = rawParagraphs.flatMap(splitLargeParagraph);

  const chunks: string[] = [];
  let buffer = "";

  const flush = () => {
    const content = buffer.trim();
    if (content.length >= MIN_CHUNK_CHARS) chunks.push(content);
  };

  for (const piece of pieces) {
    if (buffer.length + piece.length + 1 > TARGET_CHARS && buffer) {
      flush();
      const overlap = buffer.slice(-OVERLAP_CHARS).trim();
      buffer = overlap ? `${overlap} ${piece}` : piece;
    } else {
      buffer = buffer ? `${buffer} ${piece}` : piece;
    }
  }
  flush();

  let pos = 0;
  return chunks.map((content, index) => {
    const charStart = Math.max(0, text.indexOf(content.slice(0, 40).trim(), pos));
    const charEnd = charStart + content.length;
    pos = charStart;
    return { content, index, charStart, charEnd };
  });
}
