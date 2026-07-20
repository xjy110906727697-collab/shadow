'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索视频..."
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          搜索
        </button>
      </div>
    </form>
  )
}
