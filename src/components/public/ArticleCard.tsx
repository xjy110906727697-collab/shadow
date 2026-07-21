'use client'

import Link from 'next/link'
import { tagColors } from '@/data/articles'

interface ArticleCardProps {
  id: string
  title: string
  tag: string
  summary: string
  readingTime: string
  readCount: number
  date?: string
}

export default function ArticleCard({ id, title, tag, summary, readingTime, readCount, date }: ArticleCardProps) {
  return (
    <Link href={`/learning-method/${id}`} className="group block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow p-4">
        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}>
          {tag}
        </span>
        <h3 className="text-base font-semibold mt-2 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{summary}</p>
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-3">
          {date && (
            <span className="flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {readingTime}
          </span>
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {readCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
