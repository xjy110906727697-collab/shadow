'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { VideoCard } from '@/components/public/VideoCard'
import { FilterBar } from '@/components/public/FilterBar'
import { SearchBar } from '@/components/public/SearchBar'

interface Video {
  id: string
  title: string
  titleZh: string
  description?: string | null
  descriptionZh?: string | null
  coverUrl: string
  duration: number
  level?: string | null
}

export default function Home() {
  const searchParams = useSearchParams()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams(searchParams)
        const res = await fetch(`/api/videos?${params.toString()}`)
        const data = await res.json()
        setVideos(data.videos)
      } catch (error) {
        console.error('Failed to fetch videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to HangulStudy</h1>
      <p className="text-gray-600 mb-8">
        Learn Korean with interactive video lessons and synchronized subtitles.
      </p>

      <SearchBar />
      <FilterBar />

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No videos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      )}
    </div>
  )
}
