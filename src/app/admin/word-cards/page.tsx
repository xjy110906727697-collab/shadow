"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Table, Tag, Input, Select, Space, Button, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import ReactMarkdown from "react-markdown";

interface WordCard {
  id: string;
  word: string;
  meaning: string;
  meaningZh: string;
  entryId: string | null;
  startTime: number | null;
  videoId: string;
  video: { titleZh: string; title: string };
  createdAt: string;
}

export default function AdminWordCardsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoIdFilter = searchParams.get("videoId") || "";

  const [words, setWords] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewMeaning, setPreviewMeaning] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.current.toString());
      params.set("pageSize", pagination.pageSize.toString());
      if (search) params.set("search", search);
      if (videoIdFilter) params.set("videoId", videoIdFilter);

      const res = await fetch(`/api/admin/word-cards?${params.toString()}`);
      const data = await res.json();
      setWords(data.words);
      setPagination((prev) => ({ ...prev, total: data.pagination.total }));
    } catch (error) {
      console.error("Failed to fetch word cards:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search, videoIdFilter]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 20,
    }));
  };

  const columns: ColumnsType<WordCard> = [
    {
      title: "单词",
      dataIndex: "word",
      width: 150,
      render: (word: string) => (
        <span className="font-semibold text-gray-900 dark:text-slate-100">
          {word}
        </span>
      ),
    },
    {
      title: "中文翻译",
      dataIndex: "meaningZh",
      width: 200,
      ellipsis: true,
    },
    {
      title: "详细解释",
      dataIndex: "meaning",
      width: 100,
      render: (val: string) =>
        val ? (
          <button
            onClick={() => setPreviewMeaning(val)}
            className="text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="查看详细解释"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        ) : (
          <span className="text-gray-300 dark:text-slate-600">-</span>
        ),
    },
    {
      title: "所属视频",
      key: "video",
      render: (_: unknown, record: WordCard) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
            {record.video.titleZh}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[200px]">
            {record.video.title}
          </div>
        </div>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 120,
      render: (val: string) => (
        <span className="text-sm text-gray-500 dark:text-slate-400">
          {new Date(val).toLocaleDateString("zh-CN")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            词卡管理
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            管理所有视频的单词卡片
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/videos")}
          className="text-gray-600 dark:text-slate-400"
        >
          ← 返回视频列表
        </Button>
      </div>

      <div className="bg-[#faf8f6] dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-5">
        <Space wrap size="middle">
          <Input
            placeholder="搜索单词/释义..."
            prefix={
              <SearchOutlined className="text-slate-400 dark:text-slate-500" />
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            className="w-64 rounded-lg"
            allowClear
          />
          <Button
            type="primary"
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
          >
            搜索
          </Button>
          {videoIdFilter && (
            <Button
              onClick={() => router.push("/admin/word-cards")}
              className="text-gray-600 dark:text-slate-400"
            >
              清除视频筛选
            </Button>
          )}
        </Space>
      </div>

      <div className="bg-[#faf8f6] dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <Table<WordCard>
          columns={columns}
          dataSource={words}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ["10", "20", "50"],
            className: "px-6 py-4",
          }}
          onChange={handleTableChange}
          className="admin-table"
        />
      </div>

      <Modal
        title="详细解释"
        open={!!previewMeaning}
        footer={null}
        onCancel={() => setPreviewMeaning(null)}
        width={640}
        destroyOnHidden
      >
        {previewMeaning && (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{previewMeaning}</ReactMarkdown>
          </div>
        )}
      </Modal>
    </div>
  );
}
