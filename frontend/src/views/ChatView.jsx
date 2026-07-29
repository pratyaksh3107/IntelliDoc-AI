import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, Copy, Trash2, MessageSquare, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api/client";
import "./ChatView.css";

const SAMPLE_PROMPTS = [
  "Summarize this document in 5 bullet points.",
  "What are the most important facts here?",
  "Explain this document in simple language.",
  "What action items can be derived from this?",
];

function ChatView({ selectedDoc, selectedDocId, documents = [], aiProvider = "ollama", showToast, onNavigate }) {
  const [messages, setMessages]   = useState([]);
  const [question, setQuestion]   = useState("");
  const [thinking, setThinking]   = useState(false);
  const messagesEndRef             = useRef(null);
  const inputRef                   = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, thinking]);

  // Reset chat when document changes
  useEffect(() => { setMessages([]); }, [selectedDocId]);

  const handleSend = async (queryText) => {
    const q = (typeof queryText === "string" ? queryText : question).trim();
    if (!q || thinking) return;
    if (!selectedDocId) { showToast?.("Select a document first.", "error"); return; }

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setThinking(true);

    try {
      const data = await api.askQuestion(q, selectedDocId, aiProvider);
      setMessages((prev) => [
        ...prev,
        {
          role:    "assistant",
          content: data.answer || data.result || "No answer returned.",
          sources: data.sources || [],
          context: data.context || null,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err.message || "Backend unreachable."}`, sources: [] },
      ]);
    } finally {
      setThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast?.("Copied to clipboard", "success");
  };

  return (
    <div className="cv-container animate-fade-in">
      {/* Header */}
      <div className="cv-header glass-panel">
        <div className="cv-header-icon">
          <Bot size={20} />
        </div>
        <div className="cv-header-info">
          <h2 className="cv-title">AI Chat Assistant</h2>
          <p className="cv-subtitle">
            {selectedDoc
              ? `Context: ${selectedDoc.filename} · ${selectedDoc.chunks || 0} chunks`
              : "No document selected — select from header or Library"}
          </p>
        </div>
        <div className="cv-header-actions">
          {selectedDoc && <span className="badge badge-emerald">Document Loaded</span>}
          {messages.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setMessages([])} style={{ fontSize: "0.78rem" }}>
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* No document warning */}
      {!selectedDoc && (
        <div className="cv-no-doc glass-card">
          <AlertCircle size={15} style={{ color: "var(--amber)", flexShrink: 0 }} />
          <span>
            Select a document using the header dropdown or{" "}
            <button style={{ color: "var(--purple-light)", textDecoration: "underline", background: "none", cursor: "pointer" }} onClick={() => onNavigate("library")}>
              open the Library
            </button>
            {" "}to load context.
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="cv-messages">
        {messages.length === 0 ? (
          <div className="cv-welcome animate-fade-in">
            <div className="cv-welcome-icon">
              <MessageSquare size={28} />
            </div>
            <h3>Ask Questions About This Document</h3>
            <p>AI Chat uses RAG to retrieve relevant passages and answer your questions accurately.</p>
            {selectedDoc && (
              <div className="cv-prompts-grid">
                {SAMPLE_PROMPTS.map((p, i) => (
                  <button key={i} className="cv-prompt-btn glass-card" onClick={() => handleSend(p)}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`cv-msg-row ${msg.role}`}>
              <div className="cv-msg-avatar">
                {msg.role === "user" ? <span>YOU</span> : <Bot size={15} />}
              </div>

              <div className="cv-msg-bubble glass-card">
                <div className="cv-msg-header">
                  <span className="cv-msg-role">{msg.role === "user" ? "You" : "AI Assistant"}</span>
                  {msg.role === "assistant" && (
                    <button className="btn btn-ghost" style={{ padding: "0.2rem 0.35rem", fontSize: "0.7rem" }} onClick={() => copyToClipboard(msg.content)}>
                      <Copy size={12} />
                    </button>
                  )}
                </div>

                <div className="cv-msg-content md-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>

                {/* Sources */}
                {msg.role === "assistant" && msg.sources?.length > 0 && (
                  <div className="cv-sources">
                    <span className="cv-sources-label">Sources ({msg.sources.length})</span>
                    {msg.sources.map((src, si) => (
                      <div key={si} className="cv-source-item">
                        📄 {src.filename || src.document_name || "Document"}
                        {src.page && <span> · Page {src.page}</span>}
                        {src.similarity_score != null && (
                          <span className="badge badge-cyan" style={{ fontSize: "0.62rem", marginLeft: "0.4rem" }}>
                            {src.similarity_score}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {thinking && (
          <div className="cv-msg-row assistant">
            <div className="cv-msg-avatar"><Bot size={15} /></div>
            <div className="cv-msg-bubble glass-card cv-thinking">
              <Loader2 size={15} className="animate-spin" style={{ color: "var(--purple)" }} />
              <span>Retrieving context &amp; generating answer…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="cv-input-bar glass-panel">
        <textarea
          ref={inputRef}
          className="cv-input"
          placeholder={selectedDoc ? "Ask about this document…" : "Select a document first…"}
          value={question}
          rows={1}
          disabled={thinking || !selectedDoc}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
        />
        <button
          className="btn btn-primary cv-send-btn"
          onClick={() => handleSend()}
          disabled={thinking || !question.trim() || !selectedDoc}
        >
          {thinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}

export default ChatView;