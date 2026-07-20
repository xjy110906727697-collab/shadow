'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WaveformView } from '@/components/admin/WaveformView'
import { EntryEditor } from '@/components/admin/EntryEditor'
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
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
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

  const selectedEntry = entries.find(e => e.id === selectedEntryId)

  const handleUpdateEntry = async (entry: SubtitleEntry) => {
    try {
      const updatedEntries = entries.map(e =>
        e.id === entry.id ? entry : e
      )
      setEntries(updatedEntries)

      await fetch(`/api/admin/videos/${params.id}/subtitles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: updatedEntries })
      })
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
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

      if (selectedEntryId === entryId) {
        setSelectedEntryId(null)
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const handleAddEntry = async () => {
    const newEntry: SubtitleEntry = {
      id: Math.random().toString(36),
      index: entries.length,
      startTime: currentTime,
      endTime: currentTime + 3,
      ko: '',
      zh: ''
    }

    try {
      const updatedEntries = [...entries, newEntry]
      setEntries(updatedEntries)
      setSelectedEntryId(newEntry.id)

      await fetch(`/api/admin/videos/${params.id}/subtitles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: updatedEntries })
      })
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const handleImportYouTube = async (youtubeUrl: string) => {
    try {
      const res = await fetch(`/api/admin/videos/${params.id}/import-subs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl })
      })

      if (!res.ok) throw new Error('Failed to import subtitles')

      const data = await res.json()
      setEntries(data.entries)
      alert('Imported ' + data.entries.length + ' subtitle entries')
    } catch (error) {
      console.error('Failed to import subtitles:', error)
      alert('Failed to import subtitles')
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading...</p>
  }

  if (!video) {
    return <p className="text-gray-500">Video not found</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subtitle Editor</h1>
          <p className="text-gray-600 mt-2">{video.titleZh}</p>
        </div>
        <button
          onClick={() => router.push('/admin/videos')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Videos
        </button>
      </div>

      {video.audioUrl && (
        <div className="bg-white rounded-lg shadow p-6">
          <WaveformView
            audioUrl={video.audioUrl}
            entries={entries}
            currentTime={currentTime}
            selectedEntryId={selectedEntryId}
            onTimeUpdate={setCurrentTime}
            onEntrySelect={setSelectedEntryId}
          />
        </div>
      )}

      {selectedEntry && (
        <div className="bg-white rounded-lg shadow p-6">
          <EntryEditor
            entry={selectedEntry}
            onUpdate={handleUpdateEntry}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Subtitle Entries ({entries.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={handleAddEntry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Entry
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter YouTube URL:')
                if (url) handleImportYouTube(url)
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Import from YouTube
            </button>
          </div>
        </div>
        <EntryList
          entries={entries}
          selectedEntryId={selectedEntryId}
          onSelect={setSelectedEntryId}
          onDelete={handleDeleteEntry}
        />
      </div>
    </div>
  )
}
