'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Table, Button, Tag, Space, Input, Select, message, Popconfirm, Modal } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'

interface Video {
  id: string
  title: string
  titleZh: string
  coverUrl: string
  videoUrl: string
  duration: number
  episodeNumber?: number | null
  difficulty?: number | null
  instructor?: string | null
  published: boolean
  visitorAccessible: boolean
  createdAt: string
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [publishedFilter, setPublishedFilter] = useState<string>('')
  const [visitorFilter, setVisitorFilter] = useState<string>('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<string>('descend')

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.current.toString())
      params.set('pageSize', pagination.pageSize.toString())
      params.set('sortField', sortField)
      params.set('sortOrder', sortOrder)
      if (search) params.set('search', search)
      if (publishedFilter) params.set('published', publishedFilter)
      if (visitorFilter) params.set('visitorAccessible', visitorFilter)

      const res = await fetch(`/api/admin/videos?${params.toString()}`)
      const data = await res.json()
      setVideos(data.videos)
      setPagination(prev => ({ ...prev, total: data.pagination.total }))
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.current, pagination.pageSize, sortField, sortOrder, search, publishedFilter, visitorFilter])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
      message.success('删除成功')
      fetchVideos()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleToggleVisitor = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorAccessible: !current }),
      })
      message.success('更新成功')
      fetchVideos()
    } catch (error) {
      message.error('更新失败')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image')

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: any,
    sorter: SorterResult<Video> | SorterResult<Video>[]
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter
    setPagination(prev => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 10,
    }))
    if (s?.field) {
      setSortField(s.field as string)
      setSortOrder(s.order || 'descend')
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const columns: ColumnsType<Video> = [
    {
      title: '标题',
      dataIndex: 'titleZh',
      sorter: true,
      render: (_: any, record: Video) => (
        <div>
          <div className="font-medium">{record.titleZh}</div>
          <div className="text-sm text-gray-500">{record.title}</div>
        </div>
      ),
    },
    {
      title: '封面',
      width: 80,
      render: (_: any, record: Video) =>
        record.coverUrl ? (
          <img
            src={record.coverUrl}
            alt="封面"
            className="w-12 h-8 rounded object-cover cursor-pointer hover:opacity-80"
            onClick={() => { setPreviewUrl(record.coverUrl); setPreviewType('image') }}
          />
        ) : (
          <span className="text-xs text-gray-400">无</span>
        ),
    },
    {
      title: '视频',
      width: 60,
      render: (_: any, record: Video) =>
        record.videoUrl ? (
          <video
            src={record.videoUrl}
            className="w-12 h-8 rounded object-cover cursor-pointer hover:opacity-80"
            preload="none"
            onClick={() => { setPreviewUrl(record.videoUrl); setPreviewType('video') }}
          />
        ) : (
          <span className="text-xs text-gray-400">无</span>
        ),
    },
    {
      title: '期数',
      dataIndex: 'episodeNumber',
      width: 60,
      render: (val: number | null) => val ? <span>第{val}期</span> : '-',
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 80,
      render: (val: number | null) =>
        val ? <span className="text-yellow-500">{'★'.repeat(val)}{'☆'.repeat(5 - val)}</span> : '-',
    },
    {
      title: '博主',
      dataIndex: 'instructor',
      width: 100,
      render: (val: string | null) => val || '-',
    },
    {
      title: '时长',
      dataIndex: 'duration',
      sorter: true,
      width: 100,
      render: (val: number) => formatDuration(val),
    },
    {
      title: '状态',
      dataIndex: 'published',
      sorter: true,
      width: 100,
      render: (val: boolean) => (
        <Tag color={val ? 'green' : 'default'}>{val ? '已发布' : '草稿'}</Tag>
      ),
    },
    {
      title: '访客可看',
      dataIndex: 'visitorAccessible',
      sorter: true,
      width: 100,
      render: (val: boolean, record: Video) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleToggleVisitor(record.id, val)}
          style={{ color: val ? '#52c41a' : '#999' }}
        >
          {val ? '是' : '否'}
        </Button>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: true,
      width: 150,
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Video) => (
        <Space>
          <Link href={`/admin/videos/${record.id}/subtitles`} className="text-blue-600">
            字幕
          </Link>
          <Link href={`/admin/videos/${record.id}/edit`} className="text-blue-600">
            编辑
          </Link>
          <Popconfirm title="确定要删除这个视频吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">视频管理</h1>
        <Link href="/admin/videos/new">
          <Button type="primary" icon={<PlusOutlined />}>添加视频</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <Space wrap>
          <Input
            placeholder="搜索标题"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            value={publishedFilter}
            onChange={val => { setPublishedFilter(val); setPagination(prev => ({ ...prev, current: 1 })) }}
            style={{ width: 120 }}
            options={[
              { value: '', label: '全部状态' },
              { value: 'true', label: '已发布' },
              { value: 'false', label: '草稿' },
            ]}
          />
          <Select
            value={visitorFilter}
            onChange={val => { setVisitorFilter(val); setPagination(prev => ({ ...prev, current: 1 })) }}
            style={{ width: 120 }}
            options={[
              { value: '', label: '全部' },
              { value: 'true', label: '访客可看' },
              { value: 'false', label: '仅会员' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
        </Space>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table<Video>
          columns={columns}
          dataSource={videos}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={handleTableChange}
        />
      </div>

      <Modal
        open={!!previewUrl}
        footer={null}
        width={previewType === 'video' ? 800 : 500}
        onCancel={() => setPreviewUrl(null)}
        centered
      >
        {previewType === 'video' ? (
          <video src={previewUrl!} controls autoPlay className="w-full rounded" />
        ) : (
          <img src={previewUrl!} alt="预览" className="w-full rounded" />
        )}
      </Modal>
    </div>
  )
}
