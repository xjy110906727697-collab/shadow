'use client'

import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Tag, Space, Input, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'

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

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<User> | SorterResult<User>[]
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter
    setPagination(prev => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 10,
    }))
    if (s?.field) {
      setSortField(s.field as string)
      setSortOrder(s.order || 'desc')
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: '邮箱',
      dataIndex: 'email',
      sorter: true,
      render: (email: string) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
            {email.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-slate-900">{email}</span>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      sorter: true,
      render: (role: string) => (
        <Tag 
          className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 ${
            role === 'ADMIN' 
              ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' 
              : 'bg-slate-100 text-slate-700'
          }`}
        >
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
                className="rounded-lg"
              />
              <Button size="small" type="link" onClick={() => handleSaveExpire(record.id)} className="text-emerald-600 hover:text-emerald-700 font-medium">
                保存
              </Button>
              <Button size="small" type="link" onClick={handleCancelEdit} className="text-slate-500 hover:text-slate-700">
                取消
              </Button>
            </Space>
          )
        }

        if (!expireAt) {
          return <span className="text-slate-400 text-sm">无期限</span>
        }

        const isExpired = new Date(expireAt) < new Date()
        return (
          <span className={`text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {new Date(expireAt).toLocaleDateString('zh-CN')}
            {isExpired && <span className="ml-1.5 text-xs">(已过期)</span>}
          </span>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: true,
      render: (val: string) => (
        <span className="text-sm text-slate-600">{new Date(val).toLocaleDateString('zh-CN')}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        editingUserId !== record.id && (
          <Button 
            type="text" 
            size="small" 
            onClick={() => handleEditExpire(record)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑到期时间
          </Button>
        )
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">用户管理</h1>
        <p className="text-slate-500 mt-1">管理系统用户与权限</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
        <Space wrap size="middle">
          <Input
            placeholder="搜索邮箱..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            className="w-64 rounded-lg"
            allowClear
          />
          <Button type="primary" onClick={handleSearch} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0">
            搜索
          </Button>
        </Space>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
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
            className: 'px-6 py-4',
          }}
          onChange={handleTableChange}
          className="admin-table"
        />
      </div>
    </div>
  )
}
