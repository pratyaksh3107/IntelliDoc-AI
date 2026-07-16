import { useState, useEffect } from "react";

function UploadSection() {
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [documentCount, setDocumentCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
  const response = await fetch(
    "http://localhost:8000/documents"
  );

  const data = await response.json();

  setDocuments(data.documents);
  setDocumentCount(data.count);
};

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(
      "http://localhost:8000/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    setPdfData(data);

    await fetchDocuments();
  };

const handleSearch = async () => {
  if (!searchQuery) {
    alert("Please enter a search term");
    return;
  }

  const response = await fetch(
    `http://localhost:8000/semantic-search?query=${encodeURIComponent(searchQuery)}`
  );

  const data = await response.json();

  setSearchResult(data);
};

const askQuestion = async () => {
  if (!question) {
    alert("Please enter a question");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8000/ask?question=${encodeURIComponent(question)}`
    );

    const data = await response.json();

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: question,
      },
      {
        role: "assistant",
        content: data.answer,
      },
    ]);

    setQuestion("");
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div>
      <h2>Upload PDF</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />

      <p>Selected File: {fileName}</p>

      <button onClick={handleUpload}>
        Upload PDF
      </button>

      <hr />

      <h3>Uploaded Documents</h3>

      <p>Total Documents: {documentCount}</p>

      <ul>
        {documents.map((doc, index) => (
          <li key={index}>{doc}</li>
        ))}
      </ul>

      {pdfData && (
        <div>
          <h3>PDF Analysis</h3>

          <p>
            <strong>Filename:</strong> {pdfData.filename}
          </p>

          <p>
            <strong>Pages:</strong> {pdfData.pages}
          </p>

          <p>
            <strong>Chunks:</strong> {pdfData.chunks}
          </p>

          <p>
            <strong>Preview:</strong>
          </p>

          <p>{pdfData.preview}</p>
        </div>
      )}

      <hr />

      <h3>Semantic Search</h3>

      <input
        type="text"
        placeholder="Enter search query..."
        value={searchQuery}
        onChange={(e) =>
          setSearchQuery(e.target.value)
        }
      />

      <button onClick={handleSearch}>
        Search
      </button>

      {searchResult && (
        <div>
          <h3>Search Results</h3>

          <p>
            <strong>Query:</strong> {searchResult.query}
          </p>

          {searchResult.results.map(
            (result, index) => (
              <div key={index}>
                <p>{result}</p>
                <hr />
              </div>
            )
          )}
        </div>
      )}

      <hr />

      <h2>IntelliDoc AI Chat</h2>

      <input
        type="text"
        placeholder="Ask a question about your documents..."
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
      />

      <button onClick={askQuestion}>
        Ask AI
      </button>

      <br />
      <br />

      {messages.map((msg, index) => (
        <div key={index}>
          <strong>
            {msg.role === "user"
              ? "You"
              : "AI"}
            :
          </strong>

          <p>{msg.content}</p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default UploadSection;