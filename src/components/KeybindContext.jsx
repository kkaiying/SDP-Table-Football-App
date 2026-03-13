import { createContext, useState, useContext, useEffect } from 'react'

const KeybindContext = createContext()

const DEFAULT_KEYBINDS = {
    rod1: '1',
    rod2: '2',
    rod3: '3',
    rod4: '4'
}

export function KeybindProvider({ children }) {
    const [keybinds, setKeybinds] = useState(() => {
        const saved = localStorage.getItem('keybinds')
        return saved ? JSON.parse(saved) : DEFAULT_KEYBINDS
    })

    useEffect(() => {
        localStorage.setItem('keybinds', JSON.stringify(keybinds))
    }, [keybinds])

    const updateKeybind = (rodName, newKey) => {
        setKeybinds(prev => ({ ...prev, [rodName]: newKey }))
    }

    return (
        <KeybindContext.Provider value={{ keybinds, updateKeybind }}>
        {children}
        </KeybindContext.Provider>
    )
}

export function useKeybinds() {
    return useContext(KeybindContext)
}