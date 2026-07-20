'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
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
  visitorAccessible?: boolean
}

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '')
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '')
  const observerRef = useRef<HTMLDivElement>(null)
  const isVisitor = !session
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    const handleVideoLocked = () => setShowSubscribeModal(true)
    window.addEventListener('video-locked', handleVideoLocked)
    return () => window.removeEventListener('video-locked', handleVideoLocked)
  }, [])

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      setPage(1)
      try {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1')
        const res = await fetch(`/api/videos?${params.toString()}`)
        const data = await res.json()
        setVideos(data.videos)
        setTotalPages(data.pagination.totalPages)
      } catch (error) {
        console.error('Failed to fetch videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [searchParams])

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return
    
    setLoadingMore(true)
    const nextPage = page + 1
    
    try {
      const params = new URLSearchParams(searchParams)
      params.set('page', nextPage.toString())
      const res = await fetch(`/api/videos?${params.toString()}`)
      const data = await res.json()
      setVideos(prev => [...prev, ...data.videos])
      setPage(nextPage)
    } catch (error) {
      console.error('Failed to load more videos:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, loadingMore, page, totalPages])

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
    <div className="container mx-auto px-4 py-4">
      {isVisitor && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">您正在以访客身份浏览</p>
              <p className="text-sm mt-1">登录后可观看全部视频内容</p>
            </div>
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
              登录 / 注册
            </Link>
          </div>
        </div>
      )}

      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSubscribeModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">开通订阅</h3>
            <p className="text-gray-600 mb-6">此视频需要订阅后才能观看，请登录或注册以获取完整访问权限。</p>
            <div className="flex gap-3">
              <Link href="/login" className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700">
                登录 / 注册
              </Link>
              <Link href="/pricing" className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-200">
                查看订阅
              </Link>
            </div>
          </div>
        </div>
      )}

      <SearchBar />
      
      <h1 className="text-3xl font-bold mb-6">浏览视频</h1>

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
          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500">加载视频中...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">暂无视频</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {videos.map(video => (
                  <VideoCard
                    key={video.id}
                    {...video}
                    isVisitor={isVisitor}
                  />
                ))}
              </div>
              
              <div ref={observerRef} className="py-8 text-center">
                {loadingMore && (
                  <p className="text-gray-500">加载更多...</p>
                )}
                {!loadingMore && page < totalPages && (
                  <p className="text-gray-400">向下滚动加载更多</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
