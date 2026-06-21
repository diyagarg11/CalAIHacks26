/**
 * Paragraph-aware sliding-window text chunker.
 *
 * Strategy:
 *  1. Split on blank lines (paragraph boundaries).
 *  2. If a paragraph exceeds MAX_CHARS, split further on sentence endings.
 *  3. Merge short paragraphs until TARGET_CHARS is reached.
 *  4. Slide a OVERLAP_CHARS window between successive chunks.
 */

const TARGET_CHARS = 800;
const MAX_CHARS = 1200;
const OVERLAP_CHARS = 150;
const MIN_CHUNK_CHARS = 80;

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitLargeParagraph(para) {
  if (para.length <= MAX_CHARS) return [para];
  const sentences = splitSentences(para);
  const pieces = [];
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

/**
 * @param {string} text — raw document text
 * @returns {{ content: string; index: number; charStart: number; charEnd: number }[]}
 */
export function chunkText(text) {
  // Normalize line endings and split into paragraphs
  const rawParagraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length >= MIN_CHUNK_CHARS);

  // Break oversized paragraphs at sentence boundaries
  const pieces = rawParagraphs.flatMap(splitLargeParagraph);

  // Merge small pieces into chunks targeting TARGET_CHARS, then apply overlap
  const chunks = [];
  let buffer = "";
  let bufferPieces = [];

  const flush = () => {
    const content = buffer.trim();
    if (content.length >= MIN_CHUNK_CHARS) {
      chunks.push(content);
    }
  };

  for (const piece of pieces) {
    if (buffer.length + piece.length + 1 > TARGET_CHARS && buffer) {
      flush();
      // Start next buffer with overlap from the end of the previous buffer
      const overlap = buffer.slice(-OVERLAP_CHARS).trim();
      buffer = overlap ? `${overlap} ${piece}` : piece;
      bufferPieces = [piece];
    } else {
      buffer = buffer ? `${buffer} ${piece}` : piece;
      bufferPieces.push(piece);
    }
  }
  flush();

  // Annotate with index and approximate char positions
  let pos = 0;
  return chunks.map((content, index) => {
    const charStart = text.indexOf(content.slice(0, 40).trim(), pos);
    const charEnd = charStart + content.length;
    pos = Math.max(0, charStart);
    return { content, index, charStart: Math.max(0, charStart), charEnd };
  });
}
