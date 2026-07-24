import "./HeroSection.css";

function HeroSection() {
  return (
    <section className="hero-section">

      <div className="hero-content">

        <div className="hero-badge">
          🚀 AI Powered Document Intelligence
        </div>

        <h1>
          IntelliDoc <span>AI</span>
        </h1>

        <p className="hero-subtitle">
          Your intelligent document assistant powered by
          <strong> RAG</strong>,
          <strong> ChromaDB</strong>,
          <strong> OCR</strong> and
          <strong> Llama 3.2</strong>.
        </p>

        <p className="hero-description">
          Upload PDFs and Images, perform semantic search,
          and chat with your documents using local AI.
        </p>

        <div className="hero-buttons">

          <button
            className="primary-btn"
            onClick={() =>
              window.scrollTo({
                top: 650,
                behavior: "smooth",
              })
            }
          >
            📄 Upload Document
          </button>

          <button
            className="secondary-btn"
            onClick={() =>
              window.scrollTo({
                top: 1200,
                behavior: "smooth",
              })
            }
          >
            🤖 Chat with AI
          </button>

        </div>

      </div>

    </section>
  );
}

export default HeroSection;