'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WaveformView } from '@/components/admin/WaveformView'
import { EntryList } from '@/components/admin/EntryList'

interface SubtitleEntry {
  id: string
  index: number
  startTime: number
  endTime: number
  ko: string
  zh: string
}

export default function SubtitleEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [video, setVideo] = useState<any>(null)
  const [entries, setEntries] = useState<SubtitleEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingEntry, setAddingEntry] = useState<SubtitleEntry | null>(null)
  const [addingAfterId, setAddingAfterId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideo()
  }, [params.id])

  const fetchVideo = async () => {
    try {
      const res = await fetch(`/api/admin/videos/${params.id}/subtitles`)
      const data = await res.json()
      setVideo(data)
      setEntries(data.subtitles || [])
    } catch (error) {
      console.error('Failed to fetch video:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartEdit = (entryId: string) => {
    // 如果正在添加中且点击了其他行，丢弃未确认的添加
    if (addingEntry) {
      setAddingEntry(null)
      setAddingAfterId(null)
    }
    setEditingId(entryId)
  }

  const handleConfirmEdit = async (entry: SubtitleEntry) => {
    try {
      const updatedEntries = entries.map(e =>
        e.id === entry.id ? entry : e
      )
      setEntries(updatedEntries)
      setEditingId(null)

      await fetch(`/api/admin/videos/${params.id}/subtitles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: updatedEntries })
      })
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const updatedEntries = entries.filter(e => e.id !== entryId)
      setEntries(updatedEntries)

      await fetch(`/api/admin/videos/${params.id}/subtitles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: updatedEntries })
      })

      if (editingId === entryId) {
        setEditingId(null)
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const handleAddAfterEntry = (entryId: string) => {
    const currentEntry = entries.find(e => e.id === entryId)
    if (!currentEntry) return

    // 如果已有未确认的添加，先丢弃
    if (addingEntry) {
      setAddingEntry(null)
      setAddingAfterId(null)
    }

    const newEntry: SubtitleEntry = {
      id: Math.random().toString(36),
      index: currentEntry.index + 1,
      startTime: currentEntry.startTime,
      endTime: currentEntry.endTime,
      ko: currentEntry.ko,
      zh: currentEntry.zh,
    }

    setAddingEntry(newEntry)
    setAddingAfterId(entryId)
    setEditingId(newEntry.id)
  }

  const handleConfirmAdd = async (entry: SubtitleEntry) => {
    if (!addingEntry || !addingAfterId) return

    const insertIndex = entries.findIndex(e => e.id === addingAfterId)
    if (insertIndex === -1) return

    try {
      const updatedEntries = [
        ...entries.slice(0, insertIndex + 1),
        entry,
        ...entries.slice(insertIndex + 1).map(e => ({
          ...e,
          index: e.index + 1,
        })),
      ]

      setEntries(updatedEntries)
      setAddingEntry(null)
      setAddingAfterId(null)
      setEditingId(null)

      await fetch(`/api/admin/videos/${params.id}/subtitles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: updatedEntries })
      })
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const handleCancelAdd = () => {
    setAddingEntry(null)
    setAddingAfterId(null)
    setEditingId(null)
  }

  const handleImportSRT = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/admin/videos/${params.id}/import-subs`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '导入字幕失败')
      }

      const data = await res.json()
      if (data.entries) {
        setEntries(data.entries)
        alert('成功导入 ' + data.entries.length + ' 条字幕')
      } else {
        alert(data.message || '导入字幕失败')
      }
    } catch (error) {
      console.error('Failed to import subtitles:', error)
      alert(error instanceof Error ? error.message : '导入字幕失败')
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (loading) {
    return <p className="text-gray-500">加载中...</p>
  }

  if (!video) {
    return <p className="text-gray-500">视频未找到</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">字幕编辑器</h1>
          <p className="text-gray-600 mt-2">{video.titleZh}</p>
        </div>
        <button
          onClick={() => router.push('/admin/videos')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 返回视频列表
        </button>
      </div>

      {video.audioUrl && (
        <div className="bg-white rounded-lg shadow p-6">
          <WaveformView
            audioUrl={video.audioUrl}
            entries={entries}
            currentTime={currentTime}
            selectedEntryId={editingId}
            onTimeUpdate={setCurrentTime}
            onEntrySelect={setEditingId}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">字幕条目 ({entries.length})</h2>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt,.txt"
              onChange={e => e.target.files?.[0] && handleImportSRT(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              导入 SRT 字幕
            </button>
          </div>
        </div>
        <EntryList
          entries={entries}
          editingId={editingId}
          addingEntry={addingEntry}
          addAfterId={addingAfterId}
          onStartEdit={handleStartEdit}
          onConfirmEdit={handleConfirmEdit}
          onConfirmAdd={handleConfirmAdd}
          onCancelAdd={handleCancelAdd}
          onCancelEdit={handleCancelEdit}
          onDelete={handleDeleteEntry}
          onAdd={handleAddAfterEntry}
        />
      </div>
    </div>
  )
}
