'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isExpired = session?.user.expireAt && new Date(session.user.expireAt) < new Date()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('两次密码不一致')
      return
    }

    if (newPassword.length < 6) {
      setError('密码至少6个字符')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '修改密码失败')
        return
      }

      setSuccess('密码修改成功')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('发生错误')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '无到期时间'
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-20 md:pb-8">
      {status === 'unauthenticated' && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold mb-3">需要登录</h1>
          <p className="text-gray-600 mb-6">请登录后查看个人中心</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
          >
            立即登录
          </Link>
        </div>
      )}
      {status === 'authenticated' && (
      <>
      <h1 className="text-3xl font-bold mb-8">我的账号</h1>

      {isExpired && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          您的订阅已过期，请联系我们续订。
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">账号信息</h2>
        <div className="space-y-3">
          <div>
            <span className="text-gray-600">邮箱：</span>
            <span className="font-medium">{session?.user.email}</span>
          </div>
          <div>
            <span className="text-gray-600">角色：</span>
            <span className="font-medium">{session?.user.role}</span>
          </div>
          <div>
            <span className="text-gray-600">订阅到期：</span>
            <span className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
              {formatDate(session?.user.expireAt || null)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">修改密码</h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              当前密码
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              新密码
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              确认新密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          退出登录
        </button>
      </div>
        </>
      )}
    </div>
  )
}
