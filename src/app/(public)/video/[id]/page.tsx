"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/components/public/VideoPlayer";
import { SubtitlePanel } from "@/components/public/SubtitlePanel";
import { WordPopup } from "@/components/public/WordPopup";

interface SubtitleEntry {
  id: string;
  index: number;
  startTime: number;
  endTime: number;
  ko: string;
  zh: string;
}

interface VideoWord {
  id: string;
  word: string;
  meaning: string;
  meaningZh: string;
  videoId: string;
}

interface VideoDetail {
  id: string;
  title: string;
  titleZh: string;
  description?: string | null;
  descriptionZh?: string | null;
  coverUrl: string;
  videoUrl: string;
  duration: number;
  subtitles: SubtitleEntry[];
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [subtitleMode, setSubtitleMode] = useState<
    "双语" | "韩文" | "中文" | "盲听"
  >("双语");
  const [isFavorited, setIsFavorited] = useState(() => {
    if (typeof window === "undefined" || !params.id) return false;
    const stored = localStorage.getItem("favorites");
    const ids: string[] = stored ? JSON.parse(stored) : [];
    return ids.includes(params.id as string);
  });
  const [words, setWords] = useState<VideoWord[]>([]);
  const [showWordCards, setShowWordCards] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VideoWord | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/videos/${params.id}`);

        if (res.status === 403) {
          setIsLocked(true);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setVideo(data);
      } catch (error) {
        console.error("Failed to fetch video:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWords = async () => {
      try {
        const res = await fetch(`/api/videos/${params.id}/words`);
        const data = await res.json();
        setWords(data.words || []);
      } catch (error) {
        console.error("Failed to fetch words:", error);
      }
    };

    if (params.id) {
      fetchVideo();
      fetchWords();
    }
  }, [params.id]);

  useEffect(() => {
    const handler = (e: CustomEvent) =>
      setSubtitleMode(e.detail as typeof subtitleMode);
    window.addEventListener("subtitle-mode", handler as EventListener);
    return () =>
      window.removeEventListener("subtitle-mode", handler as EventListener);
  }, []);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.currentTime = time;
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <p className="text-center text-gray-500">加载视频中...</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2">需要订阅</h2>
          <p className="text-gray-600 mb-6">
            此视频需要订阅后才能观看，请登录或注册以获取完整访问权限。
          </p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              登录 / 注册
            </Link>
            <Link
              href="/pricing"
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
            >
              查看订阅
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <p className="text-center text-gray-500">视频未找到</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 md:px-4 py-4 pb-32 md:pb-4 min-[1000px]:pt-8">
      {/* Player + Subtitles */}
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col min-[1000px]:flex-row gap-4">
          <div className="min-[1000px]:w-[72%]">
            <VideoPlayer
              videoUrl={video.videoUrl}
              onTimeUpdate={setCurrentTime}
            />
          </div>

          <div className="min-[1000px]:w-[28%] flex flex-col h-[50vh] min-[1000px]:h-[70vh]">
            <SubtitlePanel
              subtitles={video.subtitles}
              currentTime={currentTime}
              onSeek={handleSeek}
              mode={subtitleMode}
              onModeChange={setSubtitleMode}
              isFavorited={isFavorited}
              onFavoriteToggle={() => {
                if (!params.id) return;
                const stored = localStorage.getItem("favorites");
                let ids: string[] = stored ? JSON.parse(stored) : [];
                if (ids.includes(params.id as string)) {
                  ids = ids.filter(id => id !== params.id);
                  setIsFavorited(false);
                } else {
                  ids.push(params.id as string);
                  setIsFavorited(true);
                }
                localStorage.setItem("favorites", JSON.stringify(ids));
              }}
              words={words}
              onWordClick={setSelectedWord}
              showWordCards={showWordCards}
              onToggleWordCards={() => setShowWordCards(!showWordCards)}
            />
          </div>
        </div>

        {/* Description below */}
        {(video.descriptionZh || video.description) && (
          <div className="mt-4 text-sm text-gray-600 leading-relaxed">
            <p>{video.descriptionZh || video.description}</p>
          </div>
        )}
      </div>

      {selectedWord && (
        <WordPopup
          word={{ ...selectedWord, videoId: video.id, videoTitle: video.titleZh || video.title }}
          onClose={() => setSelectedWord(null)}
        />
      )}

      {/* Mobile bottom action bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden">
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
