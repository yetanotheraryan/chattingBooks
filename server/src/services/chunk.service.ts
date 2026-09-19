export interface DocumentChunk {
  content: string;
  chunkIndex: number;
}
export function chunkText(
  text: string,
  chunkSize: number,
  overlap: number
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(
      start + chunkSize,
      text.length
    );

    const content = text
      .slice(start, end)
      .trim();

    if (content.length > 0) {
      chunks.push({
        content,
        chunkIndex,
      });

      chunkIndex++;
    }

    start += chunkSize - overlap;
  }

  return chunks;
}
