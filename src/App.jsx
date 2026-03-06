import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Play from "./pages/Play";
import HowToPlay from "./pages/HowToPlay";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/play" element={<Play />} />
        <Route path="/howtoplay" element={<HowToPlay />} />
      </Routes>
    </Router>
  );
}

export default App;