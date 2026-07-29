import { useState } from "react";
import {
  LayoutDashboard, Upload, FolderOpen,
  MessageSquare, Globe, Search,
  FileText, BookOpen, Layers, HelpCircle,
  Users, FlaskConical, GitCompare,
  ChevronLeft, ChevronRight, Database,
} from "lucide-react";
import "./Sidebar.css";

const NAV = [
  {
    section: "WORKSPACE",
    items: [
      { id: "overview",   icon: LayoutDashboard, label: "Overview" },
      { id: "upload",     icon: Upload,          label: "Upload" },
      { id: "library",    icon: FolderOpen,      label: "Library",     showCount: true },
      { id: "chat",       icon: MessageSquare,   label: "AI Chat",     badge: "Doc" },
      { id: "globalAI",   icon: Globe,           label: "Global AI",   badge: "All" },
      { id: "search",     icon: Search,          label: "Search" },
    ],
  },
  {
    section: "AI STUDIO",
    items: [
      { id: "summary",       icon: FileText,     label: "AI Summary" },
      { id: "notes",         icon: BookOpen,     label: "Study Notes" },
      { id: "flashcards",    icon: Layers,       label: "Flashcards" },
      { id: "questionBank",  icon: HelpCircle,   label: "Question Bank" },
      { id: "faq",           icon: HelpCircle,   label: "FAQ Generator" },
      { id: "meetingNotes",  icon: Users,        label: "Meeting Notes" },
      { id: "researchNotes", icon: FlaskConical, label: "Research Notes" },
      { id: "comparison",    icon: GitCompare,   label: "Compare Docs" },
    ],
  },
];

function Sidebar({ activeView, setActiveView, documentCount = 0 }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`app-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      <nav className="sidebar-nav">
        {NAV.map(({ section, items }) => (
          <div key={section} className="sidebar-section">
            {!collapsed && <span className="sidebar-section-label">{section}</span>}

            {items.map(({ id, icon: Icon, label, badge, showCount }) => {
              const isActive = activeView === id;
              const count = showCount ? documentCount : null;

              return (
                <button
                  key={id}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveView(id)}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} className="nav-icon" />
                  {!collapsed && (
                    <>
                      <span className="nav-label">{label}</span>
                      {badge && <span className="nav-badge">{badge}</span>}
                      {count != null && count > 0 && (
                        <span className="nav-count">{count}</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="footer-db-icon">
              <Database size={14} />
            </div>
            <div className="footer-text">
              <span className="footer-title">IntelliDoc v1.0</span>
              <span className="footer-sub">ChromaDB + Gemini / Ollama</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;