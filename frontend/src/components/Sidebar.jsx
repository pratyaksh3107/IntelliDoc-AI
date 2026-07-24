import {
  FileText,
  BookOpen,
  Bot,
  Search,
  Folder,
  Brain,
} from "lucide-react";

function Sidebar({ activeView, setActiveView }) {
  return (
    <div className="sidebar">

      <h3 className="sidebar-title">
        AI Tools
      </h3>

     <button
  className={`sidebar-btn ${activeView === "summary" ? "active" : ""}`}
  onClick={() => setActiveView("summary")}
>
  <FileText size={18} />
  Summary
</button>

    <button
  className={`sidebar-btn ${activeView === "notes" ? "active" : ""}`}
  onClick={() => setActiveView("notes")}
>
  <BookOpen size={18} />
  Study Notes
</button>

     <button
  className={`sidebar-btn ${activeView === "chat" ? "active" : ""}`}
  onClick={() => setActiveView("chat")}
>
  <Bot size={18} />
  AI Chat
</button>

      <button
  className={`sidebar-btn ${activeView === "search" ? "active" : ""}`}
  onClick={() => setActiveView("search")}
>
  <Search size={18} />
  Search
</button>

    <button
  className={`sidebar-btn ${activeView === "documents" ? "active" : ""}`}
  onClick={() => setActiveView("documents")}
>
  <Folder size={18} />
  Documents
</button>

      <button
  className={`sidebar-btn ${activeView === "analysis" ? "active" : ""}`}
  onClick={() => setActiveView("analysis")}
>
  <Brain size={18} />
  Analysis
</button>

<button
  className={`sidebar-btn ${activeView === "questionBank" ? "active" : ""}`}
  onClick={() => setActiveView("questionBank")}
>
  📘 Question Bank
</button>


<button
  className={`sidebar-btn ${activeView === "faq" ? "active" : ""}`}
  onClick={() => setActiveView("faq")}
>
  ❓ FAQ
</button>

<button
  className={`sidebar-btn ${activeView === "meetingNotes" ? "active" : ""}`}
  onClick={() => setActiveView("meetingNotes")}
>
  📝 Meeting Notes
</button>

<button
  className={`sidebar-btn ${activeView === "researchNotes" ? "active" : ""}`}
  onClick={() => setActiveView("researchNotes")}
>
  🔬 Research Notes
</button>

<button
  className={activeView === "flashcards" ? "active" : ""}
  onClick={() => setActiveView("flashcards")}
>
  🧠 Flashcards
</button>

    </div>
  );
}

export default Sidebar;