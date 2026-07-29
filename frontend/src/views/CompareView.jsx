import { useState } from "react";
import { GitCompare, FileText, ArrowRight, Copy, Download, Printer } from "lucide-react";
import { api } from "../api/client";
import { copyToClipboard, exportPDF, exportDOCX, downloadFile, printContent } from "../utils/exportUtils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CompareView({ documents = [], aiProvider, showToast }) {
  const [doc1Id,  setDoc1Id]  = useState("");
  const [doc2Id,  setDoc2Id]  = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const generate = async () => {
    if (!doc1Id || !doc2Id) { showToast?.("Select two documents to compare.", "error"); return; }
    if (doc1Id === doc2Id)  { showToast?.("Select two different documents.", "error"); return; }
    setLoading(true); setResult(null);
    try {
      const data = await api.compareDocuments(doc1Id, doc2Id, aiProvider);
      setResult(data.comparison || data.result || JSON.stringify(data));
    } catch { showToast?.("Failed to compare documents.", "error"); }
    finally { setLoading(false); }
  };

  const doc1 = documents.find((d) => d.document_id === doc1Id);
  const doc2 = documents.find((d) => d.document_id === doc2Id);

  const handleCopy       = () => copyToClipboard(result, showToast);
  const handleExportPDF  = () => exportPDF("Document_Comparison", result, showToast);
  const handleExportDOCX = () => exportDOCX("Document_Comparison", result, showToast);
  const handleDownloadTXT = () => { downloadFile("Document_Comparison.txt", result); showToast?.("Downloaded text file", "success"); };
  const handlePrint      = () => printContent("Document Comparison", result);

  return (
    <div className="studio-container animate-fade-in">
      <div className="studio-header glass-card">
        <div className="studio-header-icon">
          <GitCompare size={20} />
        </div>
        <div className="studio-header-info">
          <h1 className="studio-title">Compare Documents</h1>
          <p className="studio-desc">Side-by-side AI analysis of two documents — similarities, differences, and key insights.</p>
        </div>
        {result && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={handleCopy} style={{ fontSize: "0.75rem" }}><Copy size={12} /> Copy</button>
            <button className="btn btn-secondary" onClick={handleExportPDF} style={{ fontSize: "0.75rem" }}><FileText size={12} /> PDF</button>
            <button className="btn btn-secondary" onClick={handleExportDOCX} style={{ fontSize: "0.75rem" }}><Download size={12} /> DOCX</button>
            <button className="btn btn-secondary" onClick={handleDownloadTXT} style={{ fontSize: "0.75rem" }}><Download size={12} /> TXT</button>
            <button className="btn btn-secondary" onClick={handlePrint} style={{ fontSize: "0.75rem" }}><Printer size={12} /> Print</button>
          </div>
        )}
      </div>

      {/* Document Selectors */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>
            Document A
          </label>
          <select
            className="input-field"
            value={doc1Id}
            onChange={(e) => setDoc1Id(e.target.value)}
            style={{ padding: "0.5rem 0.75rem" }}
          >
            <option value="">Select document…</option>
            {documents.map((d) => (
              <option key={d.document_id} value={d.document_id}>{d.filename}</option>
            ))}
          </select>
        </div>

        <ArrowRight size={20} style={{ color: "#475569", flexShrink: 0, marginTop: "1.5rem" }} />

        <div style={{ flex: 1, minWidth: "180px" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>
            Document B
          </label>
          <select
            className="input-field"
            value={doc2Id}
            onChange={(e) => setDoc2Id(e.target.value)}
            style={{ padding: "0.5rem 0.75rem" }}
          >
            <option value="">Select document…</option>
            {documents.map((d) => (
              <option key={d.document_id} value={d.document_id}>{d.filename}</option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          style={{ alignSelf: "flex-end", padding: "0.55rem 1.25rem" }}
          onClick={generate}
          disabled={loading || !doc1Id || !doc2Id}
        >
          <GitCompare size={15} />
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {/* Selected doc pills */}
      {(doc1 || doc2) && (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {doc1 && (
            <span className="badge badge-purple">
              <FileText size={11} /> A: {doc1.filename}
            </span>
          )}
          {doc2 && (
            <span className="badge badge-cyan">
              <FileText size={11} /> B: {doc2.filename}
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="studio-loading glass-card">
          <div className="animate-spin" style={{ width: 24, height: 24, border: "2px solid rgba(139,92,246,0.2)", borderTopColor: "#8b5cf6", borderRadius: "50%" }} />
          <div>
            <p style={{ fontWeight: 600, color: "#f1f5f9", marginBottom: "0.2rem" }}>Comparing documents…</p>
            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Analyzing both documents and computing similarities</p>
          </div>
        </div>
      )}

      {/* Result */}
      {!loading && result && (
        <div className="studio-result glass-card md-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && documents.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><GitCompare size={22} /></div>
          <h3>No documents available</h3>
          <p>Upload at least 2 documents to use the comparison feature.</p>
        </div>
      )}
    </div>
  );
}

export default CompareView;
