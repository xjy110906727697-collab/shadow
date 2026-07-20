'use client'

import { useEffect, useState } from 'react'

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
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingExpireAt, setEditingExpireAt] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

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
      await fetchUsers()
      setEditingUserId(null)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditingExpireAt('')
  }

  if (loading) {
    return <p className="text-gray-500">Loading users...</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={editingExpireAt}
                          onChange={e => setEditingExpireAt(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => handleSaveExpire(user.id)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className={
                        user.expireAt && new Date(user.expireAt) < new Date()
                          ? 'text-red-600'
                          : ''
                      }>
                        {user.expireAt
                          ? new Date(user.expireAt).toLocaleDateString()
                          : 'Never'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingUserId !== user.id && (
                      <button
                        onClick={() => handleEditExpire(user)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit Expire
                      </button>
                    )}
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
