import { useNavigate } from "react-router-dom";
import { IoSettingsSharp } from 'react-icons/io5'
import { IoMdHelpCircle } from 'react-icons/io'
import "./Homepage.css";
import SettingsModal from "../components/Settings";
import { useState } from "react";
import Tutorial from "../components/Tutorial";
import PlayModal from "../components/PlayModal";

export default function Homepage() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPlayModal, setShowPlayModal] = useState(false);

  const openSettings = () => {
    setShowTutorial(false)
    setShowSettings(true)
  }

  const openPlayModal = () => {
    setShowTutorial(false)
    setShowSettings(false)
    setShowPlayModal(true)
  }

  return (
    <div className = "home">
      <button className = "playButton" onClick={openPlayModal}>
        PLAY
      </button>
      <button className = "tutorialButton" onClick={() => setShowTutorial(true)}>
        <IoMdHelpCircle/>
      </button>
      <button className="settingsButton" onClick={() => setShowSettings(true)}>
        <IoSettingsSharp/>
      </button>

      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} openSettings={openSettings}/>}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)}/>}
      {showPlayModal && (
        <PlayModal
          onClose={() => setShowPlayModal(false)}
          onSinglePlayer={(path) => navigate("/ai-opponent")}
          onMultiplayer={() => navigate("/play")}
        />
      )}
    </div>
  );
}
