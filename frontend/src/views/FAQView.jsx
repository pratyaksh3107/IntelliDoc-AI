import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { StudioShell } from "../components/StudioBase";
import { api } from "../api/client";

function FAQView({ selectedDoc, aiProvider, showToast }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const generate = async () => {
    if (!selectedDoc) { showToast?.("Select a document first.", "error"); return; }
    setLoading(true); setResult(null);
    try {
      const data = await api.getFaq(selectedDoc.document_id, aiProvider);
      setResult(data.faq || data.faqs || data.result || JSON.stringify(data));
    } catch { showToast?.("Failed to generate FAQ.", "error"); }
    finally { setLoading(false); }
  };

  return (
    <StudioShell
      icon={HelpCircle}
      title="FAQ Generator"
      desc="Automatically extract frequently asked questions and concise answers from the document."
      selectedDoc={selectedDoc}
      onGenerate={generate}
      loading={loading}
      result={result}
      showToast={showToast}
    />
  );
}
export default FAQView;
