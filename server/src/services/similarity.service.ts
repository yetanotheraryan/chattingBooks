import {
  getVectorDocuments,
} from "./vectorstore.service";

import {
  cosineSimilarity,
} from "./cosines.service";

export function searchSimilarChunks(
  documentId: string,
  queryEmbedding: number[],
  topK = 5
) {
  const documents =
    getVectorDocuments(documentId);

  return documents
    .map(document => ({
      ...document,

      score: cosineSimilarity(
        queryEmbedding,
        document.embedding
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}