'use client'

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
  selectedEntryId: string | null
  onSelect: (entryId: string) => void
  onDelete: (entryId: string) => void
}

export function EntryList({ entries, selectedEntryId, onSelect, onDelete }: EntryListProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">End</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Korean</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chinese</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map(entry => (
            <tr
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              className={`cursor-pointer ${
                selectedEntryId === entry.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <td className="px-4 py-2 text-sm">{entry.index + 1}</td>
              <td className="px-4 py-2 text-sm font-mono">{formatTime(entry.startTime)}</td>
              <td className="px-4 py-2 text-sm font-mono">{formatTime(entry.endTime)}</td>
              <td className="px-4 py-2 text-sm">{entry.ko}</td>
              <td className="px-4 py-2 text-sm">{entry.zh}</td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(entry.id)
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
