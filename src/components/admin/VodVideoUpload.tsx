'use client'

import { useState, useRef } from 'react'

interface VodVideoUploadProps {
  label: string
  vodVideoId: string
  onUploadComplete: (vodVideoId: string, dbId: string) => void
  onRemove: () => void
  required?: boolean
}

export function VodVideoUpload({ label, vodVideoId, onUploadComplete, onRemove, required }: VodVideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percent)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          onUploadComplete(data.videoId, data.dbId)
        } else {
          const data = JSON.parse(xhr.responseText)
          alert(data.error || '上传失败')
        }
        setUploading(false)
        setUploadProgress(0)
      })

      xhr.addEventListener('error', () => {
        alert('上传失败')
        setUploading(false)
        setUploadProgress(0)
      })

      xhr.open('POST', '/api/vod/upload')
      xhr.send(formData)
    } catch (err) {
      console.error('Upload error:', err)
      alert('上传失败')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      {vodVideoId ? (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-600 truncate flex-1">
              VOD: {vodVideoId}
            </span>
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
                onClick={onRemove}
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
            <div>
              <p className="text-sm text-gray-500 mb-2">上传中... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500">点击选择视频文件</p>
              <p className="text-xs text-gray-400 mt-1">支持 MP4、WebM 等格式，将上传到阿里云VOD</p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
