import {
  Upload,
  Search,
  FileText,
  Bot,
  Send,
  Brain,
  Database,
  CheckCircle,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Sidebar from "./Sidebar";
import ChatView from "../views/ChatView";
import remarkGfm from "remark-gfm";
import { useState, useEffect, useRef } from "react";

import "./UploadSection.css";

function UploadSection() {
  const [fileData, setFileData] = useState(null);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);

  const [fileName, setFileName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [documentCount, setDocumentCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [thinking, setThinking] = useState(false);

  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  const [meetingNotes, setMeetingNotes] = useState("");
  const [loadingMeetingNotes, setLoadingMeetingNotes] = useState(false);

  const [researchNotes, setResearchNotes] = useState("");
  const [loadingResearchNotes, setLoadingResearchNotes] = useState(false);

  const [studyNotes, setStudyNotes] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [activeView, setActiveView] = useState("analysis");
  const flashcardRef = useRef(null);

 useEffect(() => {
  console.log("Current Active View:", activeView);

  if (activeView === "flashcards") {
    flashcardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, [activeView]);
  const [aiProvider, setAiProvider] = useState("ollama");

  const [flashcards, setFlashcards] = useState("");
  const [flashcardList, setFlashcardList] = useState([]);

  const [currentCard, setCurrentCard] = useState(0);

  const [showAnswer, setShowAnswer] = useState(false);

  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

  const [questionBank, setQuestionBank] = useState("");
  const [loadingQuestionBank, setLoadingQuestionBank] = useState(false);

  const [faq, setFaq] = useState("");
  const [loadingFaq, setLoadingFaq] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/documents"
      );

      const data = await response.json();

      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

      setDocuments(data.documents || []);
      setDocumentCount(data.count || 0);

    } catch (error) {
      console.log(error);
    }
  };


  const handleFileChange = (event) => {

  const files = Array.from(event.target.files);

  if (files.length === 0) return;

  setSelectedFiles(files);

  setFileName(
    files.map(file => file.name).join(", ")
  );

};

  const handleUpload = async () => {

  if (selectedFiles.length === 0) {
    alert("Please select at least one file.");
    return;
  }

  setUploading(true);

  const formData = new FormData();

  selectedFiles.forEach((file) => {
    formData.append("files", file);
  });

  try {

    const response = await fetch(
      "http://localhost:8000/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.error) {
      alert(data.error);
      setUploading(false);
      return;
    }

    if (data.documents && data.documents.length > 0) {

      setFileData(data.documents[0]);

      setCurrentDocumentId(
        data.documents[0].document_id
      );

    }

    await fetchDocuments();

    alert(`${data.documents.length} document(s) uploaded successfully.`);

    setSelectedFiles([]);
    setFileName("");

  } catch (err) {

    console.log(err);
    alert("Upload Failed");

  }

  setUploading(false);

};

  const handleSearch = async () => {
    if (!searchQuery) return;

    setSearching(true);

    try {
      const response = await fetch(
        `http://localhost:8000/semantic-search?query=${encodeURIComponent(
          searchQuery
        )}`
      );

      const data = await response.json();

      setSearchResult(data);
    } catch (err) {
      console.log(err);
    }

    setSearching(false);
  };


  const handleSummary = async () => {

    if (!currentDocumentId) {
      alert("Please upload a document first.");
      return;
    }

    setSummarizing(true);

    try {
      const response = await fetch(
        "http://localhost:8000/summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_id: currentDocumentId,
            provider: aiProvider,
          }),
        }
      );

      const data = await response.json();

      setSummary(data.summary || "No summary generated.");

      // Automatically open Summary page
      setActiveView("summary");

    } catch (err) {
      console.log(err);
      setSummary("Failed to generate summary.");
    }

    setSummarizing(false);
  };

  const handleStudyNotes = async () => {

    if (!currentDocumentId) {
      alert("Please upload a document first.");
      return;
    }

    setLoadingNotes(true);

    try {

      const response = await fetch(
        "http://localhost:8000/study-notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_id: currentDocumentId,
            provider: aiProvider,
          }),
        }
      );

      const data = await response.json();

      setStudyNotes(
        data.study_notes || "No study notes generated."
      );

      // Automatically open Study Notes page
      setActiveView("notes");

    } catch (err) {

      console.log(err);

      setStudyNotes(
        "Failed to generate study notes."
      );

    }

    setLoadingNotes(false);
  };



 const parseFlashcards = (markdown) => {

  if (!markdown) return [];

  const sections = markdown.split(
    /(?:##+\s*Card|\*\*Card\s*\d+\*\*|Card\s+\d+)/i
  );

  const cards = [];

  sections.slice(1).forEach((section) => {

    let qMatch = section.match(
      /\*\*Q:\*\*\s*([\s\S]*?)\*\*A:\*\*/i
    );

    let aMatch = section.match(
      /\*\*A:\*\*\s*([\s\S]*)/i
    );

    // Support Front / Back format
    if (!qMatch) {

      qMatch = section.match(
        /\*\*Front:\*\*\s*([\s\S]*?)\*\*Back:\*\*/i
      );

      aMatch = section.match(
        /\*\*Back:\*\*\s*([\s\S]*)/i
      );

    }

    if (qMatch && aMatch) {

      cards.push({
        question: qMatch[1].trim(),
        answer: aMatch[1].trim(),
      });

    }

  });

  return cards;

};


  const handleFlashcards = async () => {

    if (!currentDocumentId) {
      alert("Please upload a document first.");
      return;
    }

    setLoadingFlashcards(true);

    try {

      const response = await fetch(
        "http://localhost:8000/flashcards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_id: currentDocumentId,
            provider: aiProvider,
          }),
        }
      );

      const data = await response.json();

      const cards = parseFlashcards(
        data.flashcards || ""
      );

      console.log(JSON.stringify(data.flashcards));
      console.log("Parsed Cards:", cards);

      setFlashcardList(cards);
      setCurrentCard(0);
      setShowAnswer(false);
      console.log("Cards Length:", cards.length);
      console.log("Changing activeView to flashcards");
      if (cards.length > 0) {
    setActiveView("flashcards");
} else {
    alert("Flashcards could not be generated.");
}

    } catch (err) {

      console.log(err);

      setFlashcardList([]);
      setCurrentCard(0);
      setShowAnswer(false);

    }

    setLoadingFlashcards(false);

  };

const handleQuestionBank = async () => {

  if (!currentDocumentId) {
    alert("Please upload a document first.");
    return;
  }

  setLoadingQuestionBank(true);

  try {

    const response = await fetch(
      "http://localhost:8000/question-bank",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: currentDocumentId,
          provider: aiProvider,
        }),
      }
    );

    const data = await response.json();

    console.log("Question Bank Status:", response.status);
    console.log("Question Bank Data:", data);

    setQuestionBank(
      data.question_bank || "No Question Bank generated."
    );

    setActiveView("questionBank");

  } catch (err) {

    console.log("Question Bank Error:", err);

    setQuestionBank("Failed to generate Question Bank.");

  }

  setLoadingQuestionBank(false);

};

const handleFaq = async () => {

  if (!currentDocumentId) {
    alert("Please upload a document first.");
    return;
  }

  setLoadingFaq(true);

  try {

    const response = await fetch(
      "http://localhost:8000/faq",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: currentDocumentId,
          provider: aiProvider,
        }),
      }
    );

    const data = await response.json();

    console.log("FAQ Status:", response.status);
    console.log("FAQ Data:", data);

    setFaq(
      data.faq || "No FAQ generated."
    );

    setActiveView("faq");

  } catch (err) {

    console.log("FAQ Error:", err);

    setFaq("Failed to generate FAQ.");

  }

  setLoadingFaq(false);

};


const handleMeetingNotes = async () => {

  if (!currentDocumentId) {
    alert("Please upload a document first.");
    return;
  }

  setLoadingMeetingNotes(true);

  try {

    const response = await fetch(
      "http://localhost:8000/meeting-notes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: currentDocumentId,
          provider: aiProvider,
        }),
      }
    );

    const data = await response.json();

    console.log("Meeting Notes Status:", response.status);
    console.log("Meeting Notes Data:", data);

    setMeetingNotes(
      data.meeting_notes || "No Meeting Notes generated."
    );

    setActiveView("meetingNotes");

  } catch (err) {

    console.log("Meeting Notes Error:", err);

    setMeetingNotes("Failed to generate Meeting Notes.");

  }

  setLoadingMeetingNotes(false);

};

const handleResearchNotes = async () => {

  if (!currentDocumentId) {
    alert("Please upload a document first.");
    return;
  }

  setLoadingResearchNotes(true);

  try {

    const response = await fetch(
      "http://localhost:8000/research-notes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: currentDocumentId,
          provider: aiProvider,
        }),
      }
    );

    const data = await response.json();

    console.log("Research Notes Status:", response.status);
    console.log("Research Notes Data:", data);

    setResearchNotes(
      data.research_notes || "No Research Notes generated."
    );

    setActiveView("researchNotes");

  } catch (err) {

    console.log("Research Notes Error:", err);

    setResearchNotes("Failed to generate Research Notes.");

  }

  setLoadingResearchNotes(false);

};

const handleDeleteDocument = async (documentId) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this document?"
  );

  if (!confirmDelete) return;

  try {

    const response = await fetch(
      `http://localhost:8000/document/${documentId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    alert(data.message);

    fetchDocuments();

    if (currentDocumentId === documentId) {
      setCurrentDocumentId(null);
    }

  } catch (error) {
    console.error(error);
    alert("Failed to delete document.");
  }
};

const handleDownloadDocument = (documentId) => {

  window.open(
    `http://localhost:8000/download/${documentId}`,
    "_blank"
  );

};


const exportPDF = async () => {

  if (!summary) {
    alert("Generate summary first.");
    return;
  }

  const response = await fetch(
    "http://localhost:8000/export/pdf",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: summary,
      }),
    }
  );

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "Summary.pdf";

  a.click();

};



const exportDOCX = async () => {

  if (!summary) {
    alert("Generate summary first.");
    return;
  }

  const response = await fetch(
    "http://localhost:8000/export/docx",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: summary,
      }),
    }
  );

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "Summary.docx";

  a.click();

};


  return (
    <section className="upload-container">

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "25px",
          alignItems: "start",
        }}
      >

        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <div>

          {/* ================= Upload ================= */}

          <div className="upload-card">

            <div className="card-header">

              <div className="card-icon">
                <Upload size={24} />
              </div>

              <div>
                <h2>Upload Document</h2>
                <p>Upload PDFs or Images for AI Analysis</p>
              </div>

            </div>

            <input
  type="file"
  multiple
  accept=".pdf,.png,.jpg,.jpeg"
  onChange={handleFileChange}
/>
{fileName && (
  <div className="selected-file">

    <CheckCircle size={18} />

    <span>
      {selectedFiles.length} file(s) selected
    </span>

    <br />

    <small>{fileName}</small>

  </div>
)}

            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={uploading}
            >

              {uploading ? (
                <>
                  <Loader2
                    className="spin"
                    size={18}
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Document
                </>
              )}

            </button>

          </div>



          {activeView === "documents" && (
            <div className="documents-card">

              <div className="card-header">

                <div className="card-icon">

                  <Database size={24} />

                </div>

                <div>

                  <h3>Knowledge Base</h3>

                  <p>Your uploaded documents</p>

                </div>

              </div>

              <div className="stats-box">

                <h1>{documentCount}</h1>

                <span>Total Documents</span>

              </div>

              <ul className="documents-list">

                {documents.length === 0 ? (

                  <li>No Documents Uploaded</li>

                ) : (

                  documents.map((doc) => (

  <li
    key={doc.document_id}
    onClick={() => {

      setCurrentDocumentId(doc.document_id);

      alert(`Selected: ${doc.filename}`);

    }}
    style={{
      cursor: "pointer",
      border:
        currentDocumentId === doc.document_id
          ? "2px solid #2563eb"
          : "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      marginBottom: "10px",
    }}
  >

    <FileText size={16} />

    <div>

  <strong>{doc.filename}</strong>

  <br />

  <small>
    {doc.file_type.toUpperCase()} • {doc.chunks} Chunks
  </small>

</div>

<button
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteDocument(doc.document_id);
  }}
  style={{
    marginTop: "8px",
    padding: "5px 10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Delete
</button>

<div>

  <strong>{doc.filename}</strong>

  <br />

  <small>
    {doc.file_type.toUpperCase()} • {doc.chunks} Chunks
  </small>

</div>

<button
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteDocument(doc.document_id);
  }}
>
  Delete
</button>

<button
  onClick={(e) => {
    e.stopPropagation();
    handleDownloadDocument(doc.document_id);
  }}
>
  Download
</button>

</li>

))

                )}

              </ul>

            </div>
          )}



          <div className="provider-card">

            <label>🤖 AI Provider</label>

            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
            >
              <option value="ollama">🟢 Ollama (Local)</option>
              <option value="gemini">🟣 Gemini (Cloud)</option>
            </select>

          </div>


          {/* ================= File Analysis ================= */}

          {(activeView === "analysis" ||
            activeView === "summary" ||
            activeView === "notes") &&
            fileData && (

              <div className="analysis-card">

                <div className="card-header">

                  <div className="card-icon">

                    <Brain size={24} />

                  </div>

                  <div>

                    <h3>AI File Analysis</h3>

                    <p>Generated after upload</p>

                  </div>

                </div>

                <div className="analysis-grid">

                  <div>

                    <strong>Filename</strong>

                    <p>{fileData.filename}</p>

                  </div>

                  <div>

                    <strong>Pages</strong>

                    <p>{fileData.pages}</p>

                  </div>

                  <div>

                    <strong>Chunks</strong>

                    <p>{fileData.chunks}</p>

                  </div>

                </div>

                <div className="preview-box">

                  <strong>Preview</strong>

                  <p>{fileData.preview}</p>

                </div>

                <button
                  className="upload-btn"
                  onClick={handleSummary}
                  disabled={summarizing}
                >
                  {summarizing ? (
                    <>
                      <Loader2 className="spin" size={18} />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Generate Summary
                    </>
                  )}
                </button>

                <button
                  className="upload-btn"
                  onClick={handleFlashcards}
                  disabled={loadingFlashcards}
                >
                  {loadingFlashcards ? (
                    <>
                      <Loader2
                        className="spin"
                        size={18}
                      />
                      Generating Flashcards...
                    </>
                  ) : (
                    <>
                      📚 Generate Flashcards
                    </>
                  )}
                </button>

                <button
  className="upload-btn"
  onClick={handleQuestionBank}
  disabled={loadingQuestionBank}
>
  {loadingQuestionBank ? (
    <>
      <Loader2
        className="spin"
        size={18}
      />
      Generating Question Bank...
    </>
  ) : (
    <>
      📘 Generate Question Bank
    </>
  )}
</button>

<button
  className="upload-btn"
  onClick={handleFaq}
  disabled={loadingFaq}
>
  {loadingFaq ? "Generating FAQ..." : "Generate FAQ"}
</button>

<button
  className="upload-btn"
  onClick={handleMeetingNotes}
  disabled={loadingMeetingNotes}
>
  {loadingMeetingNotes
    ? "Generating Meeting Notes..."
    : "Generate Meeting Notes"}
</button>

<button
  className="upload-btn"
  onClick={handleResearchNotes}
  disabled={loadingResearchNotes}
>
  {loadingResearchNotes
    ? "Generating Research Notes..."
    : "Generate Research Notes"}
</button>



                <button
                  className="upload-btn"
                  onClick={handleStudyNotes}
                  disabled={loadingNotes}
                >
                  {loadingNotes ? (
                    <>
                      <Loader2 className="spin" size={18} />
                      Generating Study Notes...
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Generate Study Notes
                    </>
                  )}
                </button>

                {activeView === "summary" && summary && (
                  <div className="preview-box" style={{ marginTop: "20px" }}>
                    <strong>AI Summary</strong>
                    <div
                      className="markdown-output"
                      style={{ lineHeight: "1.8" }}
                    >
                      <ReactMarkdown>
                        {summary}
                      </ReactMarkdown>
                    </div>
                    <div style={{ marginTop: "20px" }}>

  <button
    className="upload-btn"
    onClick={exportPDF}
  >
    📄 Export PDF
  </button>

  <button
    className="upload-btn"
    onClick={exportDOCX}
    style={{ marginTop: "10px" }}
  >
    📝 Export DOCX
  </button>

</div>
                  </div>
                )}

                {activeView === "notes" && studyNotes && (
                  <div className="preview-box" style={{ marginTop: "20px" }}>
                    <strong>📘 Study Notes</strong>

                    <div className="markdown-output">
                      <ReactMarkdown>
                        {studyNotes}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

              </div>

            )}



          {/* ================= Semantic Search ================= */}

          {activeView === "search" && (
            <div className="search-card">

              <div className="card-header">

                <div className="card-icon">

                  <Search size={24} />

                </div>

                <div>

                  <h3>Semantic Search</h3>

                  <p>Search using AI Embeddings</p>

                </div>

              </div>

              <div className="search-input">

                <input
                  type="text"
                  placeholder="Search your documents..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                />

                <button
                  className="search-btn"
                  onClick={handleSearch}
                >

                  {searching ? (

                    <Loader2
                      className="spin"
                      size={18}
                    />

                  ) : (

                    <Search size={18} />

                  )}

                </button>

              </div>

              {searchResult && (

                <div className="result-box">

                  <h4>

                    Results for :

                    <span> {searchResult.query}</span>

                  </h4>

                  {searchResult.results.length === 0 ? (

                    <p>No results found.</p>

                  ) : (

                    searchResult.results.map((item, index) => (

                      <div
                        className="result-item"
                        key={index}
                      >

                        {item}

                      </div>

                    ))

                  )}

                </div>

              )}

            </div>
          )}


          {activeView === "flashcards" && flashcardList.length > 0 && (

            <div
  className="summary-card"
  ref={flashcardRef}
>

              <div className="card-header">

                <div className="card-icon">
                  📚
                </div>

                <div>
                  <h3>Flashcards</h3>
                  <h4>
📖 Card {currentCard + 1} / {flashcardList.length}
</h4>
                  <div className="progress-bar">
  <div
    className="progress-fill"
    style={{
      width: `${((currentCard + 1) / flashcardList.length) * 100}%`,
    }}
  />
</div>
                </div>

              </div>

              

              <div className="flashcard">

                <h2>🧠 Question</h2>

                <p>{flashcardList[currentCard].question}</p>
                <button
                  className="primary-btn"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? "🙈 Hide Answer" : "👁 Show Answer"}
                </button>
                {showAnswer && (
                  <>
                    <hr />

                    <h2>✅ Answer</h2>

                    <p>{flashcardList[currentCard].answer}</p>
                  </>
                )}
                <div className="flashcard-navigation">

                  <button
                    className="secondary-btn"
                    disabled={currentCard === 0}
                    onClick={() => {
                      setCurrentCard(currentCard - 1);
                      setShowAnswer(false);
                    }}
                  >
                    ⬅ Previous
                  </button>

                  <button
                    className="primary-btn"
                    disabled={currentCard === flashcardList.length - 1}
                    onClick={() => {
                      setCurrentCard(currentCard + 1);
                      setShowAnswer(false);
                    }}
                  >
                    Next ➡
                  </button>

                </div>

              </div>

              </div>

 )}

           

          {activeView === "questionBank" && (
            <div className="summary-card">

              <div className="card-header">
                <div className="card-icon">
                  📘
                </div>

                <div>
                  <h3>Question Bank</h3>
                  <p>AI Generated Questions</p>
                </div>
              </div>

              {loadingQuestionBank ? (

                <p>Generating Question Bank...</p>

              ) : (

                <div
                  className="summary-content"
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.8",
                  }}
                >
                  {questionBank}
                </div>

              )}

            </div>
          )}

          {activeView === "faq" && (
  <div className="analysis-result">
    <h2>❓ Frequently Asked Questions</h2>

    <div
      style={{
        whiteSpace: "pre-wrap",
        lineHeight: "1.8",
      }}
    >
      {faq}
    </div>
  </div>
)}

{activeView === "meetingNotes" && (
  <div className="analysis-result">
    <h2>📝 Meeting Notes</h2>

    <div
      style={{
        whiteSpace: "pre-wrap",
        lineHeight: "1.8",
      }}
    >
      {meetingNotes}
    </div>
  </div>
)}


{activeView === "researchNotes" && (
  <div className="analysis-result">
    <h2>🔬 Research Notes</h2>

    <div
      style={{
        whiteSpace: "pre-wrap",
        lineHeight: "1.8",
      }}
    >
      {researchNotes}
    </div>
  </div>
)}


              {/* ================= AI Chat ================= */}

              {/* {activeView === "chat" && (
    <div className="chat-card">

      <div className="card-header">

        <div className="card-icon">

          <Bot size={24} />

        </div>

        <div>

          <h2>IntelliDoc AI</h2>

          <p>Chat with your uploaded documents</p>

        </div>

      </div>

      <div className="chat-window">

        {messages.length === 0 && (

          <div className="empty-chat">

            Start asking questions about your document.

          </div>

        )}

        {messages.map((msg, index) => (

          <div
            key={index}
            className={
              msg.role === "user"
                ? "user-message"
                : "ai-message"
            }
          >

            <strong>

              {msg.role === "user"

                ? "You"

                : "IntelliDoc AI"}

            </strong>

           <div className="markdown-output">
  <ReactMarkdown>
    {msg.content}
  </ReactMarkdown>
</div>

          </div>

        ))}

        {thinking && (

          <div className="ai-message">

            <Loader2
              className="spin"
              size={18}
            />

            Thinking...

          </div>

        )}

      </div>

      <div className="chat-input">

        <input
          type="text"
          placeholder="Ask anything..."
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
        />

        <button
          className="chat-btn"
          onClick={askQuestion}
        >

          <Send size={18} />

        </button>

      </div>

    </div>
    )} */}

              {activeView === "chat" && (
                <ChatView
                  messages={messages}
                  thinking={thinking}
                  question={question}
                  setQuestion={setQuestion}
                  askQuestion={askQuestion}
                />
              )}
            </div>   {/* Content Container */}

        </div>     {/* Grid Container */}

    </section>
  );
}

export default UploadSection;


