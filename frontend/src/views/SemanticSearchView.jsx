import { useState } from "react";
import { Search, Loader2, FileText, Zap, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api/client";
import "./SemanticSearchView.css";

function ResultCard({ result, idx }) {
  const sim = result.similarity != null
    ? Math.round(result.similarity * 100)
    : result.score != null
    ? Math.round(result.score * 100)
    : null;

  return (
    <div className="ss-result-card glass-card animate-fade-in">
      <div className="ss-result-header">
        <span className="ss-result-rank">#{idx + 1}</span>
        <div className="ss-result-meta">
          <FileText size={13} />
          <span>{result.filename || result.document_name || "Document"}</span>
          {result.page && <span className="ss-result-page">· Page {result.page}</span>}
        </div>
        {sim != null && (
          <span className="badge badge-cyan" style={{ marginLeft: "auto", fontSize: "0.65rem" }}>
            {sim}% match
          </span>
        )}
      </div>
      <div className="ss-result-text">
        {result.text || result.content || result.chunk || "—"}
      </div>
      {result.chunk_id && (
        <div className="ss-result-chunk">Chunk: {result.chunk_id.slice(0, 12)}…</div>
      )}
    </div>
  );
}

function SemanticSearchView({ showToast }) {
  const [query,     setQuery]     = useState("");
  const [mode,      setMode]      = useState("semantic"); // semantic | keyword
  const [results,   setResults]   = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) { showToast("Enter a search query.", "error"); return; }
    setSearching(true);
    setResults(null);
    try {
      const data = mode === "semantic"
        ? await api.semanticSearch(query)
        : await api.keywordSearch(query);
      setResults(data);
    } catch (e) {
      showToast("Search failed. Check backend connection.", "error");
    } finally {
      setSearching(false);
    }
  };

  const items = results?.results || results?.matches || [];

  return (
    <div className="ss-container animate-fade-in">
      <div className="ss-header">
        <h1 className="ss-title">Search Knowledge Base</h1>
        <p className="ss-sub">Use semantic (vector) or keyword (exact) search across all indexed documents.</p>
      </div>

      {/* Mode Toggle */}
      <div className="ss-mode-toggle">
        <button
          className={`ss-mode-btn ${mode === "semantic" ? "active" : ""}`}
          onClick={() => setMode("semantic")}
        >
          <Zap size={14} /> Semantic Search
        </button>
        <button
          className={`ss-mode-btn ${mode === "keyword" ? "active" : ""}`}
          onClick={() => setMode("keyword")}
        >
          <Code size={14} /> Keyword Search
        </button>
      </div>

      {/* Search Input */}
      <div className="ss-search-bar glass-panel">
        <Search size={17} className="ss-search-icon" />
        <input
          className="ss-search-input"
          placeholder={mode === "semantic" ? "Search by meaning…" : "Search by exact keyword…"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          className="btn btn-primary"
          style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
          onClick={handleSearch}
          disabled={searching}
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Search
        </button>
      </div>

      {/* Results */}
      {searching && (
        <div className="ss-loading">
          <Loader2 size={22} className="animate-spin" style={{ color: "var(--purple)" }} />
          <span>Searching vector index…</span>
        </div>
      )}

      {!searching && results && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Search size={22} /></div>
          <h3>No results found</h3>
          <p>Try a different query or upload more documents.</p>
        </div>
      )}

      {!searching && items.length > 0 && (
        <div className="ss-results">
          <div className="ss-results-header">
            <span className="ss-results-count">{items.length} results for "<strong>{query}</strong>"</span>
          </div>
          <div className="ss-results-list">
            {items.map((r, i) => <ResultCard key={i} result={r} idx={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default SemanticSearchView;
