import {
  FileText, Trash2, Download, ChevronRight, Database,
  Cpu, Layers, Zap, CheckCircle2, MessageSquare, Sparkles, BookOpen
} from "lucide-react";
import { BASE_URL, api } from "../api/client";
import "./RightPanel.css";

function RightPanel({ selectedDoc, documents, setSelectedDocId, onDelete, onNavigate, aiProvider = "ollama" }) {
  const handleDownload = (docId) => {
    window.open(api.getDownloadUrl(docId), "_blank");
  };

  const pagesCount = selectedDoc?.pages || Math.ceil((selectedDoc?.chunks || 1) / 2.5);

  return (
    <aside className="right-panel">
      {/* Panel Header */}
      <div className="rp-header">
        <Database size={14} />
        <span>Document Context</span>
        <span className={`rp-status ${selectedDoc ? "active" : "idle"}`}>
          {selectedDoc ? "Active Context" : "Global Mode"}
        </span>
      </div>

      {selectedDoc ? (
        <div className="rp-doc-card animate-fade-in">
          {/* Document Header Icon & Filename */}
          <div className="rp-doc-top">
            <div className="rp-doc-icon">
              <FileText size={20} />
            </div>
            <div className="rp-doc-title-group">
              <h4 className="rp-doc-name" title={selectedDoc.filename}>
                {selectedDoc.filename}
              </h4>
              <span className="badge badge-emerald" style={{ fontSize: "0.62rem" }}>
                <CheckCircle2 size={10} /> ChromaDB Indexed
              </span>
            </div>
          </div>

          {/* Enhanced Metadata Grid */}
          <div className="rp-meta-grid">
            {[
              { label: "File Format", value: (selectedDoc.file_type || "PDF").toUpperCase() },
              { label: "Total Pages",  value: `${pagesCount} pages` },
              { label: "Text Chunks", value: `${selectedDoc.chunks || 1} vectors` },
              { label: "Embedding",   value: "all-MiniLM (384d)" },
            ].map(({ label, value }) => (
              <div key={label} className="rp-meta-item">
                <span className="rp-meta-label">{label}</span>
                <span className="rp-meta-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Additional Details */}
          <div className="rp-details-list">
            <div className="rp-detail-row">
              <span className="rp-detail-key">Vector Index:</span>
              <span className="rp-detail-val text-success">Main Collection</span>
            </div>
            <div className="rp-detail-row">
              <span className="rp-detail-key">Active Provider:</span>
              <span className="rp-detail-val text-purple">{aiProvider.toUpperCase()}</span>
            </div>
            {selectedDoc.upload_date && (
              <div className="rp-detail-row">
                <span className="rp-detail-key">Indexed Date:</span>
                <span className="rp-detail-val">{selectedDoc.upload_date.split(" ")[0]}</span>
              </div>
            )}
          </div>

          {/* Quick Actions List */}
          <div className="rp-quick-tools">
            <span className="rp-section-label">Document Actions</span>
            <button
              className="rp-tool-btn primary"
              onClick={() => onNavigate("chat")}
            >
              <MessageSquare size={13} />
              <span>AI Chat Context</span>
              <ChevronRight size={12} className="rp-btn-arrow" />
            </button>
            <button
              className="rp-tool-btn"
              onClick={() => onNavigate("summary")}
            >
              <Sparkles size={13} />
              <span>Generate AI Summary</span>
            </button>
            <button
              className="rp-tool-btn"
              onClick={() => onNavigate("notes")}
            >
              <BookOpen size={13} />
              <span>Extract Study Notes</span>
            </button>
          </div>

          {/* Manage Actions */}
          <div className="rp-actions">
            <button
              className="rp-action-btn"
              onClick={() => handleDownload(selectedDoc.document_id)}
              title="Download File"
            >
              <Download size={13} />
              <span>Download</span>
            </button>
            <button
              className="rp-action-btn danger"
              onClick={() => onDelete(selectedDoc.document_id)}
              title="Delete Document"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-state rp-empty">
          <div className="empty-state-icon">
            <Database size={22} />
          </div>
          <h3>Global Knowledge Mode</h3>
          <p>No single document selected. Global AI is querying across all indexed files.</p>
          <button
            className="btn btn-secondary"
            style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}
            onClick={() => onNavigate("library")}
          >
            <FileText size={13} />
            Open Document Library
          </button>
        </div>
      )}

      {/* Indexed Library Selector */}
      {documents.length > 0 && (
        <div className="rp-recent">
          <div className="rp-recent-header">
            <span className="rp-section-label">Knowledge Library ({documents.length})</span>
            {selectedDoc && (
              <button
                className="rp-clear-btn"
                onClick={() => setSelectedDocId(null)}
                title="Switch to Global Mode"
              >
                Clear Context
              </button>
            )}
          </div>
          <div className="rp-doc-list">
            {documents.map((doc) => (
              <button
                key={doc.document_id}
                className={`rp-doc-item ${selectedDoc?.document_id === doc.document_id ? "active" : ""}`}
                onClick={() => setSelectedDocId(doc.document_id)}
                title={doc.filename}
              >
                <FileText size={13} className="rp-doc-item-icon" />
                <div className="rp-doc-item-info">
                  <span className="rp-doc-item-name">{doc.filename}</span>
                  <span className="rp-doc-item-meta">{doc.chunks || 1} chunks</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export default RightPanel;
