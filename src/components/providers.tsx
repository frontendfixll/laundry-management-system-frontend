'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import { TenancyThemeProvider } from '@/contexts/TenancyThemeContext'
import { PermissionSyncProvider } from './PermissionSyncProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <TenancyThemeProvider>
        <PermissionSyncProvider>
          {children}
        </PermissionSyncProvider>
      </TenancyThemeProvider>
      {/* Single global Toaster — react-hot-toast uses a singleton store, so
          mounting more than one renders every toast multiple times. Do NOT
          add additional <Toaster /> components elsewhere in the tree. */}
      <Toaster
        position="top-center"
        gutter={8}
        containerStyle={{ top: 20, zIndex: 99999 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '380px',
            width: '380px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#ffffff' },
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #22c55e',
            },
          },
          error: {
            duration: 6000,
            iconTheme: { primary: '#EF4444', secondary: '#ffffff' },
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #f87171',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}
