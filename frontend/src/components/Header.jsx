import { useState, useEffect, useRef } from "react";
import {
  Zap, ChevronDown, FileText, Database,
  Upload, Globe, Brain,
} from "lucide-react";
import { BASE_URL } from "../api/client";
import "./Header.css";

function Header({
  documents = [],
  selectedDocId,
  setSelectedDocId,
  aiProvider,
  setAiProvider,
  onUpload,
  docsLoading,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dbReady,      setDbReady]      = useState(null); // null = checking
  const dropdownRef = useRef(null);

  // Check VectorDB status
  useEffect(() => {
    fetch(`${BASE_URL}/documents`)
      .then((r) => r.ok ? setDbReady(true) : setDbReady(false))
      .catch(()  => setDbReady(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedDoc = documents.find((d) => d.document_id === selectedDocId);

  return (
    <header className="app-header">
      {/* ── Logo ── */}
      <div className="header-logo">
        <div className="logo-icon">
          <Brain size={17} />
        </div>
        <span className="logo-text">
          IntelliDoc<span className="logo-accent">.AI</span>
        </span>
        <span className="logo-badge">PRO</span>
      </div>

      {/* ── Document Selector ── */}
      <div className="header-doc-selector" ref={dropdownRef}>
        <button
          className="doc-select-btn"
          onClick={() => setDropdownOpen((o) => !o)}
        >
          <FileText size={13} className="doc-select-icon" />
          <span className="doc-select-label">
            {docsLoading
              ? "Loading documents…"
              : selectedDoc
              ? selectedDoc.filename
              : "No Document Selected"}
          </span>
          <ChevronDown
            size={13}
            className={`doc-select-chevron ${dropdownOpen ? "open" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div className="doc-dropdown">
            <div className="doc-dropdown-header">
              <span>Knowledge Base</span>
              <span style={{ color: "#a78bfa" }}>{documents.length} docs</span>
            </div>

            {/* Clear selection */}
            <button
              className={`doc-dropdown-item ${!selectedDocId ? "active" : ""}`}
              onClick={() => { setSelectedDocId(null); setDropdownOpen(false); }}
            >
              <Globe size={13} className="doc-item-icon" />
              <div className="doc-item-info">
                <span className="doc-item-name">All Documents (Global AI)</span>
                <span className="doc-item-meta">No specific document context</span>
              </div>
            </button>

            {documents.length === 0 ? (
              <div className="doc-dropdown-empty">
                No documents indexed yet.{" "}
                <span
                  style={{ color: "#a78bfa", cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => { setDropdownOpen(false); onUpload(); }}
                >
                  Upload one
                </span>
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.document_id}
                  className={`doc-dropdown-item ${selectedDocId === doc.document_id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedDocId(doc.document_id);
                    setDropdownOpen(false);
                  }}
                >
                  <FileText size={13} className="doc-item-icon" />
                  <div className="doc-item-info">
                    <span className="doc-item-name">{doc.filename}</span>
                    <span className="doc-item-meta">
                      {doc.chunks || 0} chunks · {(doc.file_type || "PDF").toUpperCase()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Provider Toggle ── */}
      <div className="provider-toggle">
        <button
          className={`provider-btn ${aiProvider === "ollama" ? "active" : ""}`}
          onClick={() => setAiProvider("ollama")}
          title="Use local Ollama (Llama 3.2)"
        >
          <Zap size={12} />
          Ollama
        </button>
        <button
          className={`provider-btn ${aiProvider === "gemini" ? "active" : ""}`}
          onClick={() => setAiProvider("gemini")}
          title="Use Google Gemini 2.5"
        >
          <Zap size={12} />
          Gemini 2.5
        </button>
      </div>

      {/* ── Upload Button ── */}
      <button className="btn btn-primary header-upload-btn" onClick={onUpload}>
        <Upload size={14} />
        Upload
      </button>

      {/* ── VectorDB Status ── */}
      <span
        className={`vectordb-status ${
          dbReady === null ? "empty" : dbReady ? "ready" : "empty"
        }`}
      >
        {dbReady === null
          ? "Checking…"
          : dbReady
          ? `VectorDB Ready`
          : "Backend Offline"}
      </span>
    </header>
  );
}

export default Header;
