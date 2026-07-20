'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { VideoCard } from '@/components/public/VideoCard'
import { SearchBar } from '@/components/public/SearchBar'

interface Category {
  id: string
  name: string
  nameZh: string
  slug: string
  type: 'LEVEL' | 'TOPIC'
}

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

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '')
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '')

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

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

  const levels = categories.filter(c => c.type === 'LEVEL')
  const topics = categories.filter(c => c.type === 'TOPIC')

  const handleFilterChange = (level: string, topic: string) => {
    setSelectedLevel(level)
    setSelectedTopic(topic)
    const params = new URLSearchParams()
    if (level) params.set('level', level)
    if (topic) params.set('topic', topic)
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">浏览视频</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">等级</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleFilterChange('', selectedTopic)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  !selectedLevel ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                全部等级
              </button>
              {levels.map(level => (
                <button
                  key={level.id}
                  onClick={() => handleFilterChange(level.slug, selectedTopic)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedLevel === level.slug ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  {level.nameZh}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">主题</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleFilterChange(selectedLevel, '')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  !selectedTopic ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                全部主题
              </button>
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => handleFilterChange(selectedLevel, topic.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedTopic === topic.slug ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  {topic.nameZh}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <SearchBar />

          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500">加载视频中...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">暂无视频</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {videos.map(video => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
