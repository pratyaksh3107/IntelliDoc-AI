import { useState } from "react";
import { FileText } from "lucide-react";
import { StudioShell } from "../components/StudioBase";
import { api } from "../api/client";

function SummaryView({ selectedDoc, aiProvider, showToast }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const generate = async () => {
    if (!selectedDoc) { showToast?.("Select a document first.", "error"); return; }
    setLoading(true);
    setResult(null);
    try {
      const data = await api.getSummary(selectedDoc.document_id, aiProvider);
      setResult(data.summary || data.result || JSON.stringify(data));
    } catch (e) {
      showToast?.("Failed to generate summary.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudioShell
      icon={FileText}
      title="AI Summary"
      desc="Generate a structured executive summary with key points, definitions, and action items."
      selectedDoc={selectedDoc}
      onGenerate={generate}
      loading={loading}
      result={result}
      showToast={showToast}
    />
  );
}

export default SummaryView;
