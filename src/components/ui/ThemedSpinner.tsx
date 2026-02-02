'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ThemedSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'accent' | 'white'
  className?: string
  showText?: boolean
  text?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const variantClasses = {
  primary: 'border-blue-600 border-t-transparent',
  secondary: 'border-gray-600 border-t-transparent', 
  accent: 'border-indigo-600 border-t-transparent',
  white: 'border-white border-t-transparent'
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base', 
  xl: 'text-lg'
}

export function ThemedSpinner({ 
  size = 'md',
  variant = 'primary',
  className,
  showText = false,
  text = 'Loading...'
}: ThemedSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* Spinner */}
      <div className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        variantClasses[variant]
      )} />
      
      {/* Loading Text */}
      {showText && (
        <p className={cn(
          'mt-3 font-medium text-gray-600',
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  )
}

// Full page loader component - Simple version
export function ThemedPageLoader({ 
  text = 'Loading...',
  variant = 'primary' 
}: { 
  text?: string
  variant?: 'primary' | 'secondary' | 'accent' | 'white'
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Simple Single Spinner */}
        <div className={cn(
          'animate-spin rounded-full h-8 w-8 border-2 border-gray-200 mx-auto',
          variant === 'primary' && 'border-t-blue-600',
          variant === 'secondary' && 'border-t-gray-600',
          variant === 'accent' && 'border-t-indigo-600',
          variant === 'white' && 'border-t-white'
        )} />
      </div>
    </div>
  )
}

// Inline loader for components
export function ThemedInlineLoader({ 
  size = 'sm',
  text,
  className 
}: { 
  size?: 'sm' | 'md'
  text?: string
  className?: string 
}) {
  return (
    <div className={cn('flex items-center justify-center py-4', className)}>
      <ThemedSpinner size={size} showText={!!text} text={text} />
    </div>
  )
}

// Button loader
export function ThemedButtonLoader({ 
  variant = 'white',
  size = 'sm' 
}: { 
  variant?: 'primary' | 'secondary' | 'accent' | 'white'
  size?: 'sm' | 'md'
}) {
  return (
    <ThemedSpinner 
      size={size} 
      variant={variant}
      className="mr-2"
    />
  )
}

export default ThemedSpinner