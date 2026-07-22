'use client'

import { useState, useEffect, useRef } from 'react'

interface SubtitleEntry {
  id: string
  index: number
  startTime: number
  endTime: number
  ko: string
  zh: string
}

interface EntryListProps {
  entries: SubtitleEntry[]
  editingId: string | null
  addingEntry: SubtitleEntry | null
  addAfterId: string | null
  onStartEdit: (entryId: string) => void
  onConfirmEdit: (entry: SubtitleEntry) => void
  onConfirmAdd: (entry: SubtitleEntry) => void
  onCancelAdd: () => void
  onCancelEdit: () => void
  onDelete: (entryId: string) => void
  onAdd: (entryId: string) => void
}

export function EntryList({
  entries,
  editingId,
  addingEntry,
  addAfterId,
  onStartEdit,
  onConfirmEdit,
  onConfirmAdd,
  onCancelAdd,
  onCancelEdit,
  onDelete,
  onAdd,
}: EntryListProps) {
  const [editForm, setEditForm] = useState<SubtitleEntry | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteRef = useRef<HTMLDivElement>(null)

  // 复制反馈后自动清除
  useEffect(() => {
    if (!copiedId) return
    const timer = setTimeout(() => setCopiedId(null), 1500)
    return () => clearTimeout(timer)
  }, [copiedId])

  // 点击外部关闭删除确认
  useEffect(() => {
    if (!deleteConfirmId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (deleteRef.current && !deleteRef.current.contains(e.target as Node)) {
        setDeleteConfirmId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [deleteConfirmId])

  // 初始化编辑表单
  useEffect(() => {
    if (editingId) {
      const entry = entries.find(e => e.id === editingId)
      if (entry) setEditForm({ ...entry })
      else if (addingEntry && addingEntry.id === editingId) {
        setEditForm({ ...addingEntry })
      }
    } else {
      setEditForm(null)
    }
  }, [editingId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const isEditing = (id: string) => editingId === id
  const isAddingEntry = (id: string) => addingEntry?.id === id

  const parseTimeInput = (str: string): number => {
    const match = str.match(/^(\d+):(\d{1,2})(?:\.(\d{1,2}))?$/)
    if (match) {
      const mins = parseInt(match[1])
      const secs = parseInt(match[2])
      const ms = parseInt(match[3] || '0')
      return mins * 60 + secs + ms / 100
    }
    return parseFloat(str) || 0
  }

  const handleFieldChange = (field: keyof SubtitleEntry, value: string | number) => {
    setEditForm(prev => prev ? { ...prev, [field]: value } : null)
  }

  const adjustTime = (field: 'startTime' | 'endTime', delta: number) => {
    setEditForm(prev => prev ? { ...prev, [field]: Math.max(0, prev[field] + delta) } : null)
  }

  const handleConfirm = () => {
    if (!editForm || !editingId) return
    if (isAddingEntry(editingId)) {
      onConfirmAdd(editForm)
    } else {
      onConfirmEdit(editForm)
    }
  }

  const handleCancel = () => {
    if (editingId && isAddingEntry(editingId)) {
      onCancelAdd()
    } else {
      onCancelEdit()
    }
  }

  // 构建渲染列表：在 addAfterId 后面插入 addingEntry
  const renderEntries = (() => {
    if (!addingEntry || !addAfterId) return entries
    const insertIdx = entries.findIndex(e => e.id === addAfterId)
    if (insertIdx === -1) return entries
    return [
      ...entries.slice(0, insertIdx + 1),
      addingEntry,
      ...entries.slice(insertIdx + 1),
    ]
  })()

  const renderRow = (entry: SubtitleEntry) => {
    const editing = isEditing(entry.id)
    const isNew = isAddingEntry(entry.id)
    const form = editing && editForm ? editForm : entry
    const rowId = entry.id

    return (
      <tr
        key={rowId}
        className={`${editing ? 'bg-red-50' : 'hover:bg-gray-50'}`}
      >
        <td className="px-4 py-2 text-sm">
          {isNew ? <span className="text-blue-500">新</span> : entry.index + 1}
        </td>
        <td className="px-4 py-2 text-sm font-mono">
          {editing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={formatTime(form.startTime)}
                onClick={e => e.stopPropagation()}
                onChange={e => handleFieldChange('startTime', parseTimeInput(e.target.value))}
                className="flex-1 px-2 py-1 border border-red-300 rounded-l text-sm font-mono"
              />
              <div className="flex border border-red-300 border-l-0 rounded-r divide-x divide-red-300">
                <button
                  onClick={(e) => { e.stopPropagation(); adjustTime('startTime', 1) }}
                  className="px-1.5 py-1 text-xs leading-none hover:bg-red-100"
                >▲</button>
                <button
                  onClick={(e) => { e.stopPropagation(); adjustTime('startTime', -1) }}
                  className="px-1.5 py-1 text-xs leading-none hover:bg-red-100"
                >▼</button>
              </div>
            </div>
          ) : (
            formatTime(entry.startTime)
          )}
        </td>
        <td className="px-4 py-2 text-sm font-mono">
          {editing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={formatTime(form.endTime)}
                onClick={e => e.stopPropagation()}
                onChange={e => handleFieldChange('endTime', parseTimeInput(e.target.value))}
                className="flex-1 px-2 py-1 border border-red-300 rounded-l text-sm font-mono"
              />
              <div className="flex border border-red-300 border-l-0 rounded-r divide-x divide-red-300">
                <button
                  onClick={(e) => { e.stopPropagation(); adjustTime('endTime', 1) }}
                  className="px-1.5 py-1 text-xs leading-none hover:bg-red-100"
                >▲</button>
                <button
                  onClick={(e) => { e.stopPropagation(); adjustTime('endTime', -1) }}
                  className="px-1.5 py-1 text-xs leading-none hover:bg-red-100"
                >▼</button>
              </div>
            </div>
          ) : (
            formatTime(entry.endTime)
          )}
        </td>
        <td className="px-4 py-2 text-sm">
          {editing ? (
            <input
              type="text"
              value={form.ko}
              onClick={e => e.stopPropagation()}
              onChange={e => handleFieldChange('ko', e.target.value)}
              className="w-full px-2 py-1 border border-red-300 rounded text-sm"
            />
          ) : (
            <div className="flex items-center gap-1 group">
              <span className="flex-1">{entry.ko}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(entry.ko)
                  } else {
                    // Fallback for older browsers
                    const ta = document.createElement('textarea')
                    ta.value = entry.ko
                    document.body.appendChild(ta)
                    ta.select()
                    document.execCommand('copy')
                    document.body.removeChild(ta)
                  }
                  setCopiedId(entry.id)
                }}
                className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                title="复制韩语"
              >
                {copiedId === entry.id ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </td>
        <td className="px-4 py-2 text-sm break-words max-w-[250px]">
          {editing ? (
            <input
              type="text"
              value={form.zh}
              onClick={e => e.stopPropagation()}
              onChange={e => handleFieldChange('zh', e.target.value)}
              className="w-full px-2 py-1 border border-red-300 rounded text-sm"
            />
          ) : (
            <span className="break-words">{entry.zh}</span>
          )}
        </td>
        <td className="px-4 py-2 text-right">
          {editing ? (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleConfirm()
                }}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                确认
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancel()
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStartEdit(entry.id)
                }}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                编辑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAdd(entry.id)
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                添加
              </button>
              <div className="relative" ref={deleteConfirmId === entry.id ? deleteRef : undefined}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirmId(deleteConfirmId === entry.id ? null : entry.id)
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  删除
                </button>
                {deleteConfirmId === entry.id && (
                  <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-gray-600">确认删除？</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(entry.id)
                        setDeleteConfirmId(null)
                      }}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      是
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirmId(null)
                      }}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      否
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">开始</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">结束</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 break-words max-w-[250px]">韩语</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 break-words max-w-[250px]">中文</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-48">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {renderEntries.map(entry => renderRow(entry))}
        </tbody>
      </table>
    </div>
  )
}
