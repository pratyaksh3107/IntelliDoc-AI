import { useState, useMemo } from "react";
import {
  FolderOpen, Search, Trash2, Download, FileText,
  Layers, Calendar, SortAsc, SortDesc, Filter,
  CheckCircle, Loader2,
} from "lucide-react";
import "./LibraryView.css";

const BASE = import.meta.env?.VITE_API_URL || "http://localhost:8000";

function LibraryView({
  documents = [],
  selectedDocId,
  setSelectedDocId,
  onDelete,
  docsLoading,
  onNavigate,
  showToast,
}) {
  const [query,     setQuery]     = useState("");
  const [sortBy,    setSortBy]    = useState("date");
  const [sortDir,   setSortDir]   = useState("desc");
  const [filterType, setFilterType] = useState("all");

  const filtered = useMemo(() => {
    let docs = [...documents];

    if (query.trim()) {
      const q = query.toLowerCase();
      docs = docs.filter((d) => d.filename.toLowerCase().includes(q));
    }

    if (filterType !== "all") {
      docs = docs.filter((d) => (d.file_type || "pdf") === filterType);
    }

    docs.sort((a, b) => {
      let va, vb;
      if (sortBy === "date")   { va = a.upload_date || ""; vb = b.upload_date || ""; }
      if (sortBy === "name")   { va = a.filename;          vb = b.filename; }
      if (sortBy === "chunks") { va = a.chunks || 0;       vb = b.chunks || 0; }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return docs;
  }, [documents, query, sortBy, sortDir, filterType]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir("desc"); }
  };

  const handleDownload = (docId) => {
    window.open(`${BASE}/download/${docId}`, "_blank");
    showToast("Starting download…", "info");
  };

  const types = ["all", ...new Set(documents.map((d) => d.file_type || "pdf"))];

  return (
    <div className="lv-container animate-fade-in">
      {/* Header */}
      <div className="lv-header">
        <div>
          <h1 className="lv-title">Document Library</h1>
          <p className="lv-sub">{documents.length} document{documents.length !== 1 ? "s" : ""} indexed in your Knowledge Base</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("upload")}>
          + Upload New
        </button>
      </div>

      {/* Toolbar */}
      <div className="lv-toolbar glass-card">
        <div className="lv-search-wrap">
          <Search size={15} className="lv-search-icon" />
          <input
            className="lv-search-input"
            placeholder="Search documents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="lv-filters">
          <span className="lv-filter-label"><Filter size={13} /> Type:</span>
          {types.map((t) => (
            <button
              key={t}
              className={`lv-filter-btn ${filterType === t ? "active" : ""}`}
              onClick={() => setFilterType(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="lv-sort">
          <span className="lv-filter-label">Sort:</span>
          {[
            { key: "date",   label: "Date" },
            { key: "name",   label: "Name" },
            { key: "chunks", label: "Chunks" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`lv-filter-btn ${sortBy === key ? "active" : ""}`}
              onClick={() => toggleSort(key)}
            >
              {label}
              {sortBy === key && (
                sortDir === "asc" ? <SortAsc size={12} /> : <SortDesc size={12} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {docsLoading ? (
        <div className="lv-grid">
          {[1,2,3,4].map((i) => (
            <div key={i} className="lv-doc-card skeleton" style={{ height: 140 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FolderOpen size={22} /></div>
          <h3>{query ? "No documents match your search" : "No documents indexed yet"}</h3>
          <p>{query ? "Try a different search term." : "Upload your first document to get started."}</p>
          {!query && (
            <button className="btn btn-primary" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }} onClick={() => onNavigate("upload")}>
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="lv-grid">
          {filtered.map((doc) => {
            const isSelected = selectedDocId === doc.document_id;
            return (
              <div
                key={doc.document_id}
                className={`lv-doc-card glass-card ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedDocId(doc.document_id)}
              >
                {/* Card Header */}
                <div className="lv-card-header">
                  <div className="lv-card-icon">
                    <FileText size={18} />
                  </div>
                  <span className="badge badge-muted lv-type-badge">
                    {(doc.file_type || "pdf").toUpperCase()}
                  </span>
                  {isSelected && <CheckCircle size={14} style={{ color: "var(--emerald)", marginLeft: "auto" }} />}
                </div>

                {/* File Name */}
                <div className="lv-card-name" title={doc.filename}>
                  {doc.filename}
                </div>

                {/* Meta */}
                <div className="lv-card-meta">
                  <span><Layers size={11} /> {doc.chunks || 0} chunks</span>
                  {doc.pages && <span>{doc.pages} pages</span>}
                </div>
                {doc.upload_date && (
                  <div className="lv-card-date">
                    <Calendar size={11} />
                    {doc.upload_date.split(" ")[0]}
                  </div>
                )}

                {/* Status */}
                <div className="lv-card-status">
                  <span className="badge badge-emerald">Indexed</span>
                </div>

                {/* Actions */}
                <div className="lv-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="lv-action-btn"
                    title="Set as active context"
                    onClick={() => { setSelectedDocId(doc.document_id); onNavigate("chat"); }}
                  >
                    Chat →
                  </button>
                  <button
                    className="lv-action-btn icon"
                    title="Download"
                    onClick={() => handleDownload(doc.document_id)}
                  >
                    <Download size={13} />
                  </button>
                  <button
                    className="lv-action-btn icon danger"
                    title="Delete"
                    onClick={() => onDelete(doc.document_id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LibraryView;
