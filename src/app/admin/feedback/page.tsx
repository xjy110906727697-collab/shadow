'use client'

import { useEffect, useState } from 'react'
import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface Feedback {
  id: string
  type: string
  content: string
  contact: string
  createdAt: string
}

const typeColors: Record<string, string> = {
  '功能建议': 'blue',
  '内容纠错': 'orange',
  '使用问题': 'red',
  '其他': 'default',
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then(res => res.json())
      .then(data => setFeedbacks(data.feedbacks))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnsType<Feedback> = [
    {
      title: '反馈类型',
      dataIndex: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={typeColors[type] || 'default'}>{type}</Tag>
      ),
    },
    {
      title: '反馈内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      width: 180,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (val: string) => new Date(val).toLocaleString('zh-CN'),
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">意见反馈</h1>
      <div className="bg-white rounded-lg shadow">
        <Table<Feedback>
          columns={columns}
          dataSource={feedbacks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </div>
    </div>
  )
}
