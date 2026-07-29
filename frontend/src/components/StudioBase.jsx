// StudioBase.jsx — Reusable AI Studio view shell with full Export & Action Toolbar
import { useState } from "react";
import { Loader2, Copy, Download, AlertCircle, RefreshCw, Printer, FileText, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { copyToClipboard, exportPDF, exportDOCX, exportMarkdown, downloadFile, printContent } from "../utils/exportUtils";

export function StudioShell({
  icon: Icon,
  title,
  desc,
  selectedDoc,
  onGenerate,
  loading,
  result,
  children,
  showToast,
  requiresDoc = true,
}) {
  const handleCopy = () => {
    if (!result) return;
    copyToClipboard(result, showToast);
  };

  const handleExportPDF = () => {
    if (!result) return;
    exportPDF(title, result, showToast);
  };

  const handleExportDOCX = () => {
    if (!result) return;
    exportDOCX(title, result, showToast);
  };

  const handleDownloadTXT = () => {
    if (!result) return;
    const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
    downloadFile(`${title.toLowerCase().replace(/\s+/g, "_")}.txt`, text);
    showToast?.("Downloaded text file", "success");
  };

  const handlePrint = () => {
    if (!result) return;
    printContent(title, result);
    showToast?.("Opened print preview", "info");
  };

  return (
    <div className="studio-container animate-fade-in">
      {/* Header */}
      <div className="studio-header glass-card">
        <div className="studio-header-icon">
          <Icon size={20} />
        </div>
        <div className="studio-header-info">
          <h1 className="studio-title">{title}</h1>
          <p className="studio-desc">{desc}</p>
        </div>
        <div className="studio-header-actions" style={{ flexWrap: "wrap", gap: "0.4rem" }}>
          {result && (
            <>
              <button className="btn btn-secondary" onClick={handleCopy} style={{ fontSize: "0.78rem" }} title="Copy to clipboard">
                <Copy size={13} /> Copy
              </button>
              <button className="btn btn-secondary" onClick={handleExportPDF} style={{ fontSize: "0.78rem" }} title="Export as PDF">
                <FileText size={13} /> PDF
              </button>
              <button className="btn btn-secondary" onClick={handleExportDOCX} style={{ fontSize: "0.78rem" }} title="Export as DOCX">
                <Download size={13} /> DOCX
              </button>
              <button className="btn btn-secondary" onClick={() => exportMarkdown(title, result, showToast)} style={{ fontSize: "0.78rem" }} title="Export as Markdown">
                <Download size={13} /> MD
              </button>
              <button className="btn btn-secondary" onClick={handleDownloadTXT} style={{ fontSize: "0.78rem" }} title="Download TXT">
                <Download size={13} /> TXT
              </button>
              <button className="btn btn-secondary" onClick={handlePrint} style={{ fontSize: "0.78rem" }} title="Print Document">
                <Printer size={13} /> Print
              </button>
              <button className="btn btn-secondary" onClick={onGenerate} style={{ fontSize: "0.78rem" }} title="Regenerate">
                <RefreshCw size={13} /> Regenerate
              </button>
            </>
          )}
          {!result && (
            <button
              className="btn btn-primary"
              onClick={onGenerate}
              disabled={loading || (requiresDoc && !selectedDoc)}
              style={{ fontSize: "0.85rem" }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
              {loading ? "Generating…" : `Generate ${title}`}
            </button>
          )}
        </div>
      </div>

      {/* No doc selected warning */}
      {requiresDoc && !selectedDoc && (
        <div className="studio-no-doc glass-card">
          <AlertCircle size={15} style={{ color: "#f59e0b", flexShrink: 0 }} />
          <span>Select a document from the header dropdown or Library to generate {title}.</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="studio-loading glass-card">
          <Loader2 size={24} className="animate-spin" style={{ color: "#8b5cf6" }} />
          <div>
            <p style={{ fontWeight: 600, color: "#f1f5f9", marginBottom: "0.2rem" }}>Generating {title}…</p>
            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Reading document chunks → Building context → Executing LLM</p>
          </div>
        </div>
      )}

      {/* Result or custom children */}
      {!loading && (result || children) && (
        <div className="studio-result glass-card">
          {children || (
            <div className="md-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
