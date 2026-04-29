'use client'

import { ArrowRight, Store } from 'lucide-react'
import type { TenantSummary } from './FindYourLaundry'
import { rememberTenant } from './recentlyVisitedStore'

interface Props {
    tenant: TenantSummary
}

// Resolves the URL the user lands on when they click a result. Tenants with a
// configured custom domain go there directly; everyone else uses a same-origin
// path so the click works regardless of which subdomain the user came from.
function getTenantUrl(tenant: TenantSummary): string {
    if (tenant.customDomain) return `https://${tenant.customDomain}`
    return `/${tenant.slug}`
}

export default function TenantResultCard({ tenant }: Props) {
    const url = getTenantUrl(tenant)
    const displayName = tenant.businessName || tenant.name
    const city = tenant.contact?.address?.city
    const logo = tenant.branding?.logo?.url
    const themeColor = tenant.branding?.theme?.primaryColor || '#14b8a6'

    const handleClick = () => {
        rememberTenant(tenant)
    }

    return (
        <a
            href={url}
            onClick={handleClick}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all group"
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ background: logo ? '#fff' : themeColor }}
                >
                    {logo ? (
                        <img src={logo} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-6 h-6 text-white" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {displayName}
                    </h3>
                    {city && (
                        <p className="text-sm text-gray-500 truncate">{city}</p>
                    )}
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
        </a>
    )
}
