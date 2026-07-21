'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { articles, tagColors } from '@/data/articles'

export default function ArticleDetailPage() {
  const params = useParams()
  const articleId = params.id as string
  const article = articles.find(a => a.id === articleId)

  if (!article) {
    return (
      <div className="w-full px-4 md:px-6 py-4 pb-20 md:pb-4">
        <div className="max-w-3xl mx-auto text-center py-16">
          <div className="text-4xl mb-4">📄</div>
          <h1 className="text-2xl font-bold mb-3">文章不存在</h1>
          <p className="text-gray-600 mb-6">找不到该文章，请返回文章列表</p>
          <Link
            href="/learning-method"
            className="inline-block bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
          >
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-6 py-4 pb-20 md:pb-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/learning-method"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </Link>

        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColors[article.tag] || 'bg-gray-100 text-gray-600'}`}>
              {article.tag}
            </span>
            {article.date && (
              <span className="text-xs text-gray-400">{article.date}</span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-4">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readingTime}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.readCount.toLocaleString()} 次阅读
            </span>
          </div>

          <div className="text-gray-700 text-base leading-7 whitespace-pre-line">
            {article.content}
          </div>
        </div>
      </div>
    </div>
  )
}
