'use client'

import { Search, X } from 'lucide-react'

interface Props {
    value: string
    onChange: (value: string) => void
}

export default function TenantSearchBar({ value, onChange }: Props) {
    return (
        <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="search"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Search by laundry name..."
                aria-label="Search laundries"
                autoFocus
                className="w-full pl-12 pr-12 py-4 text-base border border-gray-200 rounded-2xl shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all bg-white"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}
