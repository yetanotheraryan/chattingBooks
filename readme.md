# 📚 chattingBooks

> **Chat with your books and documents using RAG + LLMs.**

**chattingBooks** is a document-based AI chatbot that lets you upload a PDF or TXT file and ask questions about its contents using **Retrieval-Augmented Generation (RAG)**.

Instead of sending the entire document to an LLM, chattingBooks extracts the document, splits it into smaller chunks, generates embeddings, retrieves the most relevant chunks for each question, and provides that context to an LLM to generate a grounded answer.

---

## ✨ Features

* 📄 Upload **PDF and TXT** documents
* ✂️ Automatically split documents into chunks
* 🧠 Generate vector embeddings for document chunks
* 🔎 Semantic similarity search for relevant content
* 🤖 LLM-powered question answering
* 📚 Answers grounded in the uploaded document
* 💬 Clean conversational chat interface
* ⚡ React + TypeScript frontend
* 🚀 Node.js + TypeScript backend
* 🧩 In-memory vector store for the current version

---

## 🏗️ Architecture

```text
                         chattingBooks
                              │
               ┌──────────────┴──────────────┐
               │                             │
          React Frontend                Node.js API
               │                             │
               │                    ┌────────┴────────┐
               │                    │                 │
               │                Upload API        Chat API
               │                    │                 │
               │                    ▼                 ▼
               │              Text Extraction    Query Embedding
               │                    │                 │
               │                    ▼                 ▼
               │                 Chunking       Vector Search
               │                    │                 │
               │                    ▼                 │
               │               Embeddings             │
               │                    │                 │
               │                    ▼                 │
               │             In-Memory Store          │
               │                    │                 │
               │                    └────────┬────────┘
               │                             │
               │                             ▼
               │                       Relevant Chunks
               │                             │
               │                             ▼
               │                            LLM
               │                             │
               │                             ▼
               └────────────────────────── Answer
```

---

## 🔄 RAG Pipeline

### 1. Document ingestion

When a document is uploaded:

```text
PDF / TXT
   ↓
Text Extraction
   ↓
Chunking
   ↓
Embedding Generation
   ↓
Vector Store
```

Each document chunk is stored along with its embedding.

Example:

```typescript
{
  id: "chunk-id",
  documentId: "document-id",
  content: "Supervised learning is...",
  embedding: [0.021, -0.083, 0.142, ...],
  chunkIndex: 4
}
```

### 2. Question answering

When the user asks a question:

```text
User Question
     ↓
Generate Query Embedding
     ↓
Cosine Similarity Search
     ↓
Retrieve Top-K Chunks
     ↓
Build Context
     ↓
Send Context + Question to LLM
     ↓
Generate Answer
```

The LLM is instructed to answer using the retrieved document context rather than relying on unrelated outside knowledge.

---

## 🧠 Why RAG?

Sending an entire book directly to an LLM is inefficient and can exceed context limits.

RAG instead retrieves only the information relevant to the user's question.

For example:

```text
100-page PDF
     │
     ▼
500 document chunks
     │
     ▼
User asks:
"What is supervised learning?"
     │
     ▼
Vector search
     │
     ▼
Top 5 relevant chunks
     │
     ▼
LLM
     │
     ▼
Focused answer
```

This makes it possible to build document-aware AI applications without requiring the model to have the document in its training data.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* TypeScript
* Express
* Multer

### AI

* OpenAI Embeddings
* OpenAI LLM

### Document Processing

* `pdf-parse`
* Native TXT parsing

### Vector Search

* Custom in-memory vector store
* Cosine similarity

---

## 📁 Project Structure

```text
chattingBooks/
│
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   ├── document.service.ts
│   │   │   ├── chunk.service.ts
│   │   │   ├── embedding.service.ts
│   │   │   ├── vector-store.service.ts
│   │   │   ├── similarity.service.ts
│   │   │   ├── retrieval.service.ts
│   │   │   └── llm.service.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Node.js 18+
* npm
* An OpenAI API key

---

### 1. Clone the repository

```bash
git clone <your-repository-url>

cd chattingBooks
```

---

### 2. Start the backend

```bash
cd server

npm install
```

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
```

Start the server:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:3000
```

---

### 3. Start the frontend

Open another terminal:

```bash
cd client

npm install

npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🔌 API

### Upload document

```http
POST /documents/upload
Content-Type: multipart/form-data
```

Form field:

```text
file
```

Example response:

```json
{
  "message": "Document processed successfully",
  "documentId": "abc-123",
  "filename": "machine-learning.pdf",
  "chunks": 24
}
```

---

### Ask a question

```http
POST /chat
Content-Type: application/json
```

Request:

```json
{
  "documentId": "abc-123",
  "question": "What is supervised learning?"
}
```

Response:

```json
{
  "answer": "Supervised learning is a machine learning technique where models learn from labeled training data.",
  "sources": [
    {
      "content": "Supervised learning is...",
      "score": 0.86,
      "chunkIndex": 4
    }
  ]
}
```

---

## 🧩 Current Vector Search

The current implementation intentionally uses an in-memory vector store.

A simplified version of retrieval looks like:

```typescript
const results = vectorStore
  .filter(
    document =>
      document.documentId === documentId
  )
  .map(document => ({
    ...document,
    score: cosineSimilarity(
      queryEmbedding,
      document.embedding
    )
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);
```

This keeps the project simple while demonstrating how vector databases work internally.

For production, this can be replaced with a dedicated vector database without changing the overall RAG architecture.

---

## ⚠️ Current Limitations

This is currently an educational/prototype implementation.

* Vector data is stored only in memory
* Restarting the backend removes uploaded document vectors
* Documents are processed synchronously
* Embeddings are currently generated individually
* Chunking is character-based
* No authentication
* No persistent document storage
* No streaming LLM responses yet
* No hybrid keyword + semantic search
* No reranking
* Limited document metadata

---

## 🗺️ Roadmap

### RAG Improvements

* [ ] Batch embedding generation
* [ ] Better semantic chunking
* [ ] Document/page metadata
* [ ] Similarity score threshold
* [ ] Hybrid keyword + vector search
* [ ] Reranking
* [ ] Query rewriting
* [ ] Conversation-aware retrieval
* [ ] Citation/source highlighting

### Infrastructure

* [ ] Persistent vector database
* [ ] Redis / Qdrant / pgvector integration
* [ ] Persistent document storage
* [ ] Background document-processing jobs
* [ ] Queue-based ingestion
* [ ] Rate limiting
* [ ] Authentication

### Frontend

* [ ] Streaming responses
* [ ] Markdown rendering
* [ ] Source previews
* [ ] Drag-and-drop upload
* [ ] Multiple documents
* [ ] Document management
* [ ] Conversation history
* [ ] Dark mode

### Evaluation

* [ ] Retrieval evaluation
* [ ] Answer faithfulness evaluation
* [ ] Retrieval precision/recall
* [ ] RAG evaluation dataset
* [ ] Latency and token usage tracking

---

## 🎯 What This Project Demonstrates

chattingBooks is designed to demonstrate the fundamentals behind production RAG systems:

* Document ingestion
* Text extraction
* Chunking strategies
* Embedding generation
* Vector representations
* Semantic search
* Cosine similarity
* Context construction
* LLM prompting
* Retrieval-Augmented Generation
* Frontend/backend separation
* AI application architecture

---

## 📌 Future Architecture

The current architecture uses an in-memory vector store:

```text
React
  ↓
Node.js
  ↓
In-memory Vector Store
  ↓
LLM
```

The planned production architecture is:

```text
React
  ↓
API Gateway
  ↓
Node.js API
  │
  ├───────────────┐
  │               │
  ▼               ▼
Document Queue   Chat Service
  │               │
  ▼               ▼
Document Worker  Retrieval
  │               │
  ▼               ▼
Object Storage   Vector DB
                  │
                  ▼
               Reranker
                  │
                  ▼
                 LLM
                  │
                  ▼
               Response
```

---

## 📄 License

MIT License

---

## ⭐ About

**chattingBooks** is a hands-on implementation of Retrieval-Augmented Generation, built to explore how modern AI applications combine traditional backend systems, vector search, and large language models.

Built with ❤️ and a lot of curiosity.
