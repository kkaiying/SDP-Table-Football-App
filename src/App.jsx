import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Play from "./pages/Play";
import { KeybindProvider } from "./components/KeybindContext";

function App() {
  return (
    <KeybindProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/play" element={<Play />} />
        </Routes>
      </Router>
    </KeybindProvider>
  );
}

export default App;