# HangulStudy

一个韩语学习平台，使用 Next.js 构建，提供视频课程和同步的韩中字幕，以及基于波形的交互式字幕编辑器。

## 需求

### 功能需求

1. **首页** - 视频卡片网格，包含封面图、韩语标题、中文标题、描述、时长和等级标签。支持搜索和按等级/主题筛选。
2. **视频详情页** - 自定义 HTML5 视频播放器（上半部分）与同步字幕面板（下半部分）。字幕随着视频播放自动高亮当前句子。点击任何字幕可将视频跳转到该时间戳。
3. **浏览页** - 基于侧边栏的分类浏览，支持等级和主题筛选。
4. **用户认证** - 邮箱+密码注册和登录。
5. **订阅过期** - 用户有 `expireAt` 日期。过期用户会看到警告。管理员手动设置过期日期。
6. **支付流程** - 定价页面显示微信二维码。用户扫码支付，管理员手动设置其 `expireAt`。
7. **管理后台** - 视频、分类、用户和站点设置（微信二维码）的完整 CRUD。
8. **字幕编辑器** - 基于时间轴的编辑器，带有波形可视化（wavesurfer.js）。管理员可以添加、编辑、删除字幕条目，精确设置开始/结束时间。支持从 YouTube 导入自动生成的韩语字幕。
9. **YouTube 下载脚本** - CLI 工具，从 YouTube 下载视频，提取音频用于波形，生成缩略图，上传到阿里云 OSS，并创建带有导入韩语字幕的视频草稿条目。
10. **内容组织** - 视频按等级（初级/中级/高级）和主题（旅行、美食、商务等）分类，多对多关系。

### 非功能需求

| 需求 | 决策 |
|---|---|
| 视频格式 | MP4 (H.264) |
| 字幕编辑器 | 基于时间轴，带波形，手动调整时间 |
| 渲染方式 | 仅 SSR（无 SSG） |
| 设计方式 | 移动优先响应式 |
| 视频存储 | 从 YouTube 下载，自托管在阿里云 OSS + CDN |
| 认证方式 | 邮箱+密码（NextAuth.js credentials provider） |
| 支付方式 | 微信二维码 + 管理员手动过期 |
| 字幕语言 | 韩语 (KO) + 中文 (ZH) |
| 数据库 | PostgreSQL + Prisma ORM |
| 阿里云 OSS | 占位符配置（稍后填写） |

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router, TypeScript) |
| 样式 | Tailwind CSS v4 |
| 数据库 | PostgreSQL |
| ORM | Prisma |
| 认证 | NextAuth.js v4 (credentials provider, JWT 策略) |
| 视频存储 | 阿里云 OSS + CDN |
| 波形编辑器 | wavesurfer.js v7 (带 Regions 插件) |
| YouTube 下载 | yt-dlp (CLI) |
| 音频提取 | ffmpeg |
| 图像处理 | sharp |
| 验证 | Zod |

## 项目结构

```
shadow/
├── prisma/
│   └── schema.prisma              # 数据库 schema（6 个模型）
├── src/
│   ├── app/
│   │   ├── (public)/              # 公开页面
│   │   │   ├── page.tsx           # 首页 - 视频网格 + 筛选 + 搜索
│   │   │   ├── layout.tsx         # 公开布局（Header + Footer）
│   │   │   ├── browse/page.tsx    # 浏览页 - 侧边栏分类 + 视频网格
│   │   │   ├── video/[id]/page.tsx # 视频详情 - 播放器 + 字幕同步
│   │   │   ├── login/page.tsx     # 登录页
│   │   │   ├── register/page.tsx  # 注册页
│   │   │   ├── pricing/page.tsx   # 定价页 - 微信二维码
│   │   │   └── account/page.tsx   # 用户账号 - 信息 + 修改密码
│   │   ├── admin/                 # 管理后台（受保护）
│   │   │   ├── layout.tsx         # 管理后台布局，带侧边栏
│   │   │   ├── page.tsx           # 仪表盘 - 统计 + 最近用户
│   │   │   ├── videos/
│   │   │   │   ├── page.tsx       # 视频列表（表格）
│   │   │   │   ├── new/page.tsx   # 创建视频表单
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/page.tsx        # 编辑视频表单
│   │   │   │       └── subtitles/page.tsx   # 字幕编辑器（波形）
│   │   │   ├── categories/page.tsx # 分类管理（等级 + 主题）
│   │   │   ├── users/page.tsx     # 用户管理（编辑 expireAt）
│   │   │   └── settings/page.tsx  # 站点设置（微信二维码）
│   │   ├── api/                   # API 路由
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts  # NextAuth 处理器
│   │   │   │   └── register/route.ts       # 用户注册
│   │   │   ├── videos/
│   │   │   │   ├── route.ts       # GET 列表（带筛选）
│   │   │   │   └── [id]/route.ts  # GET 视频详情 + 字幕
│   │   │   ├── categories/route.ts # GET 公开分类
│   │   │   ├── user/
│   │   │   │   └── change-password/route.ts
│   │   │   └── admin/
│   │   │       ├── videos/
│   │   │       │   ├── route.ts   # GET 列表, POST 创建
│   │   │       │   └── [id]/
│   │   │       │       ├── route.ts          # GET, PUT, DELETE 视频
│   │   │       │       ├── subtitles/route.ts # GET, PUT 字幕
│   │   │       │       └── import-subs/route.ts # POST 导入 YouTube 字幕
│   │   │       ├── categories/
│   │   │       │   ├── route.ts   # GET 列表, POST 创建
│   │   │       │   └── [id]/route.ts # GET, PUT, DELETE 分类
│   │   │       ├── users/
│   │   │       │   ├── route.ts   # GET 列表
│   │   │       │   └── [id]/route.ts # PUT（设置 expireAt, role）
│   │   │       └── settings/route.ts # GET, PUT 站点设置
│   │   ├── layout.tsx             # 根布局
│   │   ├── page.tsx               # 根页面（重定向）
│   │   └── providers.tsx          # SessionProvider 包装器
│   ├── components/
│   │   ├── public/
│   │   │   ├── VideoCard.tsx      # 视频卡片用于网格展示
│   │   │   ├── VideoPlayer.tsx    # 自定义 HTML5 播放器，带控件
│   │   │   ├── SubtitlePanel.tsx  # 字幕展示，自动高亮
│   │   │   ├── FilterBar.tsx      # 等级 + 主题筛选标签
│   │   │   └── SearchBar.tsx      # 搜索输入框
│   │   ├── admin/
│   │   │   ├── WaveformView.tsx   # wavesurfer.js 波形，带区域
│   │   │   ├── EntryEditor.tsx    # 编辑单个字幕条目
│   │   │   └── EntryList.tsx      # 字幕条目表格
│   │   └── layout/
│   │       ├── Header.tsx         # 站点头部，带导航
│   │       └── Footer.tsx         # 站点底部
│   ├── lib/
│   │   ├── prisma.ts              # Prisma 客户端单例
│   │   └── auth.ts                # NextAuth 配置
│   ├── scripts/
│   │   └── youtube-download.ts    # YouTube 导入 CLI 工具
│   ├── types/
│   │   └── next-auth.d.ts         # NextAuth 类型扩展
│   └── middleware.ts              # 管理路由保护
├── .env.example                   # 环境变量模板
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── prisma/schema.prisma
```

## 数据库 Schema

### 模型

**User** - 注册用户，基于角色的访问控制。

| 字段 | 类型 | 描述 |
|---|---|---|
| id | String (cuid) | 主键 |
| email | String (unique) | 用户邮箱 |
| passwordHash | String | Bcrypt 加密的密码 |
| role | Enum (USER, ADMIN) | 访问级别 |
| expireAt | DateTime? | 订阅过期时间（null = 永不过期） |
| createdAt | DateTime | 注册日期 |
| updatedAt | DateTime | 最后更新时间 |

**Video** - 视频内容及其元数据。

| 字段 | 类型 | 描述 |
|---|---|---|
| id | String (cuid) | 主键 |
| title | String | 韩语标题 |
| titleZh | String | 中文标题 |
| description | String? | 韩语描述 |
| descriptionZh | String? | 中文描述 |
| coverUrl | String | 缩略图 URL (OSS) |
| videoUrl | String | MP4 视频 URL (OSS) |
| audioUrl | String? | 提取的音频 URL，用于波形编辑器 |
| duration | Int | 时长（秒） |
| published | Boolean | 是否对公众可见 |
| visitorAccessible | Boolean | 是否允许访客观看 |
| createdAt | DateTime | 创建日期 |
| updatedAt | DateTime | 最后更新时间 |

**Category** - 用于组织视频的等级和主题。

| 字段 | 类型 | 描述 |
|---|---|---|
| id | String (cuid) | 主键 |
| name | String | 韩语名称 |
| nameZh | String | 中文名称 |
| type | Enum (LEVEL, TOPIC) | 分类类型 |
| slug | String (unique) | URL 友好的标识符 |
| sortOrder | Int | 显示顺序 |

**VideoCategory** - Video 和 Category 之间的多对多连接表。

**SubtitleTrack** - 视频的语言轨道（KO 或 ZH）。

| 字段 | 类型 | 描述 |
|---|---|---|
| id | String (cuid) | 主键 |
| videoId | String | 引用 Video |
| lang | Enum (KO, ZH) | 语言 |

**SubtitleEntry** - 带时间的单个字幕行。

| 字段 | 类型 | 描述 |
|---|---|---|
| id | String (cuid) | 主键 |
| trackId | String | 引用 SubtitleTrack |
| index | Int | 显示顺序 |
| startTime | Float | 开始时间（秒，如 12.345） |
| endTime | Float | 结束时间（秒） |
| text | String | 字幕文本 |

**SiteSetting** - 站点配置的键值存储（如微信二维码 URL）。

## 设置说明

### 先决条件

- Node.js 18+
- PostgreSQL 14+
- ffmpeg（用于字幕编辑器中的音频提取）
- yt-dlp（用于 YouTube 下载脚本）

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境

将 `.env.example` 复制为 `.env` 并填写你的值：

```bash
cp .env.example .env
```

```env
# PostgreSQL 连接字符串
DATABASE_URL="postgresql://user:password@localhost:5432/hangul_study"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="生成一个随机密钥"

# 阿里云 OSS（准备好后填写）
OSS_REGION="oss-cn-hangzhou"
OSS_ACCESS_KEY_ID="你的 access-key-id"
OSS_ACCESS_KEY_SECRET="你的 access-key-secret"
OSS_BUCKET="你的 bucket-name"
OSS_CDN_DOMAIN="你的 cdn-domain.com"
```

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 4. 创建管理员用户

注册后，在数据库中手动更新你的用户角色：

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`。管理后台在 `http://localhost:3000/admin`。

## 使用指南

### 添加视频

**方式 A：手动上传**

1. 将视频 (MP4) 和缩略图上传到阿里云 OSS
2. 进入 管理后台 > 视频 > 添加视频
3. 填写标题（韩语 + 中文）、描述、URL、时长
4. 分配等级和主题
5. 发布或保存为草稿

**方式 B：YouTube 导入脚本**

```bash
# 安装先决条件
pip install yt-dlp
# 确保 ffmpeg 已安装并在 PATH 中

# 运行导入脚本
npx ts-node src/scripts/youtube-download.ts "https://www.youtube.com/watch?v=VIDEO_ID"
```

这将：
1. 下载视频（最佳质量，最高 1080p）
2. 提取音频 (MP3) 用于波形编辑器
3. 在 5 秒处生成缩略图
4. 提取自动生成的韩语字幕
5. 将所有文件上传到阿里云 OSS
6. 在数据库中创建视频草稿条目

然后进入 管理后台 > 视频 > [视频] > 字幕 来编辑导入的字幕。

### 编辑字幕

1. 导航到 管理后台 > 视频 > [视频] > 字幕
2. 波形视图显示音频时间轴，每个字幕条目有彩色区域
3. 点击区域或列表中的条目来选择它
4. 在编辑器中编辑韩语/中文文本和开始/结束时间
5. 使用"添加条目"在当前播放头位置创建新条目
6. 使用"从 YouTube 导入"自动从 YouTube URL 导入韩语字幕
7. 更改自动保存到数据库

### 管理用户

1. 进入 管理后台 > 用户
2. 点击用户行的"编辑到期时间"
3. 使用日期选择器设置过期日期
4. 点击"保存"

### 管理分类

1. 进入 管理后台 > 分类
2. 在"等级"和"主题"标签之间切换
3. 添加、编辑或删除分类
4. 设置排序顺序以控制显示顺序

### 配置微信二维码

1. 将微信二维码图片上传到阿里云 OSS
2. 进入 管理后台 > 设置
3. 粘贴图片 URL
4. 点击"保存设置"
5. 二维码将显示在 `/pricing` 页面

## 字幕同步逻辑

视频详情页的核心功能如下：

```
1. 视频触发 'timeupdate' 事件（约每秒 4 次）
2. 从视频元素获取 currentTime
3. 找到 startTime <= currentTime <= endTime 的字幕条目
4. 将高亮 CSS 类应用到该条目
5. 自动滚动字幕容器以保持活动条目可见
6. 用户可以点击任何条目将视频跳转到该条目的 startTime
```

## API 参考

### 公开 API

| 方法 | 端点 | 描述 |
|---|---|---|
| GET | `/api/videos?level=&topic=&search=&page=&limit=` | 列出已发布的视频，带筛选 |
| GET | `/api/videos/[id]` | 获取视频详情，合并 KO/ZH 字幕 |
| GET | `/api/categories` | 列出所有分类 |
| POST | `/api/auth/register` | 注册新用户（邮箱，密码） |
| POST | `/api/user/change-password` | 修改密码（需要认证） |

### 管理 API

| 方法 | 端点 | 描述 |
|---|---|---|
| GET | `/api/admin/videos` | 列出所有视频（包括草稿） |
| POST | `/api/admin/videos` | 创建视频，带分类分配 |
| GET | `/api/admin/videos/[id]` | 获取视频详情 |
| PUT | `/api/admin/videos/[id]` | 更新视频 |
| DELETE | `/api/admin/videos/[id]` | 删除视频 |
| GET | `/api/admin/videos/[id]/subtitles` | 获取字幕轨道 + 条目 |
| PUT | `/api/admin/videos/[id]/subtitles` | 批量保存所有字幕条目 |
| POST | `/api/admin/videos/[id]/import-subs` | 从 YouTube 导入字幕 |
| GET | `/api/admin/categories` | 列出所有分类 |
| POST | `/api/admin/categories` | 创建分类 |
| PUT | `/api/admin/categories/[id]` | 更新分类 |
| DELETE | `/api/admin/categories/[id]` | 删除分类 |
| GET | `/api/admin/users` | 列出所有用户 |
| PUT | `/api/admin/users/[id]` | 更新用户（expireAt, role） |
| GET | `/api/admin/settings` | 获取站点设置 |
| PUT | `/api/admin/settings` | 更新站点设置 |

## 脚本

| 命令 | 描述 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 推送 schema 到数据库 |
| `npm run db:migrate` | 运行 Prisma 迁移 |
| `npm run db:studio` | 打开 Prisma Studio |

## 部署

1. 构建应用：`npm run build`
2. 在托管平台上设置环境变量
3. 确保 PostgreSQL 可访问
4. 在生产数据库上运行 `npx prisma db push`
5. 使用 `npm run start` 启动

为中国用户推荐的托管：阿里云 ECS 或类似的基于中国的云服务商，以获得低延迟。
