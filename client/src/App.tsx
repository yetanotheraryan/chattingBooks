import { useState } from "react";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

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

      console.log(data);
    }catch(error) {
      console.error("Error uploading file:", error);
    }
    finally {
      setUploading(false);
    }
  };

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
    </div>
  );
}

export default App;
