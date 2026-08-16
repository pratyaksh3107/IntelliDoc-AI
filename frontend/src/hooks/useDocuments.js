// useDocuments.js — Central document state management hook
import { useState, useEffect, useCallback } from "react";
import { BASE_URL, api } from "../api/client";

export function useDocuments() {
  const [documents, setDocuments]           = useState([]);
  const [selectedDocId, setSelectedDocId]   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  // ── Fetch all indexed documents on mount ──────────────────
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDocuments();
      setDocuments(data.documents || []);
    } catch (e) {
      setError("Cannot reach backend. Is FastAPI running on port 8000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchDocuments();
    return () => { mounted = false; };
  }, [fetchDocuments]);

  // ── Upload ────────────────────────────────────────────────
  const uploadFiles = useCallback(async (files) => {
    const data = await api.uploadFiles(files);

    if (data.documents?.length > 0) {
      const newDocs = data.documents;
      setDocuments((prev) => {
        const newIds    = new Set(newDocs.map((d) => d.document_id));
        const filtered  = prev.filter((d) => !newIds.has(d.document_id));
        return [...newDocs, ...filtered];
      });
      setSelectedDocId(newDocs[0].document_id);
    }
    return data;
  }, []);

  // ── Delete ────────────────────────────────────────────────
  const deleteDocument = useCallback(async (docId) => {
    await api.deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
    if (selectedDocId === docId) setSelectedDocId(null);
  }, [selectedDocId]);

  // ── Derived helpers ───────────────────────────────────────
  const selectedDoc   = documents.find((d) => d.document_id === selectedDocId) || null;
  const totalChunks   = documents.reduce((acc, d) => acc + (d.chunks || 0), 0);
  const documentCount = documents.length;

  return {
    documents,
    selectedDocId,
    selectedDoc,
    setSelectedDocId,
    loading,
    error,
    fetchDocuments,
    uploadFiles,
    deleteDocument,
    totalChunks,
    documentCount,
  };
}
