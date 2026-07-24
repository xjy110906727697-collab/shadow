"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/providers/ThemeToggle";

function useVideoTitle() {
  const pathname = usePathname();
  const match = pathname?.match(/^\/video\/(.+)$/);
  const videoId = match?.[1] || null;
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      setTitle(null);
      return;
    }
    fetch(`/api/videos/${videoId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setTitle(data?.titleZh || null))
      .catch(() => setTitle(null));
  }, [videoId]);

  return { videoId, title };
}

const subtitleModes = ["双语", "韩文", "中文", "盲听"] as const;

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { videoId, title } = useVideoTitle();
  const isVideoPage = !!videoId;

  // All hooks always called — never skip hooks
  const [subtitleMode, setSubtitleMode] = useState<string>("双语");
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState("问题反馈");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery(window.location.search.replace("?", ""));
  }, [pathname]);

  // Fetch favorite status for video page
  useEffect(() => {
    if (!videoId || !session) {
      setIsFavorited(false);
      return;
    }
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) =>
        setIsFavorited(data.favorites?.includes(videoId) || false),
      )
      .catch(() => setIsFavorited(false));
  }, [videoId, session]);

  const handleSubtitleMode = (mode: string) => {
    setSubtitleMode(mode);
    window.dispatchEvent(new CustomEvent("subtitle-mode", { detail: mode }));
  };

  const toggleFavorite = async () => {
    if (!videoId) return;
    if (!session) {
      window.dispatchEvent(new CustomEvent("favorite-login"));
      return;
    }
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      setIsFavorited(data.favorited);
    } catch {
      /* ignore */
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) return;
    setFeedbackSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          content: feedbackContent,
          contact: feedbackContact,
        }),
      });
      setFeedbackDone(true);
    } catch {
      alert("提交失败");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Normal page header
  if (!isVideoPage) {
    const isBrowsePage = pathname === "/";
    const isFavoritesView = searchQuery === "show=favorites";

    return (
      <header className="border-b border-gray-200 dark:border-slate-700 bg-[#faf8f6] dark:bg-slate-900">
        {/* Mobile: centered ShadowKorean + optional filter/search */}
        <div className="md:hidden w-full px-4 h-12 flex items-center justify-between">
          {isBrowsePage && !isFavoritesView ? (
            <>
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-filter-drawer"))
                }
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 -ml-2"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
              <Link
                href="/"
                className="text-lg font-bold text-blue-600 dark:text-blue-400"
              >
                Shadow Korean
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("toggle-mobile-search"),
                    )
                  }
                  className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
                <ThemeToggle />
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 text-center">
                <Link
                  href="/"
                  className="text-lg font-bold text-blue-600 dark:text-blue-400"
                >
                  Shadow Korean
                </Link>
              </div>
              <ThemeToggle />
            </>
          )}
        </div>
        {/* Desktop header */}
        <div className="hidden md:flex w-full px-4 md:px-6 h-12 items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-blue-600 dark:text-blue-400"
          >
            Shadow Korean
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            >
              首页
            </Link>
            <Link
              href="/favorites"
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            >
              收藏
            </Link>
            <Link
              href="/vocabulary"
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            >
              单词本
            </Link>
            <Link
              href="/learning-method"
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            >
              学习方法
            </Link>
            <button
              onClick={() => {
                if (!session) {
                  setShowLoginPrompt(true);
                  return;
                }
                setShowFeedbackModal(true);
              }}
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 text-sm cursor-pointer"
            >
              反馈
            </button>
            <Link
              href="/account"
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            >
              个人中心
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs"
              >
                管理
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {
              setShowFeedbackModal(false);
              setFeedbackDone(false);
            }}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {feedbackDone ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-slate-100">
                    感谢您的反馈！
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                    我们会认真阅读每一条意见
                  </p>
                  <button
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setFeedbackDone(false);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    关闭
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2 dark:text-slate-100">
                    意见反馈
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                    您的反馈对我们非常重要，帮助我们不断改进
                  </p>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                      反馈类型
                    </label>
                    <div className="flex gap-2">
                      {["问题反馈", "功能建议", "其他"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFeedbackType(t)}
                          className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${feedbackType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:border-blue-400"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                      反馈内容 *
                    </label>
                    <textarea
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      placeholder="请详细描述您的问题或建议..."
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                      联系方式{" "}
                      <span className="text-gray-400 dark:text-slate-500 font-normal">
                        （选填）
                      </span>
                    </label>
                    <input
                      value={feedbackContact}
                      onChange={(e) => setFeedbackContact(e.target.value)}
                      placeholder="邮箱或手机号，方便我们与您联系"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    onClick={handleSubmitFeedback}
                    disabled={feedbackSubmitting || !feedbackContent.trim()}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {feedbackSubmitting ? "提交中..." : "提交反馈"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLoginPrompt(false)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-xl font-bold mb-3 dark:text-slate-100">
                需要登录
              </h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
                登录后即可提交反馈
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
      </header>
    );
  }

  return (
    <header className="border-b border-gray-200 dark:border-slate-700 bg-[#faf8f6] dark:bg-slate-900">
      <div className="w-full px-3.5 md:px-4 h-14 flex items-center justify-between max-w-[1400px] mx-auto gap-2">
        {/* Left: back + logo + title */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors shrink-0"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <Link
            href="/"
            className="text-lg font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap shrink-0 hidden md:inline"
          >
            Shadow Korean
          </Link>
          &nbsp;
          <div className="h-5 w-px bg-gray-300 dark:bg-slate-600 shrink-0" />
          &nbsp;
          {title ? (
            <span className="text-m text-gray-800 dark:text-slate-200 truncate font-bold">
              {title}
            </span>
          ) : (
            <span className="text-sm text-blue-800 dark:text-blue-400 font-bold md:hidden truncate">
              Shadow Korean
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
