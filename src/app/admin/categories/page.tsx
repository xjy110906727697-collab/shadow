"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";

interface Category {
  id: string;
  name: string;
  nameZh: string;
  slug: string;
  sortOrder: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState("sortOrder");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.current.toString());
      params.set("pageSize", pagination.pageSize.toString());
      params.set("type", "TOPIC");
      params.set("sortField", sortField);
      params.set("sortOrder", sortOrder);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/categories?${params.toString()}`);
      const data = await res.json();
      setCategories(data.categories);
      setPagination((prev) => ({ ...prev, total: data.pagination.total }));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, sortField, sortOrder, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      nameZh: category.nameZh,
      slug: category.slug,
      sortOrder: category.sortOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      message.success("删除成功");
      fetchCategories();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";

      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("保存失败");

      message.success("保存成功");
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      message.error("保存失败");
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<Category> | SorterResult<Category>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setPagination((prev) => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 10,
    }));
    if (s?.field) {
      setSortField(s.field as string);
      setSortOrder(s.order || "asc");
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: "韩语名称",
      dataIndex: "name",
      sorter: true,
      render: (name: string) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {name}
        </span>
      ),
    },
    {
      title: "中文名称",
      dataIndex: "nameZh",
      sorter: true,
      render: (nameZh: string) => (
        <span className="text-slate-700 dark:text-slate-300">{nameZh}</span>
      ),
    },
    {
      title: "标识符",
      dataIndex: "slug",
      sorter: true,
      render: (slug: string) => (
        <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-mono">
          {slug}
        </code>
      ),
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      sorter: true,
      width: 100,
      render: (val: number) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
          {val}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_: unknown, record: Category) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            onClick={() => handleEdit(record)}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
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
            分类管理
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            管理视频主题分类
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-lg shadow-blue-500/20"
        >
          添加主题
        </Button>
      </div>

      <div className="bg-[#faf8f6] dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-5">
        <Space wrap size="middle">
          <Input
            placeholder="搜索名称或标识符..."
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
        </Space>
      </div>

      <div className="bg-[#faf8f6] dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <Table<Category>
          columns={columns}
          dataSource={categories}
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
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {editingCategory ? "编辑" : "添加"}主题
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                {editingCategory ? "修改分类信息" : "创建新的主题分类"}
              </div>
            </div>
          </div>
        }
        open={showForm}
        onOk={handleSubmit}
        onCancel={() => setShowForm(false)}
        okText="保存"
        cancelText="取消"
        className="rounded-xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="韩语名称"
            rules={[{ required: true, message: "请输入韩语名称" }]}
          >
            <Input className="rounded-lg" />
          </Form.Item>
          <Form.Item
            name="nameZh"
            label="中文名称"
            rules={[{ required: true, message: "请输入中文名称" }]}
          >
            <Input className="rounded-lg" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="标识符"
            rules={[{ required: true, message: "请输入标识符" }]}
          >
            <Input
              placeholder="例如：beginner, travel"
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <Input type="number" className="rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
