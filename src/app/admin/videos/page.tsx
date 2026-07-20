'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  titleZh: string
  duration: number
  published: boolean
  createdAt: string
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos')
      const data = await res.json()
      setVideos(data)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个视频吗？')) return

    try {
      await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
      setVideos(videos.filter(v => v.id !== id))
    } catch (error) {
      console.error('Failed to delete video:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <p className="text-gray-500">加载视频中...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">视频管理</h1>
        <Link
          href="/admin/videos/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          添加视频
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时长</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {videos.map(video => (
                <tr key={video.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{video.titleZh}</div>
                    <div className="text-sm text-gray-500">{video.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDuration(video.duration)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      video.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {video.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/admin/videos/${video.id}/subtitles`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      字幕
                    </Link>
                    <Link
                      href={`/admin/videos/${video.id}/edit`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
