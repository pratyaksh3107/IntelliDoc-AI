import { useState } from "react";
import { Users } from "lucide-react";
import { StudioShell } from "../components/StudioBase";
import { api } from "../api/client";

function MeetingNotesView({ selectedDoc, aiProvider, showToast }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const generate = async () => {
    if (!selectedDoc) { showToast?.("Select a document first.", "error"); return; }
    setLoading(true); setResult(null);
    try {
      const data = await api.getMeetingNotes(selectedDoc.document_id, aiProvider);
      setResult(data.meeting_notes || data.notes || data.result || JSON.stringify(data));
    } catch { showToast?.("Failed to generate meeting notes.", "error"); }
    finally { setLoading(false); }
  };

  return (
    <StudioShell
      icon={Users}
      title="Meeting Notes"
      desc="Extract structured meeting notes with agenda, decisions, action items and next steps."
      selectedDoc={selectedDoc}
      onGenerate={generate}
      loading={loading}
      result={result}
      showToast={showToast}
    />
  );
}
export default MeetingNotesView;
