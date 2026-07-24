'use client'

import { Search } from 'lucide-react'

interface Props {
    query: string
}

export default function NoResults({ query }: Props) {
    return (
        <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No laundries found for "{query}"
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try a different name, or ask your laundry to list themselves on LaundryLobby.
            </p>
            <a
                href="https://www.laundrylobby.com"
                className="inline-flex items-center px-5 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
                Want to list your laundry? →
            </a>
        </div>
    )
}
