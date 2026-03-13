import { useState, useEffect } from 'react'
import { useKeybinds } from './KeybindContext'
import './Settings.css'

function Settings({ onClose }) {
const { keybinds, updateKeybind } = useKeybinds()
const [listening, setListening] = useState(null)

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
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Mouse Controls</h2>
        <div className="settings-content">
            <div className="control-row">
                <span className="control-label">Select Goalkeeper Rod</span>
                <div 
                className={`keybind-box ${listening === 'rod1' ? 'listening' : ''}`}
                onClick={() => handleKeybindClick('rod1')}>
                {listening === 'rod1' ? '...' : keybinds.rod1}
                </div>
            </div>
            <div className="control-row">
                <span className="control-label">Select Defender Rod</span>
                <div 
                className={`keybind-box ${listening === 'rod2' ? 'listening' : ''}`}
                onClick={() => handleKeybindClick('rod2')}>
                {listening === 'rod2' ? '...' : keybinds.rod2}
                </div>
            </div>
            <div className="control-row">
                <span className="control-label">Select Midfield Rod</span>
                <div 
                className={`keybind-box ${listening === 'rod3' ? 'listening' : ''}`}
                onClick={() => handleKeybindClick('rod3')}>
                {listening === 'rod3' ? '...' : keybinds.rod3}
                </div>
            </div>
            <div className="control-row">
                <span className="control-label">Select Attacker Rod</span>
                <div 
                className={`keybind-box ${listening === 'rod4' ? 'listening' : ''}`}
                onClick={() => handleKeybindClick('rod4')}>
                {listening === 'rod4' ? '...' : keybinds.rod4}
                </div>
            </div>
        </div>
    </div>
    </div>
)
}

export default Settings