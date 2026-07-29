import { useState } from "react";
import { Layers, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Download, FileText, Printer, Copy } from "lucide-react";
import { StudioShell } from "../components/StudioBase";
import { api } from "../api/client";
import { copyToClipboard, exportPDF, exportDOCX, exportCSV, exportJSON, printContent } from "../utils/exportUtils";
import "./FlashcardsView.css";

function parseFlashcards(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  const cards = [];
  const blocks = raw.split(/\n(?=###|Q:|Question:|\d+\.)/i);
  blocks.forEach((block) => {
    const qMatch = block.match(/(?:Q|Question|\d+\.)[:\s]*(.+?)(?:\n|$)/i);
    const aMatch = block.match(/(?:A|Answer)[:\s]*([\s\S]+)/i);
    if (qMatch && aMatch) {
      cards.push({ question: qMatch[1].trim(), answer: aMatch[1].trim() });
    }
  });
  if (cards.length > 0) return cards;
  return [{ question: "Flashcard Overview", answer: raw }];
}

function FlashcardsView({ selectedDoc, aiProvider, showToast }) {
  const [loading,   setLoading]   = useState(false);
  const [cards,     setCards]     = useState([]);
  const [current,   setCurrent]   = useState(0);
  const [flipped,   setFlipped]   = useState(false);
  const [rawResult, setRawResult] = useState(null);

  const generate = async () => {
    if (!selectedDoc) { showToast?.("Select a document first.", "error"); return; }
    setLoading(true);
    setCards([]);
    setRawResult(null);
    try {
      const data = await api.getFlashcards(selectedDoc.document_id, aiProvider);
      const raw  = data.flashcards || data.result || JSON.stringify(data);
      setRawResult(raw);
      const parsed = parseFlashcards(raw);
      setCards(parsed);
      setCurrent(0);
      setFlipped(false);
    } catch (e) {
      showToast?.("Failed to generate flashcards.", "error");
    } finally {
      setLoading(false);
    }
  };

  const shuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrent(0);
    setFlipped(false);
  };

  const prev = () => { setCurrent((c) => Math.max(0, c - 1)); setFlipped(false); };
  const next = () => { setCurrent((c) => Math.min(cards.length - 1, c + 1)); setFlipped(false); };

  // Export handlers
  const handleExportPDF  = () => exportPDF("Flashcards", rawResult || cards, showToast);
  const handleExportDOCX = () => exportDOCX("Flashcards", rawResult || cards, showToast);
  const handleExportCSV  = () => exportCSV("Flashcards", cards, showToast);
  const handleExportJSON = () => exportJSON("Flashcards", cards, showToast);
  const handlePrint      = () => printContent("Flashcards", cards);
  const handleCopy       = () => copyToClipboard(rawResult || JSON.stringify(cards, null, 2), showToast);

  return (
    <StudioShell
      icon={Layers}
      title="Flashcards"
      desc="Interactive flip cards for active recall and exam preparation."
      selectedDoc={selectedDoc}
      onGenerate={generate}
      loading={loading}
      result={cards.length > 0 ? true : null}
      showToast={showToast}
    >
      {cards.length > 0 && (
        <div className="fc-viewer">
          {/* Action Toolbar */}
          <div className="fc-toolbar" style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <button className="btn btn-secondary" onClick={handleCopy} style={{ fontSize: "0.75rem" }}><Copy size={12} /> Copy</button>
            <button className="btn btn-secondary" onClick={handleExportPDF} style={{ fontSize: "0.75rem" }}><FileText size={12} /> PDF</button>
            <button className="btn btn-secondary" onClick={handleExportDOCX} style={{ fontSize: "0.75rem" }}><Download size={12} /> DOCX</button>
            <button className="btn btn-secondary" onClick={handleExportCSV} style={{ fontSize: "0.75rem" }}><Download size={12} /> CSV</button>
            <button className="btn btn-secondary" onClick={handleExportJSON} style={{ fontSize: "0.75rem" }}><Download size={12} /> JSON</button>
            <button className="btn btn-secondary" onClick={handlePrint} style={{ fontSize: "0.75rem" }}><Printer size={12} /> Print</button>
          </div>

          {/* Progress */}
          <div className="fc-progress">
            <span>{current + 1} / {cards.length}</span>
            <button className="btn btn-ghost" onClick={shuffle} style={{ fontSize: "0.75rem" }}>
              <Shuffle size={13} /> Shuffle
            </button>
          </div>

          {/* Card */}
          <div className={`fc-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
            <div className="fc-card-inner">
              <div className="fc-face fc-front glass-card">
                <span className="fc-side-label">Question</span>
                <p className="fc-card-text">{cards[current]?.question}</p>
                <span className="fc-hint">Click to reveal answer</span>
              </div>
              <div className="fc-face fc-back glass-card">
                <span className="fc-side-label">Answer</span>
                <p className="fc-card-text">{cards[current]?.answer}</p>
                <span className="fc-hint">Click to see question</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="fc-nav">
            <button className="btn btn-secondary" onClick={prev} disabled={current === 0}>
              <ChevronLeft size={16} /> Prev
            </button>
            <button className="btn btn-ghost" onClick={() => setFlipped(false)} title="Flip back">
              <RotateCcw size={14} />
            </button>
            <button className="btn btn-secondary" onClick={next} disabled={current === cards.length - 1}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </StudioShell>
  );
}

export default FlashcardsView;
