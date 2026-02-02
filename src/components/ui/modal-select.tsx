'use client'

import * as React from "react"
import { createPortal } from 'react-dom'
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

const ModalSelectContext = React.createContext<SelectContextValue | undefined>(undefined)

function useModalSelectContext() {
  const context = React.useContext(ModalSelectContext)
  if (!context) {
    throw new Error("ModalSelect components must be used within a ModalSelect")
  }
  return context
}

interface ModalSelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const ModalSelect = ({ value, defaultValue = "", onValueChange, children }: ModalSelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const currentValue = value !== undefined ? value : internalValue
  
  const handleValueChange = (newValue: string) => {
    console.log('🎯 ModalSelect: Value changing to:', newValue)
    
    if (value === undefined) {
      setInternalValue(newValue)
    }
    
    // Call the parent's onValueChange
    if (onValueChange) {
      onValueChange(newValue)
    }
    
    // Close the dropdown
    setOpen(false)
  }

  return (
    <ModalSelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange, 
      open, 
      setOpen, 
      triggerRef 
    }}>
      <div className="relative">
        {children}
      </div>
    </ModalSelectContext.Provider>
  )
}

interface ModalSelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

const ModalSelectTrigger = React.forwardRef<HTMLButtonElement, ModalSelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useModalSelectContext()

    const handleClick = () => {
      console.log('🖱️ ModalSelect trigger clicked, current open state:', open)
      setOpen(!open)
    }

    return (
      <button
        ref={(node) => {
          triggerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
      </button>
    )
  }
)
ModalSelectTrigger.displayName = "ModalSelectTrigger"

const ModalSelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useModalSelectContext()
  return <span>{value || placeholder}</span>
}

interface ModalSelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ModalSelectContent = React.forwardRef<HTMLDivElement, ModalSelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, triggerRef, setOpen } = useModalSelectContext()
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
    const contentRef = React.useRef<HTMLDivElement>(null)

    // Update position when dropdown opens
    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        })
        console.log('📍 ModalSelect position updated:', { top: rect.bottom + 4, left: rect.left, width: rect.width })
      }
    }, [open, triggerRef])

    // Handle click outside to close
    React.useEffect(() => {
      if (!open) return

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        
        // Don't close if clicking on trigger or content
        if (
          triggerRef.current?.contains(target) ||
          contentRef.current?.contains(target)
        ) {
          return
        }
        
        console.log('🖱️ ModalSelect: Click outside detected, closing dropdown')
        setOpen(false)
      }

      // Add listener with a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [open, setOpen, triggerRef])

    if (!open) return null

    const content = (
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          "fixed max-h-60 overflow-auto rounded-md border bg-white text-gray-900 shadow-2xl ring-1 ring-black ring-opacity-10 z-[999999]",
          className
        )}
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          backgroundColor: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    )

    return createPortal(content, document.body)
  }
)
ModalSelectContent.displayName = "ModalSelectContent"

interface ModalSelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

const ModalSelectItem = React.forwardRef<HTMLDivElement, ModalSelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useModalSelectContext()
    const isSelected = selectedValue === value

    const handleClick = () => {
      console.log('🖱️ ModalSelect item clicked:', value)
      onValueChange(value)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 transition-colors",
          isSelected && "bg-gray-100",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4 text-green-600" />}
        </span>
        {children}
      </div>
    )
  }
)
ModalSelectItem.displayName = "ModalSelectItem"

export { ModalSelect, ModalSelectContent, ModalSelectItem, ModalSelectTrigger, ModalSelectValue }