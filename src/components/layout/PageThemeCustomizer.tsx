'use client'

import { useState, useRef, useEffect } from 'react'
import { Palette, Check, Layout, ChevronDown, X, GripVertical, Globe, ChevronUp } from 'lucide-react'
import { Language, languages } from '@/lib/translations'
import { useRouter } from 'next/navigation'

export type TemplateType = 'original' | 'minimal' | 'freshspin' | 'starter'
export type ThemeColor = 'teal' | 'blue' | 'purple' | 'orange'

const templates = [
  { id: 'original', name: 'Landing Page 1' },
  { id: 'minimal', name: 'Landing Page 2' },
  { id: 'freshspin', name: 'Landing Page 3' },
  { id: 'starter', name: 'Landing Page 4' },
]

const colors = [
  { id: 'teal', name: 'Teal', class: 'bg-teal-500' },
  { id: 'blue', name: 'Blue', class: 'bg-blue-500' },
  { id: 'purple', name: 'Purple', class: 'bg-purple-500' },
  { id: 'orange', name: 'Orange', class: 'bg-orange-500' },
]

export default function PageThemeCustomizer() {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isThemeExpanded, setIsThemeExpanded] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>('original')
  const [currentColor, setCurrentColor] = useState<ThemeColor>('teal')
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Template dropdown position state
  const [templatePos, setTemplatePos] = useState({ x: 16, y: 16 })
  const [isTemplateDragging, setIsTemplateDragging] = useState(false)
  const templateDragStart = useRef({ x: 0, y: 0 })
  const templateElementStart = useRef({ x: 0, y: 0 })
  
  // Color picker position state
  const [colorPos, setColorPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 120 : 0, y: 200 })
  const [isColorDragging, setIsColorDragging] = useState(false)
  const colorDragStart = useRef({ x: 0, y: 0 })
  const colorElementStart = useRef({ x: 0, y: 0 })

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTemplate = localStorage.getItem('landing_template') as TemplateType
      const savedColor = localStorage.getItem('landing_color') as ThemeColor
      const savedLanguage = localStorage.getItem('landing_language') as Language
      
      // Only set template if it's a valid one (not removed templates)
      if (savedTemplate && ['original', 'minimal', 'freshspin', 'starter'].includes(savedTemplate)) {
        setCurrentTemplate(savedTemplate)
      } else if (savedTemplate) {
        // Reset to original if saved template was removed
        localStorage.setItem('landing_template', 'original')
      }
      if (savedColor) setCurrentColor(savedColor)
      if (savedLanguage) setCurrentLanguage(savedLanguage)

      const savedTemplatePos = localStorage.getItem('template_dropdown_position')
      if (savedTemplatePos) {
        try { setTemplatePos(JSON.parse(savedTemplatePos)) } catch (e) {}
      }
      
      const savedColorPos = localStorage.getItem('color_picker_position')
      if (savedColorPos) {
        try { setColorPos(JSON.parse(savedColorPos)) } catch (e) {}
      } else {
        setColorPos({ x: window.innerWidth - 120, y: 200 })
      }

      const savedThemeExpanded = localStorage.getItem('theme_expanded')
      if (savedThemeExpanded) {
        setIsThemeExpanded(savedThemeExpanded === 'true')
      }
      
      setIsLoaded(true)
    }
  }, [])

  const selectedTemplate = templates.find(t => t.id === currentTemplate) || templates[0]
  const selectedColor = colors.find(c => c.id === currentColor) || colors[0]

  const handleTemplateChange = (template: TemplateType) => {
    setCurrentTemplate(template)
    localStorage.setItem('landing_template', template)
    // Reload page to apply new template header
    window.location.reload()
  }

  const handleColorChange = (color: ThemeColor) => {
    setCurrentColor(color)
    localStorage.setItem('landing_color', color)
    // Dispatch custom event so pages can update without reload
    window.dispatchEvent(new CustomEvent('themeColorChange', { detail: { color } }))
  }

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem('landing_language', language)
    // Dispatch custom event so pages can update without reload
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }))
  }

  const toggleThemeExpanded = () => {
    const newState = !isThemeExpanded
    setIsThemeExpanded(newState)
    localStorage.setItem('theme_expanded', String(newState))
  }

  // Template dropdown drag handlers
  const handleTemplateDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsTemplateDragging(true)
    templateDragStart.current = { x: e.clientX, y: e.clientY }
    templateElementStart.current = { x: templatePos.x, y: templatePos.y }
  }

  // Color picker drag handlers
  const handleColorDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsColorDragging(true)
    colorDragStart.current = { x: e.clientX, y: e.clientY }
    colorElementStart.current = { x: colorPos.x, y: colorPos.y }
  }

  // Handle mouse move for both
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isTemplateDragging) {
        const deltaX = e.clientX - templateDragStart.current.x
        const deltaY = e.clientY - templateDragStart.current.y
        const newX = Math.max(0, Math.min(window.innerWidth - 200, templateElementStart.current.x + deltaX))
        const newY = Math.max(0, Math.min(window.innerHeight - 50, templateElementStart.current.y + deltaY))
        setTemplatePos({ x: newX, y: newY })
      }
      
      if (isColorDragging) {
        const deltaX = e.clientX - colorDragStart.current.x
        const deltaY = e.clientY - colorDragStart.current.y
        const newX = Math.max(0, Math.min(window.innerWidth - 120, colorElementStart.current.x + deltaX))
        const newY = Math.max(0, Math.min(window.innerHeight - 200, colorElementStart.current.y + deltaY))
        setColorPos({ x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
      if (isTemplateDragging) {
        setIsTemplateDragging(false)
        localStorage.setItem('template_dropdown_position', JSON.stringify(templatePos))
      }
      if (isColorDragging) {
        setIsColorDragging(false)
        localStorage.setItem('color_picker_position', JSON.stringify(colorPos))
      }
    }

    if (isTemplateDragging || isColorDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isTemplateDragging, isColorDragging, templatePos, colorPos])

  if (!isLoaded) return null

  return (
    <>
      {/* DRAGGABLE - Landing Page Dropdown */}
      <div 
        className="fixed z-[60]"
        style={{ left: templatePos.x, top: templatePos.y }}
      >
        <div className="relative">
          <div className={`flex items-center bg-white rounded-full shadow-lg border border-gray-200 ${isTemplateDragging ? 'shadow-2xl scale-105' : 'hover:shadow-xl'} transition-all`}>
            {/* Drag Handle */}
            <div 
              onMouseDown={handleTemplateDragStart}
              className="flex items-center justify-center px-2 py-2.5 cursor-grab active:cursor-grabbing border-r border-gray-100 hover:bg-gray-50 rounded-l-full"
              title="Drag to move"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            
            {/* Dropdown Button */}
            <button
              onClick={() => !isTemplateDragging && setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2.5 pr-4"
            >
              <Layout className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{selectedTemplate.name}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isDropdownOpen && !isTemplateDragging && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Select Template</span>
                    <button onClick={() => setIsDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        handleTemplateChange(template.id as TemplateType)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                        currentTemplate === template.id ? 'bg-teal-50' : ''
                      }`}
                    >
                      <span className={`text-sm font-medium ${currentTemplate === template.id ? 'text-teal-600' : 'text-gray-700'}`}>
                        {template.name}
                      </span>
                      {currentTemplate === template.id && (
                        <Check className="w-4 h-4 text-teal-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DRAGGABLE - Color Picker (Collapsible) */}
      <div 
        className="fixed z-50"
        style={{ left: colorPos.x, top: colorPos.y }}
      >
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 ${isColorDragging ? 'shadow-2xl scale-105' : ''} transition-all`}>
          {/* Header - Click to expand/collapse */}
          <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 rounded-t-2xl">
            {/* Drag Handle */}
            <div 
              onMouseDown={handleColorDragStart}
              className="cursor-grab active:cursor-grabbing"
              title="Drag to move"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            
            {/* Click area to toggle */}
            <div 
              className="flex items-center gap-2 flex-1"
              onClick={() => !isColorDragging && toggleThemeExpanded()}
            >
              <Palette className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-800 text-sm">Theme</span>
              {isThemeExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              )}
            </div>
          </div>

          {/* Expandable Content */}
          {isThemeExpanded && (
            <div className="p-3 pt-0 border-t border-gray-100">
              {/* Color Grid */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => !isColorDragging && handleColorChange(color.id as ThemeColor)}
                    className={`relative w-10 h-10 rounded-xl ${color.class} hover:scale-110 transition-transform ${
                      currentColor === color.id ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    title={color.name}
                  >
                    {currentColor === color.id && (
                      <Check className="absolute inset-0 m-auto w-5 h-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Selected Color Name */}
              <p className="text-xs text-gray-500 mt-2 text-center">
                {selectedColor.name}
              </p>

              {/* Language Selector */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Language</span>
                </div>
                <div className="space-y-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => !isColorDragging && handleLanguageChange(lang.id as Language)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                        currentLanguage === lang.id 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.name}</span>
                      {currentLanguage === lang.id && (
                        <Check className="w-3 h-3 ml-auto text-teal-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
