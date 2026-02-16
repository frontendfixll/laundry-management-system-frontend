'use client'

/**
 * SlidePanel - Microsoft 365 style right-to-left slide panel for view/edit content.
 * Use instead of centered Dialog when you want detail/edit to open from the right.
 */

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SlidePanelProps {
  /** Whether the panel is open */
  open: boolean
  /** Called when the panel should close (backdrop click, close button, Escape) */
  onClose: () => void
  /** Optional title shown in the header */
  title?: React.ReactNode
  /** Panel width: default max-w-xl, use 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' */
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** Optional class for the panel container */
  className?: string
  /** Optional hide the header (title + close). You can render your own header in children. */
  hideHeader?: boolean
  /** Optional top accent bar color (e.g. 'bg-blue-500') */
  accentBar?: string
  children: React.ReactNode
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
}

export function SlidePanel({
  open,
  onClose,
  title,
  width = 'xl',
  className,
  hideHeader = false,
  accentBar,
  children,
}: SlidePanelProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel - slides from right to left (Microsoft 365 style) */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 flex flex-col',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
          widthClasses[width],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Panel'}
      >
        {accentBar && <div className={cn('h-1 w-full shrink-0', accentBar)} />}
        {!hideHeader && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 bg-white">
            {title != null && (
              <h2 className="text-lg font-semibold text-gray-900 truncate pr-2">{title}</h2>
            )}
            <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </>
  )
}
