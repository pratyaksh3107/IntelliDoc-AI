import "./App.css";
import "./index.css";
import { useState } from "react";
import { useDocuments } from "./hooks/useDocuments";
import { useToast }     from "./hooks/useToast";
import Header           from "./components/Header";
import Sidebar          from "./components/Sidebar";
import RightPanel       from "./components/RightPanel";
import Toast            from "./components/Toast";
import ConfirmModal     from "./components/ConfirmModal";

/* ── Views ──────────────────────────────────────────────── */
import OverviewView      from "./views/OverviewView";
import UploadView        from "./views/UploadView";
import LibraryView       from "./views/LibraryView";
import ChatView          from "./views/ChatView";
import GlobalAIView      from "./views/GlobalAIView";
import SemanticSearchView from "./views/SemanticSearchView";
import SummaryView       from "./views/SummaryView";
import FlashcardsView    from "./views/FlashcardsView";
import QuestionBankView  from "./views/QuestionBankView";
import FAQView           from "./views/FAQView";
import MeetingNotesView  from "./views/MeetingNotesView";
import ResearchNotesView from "./views/ResearchNotesView";
import CompareView       from "./views/CompareView";
import StudyNotesView    from "./views/StudyNotesView";

function App() {
  const [activeView,   setActiveView]   = useState("overview");
  const [aiProvider,   setAiProvider]   = useState("ollama");
  const [confirmModal, setConfirmModal] = useState(null);

  const {
    documents,
    selectedDocId,
    selectedDoc,
    setSelectedDocId,
    loading: docsLoading,
    error:   docsError,
    uploadFiles,
    deleteDocument,
    fetchDocuments,
    totalChunks,
    documentCount,
  } = useDocuments();

  const { toasts, showToast, dismissToast } = useToast();

  // ── Confirm delete with modal ───────────────────────────
  const handleDeleteDocument = (docId) => {
    const doc = documents.find((d) => d.document_id === docId);
    setConfirmModal({
      title:       "Delete Document",
      message:     `Are you sure you want to delete "${doc?.filename || "this document"}" from your library? This action cannot be undone.`,
      confirmText: "Delete",
      isDanger:    true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await deleteDocument(docId);
          showToast("Document deleted from Knowledge Base.", "success");
        } catch {
          showToast("Failed to delete document.", "error");
        }
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  // ── Shared view props ───────────────────────────────────
  const sharedProps = {
    documents,
    selectedDocId,
    selectedDoc,
    setSelectedDocId,
    aiProvider,
    showToast,
    onNavigate: setActiveView,
  };

  const renderView = () => {
    switch (activeView) {
      case "overview":      return <OverviewView {...sharedProps} documentCount={documentCount} totalChunks={totalChunks} docsLoading={docsLoading} />;
      case "upload":        return <UploadView   {...sharedProps} uploadFiles={uploadFiles} />;
      case "library":       return <LibraryView  {...sharedProps} onDelete={handleDeleteDocument} docsLoading={docsLoading} />;
      case "chat":          return <ChatView      {...sharedProps} />;
      case "globalAI":      return <GlobalAIView  {...sharedProps} />;
      case "search":        return <SemanticSearchView {...sharedProps} />;
      case "summary":       return <SummaryView   {...sharedProps} />;
      case "flashcards":    return <FlashcardsView {...sharedProps} />;
      case "questionBank":  return <QuestionBankView {...sharedProps} />;
      case "faq":           return <FAQView        {...sharedProps} />;
      case "meetingNotes":  return <MeetingNotesView {...sharedProps} />;
      case "researchNotes": return <ResearchNotesView {...sharedProps} />;
      case "comparison":    return <CompareView    {...sharedProps} />;
      case "notes":         return <StudyNotesView  {...sharedProps} />;
      default:              return <OverviewView   {...sharedProps} documentCount={documentCount} totalChunks={totalChunks} docsLoading={docsLoading} />;
    }
  };

  return (
    <div className="app-shell">
      <Header
        documents={documents}
        selectedDocId={selectedDocId}
        setSelectedDocId={setSelectedDocId}
        aiProvider={aiProvider}
        setAiProvider={setAiProvider}
        onUpload={() => setActiveView("upload")}
        docsLoading={docsLoading}
      />

      <div className="app-body">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          documentCount={documentCount}
        />

        <main className="app-workspace animate-fade-in" key={activeView}>
          {docsError && (
            <div className="glass-card" style={{ padding: "1rem 1.25rem", marginBottom: "1.25rem", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontSize: "0.875rem", borderRadius: "var(--radius-lg)" }}>
              ⚠️ {docsError}
            </div>
          )}
          {renderView()}
        </main>

        <RightPanel
          selectedDoc={selectedDoc}
          documents={documents}
          setSelectedDocId={setSelectedDocId}
          onDelete={handleDeleteDocument}
          onNavigate={setActiveView}
        />
      </div>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Confirm modal */}
      {confirmModal && (
        <ConfirmModal {...confirmModal} />
      )}
    </div>
  );
}

export default App;