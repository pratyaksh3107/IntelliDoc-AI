import "./Dashboard.css";
function Dashboard({
  documentCount,
  chunkCount,
}) {
  return (
    <div className="dashboard">

      <div className="dashboard-card">
        <h3>📄 Documents</h3>
        <h2>{documentCount}</h2>
      </div>

      <div className="dashboard-card">
        <h3>📦 Chunks</h3>
        <h2>{chunkCount}</h2>
      </div>

      <div className="dashboard-card">
        <h3>🧠 Embedding</h3>
        <h2>MiniLM</h2>
      </div>

      <div className="dashboard-card">
        <h3>🤖 LLM</h3>
        <h2>Llama 3.2</h2>
      </div>

    </div>
  );
}

export default Dashboard;