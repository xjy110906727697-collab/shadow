'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  label: string
  accept: string
  type: 'videos' | 'covers' | 'audio'
  value: string
  onChange: (url: string) => void
  required?: boolean
  placeholder?: string
}

export function FileUpload({ label, accept, type, value, onChange, required, placeholder }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || '上传失败')
        return
      }

      onChange(data.url)
    } catch (err) {
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      {value ? (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            {type === 'covers' ? (
              <img src={value} alt="封面预览" className="h-16 w-auto rounded object-cover" />
            ) : (
              <span className="text-sm text-gray-600 truncate flex-1">{value.split('/').pop()}</span>
            )}
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                更换
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs text-red-500 hover:text-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
        >
          {uploading ? (
            <p className="text-sm text-gray-500">上传中...</p>
          ) : (
            <>
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500">点击选择文件</p>
              <p className="text-xs text-gray-400 mt-1">{placeholder || `支持 ${accept} 格式`}</p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
