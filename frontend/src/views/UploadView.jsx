import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, Loader2, CloudUpload, AlertCircle } from "lucide-react";
import "./UploadView.css";

function UploadView({ uploadFiles, showToast, onNavigate }) {
  const [dragOver,   setDragOver]   = useState(false);
  const [files,      setFiles]      = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(null); // null | "indexing" | "done"
  const [results,    setResults]    = useState([]);
  const fileInputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const accepted = Array.from(incoming).filter(
      (f) => f.name.match(/\.(pdf|png|jpg|jpeg)$/i)
    );
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...accepted.filter((f) => !names.has(f.name))];
    });
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleUpload = async () => {
    if (files.length === 0) { showToast("Select at least one file.", "error"); return; }
    setUploading(true);
    setProgress("indexing");
    setResults([]);
    try {
      const data = await uploadFiles(files);
      if (data.documents?.length > 0) {
        setResults(data.documents);
        setProgress("done");
        setFiles([]);
        showToast(`${data.documents.length} document(s) indexed successfully.`, "success");
      } else {
        setProgress(null);
        showToast("No documents were indexed. Check file formats.", "error");
      }
    } catch (e) {
      setProgress(null);
      showToast("Upload failed. Is the backend running?", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="uv-container animate-fade-in">
      <div className="uv-header">
        <h1 className="uv-title">Upload Documents</h1>
        <p className="uv-sub">PDF, PNG, JPG and JPEG files are supported. Documents are automatically chunked, embedded and indexed into ChromaDB.</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`uv-dropzone glass-card ${dragOver ? "drag-over" : ""} ${files.length > 0 ? "has-files" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => files.length === 0 && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />

        {files.length === 0 ? (
          <div className="uv-drop-idle">
            <div className="uv-drop-icon">
              <CloudUpload size={32} />
            </div>
            <h3>Drag &amp; drop files here</h3>
            <p>or <span className="uv-link" onClick={() => fileInputRef.current?.click()}>browse files</span></p>
            <div className="uv-accepted-types">
              {["PDF", "PNG", "JPG", "JPEG"].map((t) => (
                <span key={t} className="badge badge-muted">{t}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="uv-file-list">
            {files.map((f) => (
              <div key={f.name} className="uv-file-item">
                <FileText size={16} style={{ color: "var(--purple)", flexShrink: 0 }} />
                <span className="uv-file-name">{f.name}</span>
                <span className="uv-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "0.2rem" }}
                  onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              className="uv-add-more"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              + Add more files
            </button>
          </div>
        )}
      </div>

      {/* Upload button */}
      {files.length > 0 && !uploading && progress !== "done" && (
        <button className="btn btn-primary uv-upload-btn" onClick={handleUpload}>
          <Upload size={15} />
          Index {files.length} file{files.length > 1 ? "s" : ""} into Knowledge Base
        </button>
      )}

      {/* Progress */}
      {uploading && (
        <div className="uv-progress glass-card">
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--purple)" }} />
          <div className="uv-progress-text">
            <span>Processing &amp; indexing…</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Extracting text → Chunking → Embedding → Storing in ChromaDB</span>
          </div>
          <div className="uv-progress-bar">
            <div className="uv-progress-fill animate-pulse" />
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="uv-results animate-fade-in">
          <div className="uv-results-header">
            <CheckCircle size={18} style={{ color: "var(--emerald)" }} />
            <h3>Successfully Indexed</h3>
          </div>
          <div className="uv-results-list">
            {results.map((doc) => (
              <div key={doc.document_id} className="uv-result-item glass-card">
                <FileText size={16} style={{ color: "var(--purple)" }} />
                <div className="uv-result-info">
                  <span className="uv-result-name">{doc.filename}</span>
                  <span className="uv-result-meta">{doc.pages} pages · {doc.chunks} chunks</span>
                </div>
                <span className="badge badge-emerald">Indexed</span>
              </div>
            ))}
          </div>
          <div className="uv-results-actions">
            <button className="btn btn-primary" onClick={() => onNavigate("globalAI")}>
              Query with Global AI →
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate("library")}>
              View Library
            </button>
            <button className="btn btn-ghost" onClick={() => { setResults([]); setProgress(null); }}>
              Upload more
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="uv-tips glass-card">
        <AlertCircle size={14} style={{ color: "var(--purple)", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>Tips for best results</p>
          <ul style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.6, paddingLeft: "1rem" }}>
            <li>Use text-based PDFs for best extraction quality</li>
            <li>For scanned documents, use high-resolution images</li>
            <li>Large files (&gt;50 pages) may take 20-40s to process</li>
            <li>Previously uploaded documents are auto-loaded on startup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UploadView;
