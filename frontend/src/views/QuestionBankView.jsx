import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { StudioShell } from "../components/StudioBase";
import { api } from "../api/client";

function QuestionBankView({ selectedDoc, aiProvider, showToast }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const generate = async () => {
    if (!selectedDoc) { showToast?.("Select a document first.", "error"); return; }
    setLoading(true); setResult(null);
    try {
      const data = await api.getQuestionBank(selectedDoc.document_id, aiProvider);
      setResult(data.question_bank || data.questions || data.result || JSON.stringify(data));
    } catch { showToast?.("Failed to generate question bank.", "error"); }
    finally { setLoading(false); }
  };

  return (
    <StudioShell
      icon={HelpCircle}
      title="Question Bank"
      desc="20 exam-oriented questions categorized by difficulty (Easy, Medium, Hard)."
      selectedDoc={selectedDoc}
      onGenerate={generate}
      loading={loading}
      result={result}
      showToast={showToast}
    />
  );
}
export default QuestionBankView;
