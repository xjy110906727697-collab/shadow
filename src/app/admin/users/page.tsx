'use client'

import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Tag, Space, Input, Select, Modal, message } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'

interface User {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
  expireAt: string | null
  createdAt: string
  inviteCode: { code: string } | null
}

interface UserFormData {
  email: string
  password: string
  role: 'USER' | 'ADMIN'
  expireAt: string
}

const emptyForm: UserFormData = { email: '', password: '', role: 'USER', expireAt: '' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<string>('desc')

  // Modal 状态
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState<UserFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

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

  // 新增
  const openAddModal = () => {
    setFormData(emptyForm)
    setAddModalOpen(true)
  }

  const handleAdd = async () => {
    if (!formData.email || !formData.password) {
      message.error('邮箱和密码不能为空')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          expireAt: formData.expireAt || null,
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '创建失败')
      }
      message.success('创建成功')
      setAddModalOpen(false)
      fetchUsers()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 编辑
  const openEditModal = (user: User) => {
    setEditUserId(user.id)
    setFormData({
      email: user.email,
      password: '',
      role: user.role,
      expireAt: user.expireAt ? new Date(user.expireAt).toISOString().split('T')[0] : '',
    })
    setEditModalOpen(true)
  }

  const handleEdit = async () => {
    if (!formData.email || !editUserId) {
      message.error('邮箱不能为空')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          expireAt: formData.expireAt ? new Date(formData.expireAt).toISOString() : null,
        })
      })
      if (!res.ok) throw new Error('更新失败')
      message.success('更新成功')
      setEditModalOpen(false)
      setEditUserId(null)
      fetchUsers()
    } catch (error) {
      message.error('更新失败')
    } finally {
      setSubmitting(false)
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
          <span className="font-medium text-slate-900 dark:text-slate-100">{email}</span>
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
              ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 text-purple-700 dark:text-purple-300' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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
      render: (expireAt: string | null) => {
        if (!expireAt) {
          return <span className="text-slate-400 dark:text-slate-500 text-sm">无期限</span>
        }
        const isExpired = new Date(expireAt) < new Date()
        return (
          <span className={`text-sm ${isExpired ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
            {new Date(expireAt).toLocaleDateString('zh-CN')}
            {isExpired && <span className="ml-1.5 text-xs">(已过期)</span>}
          </span>
        )
      },
    },
    {
      title: '邀请码',
      dataIndex: 'inviteCode',
      render: (inviteCode: { code: string } | null) => (
        inviteCode ? (
          <span className="font-mono text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
            {inviteCode.code}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
        )
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: true,
      render: (val: string) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{new Date(val).toLocaleDateString('zh-CN')}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Button
          type="text"
          size="small"
          onClick={() => openEditModal(record)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑
        </Button>
      ),
    },
  ]

  const formFields = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">邮箱 *</label>
        <Input
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          placeholder="请输入邮箱"
          className="rounded-lg"
        />
      </div>
      {addModalOpen && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">密码 *</label>
          <Input.Password
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder="请输入密码"
            className="rounded-lg"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">角色</label>
        <Select
          value={formData.role}
          onChange={val => setFormData({ ...formData, role: val })}
          className="w-full"
          options={[
            { value: 'USER', label: '用户' },
            { value: 'ADMIN', label: '管理员' },
          ]}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">到期时间</label>
        <Input
          type="date"
          value={formData.expireAt}
          onChange={e => setFormData({ ...formData, expireAt: e.target.value })}
          className="rounded-lg"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">用户管理</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理系统用户与权限</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
        >
          新增用户
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-5">
        <Space wrap size="middle">
          <Input
            placeholder="搜索邮箱..."
            prefix={<SearchOutlined className="text-slate-400 dark:text-slate-500" />}
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
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

      {/* 新增用户弹窗 */}
      <Modal
        title="新增用户"
        open={addModalOpen}
        onOk={handleAdd}
        onCancel={() => setAddModalOpen(false)}
        confirmLoading={submitting}
        okText="创建"
        cancelText="取消"
        destroyOnHidden
      >
        {formFields}
      </Modal>

      {/* 编辑用户弹窗 */}
      <Modal
        title="编辑用户"
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => { setEditModalOpen(false); setEditUserId(null) }}
        confirmLoading={submitting}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        {formFields}
      </Modal>
    </div>
  )
}
