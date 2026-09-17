export interface VectorDocument {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
}

const vectorStore: VectorDocument[] = [];

export function addVectorDocument(
  document: VectorDocument
) {
  vectorStore.push(document);
}

export function getVectorDocuments(
  documentId: string
) {
  return vectorStore.filter(
    document => document.documentId === documentId
  );
}