import express from "express";
import cors from "cors";
import multer from "multer";
import { extractText } from "./services/document.services";
import "dotenv/config";
import { chunkText } from "./services/chunk.service";
import { createEmbedding } from "./services/embedding.service";
import { addVectorDocument } from "./services/vectorstore.service";
import crypto from "node:crypto";
import {
  retrieveRelevantChunks,
} from "./services/retrieval.service";
import { generateAnswer } from "./services/llm.service";
const documentId = crypto.randomUUID();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok"
  });
});

app.post(
  "/documents/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded"
        });
      }

      const text = await extractText(
        req.file.buffer,
        req.file.mimetype
      );

      // 2. Split text
      const chunks = chunkText(text);

      console.log(
        `Created ${chunks.length} chunks`
      );

      // 3. Generate embeddings
      for (const chunk of chunks) {
        const embedding = await createEmbedding(
          chunk.content
        );

        // 4. Store in vector store
        addVectorDocument({
          id: crypto.randomUUID(),
          documentId,
          content: chunk.content,
          embedding,
          chunkIndex: chunk.chunkIndex,
        });
      }

      return res.json({
        message: "Document processed successfully",
        documentId,
        filename: req.file.originalname,
        chunks: chunks.length,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to upload file"
      });
    }
  }
);

app.post("/chat", async (req, res) => {
  try {
    const {
      documentId,
      question,
    } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        error: "documentId and question are required",
      });
    }

    const chunks = await retrieveRelevantChunks(documentId, question);
    console.log("Retrieved chunks:", chunks);
    const context = chunks.map((chunk, index)=> `[Source ${index+1}\n${chunk.content}]`).join("\n\n");
    console.log("before generate LLM context: ", context);
    const answer = await generateAnswer({
      question, 
      context
    })


    return res.json({
      answer,
      sources: chunks.map((chunk) => ({
        content: chunk.content,
        score: chunk.score,
        chunkIndex: chunk.chunkIndex,
      })),
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to search document",
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});