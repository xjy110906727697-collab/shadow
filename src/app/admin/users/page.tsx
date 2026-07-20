'use client'

import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Tag, Space, Input, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface User {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
  expireAt: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingExpireAt, setEditingExpireAt] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.current.toString())
      params.set('pageSize', pagination.pageSize.toString())
      params.set('sortField', sortField)
      params.set('sortOrder', sortOrder)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await res.json()
      setUsers(data.users)
      setPagination(prev => ({ ...prev, total: data.pagination.total }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.current, pagination.pageSize, sortField, sortOrder, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEditExpire = (user: User) => {
    setEditingUserId(user.id)
    setEditingExpireAt(user.expireAt ? new Date(user.expireAt).toISOString().split('T')[0] : '')
  }

  const handleSaveExpire = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expireAt: editingExpireAt ? new Date(editingExpireAt).toISOString() : null
        })
      })
      message.success('更新成功')
      fetchUsers()
      setEditingUserId(null)
    } catch (error) {
      message.error('更新失败')
    }
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditingExpireAt('')
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleTableChange = (pag: any, _filters: any, sorter: any) => {
    setPagination(prev => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 10,
    }))
    if (sorter.field) {
      setSortField(sorter.field)
      setSortOrder(sorter.order || 'desc')
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: '邮箱',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      sorter: true,
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'purple' : 'default'}>
          {role === 'ADMIN' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '到期时间',
      dataIndex: 'expireAt',
      sorter: true,
      render: (expireAt: string | null, record: User) => {
        if (editingUserId === record.id) {
          return (
            <Space>
              <Input
                type="date"
                value={editingExpireAt}
                onChange={e => setEditingExpireAt(e.target.value)}
                size="small"
              />
              <Button size="small" type="link" onClick={() => handleSaveExpire(record.id)}>
                保存
              </Button>
              <Button size="small" type="link" onClick={handleCancelEdit}>
                取消
              </Button>
            </Space>
          )
        }

        if (!expireAt) {
          return <span>无期限</span>
        }

        const isExpired = new Date(expireAt) < new Date()
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : undefined }}>
            {new Date(expireAt).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: true,
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        editingUserId !== record.id && (
          <Button type="link" size="small" onClick={() => handleEditExpire(record)}>
            编辑到期时间
          </Button>
        )
      ),
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">用户管理</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <Space wrap>
          <Input
            placeholder="搜索邮箱"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 220 }}
            allowClear
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
        </Space>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table<User>
          columns={columns}
          dataSource={users}
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
    </div>
  )
}
