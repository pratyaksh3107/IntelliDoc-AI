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
  HelpCircle,
} from "lucide-react";
import { BASE_URL, api } from "../api/client";
import ReactMarkdown from "react-markdown";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RightPanel from "./RightPanel";
import OverviewView from "../views/OverviewView";
import GlobalAIView from "../views/GlobalAIView";
import ChatView from "../views/ChatView";
import remarkGfm from "remark-gfm";
import { useState, useEffect, useRef } from "react";

import "./UploadSection.css";

function UploadSection() {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
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
  const [activeView, setActiveView] = useState("overview");
  const flashcardRef = useRef(null);

  const [selectedCompareDocs, setSelectedCompareDocs] = useState([]);

  const [comparison, setComparison] = useState("");
  const [loadingComparison, setLoadingComparison] = useState(false);

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

  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSelectDocument = (doc) => {
    setCurrentDocumentId(doc.document_id);
    setUploadedDocuments([
      {
        document_id: doc.document_id,
        filename: doc.filename,
        pages: doc.pages || "N/A",
        chunks: doc.chunks || 0,
        preview: doc.preview || `Document "${doc.filename}" selected from Knowledge Base.`,
      },
    ]);
    showToast(`Opened "${doc.filename}" from Document Library`, "success");
  };

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();

      console.log("Response Data:", data);

      const fetchedDocs = data.documents || [];
      setDocuments(fetchedDocs);
      setDocumentCount(data.count || 0);

      // Startup auto-selection disabled as requested

    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteDocument = (documentId) => {
    const docToDelete = documents.find((d) => d.document_id === documentId);
    const docName = docToDelete ? docToDelete.filename : "this document";

    setConfirmModal({
      isOpen: true,
      title: "Delete Document",
      message: `Are you sure you want to delete "${docName}" from your library? This action cannot be undone.`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const data = await api.deleteDocument(documentId);
          showToast(data.message || "Document deleted successfully.", "success");
          setDocuments((prev) => prev.filter((d) => d.document_id !== documentId));
          setDocumentCount((prev) => Math.max(0, prev - 1));
          if (currentDocumentId === documentId) {
            setCurrentDocumentId(null);
            setUploadedDocuments([]);
          }
        } catch (error) {
          console.error(error);
          showToast(error.message || "Error deleting document.", "error");
        }
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleDownloadDocument = (documentId) => {
    window.open(api.getDownloadUrl(documentId), "_blank");
    showToast("Starting document download...", "info");
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setSelectedFiles(files);
    setFileName(files.map((file) => file.name).join(", "));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showToast("Please select at least one file.", "error");
      return;
    }

    // Check for duplicate uploads
    const existingDoc = documents.find((doc) =>
      selectedFiles.some(
        (file) => doc.filename.toLowerCase() === file.name.toLowerCase()
      )
    );

    if (existingDoc) {
      setConfirmModal({
        isOpen: true,
        title: "Document Already Exists",
        message: `"${existingDoc.filename}" is already in your Document Library. Would you like to re-upload and overwrite it, or open the existing document?`,
        confirmText: "Re-upload & Overwrite",
        isDanger: false,
        onConfirm: () => {
          setConfirmModal(null);
          executeUpload();
        },
        onCancel: () => {
          setConfirmModal(null);
          handleSelectDocument(existingDoc);
          setSelectedFiles([]);
          setFileName("");
          setActiveView("analysis");
        },
      });
      return;
    }

    executeUpload();
  };

  const executeUpload = async () => {
    setUploading(true);

    try {
      const data = await api.uploadFiles(selectedFiles);

      if (data.error) {
        showToast(data.error, "error");
        setUploading(false);
        return;
      }

      if (data.documents && data.documents.length > 0) {
        const newDocs = data.documents;
        setUploadedDocuments(newDocs);
        setCurrentDocumentId(newDocs[0].document_id);

        // Incremental state mutation: append newly uploaded files to state without full refresh
        setDocuments((prev) => {
          const newDocIds = new Set(newDocs.map((d) => d.document_id));
          const filteredPrev = prev.filter((d) => !newDocIds.has(d.document_id));
          return [...newDocs, ...filteredPrev];
        });
        setDocumentCount((prev) => prev + newDocs.length);
      }

      showToast(`${data.documents.length} document(s) indexed successfully into Knowledge Base.`, "success");

      setSelectedFiles([]);
      setFileName("");
    } catch (err) {
      console.log(err);
      showToast("Upload Failed", "error");
    }

    setUploading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    setSearching(true);

    try {
      const data = await api.semanticSearch(searchQuery);
      setSearchResult(data);
    } catch (err) {
      console.log(err);
    }

    setSearching(false);
  };


  const askQuestion = async () => {

    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    if (!currentDocumentId) {
      alert("Please select or upload a document first.");
      return;
    }

    setThinking(true);

    const userMessage = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {

      const data = await api.askQuestion(question, currentDocumentId, aiProvider);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "No answer found.",
        },
      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);

    }

    setQuestion("");
    setThinking(false);

  };


  const handleSummary = async () => {

    if (!currentDocumentId) {
      alert("Please upload a document first.");
      return;
    }

    setSummarizing(true);

    try {
      const data = await api.getSummary(currentDocumentId, aiProvider);
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

      const data = await api.getStudyNotes(currentDocumentId, aiProvider);

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

      const data = await api.getFlashcards(currentDocumentId, aiProvider);

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

      const data = await api.getQuestionBank(currentDocumentId, aiProvider);

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

      const data = await api.getFaq(currentDocumentId, aiProvider);

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

      const data = await api.getMeetingNotes(currentDocumentId, aiProvider);

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

      const data = await api.getResearchNotes(currentDocumentId, aiProvider);

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

  const handleCompareDocuments = async () => {
    if (selectedCompareDocs.length !== 2) {
      alert("Please select exactly 2 documents.");
      return;
    }

    setLoadingComparison(true);

    try {
      const data = await api.compareDocuments(selectedCompareDocs[0], selectedCompareDocs[1], aiProvider);
      console.log("Comparison:", data);
      setComparison(data.comparison || "No comparison generated.");
      setActiveView("comparison");
    } catch (error) {
      console.error(error);
      alert("Comparison failed.");
    } finally {
      setLoadingComparison(false);
    }
  };


  const exportPDF = async () => {

    if (!summary) {
      alert("Generate summary first.");
      return;
    }

    const response = await fetch(
      `${BASE_URL}/export/pdf`,
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
      `${BASE_URL}/export/docx`,
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

  console.log("Documents State:", documents);

  return (
    <div className="app-main-layout">
      <Header
        documents={documents}
        currentDocumentId={currentDocumentId}
        onSelectDocument={handleSelectDocument}
        aiProvider={aiProvider}
        setAiProvider={setAiProvider}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenUploadModal={() => {
          setActiveView("analysis");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <div className="app-body-grid">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          documentCount={documentCount}
        />

        <main className="app-workspace-area">
          {activeView === "overview" && (
            <OverviewView
              documentCount={documentCount}
              totalChunks={documents.reduce((acc, d) => acc + (d.chunks || 0), 0)}
              onNavigate={setActiveView}
            />
          )}

          {activeView === "globalAI" && (
            <GlobalAIView
              documents={documents}
              currentDocumentId={currentDocumentId}
              setCurrentDocumentId={(id) => {
                const doc = documents.find((d) => d.document_id === id);
                if (doc) handleSelectDocument(doc);
              }}
              aiProvider={aiProvider}
              showToast={showToast}
            />
          )}

          {/* ================= Upload ================= */}

          {activeView === "analysis" && (
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
          )}



          {activeView === "documents" && (
            <div className="card">
              <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="doc-library-icon-box">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Document Library</h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                      Manage and review all indexed PDF documents in your knowledge base.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView("analysis")}
                  style={{
                    background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.6rem 1.1rem",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                  }}
                >
                  <Upload size={16} /> Upload New PDF
                </button>
              </div>

              <div className="doc-library-grid">
                {documents.length === 0 ? (
                  <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "1rem", width: "100%", gridColumn: "1 / -1" }}>
                    <div style={{
                      background: "rgba(18, 22, 36, 0.75)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "20px",
                      padding: "3.5rem 2.5rem",
                      textAlign: "center",
                      width: "380px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1.25rem",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                    }}>
                      <div style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        width: "68px",
                        height: "68px",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b"
                      }}>
                        <FileText size={32} />
                      </div>
                      <div>
                        <h3 style={{ color: "#f8fafc", fontSize: "1.25rem", fontWeight: "700", margin: "0 0 0.5rem" }}>Your Library is Empty</h3>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5", margin: 0 }}>
                          Upload a PDF document to begin interacting with IntelliDoc AI.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  documents.map((doc) => {
                    const isSelected = currentDocumentId === doc.document_id;
                    return (
                      <div
                        key={doc.document_id}
                        className={`doc-library-card ${isSelected ? "selected-card" : ""}`}
                        onClick={() => {
                          handleSelectDocument(doc);
                        }}
                      >
                        <div className="doc-library-top">
                          <div className="doc-library-icon-box">
                            <FileText size={20} />
                          </div>
                          <div className="doc-library-actions">
                            <button
                              className="doc-action-btn"
                              title="Download PDF"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(api.getDownloadUrl(doc.document_id), "_blank");
                              }}
                            >
                              ↓
                            </button>
                            <button
                              className="doc-action-btn delete-btn"
                              title="Delete Document"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc.document_id);
                              }}
                            >
                              🗑
                            </button>
                          </div>
                        </div>

                        <div className="doc-library-content">
                          <div className="doc-library-filename" title={doc.filename}>
                            {doc.filename}
                          </div>
                          <div className="doc-library-date">
                            {doc.upload_date || "2026-07-19 23:53:49"}
                          </div>
                        </div>

                        <div className="doc-library-footer">
                          <span className="doc-chunk-pill">
                            {doc.chunks || 0} Chunks
                          </span>
                          {isSelected && (
                            <span className="doc-selected-pill">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}


          {/* ================= File Analysis ================= */}

          {(activeView === "analysis" ||
            activeView === "summary" ||
            activeView === "notes") &&
            uploadedDocuments.length > 0 && (

              <>
                {selectedCompareDocs.length === 2 && (
                  <button
                    className="compare-btn"
                    onClick={handleCompareDocuments}
                    disabled={loadingComparison}
                  >
                    {loadingComparison ? "Comparing..." : "📄 Compare Documents"}
                  </button>
                )}

                {uploadedDocuments.map((fileData) => (
                  <div
                    key={fileData.document_id}
                    className="analysis-card">

                    <div className="card-header">

                      <div className="card-icon">
                        <Brain size={24} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3>AI File Analysis</h3>
                        <p>Generated after upload</p>
                      </div>

                      <input
                        type="checkbox"
                        checked={selectedCompareDocs.includes(fileData.document_id)}
                        onChange={(e) => {
                          if (e.target.checked) {

                            if (selectedCompareDocs.length >= 2) {
                              alert("You can compare only 2 documents.");
                              return;
                            }

                            setSelectedCompareDocs([
                              ...selectedCompareDocs,
                              fileData.document_id,
                            ]);

                          } else {

                            setSelectedCompareDocs(
                              selectedCompareDocs.filter(
                                (id) => id !== fileData.document_id
                              )
                            );

                          }
                        }}
                      />

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

                      <p>{fileData.preview || "No Preview Available"}</p>

                    </div>

                    <button
                      className="upload-btn"
                      onClick={() => {
                        setCurrentDocumentId(fileData.document_id);
                        handleSummary();
                      }}

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
                      onClick={() => {
                        setCurrentDocumentId(fileData.document_id);
                        handleFlashcards();
                      }}
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
                      onClick={() => {
                        setCurrentDocumentId(fileData.document_id);
                        handleQuestionBank();
                      }}
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
                      onClick={() => {
                        setCurrentDocumentId(fileData.document_id);
                        handleFaq();
                      }}
                      disabled={loadingFaq}
                    >
                      {loadingFaq ? "Generating FAQ..." : "Generate FAQ"}
                    </button>

                    <button
                      className="upload-btn"
                      onClick={() => {
                        setCurrentDocumentId(fileData.document_id);
                        handleMeetingNotes();
                      }}
                      disabled={loadingMeetingNotes}
                    >
                      {loadingMeetingNotes
                        ? "Generating Meeting Notes..."
                        : "Generate Meeting Notes"}
                    </button>

                    <button
                      className="upload-btn"
                      onClick={() => {
                        setCurrentDocumentId(fileData.document_id);
                        handleResearchNotes();
                      }}
                      disabled={loadingResearchNotes}
                    >
                      {loadingResearchNotes
                        ? "Generating Research Notes..."
                        : "Generate Research Notes"}
                    </button>



                    <button
                      className="upload-btn"
                      onClick={() => {
                        setCurrentDocumentId(fileData.document_id);
                        handleStudyNotes();
                      }}
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

                ))}
              </>
            )}



          {/* ================= Semantic Search ================= */}

          {(activeView === "search" || activeView === "keywordSearch") && (
            <div className="card">
              <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="doc-library-icon-box">
                    <Search size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                      {activeView === "search" ? "Semantic Knowledge Search" : "Keyword Knowledge Search"}
                    </h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                      {activeView === "search"
                        ? "Query ChromaDB vector database directly to locate exact text passages."
                        : "Exact keyword matching across your indexed PDF documents."}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                gap: "0.75rem",
                background: "rgba(18, 22, 36, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "0.5rem 0.5rem 0.5rem 1rem",
                alignItems: "center",
                margin: "1.25rem 0 1.5rem"
              }}>
                <Search size={18} color="#94a3b8" />
                <input
                  type="text"
                  placeholder={activeView === "search" ? "Query ChromaDB vector database directly to locate exact text passages..." : "Enter keyword or phrase to search across documents..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#f8fafc",
                    fontSize: "0.95rem",
                    width: "100%",
                    outline: "none"
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.6rem 1.4rem",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                  }}
                >
                  {searching ? <Loader2 className="spin" size={16} /> : null}
                  Search
                </button>
              </div>

              {searchResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 0.5rem" }}>
                    Search Results ({searchResult.results.length} matching passages)
                  </h3>
                  {searchResult.results.length === 0 ? (
                    <p style={{ color: "#94a3b8" }}>No matching text passages found.</p>
                  ) : (
                    searchResult.results.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          background: "rgba(18, 22, 36, 0.75)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "16px",
                          padding: "1.25rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600" }}>
                            Passage #{index + 1}
                          </span>
                          <span className="doc-chunk-pill">
                            {activeView === "search" ? "Similarity Match" : "Keyword Match"}
                          </span>
                        </div>
                        <div style={{ color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.6" }}>
                          {item}
                        </div>
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
            <div className="card">
              <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="doc-library-icon-box">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>FAQ Generator</h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                      Automatically generate frequently asked questions and answers from your document.
                    </p>
                  </div>
                </div>
                {currentDocumentId && (
                  <button
                    onClick={handleFaq}
                    disabled={loadingFaq}
                    style={{
                      background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.6rem 1.1rem",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                    }}
                  >
                    {loadingFaq ? <Loader2 className="spin" size={16} /> : <HelpCircle size={16} />}
                    {loadingFaq ? "Generating..." : "Generate FAQs"}
                  </button>
                )}
              </div>

              {faq ? (
                <div className="markdown-output" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#e2e8f0", marginTop: "1rem" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{faq}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ color: "#94a3b8", padding: "2rem 0", textAlign: "center" }}>
                  {currentDocumentId
                    ? "Click 'Generate FAQs' above to extract key questions from the active document."
                    : "No Document Selected. Please select a document from the top dropdown or upload a PDF first."}
                </div>
              )}
            </div>
          )}

          {activeView === "meetingNotes" && (
            <div className="card">
              <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="doc-library-icon-box">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Meeting Notes</h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                      Extract action items, key decisions, and executive meeting notes.
                    </p>
                  </div>
                </div>
                {currentDocumentId && (
                  <button
                    onClick={handleMeetingNotes}
                    disabled={loadingMeetingNotes}
                    style={{
                      background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.6rem 1.1rem",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                    }}
                  >
                    {loadingMeetingNotes ? <Loader2 className="spin" size={16} /> : <FileText size={16} />}
                    {loadingMeetingNotes ? "Generating..." : "Generate Meeting Notes"}
                  </button>
                )}
              </div>

              {meetingNotes ? (
                <div className="markdown-output" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#e2e8f0", marginTop: "1rem" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{meetingNotes}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ color: "#94a3b8", padding: "2rem 0", textAlign: "center" }}>
                  {currentDocumentId
                    ? "Click 'Generate Meeting Notes' above to extract action items."
                    : "No Document Selected. Please select a document from the top dropdown or upload a PDF first."}
                </div>
              )}
            </div>
          )}

          {activeView === "researchNotes" && (
            <div className="card">
              <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="doc-library-icon-box">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Research Notes</h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                      Generate comprehensive academic and technical research notes.
                    </p>
                  </div>
                </div>
                {currentDocumentId && (
                  <button
                    onClick={handleResearchNotes}
                    disabled={loadingResearchNotes}
                    style={{
                      background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.6rem 1.1rem",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                    }}
                  >
                    {loadingResearchNotes ? <Loader2 className="spin" size={16} /> : <Brain size={16} />}
                    {loadingResearchNotes ? "Generating..." : "Generate Research Notes"}
                  </button>
                )}
              </div>

              {researchNotes ? (
                <div className="markdown-output" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#e2e8f0", marginTop: "1rem" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{researchNotes}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ color: "#94a3b8", padding: "2rem 0", textAlign: "center" }}>
                  {currentDocumentId
                    ? "Click 'Generate Research Notes' above to analyze document methodology & findings."
                    : "No Document Selected. Please select a document from the top dropdown or upload a PDF first."}
                </div>
              )}
            </div>
          )}


          {activeView === "comparison" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
              {/* Top Selection Card */}
              <div className="card">
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div className="doc-library-icon-box">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Multi-Document Comparison</h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                      Compare two documents side-by-side to highlight similarities, differences, and unique topics.
                    </p>
                  </div>
                </div>

                <div style={{ color: "#f8fafc", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                  Select Two Documents to Compare:
                </div>

                <div className="compare-docs-container">
                  {documents.length === 0 ? (
                    <div style={{ color: "#94a3b8", padding: "1rem 0" }}>Please upload documents first in Library.</div>
                  ) : (
                    documents.map((doc) => {
                      const isSelected = selectedCompareDocs.includes(doc.document_id);
                      return (
                        <div
                          key={doc.document_id}
                          className={`compare-doc-pill ${isSelected ? "active" : ""}`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCompareDocs(selectedCompareDocs.filter((id) => id !== doc.document_id));
                            } else {
                              if (selectedCompareDocs.length < 2) {
                                setSelectedCompareDocs([...selectedCompareDocs, doc.document_id]);
                              } else {
                                alert("Please select exactly 2 documents to compare.");
                              }
                            }
                          }}
                        >
                          <FileText size={16} />
                          <span>{doc.filename}</span>
                          {isSelected && <CheckCircle size={16} color="#818cf8" />}
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  className="compare-run-btn"
                  onClick={handleCompareDocuments}
                  disabled={loadingComparison || selectedCompareDocs.length !== 2}
                >
                  {loadingComparison ? (
                    <>
                      <Loader2 className="spin" size={18} /> Generating Comparison...
                    </>
                  ) : (
                    <>
                      <span>⇄</span> Run Side-by-Side Comparison
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Report Card */}
              {(comparison || loadingComparison) && (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span className="comparison-report-badge">
                      Comparison Report
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          color: "#94a3b8",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "8px",
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(comparison);
                          showToast("Copied comparison to clipboard", "success");
                        }}
                      >
                        Copy
                      </button>
                      <button
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          color: "#94a3b8",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "8px",
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        onClick={exportPDF}
                      >
                        PDF
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 1rem" }}>
                    <FileText size={18} /> Overall Summary
                  </h3>

                  <div
                    className="markdown-output"
                    style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.8",
                      color: "#e2e8f0"
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comparison}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
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
              currentDocumentId={currentDocumentId}
              documents={documents}
            />
          )}
        </main>   {/* Workspace Container */}

        <RightPanel
          currentDocumentId={currentDocumentId}
          documents={documents}
          onDownloadDocument={(id) => {
            window.open(api.getDownloadUrl(id), "_blank");
          }}
          onExportPDF={exportPDF}
          onExportDOCX={exportDOCX}
          summary={summary}
        />

      </div>     {/* Grid Container */}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast-box ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h4>{confirmModal.title}</h4>
            <p>{confirmModal.message}</p>
            <div className="modal-footer">
              <button
                className="modal-btn-cancel"
                onClick={confirmModal.onCancel}
              >
                Cancel
              </button>
              <button
                className={`modal-btn-confirm ${confirmModal.isDanger ? "danger" : ""}`}
                onClick={confirmModal.onConfirm}
              >
                {confirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UploadSection;


