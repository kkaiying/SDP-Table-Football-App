import { useState, useEffect } from 'react'
import { useKeybinds } from './KeybindContext'
import './Settings.css'
import { MdKeyboard } from "react-icons/md";
import { IoGameController } from "react-icons/io5";
import { FaMouse } from "react-icons/fa";

function Settings({ onClose }) {
const { keybinds, updateKeybind } = useKeybinds()
const [listening, setListening] = useState(null)
const [activeTab, setActiveTab] = useState('mouse') // mouse tab opened by default

useEffect(() => {
    const handleKeyPress = (e) => {
        if (listening) {
            e.preventDefault()
            updateKeybind(listening, e.key)
            setListening(null)
        }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
}, [listening, updateKeybind])

const handleKeybindClick = (rodName) => {
    setListening(rodName)
}

return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="settings-tabs">
            <div className={`tab ${activeTab === 'mouse' ? 'active' : ''}`}
            onClick={() => {
                setActiveTab('mouse')
                setListening(null)
                }}>
            <MdKeyboard />
            </div>
            <div className={`tab ${activeTab === 'controller' ? 'active' : ''}`}
            onClick={() => { 
                setActiveTab('controller')
                setListening(null) 
                }}>
            <IoGameController />
            </div>
        </div>

        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>×</button>

          {activeTab === 'mouse' ? (<>
              <h2>Mouse Controls</h2>
              <div className="settings-content">
                <div className="control-row">
                  <span className="control-label">Select Goalkeeper Rod</span>
                  <div 
                    className={`keybind-box ${listening === 'rod1' ? 'listening' : ''}`}
                    onClick={() => handleKeybindClick('rod1')}
                  >
                    {listening === 'rod1' ? '...' : keybinds.rod1}
                  </div>
                </div>
                <div className="control-row">
                  <span className="control-label">Select Defender Rod</span>
                  <div 
                    className={`keybind-box ${listening === 'rod2' ? 'listening' : ''}`}
                    onClick={() => handleKeybindClick('rod2')}
                  >
                    {listening === 'rod2' ? '...' : keybinds.rod2}
                  </div>
                </div>
                <div className="control-row">
                  <span className="control-label">Select Midfield Rod</span>
                  <div 
                    className={`keybind-box ${listening === 'rod3' ? 'listening' : ''}`}
                    onClick={() => handleKeybindClick('rod3')}
                  >
                    {listening === 'rod3' ? '...' : keybinds.rod3}
                  </div>
                </div>
                <div className="control-row">
                  <span className="control-label">Select Attacker Rod</span>
                  <div 
                    className={`keybind-box ${listening === 'rod4' ? 'listening' : ''}`}
                    onClick={() => handleKeybindClick('rod4')}
                  >
                    {listening === 'rod4' ? '...' : keybinds.rod4}
                  </div>
                </div>
                <div className="control-row">
                  <span className="control-label">Move rods</span>
                  <div className="keybind-box"><FaMouse /></div>
                </div>
                <div className="control-row">
                  <span className="control-label">Kick</span>
                  <div className="keybind-box">Scroll</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2>Controller Controls</h2>
              <div className="settings-content">
                <div className="control-row">
                  <span className="control-label">Select Defense Rods</span>
                  <div className="keybind-box">Left DPAD</div>
                </div>
                <div className="control-row">
                  <span className="control-label">Select Attack Rods</span>
                  <div className="keybind-box">Right DPAD</div>
                </div>
                <div className="control-row">
                  <span className="control-label">Switch selected rods</span>
                  <div className="keybind-box">A</div>
                </div>
                <div className="control-row">
                  <span className="control-label">Short Left Kick</span>
                  <div className="keybind-box">LB</div>
                </div>
                <div className="control-row">
                  <span className="control-label">Short Right Kick</span>
                  <div className="keybind-box">RB</div>
                </div>
                <div className="control-row">
                  <span className="control-label">Strong Left Kick</span>
                  <div className="keybind-box">LT + B</div>
                </div>
                <div className="control-row">
                  <span className="control-label">Strong Right Kick</span>
                  <div className="keybind-box">RT + B</div>
                </div>
                <div className="control-row">
                  <span className="control-label">Move rods</span>
                  <div className="keybind-box">Joysticks</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings