import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Send, Loader2, Trash2, Bot,
  Copy, CheckCircle2, ShieldCheck, ArrowRight,
  FileText, RotateCcw, BookOpen, ChevronDown, ChevronUp,
  Brain, Zap, HelpCircle, Layers, Check, AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api/client";
import "./GlobalAIView.css";

const SAMPLE_PROMPTS = [
  "What is the age of Sanjay Mathur?",
  "Which file contains CNN and Deep Learning?",
  "List all financial, fee, or payment information.",
  "Synthesize key takeaways across all documents.",
  "What are the major dates and timelines mentioned?",
  "Who are the key people mentioned and their roles?",
];

function ConfidenceBadge({ score, rating }) {
  const cls = score >= 75 ? "badge-emerald" : score >= 55 ? "badge-amber" : "badge-red";
  return (
    <span className={`badge ${cls}`} style={{ fontSize: "0.72rem" }}>
      <CheckCircle2 size={11} />
      {rating}
    </span>
  );
}

function AIInsightCard({ insight }) {
  if (!insight || !insight.type || insight.type === "None" || insight.type === "Conversational Greeting") return null;

  const colorClass =
    insight.badge_color === "purple" ? "badge-purple" :
    insight.badge_color === "cyan" ? "badge-cyan" :
    insight.badge_color === "amber" ? "badge-amber" : "badge-emerald";

  return (
    <div className="gai-insight-card">
      <div className="gai-insight-header">
        <Brain size={14} className="gai-insight-icon" />
        <span className="gai-insight-label">AI RAG Insight</span>
        <span className={`badge ${colorClass}`} style={{ fontSize: "0.68rem" }}>
          {insight.type}
        </span>
      </div>
      <p className="gai-insight-text">{insight.explanation}</p>
    </div>
  );
}

function SourceEvidenceCard({ src, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const matchColor =
    src.similarity_score >= 70 ? "#34d399" :
    src.similarity_score >= 45 ? "#fbbf24" : "#94a3b8";

  return (
    <div className="gai-source-card">
      <div className="gai-source-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="gai-source-card-left">
          <div className="gai-source-doc-icon">
            <FileText size={14} />
          </div>
          <div className="gai-source-doc-info">
            <span className="gai-source-filename">{src.filename}</span>
            <span className="gai-source-meta">
              Page {src.page || 1}
              {src.chunk_id && ` · Chunk #${src.chunk_id.slice(0, 6)}`}
            </span>
          </div>
        </div>

        <div className="gai-source-card-right">
          <span className="gai-source-match-pct" style={{ color: matchColor }}>
            {src.similarity_score}% match
          </span>
          <button className="gai-source-toggle" tabIndex={-1}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && src.snippet && (
        <div className="gai-source-snippet-box">
          <div className="gai-source-snippet-label">
            <ShieldCheck size={12} /> Verified Passage from {src.filename} (Page {src.page || 1}):
          </div>
          <div className="gai-source-snippet-text">{src.snippet}</div>
        </div>
      )}
    </div>
  );
}

function useStreamingText(fullText, isTyping) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isTyping || !fullText) {
      setTimeout(() => setDisplayedText(fullText || ""), 0);
      return;
    }

    setDisplayedText("");
    let i = 0;
    const speed = Math.max(8, Math.min(25, Math.floor(1500 / fullText.length)));
    
    const interval = setInterval(() => {
      i += 3;
      if (i >= fullText.length) {
        setDisplayedText(fullText);
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, i));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, isTyping]);

  return displayedText;
}

function AssistantMessage({ msg, onSendPrompt, copyToClipboard }) {
  const [isCopied, setIsCopied] = useState(false);
  const displayedContent = useStreamingText(msg.content, msg.isStreaming);

  const isGreetingMsg = msg.confidenceRating === "Greeting" || msg.aiInsight?.type === "Conversational Greeting";

  const handleCopy = () => {
    copyToClipboard(msg.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="gai-msg-row assistant">
      <div className="gai-msg-avatar">
        <Bot size={16} />
      </div>

      <div className="gai-msg-bubble glass-card">
        {/* Bubble header */}
        <div className="gai-msg-header">
          <div className="gai-msg-role-group">
            <span className="gai-msg-role">Global AI Platform</span>
            <span className="badge badge-purple" style={{ fontSize: "0.62rem" }}>
              {isGreetingMsg ? "Assistant" : "Flagship RAG"}
            </span>
          </div>

          <div className="gai-msg-actions">
            {msg.retrievalTime != null && !isGreetingMsg && (
              <span className="gai-timing">{msg.retrievalTime}s execution</span>
            )}
            <button className="btn btn-ghost" style={{ padding: "0.2rem 0.4rem" }} onClick={handleCopy} title="Copy Answer">
              {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Answer Content Markdown */}
        <div className="gai-msg-content md-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayedContent}
          </ReactMarkdown>
        </div>

        {/* Render RAG Insight, Confidence, and Sources ONLY for non-greeting queries */}
        {!isGreetingMsg && (
          <>
            {msg.aiInsight && (
              <AIInsightCard insight={msg.aiInsight} />
            )}

            {msg.confidenceScore > 0 && (
              <div className="gai-confidence-box">
                <div className="gai-confidence-top">
                  <ConfidenceBadge score={msg.confidenceScore} rating={msg.confidenceRating} />
                </div>
                {msg.confidenceExplanation && (
                  <p className="gai-confidence-exp">{msg.confidenceExplanation}</p>
                )}
              </div>
            )}

            {msg.sources?.length > 0 && (
              <div className="gai-sources-section">
                <div className="gai-sources-section-header">
                  <BookOpen size={14} />
                  <span>Grounded Evidence ({msg.sources.length} Contributing Passages)</span>
                </div>

                {msg.matchedDocs?.length > 0 && (
                  <div className="gai-matched-pills">
                    {msg.matchedDocs.map((doc, di) => (
                      <span key={di} className="gai-doc-pill">
                        <FileText size={11} />
                        <span className="gai-doc-pill-name">{doc.filename}</span>
                        <span className="gai-doc-pill-pct">{doc.max_similarity}% match</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="gai-source-cards">
                  {msg.sources.map((src, si) => (
                    <SourceEvidenceCard key={si} src={src} index={si} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Suggested Follow-up Questions Chips */}
        {msg.followUpQuestions?.length > 0 && (
          <div className="gai-followup-section">
            <div className="gai-followup-header">
              <HelpCircle size={13} />
              <span>Suggested Follow-up Questions</span>
            </div>
            <div className="gai-followup-chips">
              {msg.followUpQuestions.map((q, qi) => (
                <button
                  key={qi}
                  className="gai-followup-chip"
                  onClick={() => onSendPrompt(q)}
                >
                  <span>{q}</span>
                  <ArrowRight size={12} className="gai-chip-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalAIView({ documents = [], aiProvider = "ollama", showToast }) {
  const [question, setQuestion]   = useState("");
  const [messages, setMessages]   = useState([]);
  const [thinking, setThinking]   = useState(false);
  const messagesEndRef             = useRef(null);
  const inputRef                   = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, thinking]);

  const handleSend = async (queryText) => {
    const q = (typeof queryText === "string" ? queryText : question).trim();
    if (!q || thinking) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setThinking(true);

    try {
      const res = await api.askGlobalQuestion(q, aiProvider);
      setMessages((prev) => [
        ...prev,
        {
          role:                  "assistant",
          content:               res.answer || "No response received.",
          sources:               res.sources            || [],
          matchedDocs:           res.matched_documents  || [],
          confidenceScore:       res.confidence_score   || 0,
          confidenceRating:      res.confidence_rating  || "N/A",
          confidenceExplanation: res.confidence_explanation || "",
          chunksSearched:        res.chunks_searched    || 0,
          retrievalTime:         res.retrieval_time_sec || null,
          aiInsight:             res.ai_insight         || null,
          followUpQuestions:    res.follow_up_questions|| [],
          isStreaming:           true,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role:        "assistant",
          content:     `⚠️ Error: ${err.message || "Failed to reach backend."}`,
          sources:     [],
          confidenceScore: 0,
          isStreaming: false,
        },
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
    <div className="gai-container animate-fade-in">
      <div className="gai-header glass-panel">
        <div className="gai-header-left">
          <div className="gai-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="gai-title">Global AI Assistant</h2>
            <p className="gai-subtitle">
              Searching across {documents.length} indexed document{documents.length !== 1 ? "s" : ""} in Knowledge Base
            </p>
          </div>
        </div>

        <div className="gai-header-right">
          <span className="badge badge-purple" style={{ fontSize: "0.72rem" }}>
            <Zap size={11} /> Provider: {aiProvider.toUpperCase()}
          </span>
          {messages.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() => setMessages([])}
              style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
            >
              <Trash2 size={13} /> Clear Session
            </button>
          )}
        </div>
      </div>

      <div className="gai-messages">
        {messages.length === 0 ? (
          <div className="gai-welcome animate-fade-in">
            <div className="gai-welcome-icon">
              <Sparkles size={34} />
            </div>
            <h3>Ask Anything Across Your Knowledge Base</h3>
            <p>
              Global AI evaluates every indexed document with hybrid RAG reranking,
              executes multi-step reasoning, and provides exact page evidence citations.
            </p>

            <div className="gai-prompts-grid">
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  className="gai-prompt-btn glass-card"
                  onClick={() => handleSend(p)}
                >
                  <ArrowRight size={12} className="gai-prompt-arrow" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            msg.role === "user" ? (
              <div key={i} className="gai-msg-row user">
                <div className="gai-msg-avatar">YOU</div>
                <div className="gai-msg-bubble glass-card">
                  <div className="gai-msg-header">
                    <span className="gai-msg-role">You</span>
                  </div>
                  <div className="gai-msg-content">{msg.content}</div>
                </div>
              </div>
            ) : (
              <AssistantMessage
                key={i}
                msg={msg}
                onSendPrompt={handleSend}
                copyToClipboard={copyToClipboard}
              />
            )
          ))
        )}

        {thinking && (
          <div className="gai-msg-row assistant">
            <div className="gai-msg-avatar"><Bot size={16} /></div>
            <div className="gai-msg-bubble glass-card gai-thinking">
              <Loader2 size={16} className="animate-spin" style={{ color: "#8b5cf6" }} />
              <span>Analyzing query intent → Hybrid RAG search → Synthesizing answer…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="gai-input-bar glass-panel">
        <textarea
          ref={inputRef}
          className="gai-input"
          placeholder="Ask across all documents... (e.g. 'What is the age of Sanjay Mathur?', 'Which file contains CNN?')"
          value={question}
          rows={1}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={thinking}
        />
        <button
          className="btn btn-primary gai-send-btn"
          onClick={() => handleSend()}
          disabled={thinking || !question.trim()}
        >
          {thinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
}

export default GlobalAIView;
