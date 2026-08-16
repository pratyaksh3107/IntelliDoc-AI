export const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://intellidoc-backend-ctzp.onrender.com"
    : "http://localhost:8000");

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getDocuments: () => request("/documents"),

  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return request("/upload", {
      method: "POST",
      body: formData,
    });
  },

  deleteDocument: (documentId) =>
    request(`/document/${documentId}`, {
      method: "DELETE",
    }),

  askQuestion: (question, documentId, provider = "ollama") =>
    request("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, document_id: documentId, provider }),
    }),

  askGlobalQuestion: (question, provider = "ollama") =>
    request("/ask-global", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, provider }),
    }),

  getSummary: (documentId, provider = "ollama") =>
    request("/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, provider }),
    }),

  getStudyNotes: (documentId, provider = "ollama") =>
    request("/study-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, provider }),
    }),

  getFlashcards: (documentId, provider = "ollama") =>
    request("/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, provider }),
    }),

  getQuestionBank: (documentId, provider = "ollama") =>
    request("/question-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, provider }),
    }),

  getFaq: (documentId, provider = "ollama") =>
    request("/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, provider }),
    }),

  getMeetingNotes: (documentId, provider = "ollama") =>
    request("/meeting-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, provider }),
    }),

  getResearchNotes: (documentId, provider = "ollama") =>
    request("/research-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, provider }),
    }),

  compareDocuments: (docId1, docId2, provider = "ollama") =>
    request("/compare/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_id_1: docId1,
        document_id_2: docId2,
        provider,
      }),
    }),

  semanticSearch: (query) =>
    request(`/semantic-search?query=${encodeURIComponent(query)}`),

  keywordSearch: (query) =>
    request(`/keyword-search?query=${encodeURIComponent(query)}`),

  globalSearch: (query, searchType = "hybrid") =>
    request(`/global-search?query=${encodeURIComponent(query)}&search_type=${encodeURIComponent(searchType)}`),

  getDownloadUrl: (documentId) => `${BASE_URL}/download/${documentId}`,
};
