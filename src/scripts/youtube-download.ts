#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import OSS from 'ali-oss';
import sharp from 'sharp';
import { prisma } from '../lib/prisma';

const client = new OSS({
  region: process.env.OSS_REGION!,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET!,
});

async function downloadVideo(url: string, outputPath: string) {
  console.log('Downloading video...');
  execSync(`yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" -o "${outputPath}" "${url}"`);
  console.log('Video downloaded');
}

async function extractAudio(videoPath: string, audioPath: string) {
  console.log('Extracting audio...');
  execSync(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 2 "${audioPath}"`);
  console.log('Audio extracted');
}

async function extractSubtitles(url: string, outputPath: string) {
  console.log('Extracting subtitles...');
  execSync(`yt-dlp --write-auto-sub --sub-lang ko --skip-download -o "${outputPath}" "${url}"`);
  console.log('Subtitles extracted');
}

async function generateThumbnail(videoPath: string, thumbnailPath: string) {
  console.log('Generating thumbnail...');
  execSync(`ffmpeg -i "${videoPath}" -ss 00:00:05 -vframes 1 -vf "scale=640:360" "${thumbnailPath}"`);
  console.log('Thumbnail generated');
}

async function getVideoDuration(videoPath: string): Promise<number> {
  const result = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`);
  return Math.floor(parseFloat(result.toString()));
}

async function uploadToOSS(filePath: string, key: string): Promise<string> {
  console.log(`Uploading ${key} to OSS...`);
  const result = await client.put(key, filePath);
  return result.url;
}

async function parseSubtitles(subtitlePath: string) {
  if (!fs.existsSync(subtitlePath)) {
    console.log('No subtitles found');
    return [];
  }

  const content = fs.readFileSync(subtitlePath, 'utf-8');
  const entries: Array<{ startTime: number; endTime: number; text: string }> = [];
  
  const blocks = content.split('\n\n');
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 3) {
      const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
      if (timeMatch) {
        const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
        const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
        const text = lines.slice(2).join(' ');
        entries.push({ startTime, endTime, text });
      }
    }
  }

  return entries;
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: ts-node youtube-download.ts <youtube-url>');
    process.exit(1);
  }

  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const videoPath = path.join(tempDir, 'video.mp4');
  const audioPath = path.join(tempDir, 'audio.mp3');
  const subtitlePath = path.join(tempDir, 'subtitles.ko.vtt');
  const thumbnailPath = path.join(tempDir, 'thumbnail.jpg');

  try {
    await downloadVideo(url, videoPath);
    await extractAudio(videoPath, audioPath);
    await extractSubtitles(url, subtitlePath);
    await generateThumbnail(videoPath, thumbnailPath);

    const duration = await getVideoDuration(videoPath);
    const videoId = Date.now().toString();

    const videoUrl = await uploadToOSS(videoPath, `videos/${videoId}.mp4`);
    const audioUrl = await uploadToOSS(audioPath, `audio/${videoId}.mp3`);
    const coverUrl = await uploadToOSS(thumbnailPath, `covers/${videoId}.jpg`);

    const video = await prisma.video.create({
      data: {
        title: 'Imported Video',
        titleZh: '导入的视频',
        description: '',
        descriptionZh: '',
        coverUrl,
        videoUrl,
        audioUrl,
        duration,
        published: false,
      },
    });

    const subtitleEntries = await parseSubtitles(subtitlePath);
    if (subtitleEntries.length > 0) {
      const koTrack = await prisma.subtitleTrack.create({
        data: {
          videoId: video.id,
          lang: 'KO',
        },
      });

      await prisma.subtitleEntry.createMany({
        data: subtitleEntries.map((entry, index) => ({
          trackId: koTrack.id,
          index,
          startTime: entry.startTime,
          endTime: entry.endTime,
          text: entry.text,
        })),
      });
    }

    console.log(`\nVideo imported successfully!`);
    console.log(`Video ID: ${video.id}`);
    console.log(`Edit subtitles at: /admin/videos/${video.id}/subtitles`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(subtitlePath)) fs.unlinkSync(subtitlePath);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
  }
}

main();
