'use client'

import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface Category {
  id: string
  name: string
  nameZh: string
  slug: string
  sortOrder: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [sortField, setSortField] = useState('sortOrder')
  const [sortOrder, setSortOrder] = useState<string>('asc')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.current.toString())
      params.set('pageSize', pagination.pageSize.toString())
      params.set('type', 'TOPIC')
      params.set('sortField', sortField)
      params.set('sortOrder', sortOrder)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/categories?${params.toString()}`)
      const data = await res.json()
      setCategories(data.categories)
      setPagination(prev => ({ ...prev, total: data.pagination.total }))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.current, pagination.pageSize, sortField, sortOrder, search])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    setShowForm(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      nameZh: category.nameZh,
      slug: category.slug,
      sortOrder: category.sortOrder
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      message.success('删除成功')
      fetchCategories()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'

      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!res.ok) throw new Error('保存失败')

      message.success('保存成功')
      setShowForm(false)
      fetchCategories()
    } catch (error) {
      message.error('保存失败')
    }
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
      setSortOrder(sorter.order || 'asc')
    }
  }

  const columns: ColumnsType<Category> = [
    {
      title: '韩语名称',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: '中文名称',
      dataIndex: 'nameZh',
      sorter: true,
    },
    {
      title: '标识符',
      dataIndex: 'slug',
      sorter: true,
      render: (slug: string) => <code>{slug}</code>,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      sorter: true,
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Category) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个分类吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">分类管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加主题
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <Space wrap>
          <Input
            placeholder="搜索名称或标识符"
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
        <Table<Category>
          columns={columns}
          dataSource={categories}
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
        title={`${editingCategory ? '编辑' : '添加'}主题`}
        open={showForm}
        onOk={handleSubmit}
        onCancel={() => setShowForm(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="韩语名称"
            rules={[{ required: true, message: '请输入韩语名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nameZh"
            label="中文名称"
            rules={[{ required: true, message: '请输入中文名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="slug"
            label="标识符"
            rules={[{ required: true, message: '请输入标识符' }]}
          >
            <Input placeholder="例如：beginner, travel" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
