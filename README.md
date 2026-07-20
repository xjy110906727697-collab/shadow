# HangulStudy

A Korean learning platform built with Next.js, featuring video lessons with synchronized Korean/Chinese subtitles and an interactive waveform-based subtitle editor for admins.

## Requirements

### Functional Requirements

1. **Home Page** - Video card grid with cover image, Korean title, Chinese title, description, duration, and level badge. Includes search and filter by level/topic.
2. **Video Detail Page** - Custom HTML5 video player (top half) with synchronized subtitle panel (bottom half). Subtitles auto-highlight the current sentence as the video plays. Click any subtitle to seek the video to that timestamp.
3. **Browse Page** - Sidebar-based category browsing with level and topic filters.
4. **User Authentication** - Email + password registration and login.
5. **Subscription Expiration** - Users have an `expireAt` date. Expired users see warnings. Admins manually set expiration dates.
6. **Payment Flow** - Pricing page displays a WeChat QR code. User scans and pays, admin manually sets their `expireAt`.
7. **Admin Panel** - Full CRUD for videos, categories, users, and site settings (WeChat QR code).
8. **Subtitle Editor** - Timeline-based editor with waveform visualization (wavesurfer.js). Admins can add, edit, delete subtitle entries with precise start/end times. Supports importing auto-generated Korean subtitles from YouTube.
9. **YouTube Download Script** - CLI tool that downloads video from YouTube, extracts audio for waveform, generates thumbnail, uploads to Aliyun OSS, and creates a draft video entry with imported Korean subtitles.
10. **Content Organization** - Videos categorized by level (Beginner/Intermediate/Advanced) and topic (Travel, Food, Business, etc.) in a many-to-many relationship.

### Non-Functional Requirements

| Requirement | Decision |
|---|---|
| Video format | MP4 (H.264) |
| Subtitle editor | Timeline-based with waveform, manual timing |
| Rendering | SSR only (no SSG) |
| Design approach | Mobile-first responsive |
| Video storage | Download from YouTube, self-host on Aliyun OSS + CDN |
| Authentication | Email + password (NextAuth.js credentials) |
| Payment | WeChat QR code + manual admin expiration |
| Subtitle languages | Korean (KO) + Chinese (ZH) |
| Database | PostgreSQL with Prisma ORM |
| Aliyun OSS | Placeholder config (fill in later) |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v4 (credentials provider, JWT strategy) |
| Video Storage | Aliyun OSS + CDN |
| Waveform Editor | wavesurfer.js v7 (with Regions plugin) |
| YouTube Download | yt-dlp (CLI) |
| Audio Extraction | ffmpeg |
| Image Processing | sharp |
| Validation | Zod |

## Project Structure

```
shadow/
├── prisma/
│   └── schema.prisma              # Database schema (6 models)
├── src/
│   ├── app/
│   │   ├── (public)/              # Public-facing pages
│   │   │   ├── page.tsx           # Home - video grid + filters + search
│   │   │   ├── layout.tsx         # Public layout (Header + Footer)
│   │   │   ├── browse/page.tsx    # Browse - sidebar categories + video grid
│   │   │   ├── video/[id]/page.tsx # Video detail - player + subtitle sync
│   │   │   ├── login/page.tsx     # Login page
│   │   │   ├── register/page.tsx  # Registration page
│   │   │   ├── pricing/page.tsx   # Pricing - WeChat QR code
│   │   │   └── account/page.tsx   # User account - info + change password
│   │   ├── admin/                 # Admin panel (protected)
│   │   │   ├── layout.tsx         # Admin layout with sidebar
│   │   │   ├── page.tsx           # Dashboard - stats + recent users
│   │   │   ├── videos/
│   │   │   │   ├── page.tsx       # Video list (table)
│   │   │   │   ├── new/page.tsx   # Create video form
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/page.tsx        # Edit video form
│   │   │   │       └── subtitles/page.tsx   # Subtitle editor (waveform)
│   │   │   ├── categories/page.tsx # Category management (levels + topics)
│   │   │   ├── users/page.tsx     # User management (edit expireAt)
│   │   │   └── settings/page.tsx  # Site settings (WeChat QR code)
│   │   ├── api/                   # API routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   │   └── register/route.ts       # User registration
│   │   │   ├── videos/
│   │   │   │   ├── route.ts       # GET list (with filters)
│   │   │   │   └── [id]/route.ts  # GET video detail + subtitles
│   │   │   ├── categories/route.ts # GET public categories
│   │   │   ├── user/
│   │   │   │   └── change-password/route.ts
│   │   │   └── admin/
│   │   │       ├── videos/
│   │   │       │   ├── route.ts   # GET list, POST create
│   │   │       │   └── [id]/
│   │   │       │       ├── route.ts          # GET, PUT, DELETE video
│   │   │       │       ├── subtitles/route.ts # GET, PUT subtitles
│   │   │       │       └── import-subs/route.ts # POST import YouTube subs
│   │   │       ├── categories/
│   │   │       │   ├── route.ts   # GET list, POST create
│   │   │       │   └── [id]/route.ts # GET, PUT, DELETE category
│   │   │       ├── users/
│   │   │       │   ├── route.ts   # GET list
│   │   │       │   └── [id]/route.ts # PUT (set expireAt, role)
│   │   │       └── settings/route.ts # GET, PUT site settings
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Root page (redirects)
│   │   └── providers.tsx          # SessionProvider wrapper
│   ├── components/
│   │   ├── public/
│   │   │   ├── VideoCard.tsx      # Video card for grid display
│   │   │   ├── VideoPlayer.tsx    # Custom HTML5 player with controls
│   │   │   ├── SubtitlePanel.tsx  # Subtitle display with auto-highlight
│   │   │   ├── FilterBar.tsx      # Level + topic filter chips
│   │   │   └── SearchBar.tsx      # Search input
│   │   ├── admin/
│   │   │   ├── WaveformView.tsx   # wavesurfer.js waveform with regions
│   │   │   ├── EntryEditor.tsx    # Edit single subtitle entry
│   │   │   └── EntryList.tsx      # Subtitle entries table
│   │   └── layout/
│   │       ├── Header.tsx         # Site header with nav
│   │       └── Footer.tsx         # Site footer
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   └── auth.ts                # NextAuth configuration
│   ├── scripts/
│   │   └── youtube-download.ts    # CLI tool for YouTube import
│   ├── types/
│   │   └── next-auth.d.ts         # NextAuth type extensions
│   └── middleware.ts              # Admin route protection
├── .env.example                   # Environment variable template
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── prisma/schema.prisma
```

## Database Schema

### Models

**User** - Registered users with role-based access.

| Field | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| email | String (unique) | User email |
| passwordHash | String | Bcrypt hashed password |
| role | Enum (USER, ADMIN) | Access level |
| expireAt | DateTime? | Subscription expiration (null = never expires) |
| createdAt | DateTime | Registration date |
| updatedAt | DateTime | Last update |

**Video** - Video content with metadata.

| Field | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| title | String | Korean title |
| titleZh | String | Chinese title |
| description | String? | Korean description |
| descriptionZh | String? | Chinese description |
| coverUrl | String | Thumbnail URL (OSS) |
| videoUrl | String | MP4 video URL (OSS) |
| audioUrl | String? | Extracted audio URL for waveform editor |
| duration | Int | Duration in seconds |
| published | Boolean | Whether visible to public |
| createdAt | DateTime | Creation date |
| updatedAt | DateTime | Last update |

**Category** - Levels and topics for organizing videos.

| Field | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Korean name |
| nameZh | String | Chinese name |
| type | Enum (LEVEL, TOPIC) | Category type |
| slug | String (unique) | URL-friendly identifier |
| sortOrder | Int | Display order |

**VideoCategory** - Many-to-many join table between Video and Category.

**SubtitleTrack** - A language track for a video (KO or ZH).

| Field | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| videoId | String | Reference to Video |
| lang | Enum (KO, ZH) | Language |

**SubtitleEntry** - Individual subtitle line with timing.

| Field | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| trackId | String | Reference to SubtitleTrack |
| index | Int | Display order |
| startTime | Float | Start time in seconds (e.g. 12.345) |
| endTime | Float | End time in seconds |
| text | String | Subtitle text |

**SiteSetting** - Key-value store for site configuration (e.g. WeChat QR code URL).

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- ffmpeg (for audio extraction in subtitle editor)
- yt-dlp (for YouTube download script)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/hangul_study"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret"

# Aliyun OSS (fill in when ready)
OSS_REGION="oss-cn-hangzhou"
OSS_ACCESS_KEY_ID="your-access-key-id"
OSS_ACCESS_KEY_SECRET="your-access-key-secret"
OSS_BUCKET="your-bucket-name"
OSS_CDN_DOMAIN="your-cdn-domain.com"
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Create Admin User

After registration, manually update your user role in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`. Admin panel at `http://localhost:3000/admin`.

## Usage Guide

### Adding Videos

**Option A: Manual Upload**

1. Upload video (MP4) and thumbnail to Aliyun OSS
2. Go to Admin > Videos > Add Video
3. Fill in titles (Korean + Chinese), descriptions, URLs, duration
4. Assign level and topics
5. Publish or save as draft

**Option B: YouTube Import Script**

```bash
# Install prerequisites
pip install yt-dlp
# Ensure ffmpeg is installed and in PATH

# Run the import script
npx ts-node src/scripts/youtube-download.ts "https://www.youtube.com/watch?v=VIDEO_ID"
```

This will:
1. Download the video (best quality up to 1080p)
2. Extract audio (MP3) for waveform editor
3. Generate a thumbnail at 5 seconds
4. Extract auto-generated Korean subtitles
5. Upload all files to Aliyun OSS
6. Create a draft video entry in the database

Then go to Admin > Videos > [video] > Subtitles to edit the imported subtitles.

### Editing Subtitles

1. Navigate to Admin > Videos > [video] > Subtitles
2. The waveform view shows the audio timeline with colored regions for each subtitle entry
3. Click a region or entry in the list to select it
4. Edit Korean/Chinese text and start/end times in the editor
5. Use "Add Entry" to create new entries at the current playhead position
6. Use "Import from YouTube" to auto-import Korean subtitles from a YouTube URL
7. Changes auto-save to the database

### Managing Users

1. Go to Admin > Users
2. Click "Edit Expire" on a user row
3. Set the expiration date using the date picker
4. Click "Save"

### Managing Categories

1. Go to Admin > Categories
2. Switch between "Levels" and "Topics" tabs
3. Add, edit, or delete categories
4. Set sort order to control display order

### Configuring WeChat QR Code

1. Upload your WeChat QR code image to Aliyun OSS
2. Go to Admin > Settings
3. Paste the image URL
4. Click "Save Settings"
5. The QR code will appear on the `/pricing` page

## Subtitle Sync Logic

The core feature of the video detail page works as follows:

```
1. Video fires 'timeupdate' event (~4 times per second)
2. Get currentTime from the video element
3. Find the subtitle entry where startTime <= currentTime <= endTime
4. Apply highlight CSS class to that entry
5. Auto-scroll the subtitle container to keep the active entry visible
6. User can click any entry to seek the video to that entry's startTime
```

## API Reference

### Public APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/videos?level=&topic=&search=&page=&limit=` | List published videos with filters |
| GET | `/api/videos/[id]` | Get video detail with merged KO/ZH subtitles |
| GET | `/api/categories` | List all categories |
| POST | `/api/auth/register` | Register new user (email, password) |
| POST | `/api/user/change-password` | Change password (requires auth) |

### Admin APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/videos` | List all videos (including drafts) |
| POST | `/api/admin/videos` | Create video with category assignments |
| GET | `/api/admin/videos/[id]` | Get video detail |
| PUT | `/api/admin/videos/[id]` | Update video |
| DELETE | `/api/admin/videos/[id]` | Delete video |
| GET | `/api/admin/videos/[id]/subtitles` | Get subtitle tracks + entries |
| PUT | `/api/admin/videos/[id]/subtitles` | Bulk save all subtitle entries |
| POST | `/api/admin/videos/[id]/import-subs` | Import subtitles from YouTube |
| GET | `/api/admin/categories` | List all categories |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/[id]` | Update category |
| DELETE | `/api/admin/categories/[id]` | Delete category |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/[id]` | Update user (expireAt, role) |
| GET | `/api/admin/settings` | Get site settings |
| PUT | `/api/admin/settings` | Update site settings |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## Deployment

1. Build the application: `npm run build`
2. Set environment variables on your hosting platform
3. Ensure PostgreSQL is accessible
4. Run `npx prisma db push` on the production database
5. Start with `npm run start`

Recommended hosting for Chinese users: Aliyun ECS or similar China-based cloud provider for low latency.
