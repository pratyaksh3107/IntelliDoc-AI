import { useState } from "react";
import { BookOpen } from "lucide-react";
import { StudioShell } from "../components/StudioBase";
import { api } from "../api/client";

function StudyNotesView({ selectedDoc, aiProvider, showToast }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const generate = async () => {
    if (!selectedDoc) { showToast?.("Select a document first.", "error"); return; }
    setLoading(true); setResult(null);
    try {
      const data = await api.getStudyNotes(selectedDoc.document_id, aiProvider);
      setResult(data.study_notes || data.notes || data.result || JSON.stringify(data));
    } catch { showToast?.("Failed to generate study notes.", "error"); }
    finally { setLoading(false); }
  };

  return (
    <StudioShell
      icon={BookOpen}
      title="Study Notes"
      desc="Generate structured learning notes with definitions, key concepts and exam tips."
      selectedDoc={selectedDoc}
      onGenerate={generate}
      loading={loading}
      result={result}
      showToast={showToast}
    />
  );
}
export default StudyNotesView;
