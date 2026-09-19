import { useState } from "react";

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
        "http://localhost:3000/documents/upload",
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
        "http://localhost:3000/chat",
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
    <div>
      <h1>RAG Chatbot</h1>

      <input
        type="file"
        accept=".pdf,.txt"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];

          if (selectedFile) {
            setFile(selectedFile);
          }
        }}
      />

      {file && (
        <div>
          <p>Selected: {file.name}</p>

          <button
            onClick={uploadFile}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {documentId && (
        <div>
          <p>Document is ready for questioning!</p>
          <p>File Name: {uploadedFileName}</p>
        </div>
      )}

      {documentId && (
        <div>
          <h2>Chat</h2>

          <div>
            {messages.map((message) => (
              <div key={message.id}>
                <strong>
                  {message.role === "user" ? "You" : "AI"}
                </strong>

                <p>{message.content}</p>
              </div>
            ))}
          </div>
          <div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                askQuestion();
              }}
            >
              <input
                type="text"
                value={question}
                placeholder="Ask anything about your document..."
                onChange={(event) => {
                  setQuestion(event.target.value);
                }}
              />

              <button
                disabled={asking || !question.trim()}
                onClick={askQuestion}
              >
                {asking ? "Thinking..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )
      }

    </div >


  );
}

export default App;
