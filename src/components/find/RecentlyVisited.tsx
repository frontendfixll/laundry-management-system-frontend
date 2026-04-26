'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import TenantResultCard from './TenantResultCard'
import { getRecentTenants, type RecentTenant } from './recentlyVisitedStore'
import type { TenantSummary } from './FindYourLaundry'

export default function RecentlyVisited() {
    const [recent, setRecent] = useState<RecentTenant[]>([])
    const [hydrated, setHydrated] = useState(false)

    // Read from localStorage after hydration to avoid SSR/CSR mismatch.
    useEffect(() => {
        setRecent(getRecentTenants())
        setHydrated(true)
    }, [])

    if (!hydrated || recent.length === 0) return null

    // Adapt RecentTenant → TenantSummary for the card.
    const asSummary = (r: RecentTenant): TenantSummary => ({
        _id: r._id,
        name: r.name,
        businessName: r.businessName,
        slug: r.slug,
        customDomain: r.customDomain,
        branding: r.branding,
        contact: r.contact,
    })

    return (
        <div className="mt-12">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Recently visited</span>
            </div>
            <div className="space-y-3">
                {recent.map(r => (
                    <TenantResultCard key={r._id} tenant={asSummary(r)} />
                ))}
            </div>
        </div>
    )
}
