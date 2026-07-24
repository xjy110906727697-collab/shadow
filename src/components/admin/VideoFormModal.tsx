'use client'

import { useEffect, useState } from 'react'
import { Modal, Select, message } from 'antd'
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

interface VideoFormModalProps {
  open: boolean
  editId: string | null
  onClose: () => void
  onSuccess: () => void
}

const emptyForm: VideoFormData = {
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
  topicIds: [],
}

export function VideoFormModal({ open, editId, onClose, onSuccess }: VideoFormModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vodVideoId, setVodVideoId] = useState('')
  const [dbId, setDbId] = useState<string | null>(null)
  const [formData, setFormData] = useState<VideoFormData>(emptyForm)

  const isEdit = !!editId

  // 加载分类
  useEffect(() => {
    if (!open) return
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [open])

  // 编辑模式：加载视频数据
  useEffect(() => {
    if (!open || !editId) {
      if (!open) {
        setFormData(emptyForm)
        setVodVideoId('')
        setDbId(null)
        setError('')
      }
      return
    }
    fetch(`/api/admin/videos/${editId}`)
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
          topicIds: topicCategories?.map((c: any) => c.category.id) || [],
        })
        setVodVideoId(data.vodVideoId || '')
        setDbId(data.id || null)
      })
      .catch(console.error)
  }, [open, editId])

  const topics = categories.filter(c => c.type === 'TOPIC')

  const handleSubmit = async () => {
    setError('')
    if (!formData.title || !formData.titleZh) {
      message.error('标题不能为空')
      return
    }
    setLoading(true)

    try {
      const payload = {
        ...formData,
        videoUrl: vodVideoId,
        episodeNumber: formData.episodeNumber || null,
        difficulty: formData.difficulty || null,
        instructor: formData.instructor || null,
        categoryIds: formData.topicIds,
      }

      let res: Response
      if (isEdit && dbId) {
        res = await fetch(`/api/admin/videos/${dbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '操作失败')
      }

      message.success(isEdit ? '更新成功' : '创建成功')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:bg-slate-800 dark:text-slate-200'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'

  return (
    <Modal
      title={isEdit ? '编辑视频' : '添加视频'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText={isEdit ? '更新' : '创建'}
      cancelText="取消"
      width={640}
      destroyOnHidden
      className="rounded-xl overflow-hidden"
    >
      <div className="space-y-4 -mt-1">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
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

        {/* 频道 + 主题 并排各一半 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Select
              mode="multiple"
              value={formData.topicIds}
              onChange={vals => setFormData({ ...formData, topicIds: vals })}
              className="w-full"
              placeholder="请选择主题"
              options={topics.map(t => ({ value: t.id, label: t.nameZh }))}
            />
          </div>
        </div>

        {/* 发布 + 访客 下拉 */}
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
      </div>
    </Modal>
  )
}
