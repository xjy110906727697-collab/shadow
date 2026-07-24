"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TopicInfo {
  id: string;
  name: string;
  slug: string;
}

interface VideoCardProps {
  id: string;
  title: string;
  titleZh: string;
  description?: string | null;
  descriptionZh?: string | null;
  coverUrl: string;
  duration: number;
  episodeNumber?: number | null;
  difficulty?: number | null;
  instructor?: string | null;
  level?: string | null;
  topics?: TopicInfo[];
  visitorAccessible?: boolean;
  createdAt?: string;
  isVisitor?: boolean;
}

export function VideoCard({
  id,
  title,
  titleZh,
  coverUrl,
  duration,
  episodeNumber,
  difficulty,
  instructor,
  level: _level,
  topics,
  visitorAccessible,
  createdAt,
  isVisitor,
}: VideoCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (isVisitor) {
      setIsFavorited(false);
      return;
    }
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => setIsFavorited(data.favorites?.includes(id) || false))
      .catch(() => setIsFavorited(false));
  }, [id, isVisitor]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isVisitor) {
      window.dispatchEvent(new CustomEvent("favorite-login"));
      return;
    }

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: id }),
      });
      const data = await res.json();
      setIsFavorited(data.favorited);
    } catch {
      /* ignore */
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  };

  const isLocked = isVisitor && !visitorAccessible;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      const event = new CustomEvent("video-locked");
      window.dispatchEvent(event);
    }
  };

  return (
    <Link href={`/video/${id}`} className="group block" onClick={handleClick}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden hover:shadow transition-shadow relative border border-gray-100 dark:border-slate-700">
        <div className="relative aspect-video bg-gray-200 dark:bg-slate-700">
          <Image
            src={coverUrl}
            alt={titleZh}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            <svg
              className={`w-4 h-4 ${isFavorited ? "text-red-500 fill-red-500" : "text-gray-500"}`}
              fill={isFavorited ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          {episodeNumber && (
            <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              第{episodeNumber}期
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(duration)}
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          {/* 第一行：韩语标题（粗体） */}
          <div className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-slate-200">
            {titleZh}
          </div>

          {/* 第二行：中文标题（灰色） */}
          {title && title !== titleZh && (
            <div className="text-xs text-gray-400 dark:text-slate-500 line-clamp-1">
              {title}
            </div>
          )}

          {/* 第二行：作者  时间 */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>{instructor || ''}</span>
            {createdAt && (
              <span>{formatDate(createdAt)}</span>
            )}
          </div>

          {/* 第三行：话题  难度 */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {topics && topics.slice(0, 2).map((t) => (
                <span
                  key={t.id}
                  className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-1.5 py-0.5 rounded"
                >
                  {t.name}
                </span>
              ))}
              {topics && topics.length > 2 && (
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  +{topics.length - 2}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {difficulty ? (
                <span className="text-sm text-yellow-500">
                  {"★".repeat(difficulty)}{"☆".repeat(5 - difficulty)}
                </span>
              ) : (
                <span className="text-sm text-gray-300">☆☆☆☆☆</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
