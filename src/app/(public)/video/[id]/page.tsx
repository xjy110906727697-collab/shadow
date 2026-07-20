'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/videos/${params.id}`)
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
        <div className="lg:w-3/5">
          <VideoPlayer
            videoUrl={video.videoUrl}
            onTimeUpdate={setCurrentTime}
          />
        </div>

        <div className="lg:w-2/5 flex flex-col">
          <div className="flex items-center justify-end gap-2 mb-3">
            <span className="text-sm text-gray-600">字号：</span>
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-1 text-sm rounded ${
                  fontSize === size
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
              </button>
            ))}
          </div>

          <SubtitlePanel
            subtitles={video.subtitles}
            currentTime={currentTime}
            onSeek={handleSeek}
            fontSize={fontSize}
          />
        </div>
      </div>
    </div>
  )
}
