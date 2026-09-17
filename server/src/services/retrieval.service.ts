import { createEmbedding } from "./embedding.service";

import {
  searchSimilarChunks,
} from "./similarity.service";

export async function retrieveRelevantChunks(
  documentId: string,
  question: string
) {
  const queryEmbedding =
    await createEmbedding(question);

  return searchSimilarChunks(
    documentId,
    queryEmbedding,
    5
  );
}