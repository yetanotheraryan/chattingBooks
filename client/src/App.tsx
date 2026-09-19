import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_HOST_URL;
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [asking, setAsking] = useState<boolean>(false);

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    setUploading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();
      setDocumentId(data.documentId);
      setUploadedFileName(data.filename);

      console.log(data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!documentId || !question) return;

    const currentQuestion = question;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: currentQuestion,
    }

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setQuestion("");
    setAsking(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId,
            question: currentQuestion,
          }),
        }
      );

      const data = await response.json();
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
      }
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      setAsking(false);
    }

  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              📚 chattingBooks
            </h1>

            <p className="text-sm text-slate-500">
              Chat with your documents
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Online
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* Upload Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📄
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Upload your document
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a PDF or TXT file and ask questions about it.
            </p>
          </div>

          {/* File picker */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <label className="cursor-pointer rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">
              Choose file

              <input
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={(event) => {
                  const selectedFile =
                    event.target.files?.[0];

                  if (selectedFile) {
                    setFile(selectedFile);
                  }
                }}
              />
            </label>

            <p className="text-xs text-slate-400">
              PDF or TXT · Max 10 MB
            </p>
          </div>

          {/* Selected file */}
          {file && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">

              <div className="flex items-center gap-3">
                <div className="text-xl">
                  📄
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={uploadFile}
                disabled={uploading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Processing..."
                  : "Upload"}
              </button>
            </div>
          )}

          {/* Ready state */}
          {documentId && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                ✓
              </div>

              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Ready to chat
                </p>

                <p className="text-xs text-emerald-600">
                  {uploadedFileName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat */}
        {documentId && (
          <div className="mt-8">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Chat
              </h2>

              <p className="text-sm text-slate-500">
                Ask anything about your document.
              </p>
            </div>

            {/* Messages */}
            <div className="space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div className="max-w-2xl">

                    <p
                      className={
                        message.role === "user"
                          ? "mb-1 text-right text-xs font-medium text-slate-400"
                          : "mb-1 text-xs font-medium text-slate-500"
                      }
                    >
                      {message.role === "user"
                        ? "You"
                        : "chattingBooks"}
                    </p>

                    <div
                      className={
                        message.role === "user"
                          ? "rounded-2xl rounded-br-md bg-slate-900 px-5 py-3 text-sm leading-6 text-white"
                          : "rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-700 shadow-sm"
                      }
                    >
                      {message.content}
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Empty chat */}
            {messages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <div className="text-3xl">
                  💬
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  Ask your first question
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  I'll answer using information from your document.
                </p>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                askQuestion();
              }}
              className="sticky bottom-4 mt-6"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50">

                <input
                  type="text"
                  value={question}
                  placeholder="Ask anything about your document..."
                  onChange={(event) => {
                    setQuestion(event.target.value);
                  }}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={
                    asking || !question.trim()
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {asking ? "…" : "➤"}
                </button>

              </div>
            </form>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
