'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Search } from 'lucide-react'
import TenantSearchBar from './TenantSearchBar'
import TenantResultCard from './TenantResultCard'
import RecentlyVisited from './RecentlyVisited'
import NoResults from './NoResults'

export interface TenantSummary {
    _id: string
    name: string
    businessName?: string
    slug: string
    subdomain?: string
    customDomain?: string
    branding?: {
        logo?: { url?: string }
        theme?: { primaryColor?: string }
    }
    contact?: {
        address?: { city?: string }
    }
}

export default function FindYourLaundry() {
    const [input, setInput] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    // Debounce input → search query (300ms after user stops typing)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(input.trim()), 300)
        return () => clearTimeout(timer)
    }, [input])

    const trimmed = debouncedQuery
    const hasQuery = trimmed.length >= 2

    const { data, isPending, isError } = useQuery({
        queryKey: ['public', 'tenancy', 'list', { q: trimmed }],
        queryFn: async (): Promise<TenantSummary[]> => {
            const response = await api.get('/public/tenancy/list', {
                params: { q: trimmed, limit: 20 },
            })
            return response.data?.data?.tenancies ?? []
        },
        enabled: hasQuery,
        staleTime: 30_000,
    })

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
            {/* Top bar */}
            <header className="border-b border-gray-200 bg-white/70 backdrop-blur">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
                            L
                        </div>
                        <span className="font-semibold text-gray-900">LaundryLobby</span>
                    </div>
                    <a
                        href="https://www.laundrylobby.com"
                        className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
                    >
                        Are you a laundry business? →
                    </a>
                </div>
            </header>

            {/* Hero + search */}
            <section className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                    Find your local laundry
                </h1>
                <p className="text-gray-600 mb-8">
                    Search by name to visit your laundry's online store.
                </p>

                <TenantSearchBar value={input} onChange={setInput} />
            </section>

            {/* Body */}
            <section className="max-w-3xl mx-auto px-6 pb-24">
                {!hasQuery && <RecentlyVisited />}

                {hasQuery && isPending && (
                    <div className="flex items-center justify-center py-16 text-gray-500">
                        <Search className="w-5 h-5 mr-2 animate-pulse" />
                        Searching...
                    </div>
                )}

                {hasQuery && !isPending && isError && (
                    <div className="text-center py-16 text-red-600">
                        Could not load results. Try again in a moment.
                    </div>
                )}

                {hasQuery && !isPending && !isError && (data?.length ?? 0) === 0 && (
                    <NoResults query={trimmed} />
                )}

                {hasQuery && !isPending && !isError && (data?.length ?? 0) > 0 && (
                    <div className="space-y-3 mt-6">
                        <p className="text-sm text-gray-500">
                            {data!.length} {data!.length === 1 ? 'laundry' : 'laundries'} found
                        </p>
                        {data!.map(tenant => (
                            <TenantResultCard key={tenant._id} tenant={tenant} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
