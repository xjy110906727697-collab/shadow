"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface WordData {
  id: string;
  word: string;
  meaning: string;
  meaningZh: string;
  videoId: string;
  videoTitle?: string;
}

interface WordPopupProps {
  word: WordData | null;
  onClose: () => void;
}

export function WordPopup({ word, onClose }: WordPopupProps) {
  const { data: session } = useSession();
  const [isInBag, setIsInBag] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!word || !session) {
      setIsInBag(false);
      return;
    }

    fetch("/api/word-bag")
      .then((res) => res.json())
      .then((data) => {
        const wordIds: string[] = data.words || [];
        setIsInBag(wordIds.includes(word.id));
      })
      .catch(() => setIsInBag(false));
  }, [word, session]);

  if (!word) return null;

  const handleAddToBag = async () => {
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/word-bag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: word.id }),
      });
      const data = await res.json();
      setIsInBag(data.added);
    } catch (error) {
      console.error("Failed to add to word bag:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {word.word}
                </h2>
                <span className="text-lg text-gray-600 dark:text-slate-400 font-medium">
                  {word.meaningZh}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg p-1.5 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {word.meaning && (
            <div className="overflow-y-auto flex-1 -mx-2 px-2">
              <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 leading-relaxed">
                <ReactMarkdown>{word.meaning}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-bold mb-3 dark:text-slate-100">
              需要登录
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
              登录后即可加入词卡
            </p>
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg hover:bg-blue-700 font-medium mb-2"
            >
              立即登录
            </Link>
            <Link
              href="/register"
              className="block w-full text-gray-500 dark:text-slate-400 text-sm text-center py-2 rounded-lg hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              注册账号
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
