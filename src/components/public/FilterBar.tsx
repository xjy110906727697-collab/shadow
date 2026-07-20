'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  nameZh: string
  slug: string
  type: 'LEVEL' | 'TOPIC'
}

export function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '')
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '')

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  const levels = categories.filter(c => c.type === 'LEVEL')
  const topics = categories.filter(c => c.type === 'TOPIC')

  const handleFilterChange = (level: string, topic: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (level) {
      params.set('level', level)
    } else {
      params.delete('level')
    }
    
    if (topic) {
      params.set('topic', topic)
    } else {
      params.delete('topic')
    }
    
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4 mb-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">等级</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedLevel('')
              handleFilterChange('', selectedTopic)
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              !selectedLevel
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {levels.map(level => (
            <button
              key={level.id}
              onClick={() => {
                setSelectedLevel(level.slug)
                handleFilterChange(level.slug, selectedTopic)
              }}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedLevel === level.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level.nameZh}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">主题</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedTopic('')
              handleFilterChange(selectedLevel, '')
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              !selectedTopic
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => {
                setSelectedTopic(topic.slug)
                handleFilterChange(selectedLevel, topic.slug)
              }}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedTopic === topic.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {topic.nameZh}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
