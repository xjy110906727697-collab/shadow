'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FileUpload } from '@/components/admin/FileUpload'
import { VodVideoUpload } from '@/components/admin/VodVideoUpload'

interface Category {
  id: string
  name: string
  nameZh: string
  slug: string
  type: 'LEVEL' | 'TOPIC'
}

interface VideoFormData {
  title: string
  titleZh: string
  coverUrl: string
  videoUrl: string
  duration: number
  episodeNumber: number
  difficulty: number
  instructor: string
  published: boolean
  visitorAccessible: boolean
  topicIds: string[]
}

export default function VideoEditPage() {
  const router = useRouter()
  const params = useParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vodVideoId, setVodVideoId] = useState('')
  const [dbId, setDbId] = useState<string | null>(null)
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    titleZh: '',
    coverUrl: '',
    videoUrl: '',
    duration: 0,
    episodeNumber: 0,
    difficulty: 0,
    instructor: '',
    published: false,
    visitorAccessible: false,
    topicIds: []
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)

    fetch(`/api/admin/videos/${params.id}`)
      .then(res => res.json())
      .then(data => {
        const topicCategories = data.categories?.filter((c: any) => c.category.type === 'TOPIC')

        setFormData({
          title: data.title,
          titleZh: data.titleZh,
          coverUrl: data.coverUrl,
          videoUrl: data.videoUrl,
          duration: data.duration,
          episodeNumber: data.episodeNumber || 0,
          difficulty: data.difficulty || 0,
          instructor: data.instructor || '',
          published: data.published,
          visitorAccessible: data.visitorAccessible || false,
          topicIds: topicCategories?.map((c: any) => c.category.id) || []
        })
        setVodVideoId(data.vodVideoId || '')
        setDbId(data.id || null)
      })
      .catch(console.error)
  }, [params.id])

  const levels = categories.filter(c => c.type === 'LEVEL')
  const topics = categories.filter(c => c.type === 'TOPIC')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/videos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          episodeNumber: formData.episodeNumber || null,
          difficulty: formData.difficulty || null,
          instructor: formData.instructor || null,
          categoryIds: formData.topicIds
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '更新视频失败')
      }

      router.push('/admin/videos')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误')
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      topicIds: prev.topicIds.includes(topicId)
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId]
    }))
  }

  const inputClass = "w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="min-h-screen bg-black/20 flex items-start justify-center py-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">编辑视频</h2>
          <Link href="/admin/videos" className="text-gray-500 hover:text-gray-700 text-sm">
            ✕
          </Link>
        </div>

        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>韩语标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>中文标题 *</label>
                <input
                  type="text"
                  value={formData.titleZh}
                  onChange={e => setFormData({ ...formData, titleZh: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload
                label="封面图片"
                accept="image/*"
                type="covers"
                value={formData.coverUrl}
                onChange={url => setFormData({ ...formData, coverUrl: url })}
                required
                placeholder="支持 JPG、PNG 等格式"
              />
              <VodVideoUpload
                label="视频文件 (阿里云VOD)"
                vodVideoId={vodVideoId}
                onUploadComplete={(newVodId, newDbId) => {
                  setVodVideoId(newVodId)
                  setDbId(newDbId)
                }}
                onRemove={() => {
                  setVodVideoId('')
                  setDbId(null)
                }}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>时长（秒） *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  required
                  min={0}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>期数</label>
                <input
                  type="number"
                  value={formData.episodeNumber}
                  onChange={e => setFormData({ ...formData, episodeNumber: parseInt(e.target.value) || 0 })}
                  min={0}
                  placeholder="如 11"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>难度（1-5星）</label>
                <input
                  type="number"
                  value={formData.difficulty}
                  onChange={e => setFormData({ ...formData, difficulty: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={5}
                  placeholder="1-5"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>频道</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="频道"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>主题</label>
              <div className="flex flex-wrap gap-2">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      formData.topicIds.includes(topic.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic.nameZh}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>发布状态</label>
                <select
                  value={formData.published ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, published: e.target.value === 'true' })}
                  className={inputClass}
                >
                  <option value="false">草稿</option>
                  <option value="true">已发布</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>允许访客观看</label>
                <select
                  value={formData.visitorAccessible ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, visitorAccessible: e.target.value === 'true' })}
                  className={inputClass}
                >
                  <option value="false">否</option>
                  <option value="true">是</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                {loading ? '更新中...' : '更新视频'}
              </button>
              <Link
                href="/admin/videos"
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 text-sm"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
