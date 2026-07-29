import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { StudioShell } from "../components/StudioBase";
import { api } from "../api/client";

function ResearchNotesView({ selectedDoc, aiProvider, showToast }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const generate = async () => {
    if (!selectedDoc) { showToast?.("Select a document first.", "error"); return; }
    setLoading(true); setResult(null);
    try {
      const data = await api.getResearchNotes(selectedDoc.document_id, aiProvider);
      setResult(data.research_notes || data.notes || data.result || JSON.stringify(data));
    } catch { showToast?.("Failed to generate research notes.", "error"); }
    finally { setLoading(false); }
  };

  return (
    <StudioShell
      icon={FlaskConical}
      title="Research Notes"
      desc="Generate structured research synthesis with hypotheses, methodology, findings and implications."
      selectedDoc={selectedDoc}
      onGenerate={generate}
      loading={loading}
      result={result}
      showToast={showToast}
    />
  );
}
export default ResearchNotesView;
