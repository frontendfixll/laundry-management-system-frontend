'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

interface SimpleSelectProps {
  value?: string
  placeholder?: string
  onValueChange?: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function SimpleSelect({ value, placeholder, onValueChange, options, className }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || '')
  const selectRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    console.log('🎯 Option selected:', optionValue)
    setSelectedValue(optionValue)
    onValueChange?.(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(option => option.value === selectedValue)

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          selectedValue ? 'border-green-500 bg-green-50' : ''
        )}
        onClick={() => {
          console.log('🖱️ Select trigger clicked, current state:', isOpen)
          setIsOpen(!isOpen)
        }}
      >
        <span className={selectedValue ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption?.label || placeholder || 'Select an option'}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-[999999] mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
                  selectedValue === option.value && "bg-gray-100"
                )}
                onClick={() => handleSelect(option.value)}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {selectedValue === option.value && <Check className="h-4 w-4 text-green-600" />}
                </span>
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}