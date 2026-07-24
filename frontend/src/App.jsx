import "./App.css";

import HeroSection from "./components/HeroSection";
import UploadSection from "./components/UploadSection";

function App() {
  return (
    <div className="app-container">
      <HeroSection />

      <div className="main-container">
        <UploadSection />
      </div>
    </div>
  );
}

export default App;