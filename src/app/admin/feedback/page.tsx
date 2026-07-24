"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, Tag, Input, Select, Space, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";

interface Feedback {
  id: string;
  type: string;
  content: string;
  contact: string;
  createdAt: string;
}

const typeConfig: Record<string, { color: string; bg: string }> = {
  问题反馈: {
    color: "text-red-700 dark:text-red-300",
    bg: "bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30",
  },
  功能建议: {
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30",
  },
  其他: {
    color: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-700",
  },
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("descend");

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.current.toString());
      params.set("pageSize", pagination.pageSize.toString());
      params.set("sortField", sortField);
      params.set("sortOrder", sortOrder);
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/admin/feedback?${params.toString()}`);
      const data = await res.json();
      setFeedbacks(data.feedbacks);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || data.feedbacks.length,
      }));
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current,
    pagination.pageSize,
    sortField,
    sortOrder,
    search,
    typeFilter,
  ]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<Feedback> | SorterResult<Feedback>[],
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

  const columns: ColumnsType<Feedback> = [
    {
      title: "反馈类型",
      dataIndex: "type",
      width: 150,
      render: (type: string) => {
        const config = typeConfig[type] || typeConfig["其他"];
        return (
          <Tag
            className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 ${config.bg} ${config.color}`}
          >
            {type}
          </Tag>
        );
      },
    },
    {
      title: "反馈内容",
      dataIndex: "content",
      width: 280,
      ellipsis: true,
      render: (content: string) => (
        <span className="text-slate-700 dark:text-slate-300 text-sm">
          {content}
        </span>
      ),
    },
    {
      title: "联系方式",
      dataIndex: "contact",
      width: 200,
      render: (contact: string) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {contact || (
            <span className="text-slate-300 dark:text-slate-500">未提供</span>
          )}
        </span>
      ),
    },
    {
      title: "提交时间",
      dataIndex: "createdAt",
      sorter: true,
      width: 200,
      render: (val: string) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(val).toLocaleString("zh-CN")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          意见反馈
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          查看用户反馈与建议
        </p>
      </div>

      <div className="bg-[#faf8f6] dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-5">
        <Space wrap size="middle">
          <Input
            placeholder="搜索反馈内容..."
            prefix={
              <SearchOutlined className="text-slate-400 dark:text-slate-500" />
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            className="w-64 rounded-lg"
            allowClear
          />
          <Select
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
            className="w-36"
            options={[
              { value: "", label: "全部类型" },
              { value: "问题反馈", label: "问题反馈" },
              { value: "功能建议", label: "功能建议" },
              { value: "其他", label: "其他" },
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

      <div className="bg-[#faf8f6] dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <Table<Feedback>
          columns={columns}
          dataSource={feedbacks}
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
    </div>
  );
}
