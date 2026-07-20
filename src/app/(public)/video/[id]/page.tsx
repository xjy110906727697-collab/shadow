'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { VideoPlayer } from '@/components/public/VideoPlayer'
import { SubtitlePanel } from '@/components/public/SubtitlePanel'

interface SubtitleEntry {
  id: string
  index: number
  startTime: number
  endTime: number
  ko: string
  zh: string
}

interface VideoDetail {
  id: string
  title: string
  titleZh: string
  description?: string | null
  descriptionZh?: string | null
  coverUrl: string
  videoUrl: string
  duration: number
  subtitles: SubtitleEntry[]
}

export default function VideoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/videos/${params.id}`)
        
        if (res.status === 403) {
          setIsLocked(true)
          setLoading(false)
          return
        }
        
        const data = await res.json()
        setVideo(data)
      } catch (error) {
        console.error('Failed to fetch video:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchVideo()
    }
  }, [params.id])

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    const videoElement = document.querySelector('video')
    if (videoElement) {
      videoElement.currentTime = time
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">加载视频中...</p>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">需要订阅</h2>
          <p className="text-gray-600 mb-6">此视频需要订阅后才能观看，请登录或注册以获取完整访问权限。</p>
          <div className="flex gap-3">
            <Link href="/login" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              登录 / 注册
            </Link>
            <Link href="/pricing" className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
              查看订阅
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">视频未找到</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{video.titleZh}</h1>
        <p className="text-gray-600 mb-2">{video.title}</p>
        {(video.descriptionZh || video.description) && (
          <p className="text-gray-700">{video.descriptionZh || video.description}</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[65%]">
          <VideoPlayer
            videoUrl={video.videoUrl}
            onTimeUpdate={setCurrentTime}
          />
        </div>

        <div className="lg:w-[35%] flex flex-col">
          <SubtitlePanel
            subtitles={video.subtitles}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>
      </div>
    </div>
  )
}
