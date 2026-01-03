'use client'

import { useState, useEffect } from 'react'
import { X, Sun, Moon, Monitor, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type ThemeMode = 'light' | 'dark' | 'auto'
type ThemeColor = 'blue' | 'teal' | 'purple' | 'orange' | 'pink'
type SidebarColor = 'white' | 'dark' | 'color'

interface ThemeSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const STORAGE_KEY = 'admin_theme_settings'

const defaultSettings = {
  mode: 'light' as ThemeMode,
  color: 'blue' as ThemeColor,
  sidebarColor: 'white' as SidebarColor,
}

export default function ThemeSettingsPanel({ isOpen, onClose }: ThemeSettingsPanelProps) {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [color, setColor] = useState<ThemeColor>('blue')
  const [sidebarColor, setSidebarColor] = useState<SidebarColor>('white')

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          setMode(settings.mode || 'light')
          setColor(settings.color || 'blue')
          setSidebarColor(settings.sidebarColor || 'white')
        } catch (e) {
          console.log('Could not parse theme settings')
        }
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (newSettings: Partial<typeof defaultSettings>) => {
    const settings = { mode, color, sidebarColor, ...newSettings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('adminThemeChange', { detail: settings }))
  }

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode)
    saveSettings({ mode: newMode })
    
    // Apply dark mode to document
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newMode === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // Auto - check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const handleColorChange = (newColor: ThemeColor) => {
    setColor(newColor)
    saveSettings({ color: newColor })
  }

  const handleSidebarColorChange = (newSidebarColor: SidebarColor) => {
    setSidebarColor(newSidebarColor)
    saveSettings({ sidebarColor: newSidebarColor })
  }

  const handleReset = () => {
    setMode('light')
    setColor('blue')
    setSidebarColor('white')
    localStorage.removeItem(STORAGE_KEY)
    document.documentElement.classList.remove('dark')
    window.dispatchEvent(new CustomEvent('adminThemeChange', { detail: defaultSettings }))
  }

  const colorOptions: { id: ThemeColor; colors: string[] }[] = [
    { id: 'blue', colors: ['#3b82f6', '#6366f1'] },
    { id: 'teal', colors: ['#14b8a6', '#06b6d4'] },
    { id: 'purple', colors: ['#8b5cf6', '#ec4899'] },
    { id: 'orange', colors: ['#f97316', '#eab308'] },
    { id: 'pink', colors: ['#ec4899', '#06b6d4'] },
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          'fixed inset-0 bg-black/20 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-8">
          {/* Scheme */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Scheme</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange('auto')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium',
                  mode === 'auto' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                )}
              >
                <Monitor className="w-4 h-4" />
                Auto
              </button>
              <button
                onClick={() => handleModeChange('dark')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium',
                  mode === 'dark' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                )}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => handleModeChange('light')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium',
                  mode === 'light' 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                )}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
            </div>
          </div>

          {/* Color Customizer */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Color Customizer</h3>
              <button 
                onClick={handleReset}
                className="text-blue-500 hover:text-blue-600 transition-colors"
                title="Reset to default"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleColorChange(option.id)}
                  className={cn(
                    'w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
                    color === option.id 
                      ? 'border-gray-800 scale-110 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div 
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(135deg, ${option.colors[0]} 50%, ${option.colors[1]} 50%)`
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Color */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Sidebar Color</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleSidebarColorChange('white')}
                className={cn(
                  'flex-1 h-20 rounded-xl border-2 transition-all bg-white flex items-center justify-center',
                  sidebarColor === 'white' 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
                </div>
              </button>
              <button
                onClick={() => handleSidebarColorChange('dark')}
                className={cn(
                  'flex-1 h-20 rounded-xl border-2 transition-all bg-gray-800 flex items-center justify-center',
                  sidebarColor === 'dark' 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-gray-600 rounded-full"></div>
                  <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
                  <div className="w-1 h-8 bg-gray-600 rounded-full"></div>
                </div>
              </button>
              <button
                onClick={() => handleSidebarColorChange('color')}
                className={cn(
                  'flex-1 h-20 rounded-xl border-2 transition-all flex items-center justify-center',
                  sidebarColor === 'color' 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
                style={{
                  background: `linear-gradient(180deg, ${colorOptions.find(c => c.id === color)?.colors[0] || '#3b82f6'}, ${colorOptions.find(c => c.id === color)?.colors[1] || '#6366f1'})`
                }}
              >
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-white/40 rounded-full"></div>
                  <div className="w-1 h-8 bg-white/30 rounded-full"></div>
                  <div className="w-1 h-8 bg-white/40 rounded-full"></div>
                </div>
              </button>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>White</span>
              <span>Dark</span>
              <span>Color</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Export hook to use theme settings
export function useAdminTheme() {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          setSettings(JSON.parse(saved))
        } catch (e) {
          console.log('Could not parse theme settings')
        }
      }

      const handleChange = (e: CustomEvent) => {
        setSettings(e.detail)
      }
      window.addEventListener('adminThemeChange', handleChange as EventListener)
      return () => window.removeEventListener('adminThemeChange', handleChange as EventListener)
    }
  }, [])

  return settings
}
