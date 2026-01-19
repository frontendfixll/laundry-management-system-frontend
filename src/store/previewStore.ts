import { create } from 'zustand'

interface PreviewState {
  isAdminPreviewMode: boolean
  originalRole: string | null
  setAdminPreviewMode: (enabled: boolean, originalRole?: string) => void
  clearPreviewMode: () => void
}

/**
 * Store for managing Admin Preview Mode
 * Allows admins to preview customer pages without losing admin privileges
 */
export const usePreviewStore = create<PreviewState>((set) => ({
  isAdminPreviewMode: false,
  originalRole: null,
  
  setAdminPreviewMode: (enabled: boolean, originalRole?: string) => {
    set({ 
      isAdminPreviewMode: enabled,
      originalRole: originalRole || null
    })
  },
  
  clearPreviewMode: () => {
    set({ 
      isAdminPreviewMode: false,
      originalRole: null
    })
  }
}))