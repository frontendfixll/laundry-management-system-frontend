'use client'

import { notFound } from 'next/navigation'

// This is a catch-all route that will handle any unmatched routes within a tenant
// It will automatically trigger the not-found.tsx page
export default function TenantCatchAll() {
  // This will trigger the not-found.tsx page in the [tenant] directory
  notFound()
}