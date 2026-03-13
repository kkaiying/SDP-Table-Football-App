import { useNavigate } from "react-router-dom";
import { IoSettingsSharp } from 'react-icons/io5'
import { IoMdHelpCircle } from 'react-icons/io'
import "./Homepage.css";
import SettingsModal from "../components/Settings";
import { useState } from "react";

export default function Homepage() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className = "home">
      <button className = "playButton" onClick={() => navigate("/play")}>
        PLAY
      </button>
      <button className = "tutorialButton" onClick={() => navigate("/howtoplay")}>
        <IoMdHelpCircle/>
      </button>
      <button className="settingsButton" onClick={() => setShowSettings(true)}>
        <IoSettingsSharp/>
      </button>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)}/>}
    </div>
  );
}
