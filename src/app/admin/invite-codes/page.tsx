'use client'

import { useEffect, useState } from 'react'
import { Table, Button, App, Tag, Space, Select } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface InviteCode {
  id: string
  code: string
  used: boolean
  createdAt: string
  user: {
    id: string
    email: string
  } | null
}

export default function AdminInviteCodesPage() {
  const { message } = App.useApp()
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all')
  const [generating, setGenerating] = useState(false)

  const fetchCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/invite-codes?filter=${filter}`)
      const data = await res.json()
      setCodes(data.codes || [])
    } catch (error) {
      console.error('Failed to fetch invite codes:', error)
      message.error('获取邀请码列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [filter])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 1 })
      })
      const data = await res.json()
      if (data.codes && data.codes.length > 0) {
        message.success(`生成成功：${data.codes[0]}`)
        fetchCodes()
      }
    } catch (error) {
      message.error('生成邀请码失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleBatchGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10 })
      })
      const data = await res.json()
      if (data.codes && data.codes.length > 0) {
        message.success(`批量生成 ${data.codes.length} 个邀请码成功`)
        fetchCodes()
      }
    } catch (error) {
      message.error('批量生成邀请码失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    message.success('已复制到剪贴板')
  }

  const columns: ColumnsType<InviteCode> = [
    {
      title: '邀请码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <span className="font-mono text-base font-semibold text-blue-600 dark:text-blue-400">
          {code}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'used',
      key: 'used',
      render: (used: boolean) => (
        <Tag color={used ? 'default' : 'success'}>
          {used ? '已使用' : '未使用'}
        </Tag>
      )
    },
    {
      title: '使用者',
      dataIndex: 'user',
      key: 'user',
      render: (user: InviteCode['user']) => (
        user ? (
          <span className="text-gray-600 dark:text-slate-400">
            {user.email}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-slate-500">-</span>
        )
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => (
        <span className="text-gray-600 dark:text-slate-400">
          {new Date(createdAt).toLocaleString('zh-CN')}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: InviteCode) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleCopy(record.code)}
          disabled={record.used}
        >
          复制
        </Button>
      )
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          邀请码管理
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          生成和管理用户注册邀请码
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleGenerate}
            loading={generating}
          >
            生成单个
          </Button>
          <Button
            onClick={handleBatchGenerate}
            loading={generating}
          >
            批量生成 (10个)
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCodes}
          >
            刷新
          </Button>
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部' },
              { value: 'available', label: '未使用' },
              { value: 'used', label: '已使用' }
            ]}
          />
        </Space>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <Table
          columns={columns}
          dataSource={codes}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </div>
    </div>
  )
}
