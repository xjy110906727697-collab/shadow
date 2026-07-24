"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  message,
  Popconfirm,
  Modal,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { VideoFormModal } from "@/components/admin/VideoFormModal";

interface Video {
  id: string;
  title: string;
  titleZh: string;
  coverUrl: string;
  videoUrl: string;
  duration: number;
  episodeNumber?: number | null;
  difficulty?: number | null;
  instructor?: string | null;
  published: boolean;
  visitorAccessible: boolean;
  createdAt: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("");
  const [visitorFilter, setVisitorFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("descend");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoEditId, setVideoEditId] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.current.toString());
      params.set("pageSize", pagination.pageSize.toString());
      params.set("sortField", sortField);
      params.set("sortOrder", sortOrder);
      if (search) params.set("search", search);
      if (publishedFilter) params.set("published", publishedFilter);
      if (visitorFilter) params.set("visitorAccessible", visitorFilter);

      const res = await fetch(`/api/admin/videos?${params.toString()}`);
      const data = await res.json();
      setVideos(data.videos);
      setPagination((prev) => ({ ...prev, total: data.pagination.total }));
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current,
    pagination.pageSize,
    sortField,
    sortOrder,
    search,
    publishedFilter,
    visitorFilter,
  ]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      message.success("删除成功");
      fetchVideos();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleToggleVisitor = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorAccessible: !current }),
      });
      message.success("更新成功");
      fetchVideos();
    } catch (error) {
      message.error("更新失败");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video">("image");

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<Video> | SorterResult<Video>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setPagination((prev) => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 10,
    }));
    if (s?.field) {
      setSortField(s.field as string);
      setSortOrder(s.order || "descend");
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const columns: ColumnsType<Video> = [
    {
      title: "标题",
      dataIndex: "titleZh",
      sorter: true,
      width: 250,
      render: (_: unknown, record: Video) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-medium shadow-sm">
            {record.episodeNumber || "?"}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">{record.titleZh}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              {record.title}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "封面",
      width: 90,
      render: (_: unknown, record: Video) =>
        record.coverUrl ? (
          <img
            src={record.coverUrl}
            alt="封面"
            className="w-14 h-10 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
            onClick={() => {
              setPreviewUrl(record.coverUrl);
              setPreviewType("image");
            }}
          />
        ) : (
          <div className="w-14 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-slate-300 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ),
    },
    {
      title: "视频",
      width: 70,
      render: (_: unknown, record: Video) =>
        record.videoUrl ? (
          <video
            src={record.videoUrl}
            className="w-14 h-10 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
            preload="none"
            onClick={() => {
              setPreviewUrl(record.videoUrl);
              setPreviewType("video");
            }}
          />
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">无</span>
        ),
    },
    {
      title: "难度",
      dataIndex: "difficulty",
      width: 100,
      render: (val: number | null) =>
        val ? (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${star <= val ? "text-yellow-400" : "text-slate-200 dark:text-slate-600"}`}
              >
                ★
              </span>
            ))}
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">-</span>
        ),
    },
    {
      title: "频道",
      dataIndex: "instructor",
      width: 120,
      render: (val: string | null) =>
        val ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {val}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">-</span>
        ),
    },
    {
      title: "时长",
      dataIndex: "duration",
      sorter: true,
      width: 90,
      render: (val: number) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {formatDuration(val)}
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "published",
      sorter: true,
      width: 100,
      render: (val: boolean) => (
        <Tag
          className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 ${
            val
              ? "bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
          }`}
        >
          {val ? "已发布" : "草稿"}
        </Tag>
      ),
    },
    {
      title: "访客可看",
      dataIndex: "visitorAccessible",
      sorter: true,
      width: 120,
      render: (val: boolean, record: Video) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleToggleVisitor(record.id, val)}
          className={`font-medium ${val ? "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
        >
          {val ? "是" : "否"}
        </Button>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      sorter: true,
      width: 120,
      render: (val: string) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(val).toLocaleDateString("zh-CN")}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 250,
      render: (_: unknown, record: Video) => (
        <Space size="small">
          <Link
            href={`/admin/videos/${record.id}/subtitles`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
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
            字幕
          </Link>
          <Button
            onClick={() => { setVideoEditId(record.id); setVideoModalOpen(true) }}
            type="text"
            size="small"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个视频吗？"
            description="删除后将无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              size="small"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            视频管理
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理所有视频内容</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setVideoEditId(null); setVideoModalOpen(true) }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-lg shadow-blue-500/20"
        >
          添加视频
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-5">
        <Space wrap size="middle">
          <Input
            placeholder="搜索标题..."
            prefix={<SearchOutlined className="text-slate-400 dark:text-slate-500" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            className="w-64 rounded-lg"
            allowClear
          />
          <Select
            value={publishedFilter}
            onChange={(val) => {
              setPublishedFilter(val);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
            className="w-32"
            options={[
              { value: "", label: "全部状态" },
              { value: "true", label: "已发布" },
              { value: "false", label: "草稿" },
            ]}
          />
          <Select
            value={visitorFilter}
            onChange={(val) => {
              setVisitorFilter(val);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
            className="w-32"
            options={[
              { value: "", label: "全部" },
              { value: "true", label: "访客可看" },
              { value: "false", label: "仅会员" },
            ]}
          />
          <Button
            type="primary"
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
          >
            搜索
          </Button>
        </Space>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <Table<Video>
          columns={columns}
          dataSource={videos}
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
        open={!!previewUrl}
        footer={null}
        width={previewType === "video" ? 800 : 500}
        onCancel={() => setPreviewUrl(null)}
        centered
        destroyOnHidden
        className="rounded-xl overflow-hidden"
      >
        {previewType === "video" ? (
          <video
            key={previewUrl}
            src={previewUrl!}
            controls
            autoPlay
            className="w-full rounded-xl"
          />
        ) : (
          <img src={previewUrl!} alt="预览" className="w-full rounded-xl" />
        )}
      </Modal>

      <VideoFormModal
        open={videoModalOpen}
        editId={videoEditId}
        onClose={() => { setVideoModalOpen(false); setVideoEditId(null) }}
        onSuccess={fetchVideos}
      />
    </div>
  );
}
