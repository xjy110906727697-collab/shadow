import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function splitKoZh(text: string): { ko: string; zh: string } {
  // Korean ranges: Hangul Syllables (AC00-D7AF), Hangul Jamo (1100-11FF), Hangul Compatibility Jamo (3130-318F)
  // Chinese ranges: CJK Unified Ideographs (4E00-9FFF), CJK Unified Ideographs Ext A (3400-4DBF)
  let ko = ''
  let zh = ''
  let current = ''
  let isKo = false
  let isZh = false

  for (const char of text) {
    const code = char.charCodeAt(0)
    const isKorean = (code >= 0xAC00 && code <= 0xD7AF) || (code >= 0x1100 && code <= 0x11FF) || (code >= 0x3130 && code <= 0x318F) || (code >= 0x3200 && code <= 0x32FF)
    const isChinese = (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF)
    const isPunct = /[.,!?;:()\s]/.test(char) || char === '-' || char === '—'

    if (isKorean) {
      if (isZh && current.trim()) { zh += current; current = ''; isZh = false }
      isKo = true
      current += char
    } else if (isChinese) {
      if (isKo && current.trim()) { ko += current; current = ''; isKo = false }
      isZh = true
      current += char
    } else if (isPunct || char === '') {
      current += char
    } else {
      // Latin/other — append to whichever is current
      current += char
    }
  }
  if (current.trim()) {
    if (isKo) ko += current
    else if (isZh) zh += current
    else ko += current // default to ko
  }

  return { ko: ko.trim(), zh: zh.trim() }
}

function parseSRT(content: string) {
  const entries: Array<{ startTime: number; endTime: number; text: string }> = []
  const blocks = content.trim().split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 3) continue

    // Find the time line (contains -->)
    const timeLine = lines.find(l => l.includes('-->'))
    if (!timeLine) continue

    const match = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/
    )
    if (!match) continue

    const startTime =
      parseInt(match[1]) * 3600 +
      parseInt(match[2]) * 60 +
      parseInt(match[3]) +
      parseInt(match[4]) / 1000
    const endTime =
      parseInt(match[5]) * 3600 +
      parseInt(match[6]) * 60 +
      parseInt(match[7]) +
      parseInt(match[8]) / 1000

    // Text is everything between the time line and the next block
    const textIndex = lines.findIndex(l => l.includes('-->'))
    const textLines = lines.slice(textIndex + 1).filter(l => l.trim().length > 0)
    const text = textLines.join(' ').replace(/<[^>]*>/g, '').trim()

    if (text) {
      entries.push({ startTime, endTime, text })
    }
  }

  return entries
}

function parseVTT(content: string) {
  // Remove VTT header
  const clean = content.replace(/^WEBVTT.*\n(?:Kind:.*\n)?(?:Language:.*\n)?/m, '')
  return parseSRT(clean)
}

function parseTXT(content: string) {
  // Simple plain text — each line is one subtitle entry
  // Format: startSeconds endSeconds text
  // Or just text with no timestamps
  const entries: Array<{ startTime: number; endTime: number; text: string }> = []
  const lines = content.trim().split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Try to parse "start end text" format
    const parts = trimmed.split(/\s+/)
    const first = parseFloat(parts[0])
    const second = parseFloat(parts[1])

    if (!isNaN(first) && !isNaN(second) && parts.length >= 3) {
      entries.push({
        startTime: first,
        endTime: second,
        text: parts.slice(2).join(' '),
      })
    } else {
      // Plain text line — use sequential timing
      const idx = entries.length
      entries.push({
        startTime: idx * 3,
        endTime: idx * 3 + 2.5,
        text: trimmed,
      })
    }
  }

  return entries
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '请选择字幕文件' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.srt') && !fileName.endsWith('.vtt') && !fileName.endsWith('.txt')) {
      return NextResponse.json({ error: '仅支持 .srt、.vtt、.txt 格式文件' }, { status: 400 })
    }

    let content = await file.text()

    // Parse based on format
    let parsed: Array<{ startTime: number; endTime: number; text: string }>
    if (fileName.endsWith('.vtt')) {
      parsed = parseVTT(content)
    } else if (fileName.endsWith('.txt')) {
      parsed = parseTXT(content)
    } else {
      parsed = parseSRT(content)
    }

    if (parsed.length === 0) {
      return NextResponse.json({ error: '未解析到有效字幕，请检查文件格式' }, { status: 400 })
    }

    // Create subtitle tracks
    let koTrack = await prisma.subtitleTrack.findFirst({
      where: { videoId: id, lang: 'KO' }
    })
    if (!koTrack) {
      koTrack = await prisma.subtitleTrack.create({ data: { videoId: id, lang: 'KO' } })
    } else {
      await prisma.subtitleEntry.deleteMany({ where: { trackId: koTrack.id } })
    }

    let zhTrack = await prisma.subtitleTrack.findFirst({
      where: { videoId: id, lang: 'ZH' }
    })
    if (!zhTrack) {
      zhTrack = await prisma.subtitleTrack.create({ data: { videoId: id, lang: 'ZH' } })
    } else {
      await prisma.subtitleEntry.deleteMany({ where: { trackId: zhTrack.id } })
    }

    // Split each entry into KO and ZH, then save
    const koEntries: Array<{ trackId: string; index: number; startTime: number; endTime: number; text: string }> = []
    const zhEntries: typeof koEntries = []

    parsed.forEach((entry, idx) => {
      const { ko, zh } = splitKoZh(entry.text)
      koEntries.push({
        trackId: koTrack!.id,
        index: idx,
        startTime: entry.startTime,
        endTime: entry.endTime,
        text: ko || entry.text, // fallback to full text if no Korean detected
      })
      zhEntries.push({
        trackId: zhTrack!.id,
        index: idx,
        startTime: entry.startTime,
        endTime: entry.endTime,
        text: zh || ko || entry.text, // fallback to ko then original
      })
    })

    await prisma.subtitleEntry.createMany({ data: koEntries })
    await prisma.subtitleEntry.createMany({ data: zhEntries })

    // Return entries for frontend
    const entries = parsed.map((entry, idx) => {
      const { ko, zh } = splitKoZh(entry.text)
      return {
        id: `new-${idx}`,
        index: idx,
        startTime: entry.startTime,
        endTime: entry.endTime,
        ko: ko || entry.text,
        zh: zh || ko || '',
      }
    })

    return NextResponse.json({
      message: `成功导入 ${entries.length} 条字幕`,
      entries,
    })
  } catch (error) {
    console.error('Error importing subtitles:', error)
    return NextResponse.json(
      { error: '导入字幕失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}
