'use client'

import { useEffect, useState } from 'react'

export default function AdminSettingsPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      setQrCodeUrl(data.qrCodeUrl || '')
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeUrl })
      })
      alert('设置保存成功！')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('设置保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">系统设置</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">微信收款码</h2>
        <p className="text-gray-600 mb-4">
          上传您的微信收款码图片 URL，用于订阅页面。用户将扫描此码进行订阅。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              收款码图片 URL
            </label>
            <input
              type="url"
              value={qrCodeUrl}
              onChange={e => setQrCodeUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {qrCodeUrl && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">预览：</p>
              <img
                src={qrCodeUrl}
                alt="微信收款码"
                className="max-w-sm rounded-lg shadow"
              />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  )
}
