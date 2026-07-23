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

interface VideoWord {
  id: string
  word: string
  meaning: string
  meaningZh: string
  entryId: string | null
  startTime: number | null
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
  const [words, setWords] = useState<VideoWord[]>([])
  const [showWordForm, setShowWordForm] = useState(false)
  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const [wordForm, setWordForm] = useState({ word: '', meaning: '', meaningZh: '', entryId: '', startTime: '' })

  useEffect(() => {
    fetchVideo()
    fetchWords()
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

  const fetchWords = async () => {
    try {
      const res = await fetch(`/api/videos/${params.id}/words`)
      const data = await res.json()
      setWords(data.words || [])
    } catch (error) {
      console.error('Failed to fetch words:', error)
    }
  }

  const handleAddWord = () => {
    setWordForm({ word: '', meaning: '', meaningZh: '', entryId: '', startTime: '' })
    setEditingWordId(null)
    setShowWordForm(true)
  }

  const handleEditWord = (word: VideoWord) => {
    setWordForm({
      word: word.word,
      meaning: word.meaning,
      meaningZh: word.meaningZh,
      entryId: word.entryId || '',
      startTime: word.startTime?.toString() || '',
    })
    setEditingWordId(word.id)
    setShowWordForm(true)
  }

  const handleSaveWord = async () => {
    if (!wordForm.word || !wordForm.meaning || !wordForm.meaningZh) {
      alert('请填写完整单词信息')
      return
    }

    try {
      if (editingWordId) {
        const res = await fetch(`/api/videos/${params.id}/words/${editingWordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: wordForm.word,
            meaning: wordForm.meaning,
            meaningZh: wordForm.meaningZh,
            entryId: wordForm.entryId || null,
            startTime: wordForm.startTime ? parseFloat(wordForm.startTime) : null,
          }),
        })
        if (!res.ok) throw new Error('Failed to update word')
      } else {
        const res = await fetch(`/api/videos/${params.id}/words`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: wordForm.word,
            meaning: wordForm.meaning,
            meaningZh: wordForm.meaningZh,
            entryId: wordForm.entryId || null,
            startTime: wordForm.startTime ? parseFloat(wordForm.startTime) : null,
          }),
        })
        if (!res.ok) throw new Error('Failed to create word')
      }
      setShowWordForm(false)
      fetchWords()
    } catch (error) {
      console.error('Failed to save word:', error)
      alert('保存失败')
    }
  }

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('确定删除这个单词吗？')) return

    try {
      const res = await fetch(`/api/videos/${params.id}/words/${wordId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete word')
      fetchWords()
    } catch (error) {
      console.error('Failed to delete word:', error)
      alert('删除失败')
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

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">词卡管理 ({words.length})</h2>
          <button
            onClick={handleAddWord}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + 添加词卡
          </button>
        </div>

        {showWordForm && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-blue-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单词</label>
                <input
                  type="text"
                  value={wordForm.word}
                  onChange={e => setWordForm(prev => ({ ...prev, word: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="韩语单词"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">韩语释义</label>
                <input
                  type="text"
                  value={wordForm.meaning}
                  onChange={e => setWordForm(prev => ({ ...prev, meaning: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="韩语解释"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">中文翻译</label>
                <input
                  type="text"
                  value={wordForm.meaningZh}
                  onChange={e => setWordForm(prev => ({ ...prev, meaningZh: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="中文意思"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联字幕条目</label>
                <select
                  value={wordForm.entryId}
                  onChange={e => setWordForm(prev => ({ ...prev, entryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">不关联</option>
                  {entries.map(entry => (
                    <option key={entry.id} value={entry.id}>
                      #{entry.index + 1} - {entry.ko.slice(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">时间点（秒）</label>
                <input
                  type="number"
                  step="0.01"
                  value={wordForm.startTime}
                  onChange={e => setWordForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="可选"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveWord}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                {editingWordId ? '更新' : '保存'}
              </button>
              <button
                onClick={() => { setShowWordForm(false); setEditingWordId(null) }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {words.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">暂无词卡，点击上方按钮添加</p>
        ) : (
          <div className="space-y-2">
            {words.map(w => (
              <div key={w.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <span className="text-lg font-bold text-gray-900 mr-3">{w.word}</span>
                  <span className="text-sm text-gray-600 mr-3">{w.meaning}</span>
                  <span className="text-sm text-gray-500">({w.meaningZh})</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEditWord(w)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteWord(w.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
