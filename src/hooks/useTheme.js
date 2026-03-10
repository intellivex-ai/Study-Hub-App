// src/hooks/useTheme.js
import { useState, useEffect } from 'react'

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light'
    })

    useEffect(() => {
        const root = window.document.documentElement

        // Remove all theme classes
        root.classList.remove('dark', 'theme-pookie')

        // Add active theme class
        if (theme === 'dark') {
            root.classList.add('dark')
        } else if (theme === 'pookie') {
            root.classList.add('theme-pookie')
        }

        localStorage.setItem('app-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark'
            if (prev === 'dark') return 'pookie'
            return 'light'
        })
    }

    return { theme, setTheme, toggleTheme }
}
