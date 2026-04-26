'use client'

// Internal preview of the tenant landing-page templates. Not linked from any
// public page — visit `/preview-templates` directly. Useful for designers and
// admins to see what a tenant's landing looks like across the four templates
// without needing to log in or set branding. The page itself is not gated, so
// don't show anything sensitive here.

import LandingPageSelector from '@/components/landing/LandingPageSelector'

export default function PreviewTemplatesPage() {
    return <LandingPageSelector />
}
