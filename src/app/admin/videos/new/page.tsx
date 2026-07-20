'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  description: string
  descriptionZh: string
  coverUrl: string
  videoUrl: string
  duration: number
  published: boolean
  visitorAccessible: boolean
  levelId: string
  topicIds: string[]
}

export default function VideoFormPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    titleZh: '',
    description: '',
    descriptionZh: '',
    coverUrl: '',
    videoUrl: '',
    duration: 0,
    published: false,
    visitorAccessible: false,
    levelId: '',
    topicIds: []
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  const levels = categories.filter(c => c.type === 'LEVEL')
  const topics = categories.filter(c => c.type === 'TOPIC')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryIds: [formData.levelId, ...formData.topicIds].filter(Boolean)
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '创建视频失败')
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">添加视频</h1>
        <Link href="/admin/videos" className="text-gray-600 hover:text-gray-900">
          ← 返回视频列表
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                韩语标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                中文标题 *
              </label>
              <input
                type="text"
                value={formData.titleZh}
                onChange={e => setFormData({ ...formData, titleZh: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                韩语描述
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                中文描述
              </label>
              <textarea
                value={formData.descriptionZh}
                onChange={e => setFormData({ ...formData, descriptionZh: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片 URL *
              </label>
              <input
                type="url"
                value={formData.coverUrl}
                onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                required
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频 URL *
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                required
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时长（秒） *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              required
              min={0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              等级 *
            </label>
            <select
              value={formData.levelId}
              onChange={e => setFormData({ ...formData, levelId: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">选择等级</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.nameZh}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主题
            </label>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className={`px-4 py-2 rounded-lg text-sm ${
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={e => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
              立即发布
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="visitorAccessible"
              checked={formData.visitorAccessible}
              onChange={e => setFormData({ ...formData, visitorAccessible: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="visitorAccessible" className="ml-2 text-sm font-medium text-gray-700">
              允许访客观看
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '创建视频'}
            </button>
            <Link
              href="/admin/videos"
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
