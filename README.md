# ShadowKorean

韩语跟读学习平台，基于真实视频语料，提供韩中双语字幕同步、单词收集、学习进度追踪等功能。

## 功能概览

### 用户端

- **首页** — 视频网格（响应式 1/2/3/4 列），支持搜索、等级/主题/时长/频道筛选，学习进度统计（总期数/已学/未学）
- **视频详情** — HTML5 播放器 + 韩中双语字幕面板，字幕随播放自动高亮，点击字幕跳转时间戳，支持收藏
- **收藏页** — 用户收藏的视频列表
- **单词本** — 学习中收集的单词，按日期分组，支持详情查看和删除
- **学习方法** — 学习方法文章列表与详情
- **账号中心** — 学习统计、修改密码、意见反馈、联系客服（微信二维码弹窗）
- **认证** — 登录/注册（需邀请码）/忘记密码，支持游客模式浏览
- **暗色模式** — 全站支持，右上角日/月图标切换，状态持久化

### 管理后台

- **仪表盘** — 站点数据统计
- **视频管理** — 视频 CRUD、封面上传、分类分配、发布/草稿
- **字幕编辑** — wavesurfer.js 波形编辑器，手动调整时间轴
- **词卡管理** — 视频单词维护
- **分类管理** — 等级/主题分类 CRUD
- **用户管理** — 用户列表、角色/到期时间管理、邀请码展示
- **邀请码管理** — 生成 10 位随机邀请码（单个/批量），查看使用状态，筛选有效码
- **意见反馈** — 查看用户反馈列表

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router, TypeScript, Turbopack) |
| UI | React 19, Ant Design 5, Tailwind CSS v4 |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | NextAuth.js v4 (credentials, JWT) |
| 视频 | 阿里云 VOD + HLS.js |
| 存储 | 阿里云 OSS |
| 波形编辑 | wavesurfer.js v7 |
| 验证 | Zod |

## 项目结构

```
shadow/
├── prisma/
│   ├── schema.prisma              # 数据库 schema（14 个模型）
│   └── seed.ts                    # 测试数据种子脚本
├── src/
│   ├── app/
│   │   ├── (auth)/                # 认证页面
│   │   │   ├── login/             # 登录（含游客模式入口）
│   │   │   ├── register/          # 注册（需邀请码）
│   │   │   └── forgot-password/   # 忘记密码
│   │   ├── (public)/              # 公开页面
│   │   │   ├── page.tsx           # 首页 - 视频网格 + 筛选
│   │   │   ├── account/           # 账号中心
│   │   │   ├── favorites/         # 收藏
│   │   │   ├── vocabulary/        # 单词本
│   │   │   ├── learning-method/   # 学习方法（列表 + 详情）
│   │   │   └── video/[id]/        # 视频详情 - 播放器 + 字幕
│   │   ├── admin/                 # 管理后台
│   │   │   ├── page.tsx           # 仪表盘
│   │   │   ├── videos/            # 视频管理
│   │   │   ├── word-cards/        # 词卡管理
│   │   │   ├── categories/        # 分类管理
│   │   │   ├── users/             # 用户管理
│   │   │   ├── invite-codes/      # 邀请码管理
│   │   │   └── feedback/          # 意见反馈
│   │   └── api/                   # API 路由（25 个）
│   │       ├── auth/              # NextAuth + 注册
│   │       ├── videos/            # 视频 + 单词
│   │       ├── categories/        # 分类
│   │       ├── favorites/         # 收藏
│   │       ├── word-bag/          # 单词本
│   │       ├── feedback/          # 反馈
│   │       ├── upload/            # 文件上传
│   │       ├── user/              # 修改密码 + 学习统计
│   │       └── admin/             # 管理端 CRUD
│   ├── components/
│   │   ├── public/                # VideoCard, VideoPlayer, SubtitlePanel, WordPopup, SearchBar, FilterBar, ArticleCard
│   │   ├── admin/                 # WaveformView, EntryEditor, EntryList, FileUpload, VideoFormModal, VodVideoUpload
│   │   ├── layout/                # Header, Footer, BottomTabBar, FilterDrawer, LogoutButton
│   │   └── providers/             # ThemeProvider, ThemeToggle, AntdProvider
│   └── lib/
│       ├── prisma.ts              # Prisma 客户端单例
│       ├── auth.ts                # NextAuth 配置
│       └── vod.ts                 # 阿里云 VOD 客户端
├── .env.example                   # 环境变量模板
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 数据库 Schema

| 模型 | 描述 |
|---|---|
| **User** | 用户（email/passwordHash/role/expireAt/inviteCodeId） |
| **InviteCode** | 邀请码（code/used/user 关联） |
| **Video** | 视频（标题/封面/URL/时长/集数/难度/讲师/发布状态） |
| **Category** | 分类（等级 LEVEL / 主题 TOPIC） |
| **VideoCategory** | Video ↔ Category 多对多连接表 |
| **SubtitleTrack** | 字幕轨道（KO / ZH） |
| **SubtitleEntry** | 字幕条目（时间轴 + 文本） |
| **UserVideoProgress** | 学习进度（userId/videoId/completed/progress） |
| **Favorite** | 收藏（userId/videoId） |
| **VideoWord** | 视频单词（词义/韩义/时间戳） |
| **UserWordBag** | 用户单词本（userId/wordId） |
| **Feedback** | 用户反馈 |
| **SiteSetting** | 站点设置（key-value） |

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 14+

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境

```bash
cp .env.example .env
```

编辑 `.env`，填写以下配置：

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/ShadowKorean"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="生成一个随机密钥"

# 阿里云 OSS
OSS_REGION="oss-cn-hangzhou"
OSS_ACCESS_KEY_ID="your-access-key-id"
OSS_ACCESS_KEY_SECRET="your-access-key-secret"
OSS_BUCKET="your-bucket-name"
OSS_CDN_DOMAIN="your-cdn-domain.com"

# 阿里云 VOD
VOD_REGION="cn-shanghai"
VOD_ACCESS_KEY_ID="your-access-key-id"
VOD_ACCESS_KEY_SECRET="your-access-key-secret"
VOD_STORAGE_LOCATION="out-xxx.oss-cn-shanghai.aliyuncs.com"
```

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 4. 种子数据（可选）

```bash
npm run db:seed
```

生成 12 个测试视频（含字幕/单词）、4 个用户、分类、收藏、学习进度等测试数据。

测试账号：

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | admin@shadowkorean.com | password123 |
| 用户 | user@test.com | password123 |
| 用户 | learner@test.com | password123 |
| 用户 | student@test.com | password123 |

### 5. 创建管理员

注册后手动提升角色：

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`，管理后台 `http://localhost:3000/admin`。

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
| `npm run db:seed` | 运行种子数据 |

## API 参考

### 公开 API

| 方法 | 端点 | 描述 |
|---|---|---|
| GET | `/api/videos` | 视频列表（支持 search/topic/duration/difficulty/instructor/progress/page 筛选） |
| GET | `/api/videos/[id]` | 视频详情 + 字幕 |
| GET | `/api/videos/[id]/words` | 视频单词列表 |
| GET | `/api/categories` | 分类列表 |
| POST | `/api/auth/register` | 注册（需邀请码） |
| POST | `/api/favorites` | 切换收藏状态 |
| GET | `/api/favorites` | 获取收藏视频 ID 列表 |
| GET | `/api/word-bag` | 获取用户单词本 |
| POST | `/api/feedback` | 提交反馈 |
| POST | `/api/upload` | 文件上传 |
| POST | `/api/user/change-password` | 修改密码 |
| GET | `/api/user/progress/stats` | 学习进度统计 |

### 管理 API

| 方法 | 端点 | 描述 |
|---|---|---|
| GET/POST | `/api/admin/videos` | 视频列表/创建 |
| GET/PUT/DELETE | `/api/admin/videos/[id]` | 视频详情/更新/删除 |
| GET/PUT | `/api/admin/videos/[id]/subtitles` | 字幕轨道管理 |
| POST | `/api/admin/videos/[id]/import-subs` | 导入字幕 |
| GET/POST | `/api/admin/categories` | 分类列表/创建 |
| PUT/DELETE | `/api/admin/categories/[id]` | 分类更新/删除 |
| GET/POST | `/api/admin/users` | 用户列表/创建 |
| PUT/DELETE | `/api/admin/users/[id]` | 用户更新/删除 |
| GET/POST | `/api/admin/invite-codes` | 邀请码列表/生成 |
| GET/POST | `/api/admin/word-cards` | 词卡列表/创建 |
| GET/PUT | `/api/admin/settings` | 站点设置 |
| GET | `/api/admin/feedback` | 反馈列表 |

## 部署

1. 构建：`npm run build`
2. 设置环境变量
3. 确保 PostgreSQL 可访问
4. 生产数据库：`npx prisma db push`
5. 启动：`npm run start`
