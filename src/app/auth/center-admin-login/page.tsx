'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Redirect to the main super admin login page (legacy URL support)
export default function SuperAdminLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/superadmin/auth/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-gray-300">Redirecting to Super Admin Login...</p>
      </div>
    </div>
  )
}
