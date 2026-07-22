#!/usr/bin/env ts-node
/**
 * YouTube 视频下载导入脚本
 *
 * 使用方法：
 *   npx tsx src/scripts/youtube-download.ts <youtube-url>
 *
 * 前置要求：
 *   pip install yt-dlp
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function downloadFile(url: string, dest: string): Promise<void> {
  return fetch(url).then(async (res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
  });
}

function checkFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
  } catch {
    console.error(
      "\n❌ ffmpeg 未安装或不在 PATH 中。下载高清视频需要 ffmpeg 合并音视频流。\n",
    );
    console.error("安装方法:");
    console.error("  winget install ffmpeg       (Windows)");
    console.error("  brew install ffmpeg          (macOS)");
    console.error("  sudo apt install ffmpeg      (Linux)");
    console.error("\n安装后重新运行即可。\n");
    process.exit(1);
  }
}

async function getVideoInfo(url: string) {
  console.log("获取视频信息...");
  const result = execSync(
    `yt-dlp --print "%(title)s|||%(duration)s" "${url}"`,
    { encoding: "utf-8" },
  );
  const parts = result.trim().split("|||");
  return {
    title: parts[0] || "Unknown",
    duration: parseInt(parts[1] || "0"),
  };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("\n使用方法:");
    console.error(
      '  npx tsx src/scripts/youtube-download.ts <youtube-url> [--title-zh "中文标题"] [--publish]\n',
    );
    console.error("示例:");
    console.error(
      "  npx tsx src/scripts/youtube-download.ts https://youtu.be/xxxxx\n",
    );
    process.exit(1);
  }

  const args = process.argv.slice(3);
  const titleZhIndex = args.indexOf("--title-zh");
  const customTitleZh = titleZhIndex >= 0 ? args[titleZhIndex + 1] : null;
  const shouldPublish = args.includes("--publish");

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  for (const dir of ["videos", "covers"]) {
    const fullDir = path.join(uploadsDir, dir);
    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
  }

  const fileId = Date.now().toString();
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    const info = await getVideoInfo(url);
    console.log(`标题: ${info.title}`);
    console.log(`时长: ${info.duration}秒`);

    // 检查 ffmpeg（高清下载需要合并音视频流）
    checkFfmpeg();

    // Step 1: Download video (prefer video+audio merge for high quality mp4)
    console.log("下载视频中...");
    const cookiesArg = args.includes("--cookies")
      ? " --cookies-from-browser chrome"
      : "";
    execSync(
      `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best"${cookiesArg} --merge-output-format mp4 -o "${path.join(tempDir, `${fileId}.%(ext)s`)}" "${url}"`,
      { stdio: "inherit" },
    );

    // Find the actual downloaded file (yt-dlp may append extra info)
    const findDownloadedFile = (): string | null => {
      if (!fs.existsSync(tempDir)) return null;
      const files = fs.readdirSync(tempDir);
      const match = files.find((f) => f.startsWith(fileId));
      return match ? path.join(tempDir, match) : null;
    };

    const actualVideo = findDownloadedFile();
    if (!actualVideo || !fs.existsSync(actualVideo)) {
      throw new Error("下载的视频文件未找到");
    }
    const videoExt = path.extname(actualVideo);
    console.log(`视频下载完成: ${path.basename(actualVideo)}`);

    // Step 2: Download thumbnail from YouTube's CDN (always jpg, no ffmpeg needed)
    const tempThumb = path.join(tempDir, `${fileId}.jpg`);
    console.log("下载封面...");
    const videoId = extractVideoId(url);
    if (videoId) {
      try {
        await downloadFile(
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          tempThumb,
        );
        console.log("封面下载完成");
      } catch {
        try {
          await downloadFile(
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            tempThumb,
          );
          console.log("封面下载完成（低分辨率）");
        } catch {
          console.log("封面下载失败");
        }
      }
    }

    // Step 3: Copy to uploads
    const videoDest = path.join(uploadsDir, "videos", `${fileId}${videoExt}`);
    fs.copyFileSync(actualVideo, videoDest);

    let coverUrl = "";
    if (fs.existsSync(tempThumb)) {
      const coverDest = path.join(uploadsDir, "covers", `${fileId}.jpg`);
      fs.copyFileSync(tempThumb, coverDest);
      coverUrl = `/uploads/covers/${fileId}.jpg`;
    }

    const videoUrl = `/uploads/videos/${fileId}${videoExt}`;

    // Step 4: Create DB record
    const video = await prisma.video.create({
      data: {
        title: info.title,
        titleZh: customTitleZh || info.title,
        coverUrl: coverUrl || "",
        videoUrl,
        duration: info.duration,
        published: shouldPublish,
      },
    });

    console.log(`\n✅ 视频已创建! ID: ${video.id}`);
    console.log(`   视频: ${videoUrl}`);
    if (coverUrl) console.log(`   封面: ${coverUrl}`);
    console.log(`   编辑: /admin/videos/${video.id}/edit`);
    console.log("\n🎉 导入完成!");
  } catch (error) {
    console.error("错误:", error);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const f of files) {
        if (f.startsWith(fileId)) fs.unlinkSync(path.join(tempDir, f));
      }
    }
  }
}

main();
