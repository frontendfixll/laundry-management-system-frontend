import type { TenantSummary } from './FindYourLaundry'

// localStorage-backed list of tenants the visitor has clicked into. Keeps last
// 5, most-recent-first. Survives across browser sessions but is per-device.
const STORAGE_KEY = 'recently-visited-tenants'
const MAX_ITEMS = 5

export type RecentTenant = Pick<
    TenantSummary,
    '_id' | 'name' | 'businessName' | 'slug' | 'customDomain' | 'branding'
> & {
    contact?: TenantSummary['contact']
    visitedAt: number
}

export function getRecentTenants(): RecentTenant[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export function rememberTenant(tenant: TenantSummary): void {
    if (typeof window === 'undefined') return
    try {
        const existing = getRecentTenants().filter(t => t.slug !== tenant.slug)
        const next: RecentTenant[] = [
            {
                _id: tenant._id,
                name: tenant.name,
                businessName: tenant.businessName,
                slug: tenant.slug,
                customDomain: tenant.customDomain,
                branding: tenant.branding,
                contact: tenant.contact,
                visitedAt: Date.now(),
            },
            ...existing,
        ].slice(0, MAX_ITEMS)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
        // Quota errors / privacy mode — silently ignore; recently-visited is a
        // nice-to-have, not load-bearing.
    }
}

export function forgetTenant(slug: string): void {
    if (typeof window === 'undefined') return
    try {
        const next = getRecentTenants().filter(t => t.slug !== slug)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
        // ignore
    }
}
