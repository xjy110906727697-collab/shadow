'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { VideoCard } from '@/components/public/VideoCard'
import { useSession } from 'next-auth/react'

interface Video {
  id: string
  title: string
  titleZh: string
  description?: string | null
  descriptionZh?: string | null
  coverUrl: string
  duration: number
  episodeNumber?: number | null
  difficulty?: number | null
  instructor?: string | null
  level?: string | null
  topics?: { id: string; name: string; slug: string }[]
  visitorAccessible?: boolean
  createdAt?: string
}

export default function FavoritesPage() {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const isVisitor = !session

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch('/api/favorites')
        const data = await res.json()
        const ids: string[] = data.favorites || []

        if (ids.length === 0) {
          setFavorites([])
          setLoading(false)
          return
        }

        const results = await Promise.all(
          ids.map(id =>
            fetch(`/api/videos/${id}`).then(r => r.ok ? r.json() : null)
          )
        )
        setFavorites(results.filter((v): v is Video => v && v.id))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [session])

  return (
    <div className="w-full px-4 md:px-8 py-4 pb-20 md:pb-4">

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-slate-400">加载中...</p>
        </div>
      ) : !session ? (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-slate-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-lg mb-2">需要登录查看收藏</p>
          <p className="text-gray-400 dark:text-slate-500 mb-6">登录后即可查看和管理您的收藏视频</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            去登录
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-slate-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-lg mb-2">还没有收藏的视频</p>
          <p className="text-gray-400 dark:text-slate-500 mb-6">在视频页面点击爱心图标即可收藏</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            去浏览视频
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
          {favorites.map(video => (
            <VideoCard
              key={video.id}
              {...video}
              isVisitor={isVisitor}
            />
          ))}
        </div>
      )}
    </div>
  )
}
