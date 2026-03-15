import { useNavigate } from "react-router-dom";
import { IoSettingsSharp } from 'react-icons/io5'
import { IoMdHelpCircle } from 'react-icons/io'
import "./Homepage.css";
import SettingsModal from "../components/Settings";
import { useState } from "react";
import Tutorial from "../components/Tutorial";

export default function Homepage() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const openSettings = () => {
    setShowTutorial(false)
    setShowSettings(true)
  }

  return (
    <div className = "home">
      <button className = "playButton" onClick={() => navigate("/play")}>
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
    </div>
  );
}
