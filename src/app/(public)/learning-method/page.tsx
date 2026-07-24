"use client";

import { useState } from "react";
import { articles, tagColors } from "@/data/articles";
import ArticleCard from "@/components/public/ArticleCard";

export default function LearningMethodPage() {
  const [activeId, setActiveId] = useState(articles[0].id);
  const current = articles.find((a) => a.id === activeId) || articles[0];

  return (
    <div className="w-full px-4 md:px-6 py-4 pb-20 md:pb-4">
      <div className="max-w-5xl mx-auto">
        <div className="md:hidden">
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                tag={article.tag}
                summary={article.summary}
                readingTime={article.readingTime}
                readCount={article.readCount}
                date={article.date}
              />
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-row gap-8">
          <aside className="w-72 shrink-0">
            <nav className="space-y-3 sticky top-4">
              {articles.map((article) => {
                const isActive = article.id === activeId;
                return (
                  <button
                    key={article.id}
                    onClick={() => setActiveId(article.id)}
                    className={`w-full text-left rounded-lg border p-3.5 transition-all ${
                      isActive
                        ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                        : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          tagColors[article.tag] ||
                          "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                        }`}
                      >
                        {article.tag}
                      </span>
                    </div>
                    <h3
                      className={`text-sm font-semibold mb-1 ${isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-slate-200"}`}
                    >
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-slate-500">
                      {article.date && (
                        <span className="flex items-center gap-0.5">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {article.date}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {article.readingTime}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {article.readCount.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-semibold dark:text-slate-100">
                  {current.title}
                </h2>
                {current.date && (
                  <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">
                    {current.date}
                  </span>
                )}
              </div>
              <div className="text-gray-700 dark:text-slate-300 text-base leading-7 whitespace-pre-line">
                {current.content}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
