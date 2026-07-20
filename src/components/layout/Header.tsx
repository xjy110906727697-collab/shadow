'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

function useVideoTitle() {
  const pathname = usePathname()
  const match = pathname?.match(/^\/video\/(.+)$/)
  const videoId = match?.[1] || null
  const [title, setTitle] = useState<string | null>(null)

  useEffect(() => {
    if (!videoId) { setTitle(null); return }
    fetch(`/api/videos/${videoId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setTitle(data?.titleZh || null))
      .catch(() => setTitle(null))
  }, [videoId])

  return { videoId, title }
}

const subtitleModes = ['双语', '韩文', '中文', '盲听'] as const

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { videoId, title } = useVideoTitle()
  const isVideoPage = !!videoId

  // All hooks always called — never skip hooks
  const [subtitleMode, setSubtitleMode] = useState<string>('双语')
  const [favKey, setFavKey] = useState(0)

  const handleSubtitleMode = (mode: string) => {
    setSubtitleMode(mode)
    window.dispatchEvent(new CustomEvent('subtitle-mode', { detail: mode }))
  }

  const isFavorited = videoId ? (() => {
    try {
      const stored = localStorage.getItem('favorites')
      const ids: string[] = stored ? JSON.parse(stored) : []
      return ids.includes(videoId)
    } catch { return false }
  })() : false

  const toggleFavorite = () => {
    if (!videoId) return
    const stored = localStorage.getItem('favorites')
    let ids: string[] = stored ? JSON.parse(stored) : []
    if (ids.includes(videoId)) {
      ids = ids.filter(id => id !== videoId)
    } else {
      ids.push(videoId)
    }
    localStorage.setItem('favorites', JSON.stringify(ids))
    setFavKey(prev => prev + 1)
  }

  // Normal page header
  if (!isVideoPage) {
    return (
      <header className="border-b border-gray-200 bg-white">
        <div className="w-full px-4 md:px-6 h-12 flex items-center justify-between">
          <Link href="/browse" className="text-lg font-bold text-blue-600">
            HangulStudy
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/browse" className="text-gray-600 hover:text-gray-900">首页</Link>
            <Link href="/browse?show=favorites" className="text-gray-600 hover:text-gray-900">收藏</Link>
            <Link href="/learning-method" className="text-gray-600 hover:text-gray-900">学习方法</Link>
            <Link href="/account" className="text-gray-600 hover:text-gray-900">个人中心</Link>
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 text-xs">管理</Link>
            )}
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="w-full px-4 md:px-6 h-14 flex items-center justify-between max-w-6xl mx-auto gap-2">
        {/* Left: back + logo + title */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/browse"
            className="flex items-center text-gray-500 hover:text-gray-800 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="h-5 w-px bg-gray-300 shrink-0" />
          <Link href="/browse" className="text-lg font-bold text-blue-600 whitespace-nowrap shrink-0">
            HangulStudy
          </Link>
          {title && (
            <span className="text-sm text-gray-700 truncate ml-1 hidden md:inline">{title}</span>
          )}
        </div>

        {/* Right: subtitle switches + action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {subtitleModes.map(mode => (
            <button
              key={mode}
              onClick={() => handleSubtitleMode(mode)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                subtitleMode === mode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {mode}
            </button>
          ))}
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-loop'))}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            title="循环播放"
          >
            🔁 循环
          </button>
          <button
            onClick={toggleFavorite}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              isFavorited
                ? 'bg-red-50 text-red-500 border-red-300'
                : 'bg-white text-gray-500 border-gray-300 hover:border-red-400 hover:text-red-500'
            }`}
            title="收藏"
          >
            {isFavorited ? '❤️' : '🤍'} 收藏
          </button>
        </div>
      </div>
    </header>
  )
}
