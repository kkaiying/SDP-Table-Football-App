import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Play from "./pages/Play";
import AIOpponent from "./pages/AIOpponent";
import { KeybindProvider } from "./components/KeybindContext";

function App() {
  return (
    <KeybindProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/play" element={<Play />} />
          <Route path="/ai-opponent" element={<AIOpponent />} />
        </Routes>
      </Router>
    </KeybindProvider>
  );
}

export default App;