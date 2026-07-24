"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { WordPopup } from "@/components/public/WordPopup";

interface WordBagItem {
  id: string;
  word: string;
  meaning: string;
  meaningZh: string;
  videoId: string;
  videoTitle: string;
  addedAt: string;
}

interface DateGroup {
  date: string;
  label: string;
  items: WordBagItem[];
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays === 2) return "前天";
  if (diffDays < 7) return `${diffDays}天前`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (date.getFullYear() === now.getFullYear()) {
    return `${month}月${day}日`;
  }
  return `${date.getFullYear()}年${month}月${day}日`;
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WordBagPage() {
  const { data: session } = useSession();
  const [words, setWords] = useState<WordBagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<WordBagItem | null>(null);
  const [activeDateKey, setActiveDateKey] = useState<string | null>(null);
  const [removingWordId, setRemovingWordId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    fetch("/api/word-bag")
      .then((res) => res.json())
      .then((data) => {
        setWords(data.words || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  const dateGroups = useMemo<DateGroup[]>(() => {
    const map = new Map<string, WordBagItem[]>();
    const sorted = [...words].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );
    for (const item of sorted) {
      const key = getDateKey(item.addedAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).map(([date, items]) => ({
      date,
      label: formatDateLabel(items[0].addedAt),
      items,
    }));
  }, [words]);

  useEffect(() => {
    if (dateGroups.length > 0 && activeDateKey === null) {
      setActiveDateKey(dateGroups[0].date);
    }
  }, [dateGroups, activeDateKey]);

  const activeGroup = dateGroups.find((g) => g.date === activeDateKey);

  const handleRemoveWord = useCallback(
    async (item: WordBagItem) => {
      if (removingWordId !== item.id) {
        setRemovingWordId(item.id);
        return;
      }
      try {
        const res = await fetch("/api/word-bag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wordId: item.id }),
        });
        if (res.ok) {
          setWords((prev) => prev.filter((w) => w.id !== item.id));
          if (selectedWord?.id === item.id) setSelectedWord(null);
        }
      } catch {
      } finally {
        setRemovingWordId(null);
      }
    },
    [removingWordId, selectedWord],
  );

  useEffect(() => {
    if (removingWordId === null) return;
    const timer = setTimeout(() => setRemovingWordId(null), 2500);
    return () => clearTimeout(timer);
  }, [removingWordId]);

  return (
    <div className="w-full px-4 md:px-8 py-4 pb-20 md:pb-4">
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-slate-400">加载中...</p>
        </div>
      ) : !session ? (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-slate-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-lg mb-2">
            需要登录查看词卡
          </p>
          <p className="text-gray-400 dark:text-slate-500 mb-6">
            登录后即可管理和复习您的词卡
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            去登录
          </Link>
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-slate-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-lg mb-2">
            还没有收藏的单词
          </p>
          <p className="text-gray-400 dark:text-slate-500 mb-6">
            在视频学习时点击单词，即可加入单词本
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            去浏览视频
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-52 shrink-0">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {dateGroups.map((group) => {
                const isActive = group.date === activeDateKey;
                return (
                  <button
                    key={group.date}
                    onClick={() => setActiveDateKey(group.date)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all whitespace-nowrap md:whitespace-normal md:w-full md:text-sm text-xs ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isActive
                          ? "bg-blue-500 dark:bg-blue-400"
                          : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    />
                    <span className="text-xs md:text-sm">{group.label}</span>
                    <span
                      className={`text-xs ml-auto tabular-nums ${
                        isActive
                          ? "text-blue-400 dark:text-blue-500"
                          : "text-gray-400 dark:text-slate-500"
                      }`}
                    >
                      {group.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {activeGroup && (
              <div>
                <div className="mb-4 flex items-baseline gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {activeGroup.label}
                  </h2>
                  <span className="text-sm text-gray-400 dark:text-slate-500">
                    {activeGroup.items.length} 个单词
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeGroup.items.map((item) => (
                    <div
                      key={item.id}
                      className="group relative"
                    >
                      <button
                        onClick={() => setSelectedWord(item)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#faf8f6] dark:bg-[#0a0a0e] border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all text-left"
                      >
                        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                          {item.word}
                        </span>
                        {item.meaningZh && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                            {item.meaningZh}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWord(item);
                        }}
                        className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                          removingWordId === item.id
                            ? "bg-red-500 text-white opacity-100"
                            : "bg-gray-300 dark:bg-slate-600 text-white hover:bg-red-500 dark:hover:bg-red-500"
                        }`}
                        title={removingWordId === item.id ? "再次点击移除" : "移出"}
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {selectedWord && (
        <WordPopup word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}
    </div>
  );
}
