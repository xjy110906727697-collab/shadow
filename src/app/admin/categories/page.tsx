'use client'

import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  nameZh: string
  slug: string
  sortOrder: number
  type: 'LEVEL' | 'TOPIC'
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<'LEVEL' | 'TOPIC'>('LEVEL')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameZh: '',
    slug: '',
    sortOrder: 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const filteredCategories = categories.filter(c => c.type === activeTab)

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({ name: '', nameZh: '', slug: '', sortOrder: 0 })
    setShowForm(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      nameZh: category.nameZh,
      slug: category.slug,
      sortOrder: category.sortOrder
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return

    try {
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      setCategories(categories.filter(c => c.id !== id))
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'

      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: activeTab
        })
      })

      if (!res.ok) throw new Error('Failed to save category')

      await fetchCategories()
      setShowForm(false)
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">分类管理</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          添加{activeTab === 'LEVEL' ? '等级' : '主题'}
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('LEVEL')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'LEVEL'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          等级
        </button>
        <button
          onClick={() => setActiveTab('TOPIC')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'TOPIC'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          主题
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? '编辑' : '添加'}{activeTab === 'LEVEL' ? '等级' : '主题'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  韩语名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  中文名称 *
                </label>
                <input
                  type="text"
                  value={formData.nameZh}
                  onChange={e => setFormData({ ...formData, nameZh: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标识符 *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="例如：beginner, travel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingCategory ? '更新' : '创建'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">韩语名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">中文名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标识符</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排序</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCategories.map(category => (
                <tr key={category.id}>
                  <td className="px-6 py-4 text-sm">{category.name}</td>
                  <td className="px-6 py-4 text-sm">{category.nameZh}</td>
                  <td className="px-6 py-4 text-sm font-mono">{category.slug}</td>
                  <td className="px-6 py-4 text-sm">{category.sortOrder}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
