import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始插入 mock 数据...')

  // 清空现有数据
  await prisma.subtitleEntry.deleteMany()
  await prisma.subtitleTrack.deleteMany()
  await prisma.videoCategory.deleteMany()
  await prisma.video.deleteMany()
  await prisma.category.deleteMany()
  console.log('已清空现有数据')

  // 创建分类
  const levels = await Promise.all([
    prisma.category.create({
      data: {
        name: '초급',
        nameZh: '初级',
        type: 'LEVEL',
        slug: 'beginner',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: '중급',
        nameZh: '中级',
        type: 'LEVEL',
        slug: 'intermediate',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: '고급',
        nameZh: '高级',
        type: 'LEVEL',
        slug: 'advanced',
        sortOrder: 3,
      },
    }),
  ])

  const topics = await Promise.all([
    prisma.category.create({
      data: {
        name: '일상회화',
        nameZh: '日常会话',
        type: 'TOPIC',
        slug: 'daily-conversation',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: '여행',
        nameZh: '旅行',
        type: 'TOPIC',
        slug: 'travel',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: '비즈니스',
        nameZh: '商务',
        type: 'TOPIC',
        slug: 'business',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: '문화',
        nameZh: '文化',
        type: 'TOPIC',
        slug: 'culture',
        sortOrder: 4,
      },
    }),
  ])

  console.log('已创建分类')

  // 创建视频
  const videos = await Promise.all([
    prisma.video.create({
      data: {
        title: '한국어 기초 인사',
        titleZh: '韩语基础问候语',
        description: '기본적인 한국어 인사말을 배워보세요.',
        descriptionZh: '学习基本的韩语问候语。',
        coverUrl: 'https://images.unsplash.com/photo-1517821362941-f7f753200421?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 180,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '서울 여행 가이드',
        titleZh: '首尔旅行指南',
        description: '서울의 주요 관광지와 여행 팁을 소개합니다.',
        descriptionZh: '介绍首尔的主要旅游景点和旅行贴士。',
        coverUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 420,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 음식 문화',
        titleZh: '韩国饮食文化',
        description: '한국의 다양한 음식과 식사 예절을 알아봅니다.',
        descriptionZh: '了解韩国多样的美食和用餐礼仪。',
        coverUrl: 'https://images.unsplash.com/photo-1583224944844-5b268c057b5b?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 300,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '비즈니스 한국어',
        titleZh: '商务韩语',
        description: '직장에서의 한국어 표현을 배워보세요.',
        descriptionZh: '学习职场中的韩语表达。',
        coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 540,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국어 발음 연습',
        titleZh: '韩语发音练习',
        description: '한국어 발음의 기본을 연습해봅니다.',
        descriptionZh: '练习韩语发音的基础。',
        coverUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 240,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: 'K-POP 가사로 배우는 한국어',
        titleZh: '通过K-POP歌词学韩语',
        description: '인기 K-POP 노래 가사로 한국어를 배워보세요.',
        descriptionZh: '通过热门K-POP歌曲歌词学习韩语。',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 360,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 드라마 대사로 배우기',
        titleZh: '通过韩剧台词学习',
        description: '인기 한국 드라마의 대사로 실전 회화를 배워봅니다.',
        descriptionZh: '通过热门韩剧台词学习实用会话。',
        coverUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 480,
        published: false,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국어 문법 기초',
        titleZh: '韩语语法基础',
        description: '한국어 문법의 기본 구조를 배워봅니다.',
        descriptionZh: '学习韩语语法的基本结构。',
        coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 600,
        published: true,
      },
    }),
  ])

  console.log('已创建视频')

  // 关联视频和分类
  await Promise.all([
    // 初级 - 日常会话
    prisma.videoCategory.create({
      data: { videoId: videos[0].id, categoryId: levels[0].id },
    }),
    prisma.videoCategory.create({
      data: { videoId: videos[0].id, categoryId: topics[0].id },
    }),
    // 初级 - 旅行
    prisma.videoCategory.create({
      data: { videoId: videos[1].id, categoryId: levels[0].id },
    }),
    prisma.videoCategory.create({
      data: { videoId: videos[1].id, categoryId: topics[1].id },
    }),
    // 初级 - 文化
    prisma.videoCategory.create({
      data: { videoId: videos[2].id, categoryId: levels[0].id },
    }),
    prisma.videoCategory.create({
      data: { videoId: videos[2].id, categoryId: topics[3].id },
    }),
    // 中级 - 商务
    prisma.videoCategory.create({
      data: { videoId: videos[3].id, categoryId: levels[1].id },
    }),
    prisma.videoCategory.create({
      data: { videoId: videos[3].id, categoryId: topics[2].id },
    }),
    // 初级 - 日常会话 (发音)
    prisma.videoCategory.create({
      data: { videoId: videos[4].id, categoryId: levels[0].id },
    }),
    prisma.videoCategory.create({
      data: { videoId: videos[4].id, categoryId: topics[0].id },
    }),
    // 中级 - 文化 (K-POP)
    prisma.videoCategory.create({
      data: { videoId: videos[5].id, categoryId: levels[1].id },
    }),
    prisma.videoCategory.create({
      data: { videoId: videos[5].id, categoryId: topics[3].id },
    }),
    // 高级 - 文化 (韩剧)
    prisma.videoCategory.create({
      data: { videoId: videos[6].id, categoryId: levels[2].id },
    }),
    prisma.videoCategory.create({
      data: { videoId: videos[6].id, categoryId: topics[3].id },
    }),
    // 初级 - 语法
    prisma.videoCategory.create({
      data: { videoId: videos[7].id, categoryId: levels[0].id },
    }),
  ])

  console.log('已关联视频和分类')

  // 为所有视频添加字幕
  const allSubtitles = [
    // Video 0: 韩语基础问候语
    [
      { ko: '안녕하세요', zh: '你好', startTime: 0, endTime: 3 },
      { ko: '반갑습니다', zh: '很高兴认识你', startTime: 3, endTime: 6 },
      { ko: '오늘 날씨가 좋네요', zh: '今天天气真好', startTime: 6, endTime: 10 },
      { ko: '네, 정말 좋어요', zh: '是的，真的很好', startTime: 10, endTime: 14 },
      { ko: '어디에 가요?', zh: '去哪里？', startTime: 14, endTime: 17 },
      { ko: '학교에 가요', zh: '去学校', startTime: 17, endTime: 20 },
    ],
    // Video 1: 首尔旅行指南
    [
      { ko: '서울은 한국의 수도입니다', zh: '首尔是韩国的首都', startTime: 0, endTime: 4 },
      { ko: '경복궁은 아름다운 궁궐이에요', zh: '景福宫是美丽的宫殿', startTime: 4, endTime: 8 },
      { ko: '명동에서 쇼핑을 할 수 있어요', zh: '可以在明洞购物', startTime: 8, endTime: 12 },
      { ko: '한국 음식을 꼭 맛보세요', zh: '一定要品尝韩国美食', startTime: 12, endTime: 16 },
      { ko: '서울 탑에서 야경을 보세요', zh: '在首尔塔看夜景', startTime: 16, endTime: 20 },
    ],
    // Video 2: 韩国饮食文化
    [
      { ko: '김치는 한국 대표 음식이에요', zh: '泡菜是韩国代表性食物', startTime: 0, endTime: 4 },
      { ko: '비빔밥은 건강에 좋아요', zh: '拌饭对健康很好', startTime: 4, endTime: 8 },
      { ko: '불고기는 맛이 달콤해요', zh: '烤肉味道甜甜的', startTime: 8, endTime: 12 },
      { ko: '밥을 먹기 전에 수저를 들어요', zh: '吃饭前拿起勺子', startTime: 12, endTime: 16 },
      { ko: '한국 식사 예절을 배워요', zh: '学习韩国用餐礼仪', startTime: 16, endTime: 20 },
    ],
    // Video 3: 商务韩语
    [
      { ko: '안녕하십니까, 김부장입니다', zh: '您好，我是金部长', startTime: 0, endTime: 4 },
      { ko: '회의를 시작하겠습니다', zh: '开始开会', startTime: 4, endTime: 8 },
      { ko: '프로젝트 진행 상황을 보고합니다', zh: '汇报项目进展', startTime: 8, endTime: 12 },
      { ko: '좋은 의견 감사합니다', zh: '感谢您的好意见', startTime: 12, endTime: 16 },
      { ko: '다음 주까지 완성하겠습니다', zh: '下周前完成', startTime: 16, endTime: 20 },
    ],
    // Video 4: 韩语发音练习
    [
      { ko: '한국어 자음을 배워요', zh: '学习韩语辅音', startTime: 0, endTime: 4 },
      { ko: '모음은 스무 개가 있어요', zh: '元音有20个', startTime: 4, endTime: 8 },
      { ko: '받침 발음에 주의하세요', zh: '注意收音发音', startTime: 8, endTime: 12 },
      { ko: '된소리와 겹소리를 구분해요', zh: '区分硬音和复音', startTime: 12, endTime: 16 },
      { ko: '따라 읽으면서 연습해요', zh: '跟着读来练习', startTime: 16, endTime: 20 },
    ],
    // Video 5: 通过K-POP歌词学韩语
    [
      { ko: '노래 가사로 한국어를 배워요', zh: '通过歌词学韩语', startTime: 0, endTime: 4 },
      { ko: '방탄소년단 인기가 많아요', zh: '防弹少年团很受欢迎', startTime: 4, endTime: 8 },
      { ko: '블랙핑크도 유명해요', zh: 'BLACKPINK也很有名', startTime: 8, endTime: 12 },
      { ko: '가사를 따라 불러봐요', zh: '跟着歌词唱', startTime: 12, endTime: 16 },
      { ko: '재미있게 공부해요', zh: '愉快地学习', startTime: 16, endTime: 20 },
    ],
    // Video 6: 通过韩剧台词学习
    [
      { ko: '한국 드라마를 좋아해요', zh: '我喜欢韩剧', startTime: 0, endTime: 4 },
      { ko: '사랑해요는 가장 많이 써요', zh: '"我爱你"用得最多', startTime: 4, endTime: 8 },
      { ko: '대사를 따라 말해봐요', zh: '跟着台词说', startTime: 8, endTime: 12 },
      { ko: '실생활 표현을 배워요', zh: '学习日常表达', startTime: 12, endTime: 16 },
      { ko: '자연스러운 한국어를 배워요', zh: '学习自然的韩语', startTime: 16, endTime: 20 },
    ],
    // Video 7: 韩语语法基础
    [
      { ko: '한국어 어순은 SOV예요', zh: '韩语语序是SOV', startTime: 0, endTime: 4 },
      { ko: '조사 사용이 중요해요', zh: '助词使用很重要', startTime: 4, endTime: 8 },
      { ko: '동사 변형을 배워요', zh: '学习动词变形', startTime: 8, endTime: 12 },
      { ko: '형용사 활용을 연습해요', zh: '练习形容词活用', startTime: 12, endTime: 16 },
      { ko: '문법을 익혀요', zh: '熟悉语法', startTime: 16, endTime: 20 },
    ],
  ]

  for (let i = 0; i < videos.length; i++) {
    const koTrack = await prisma.subtitleTrack.create({
      data: {
        videoId: videos[i].id,
        lang: 'KO',
      },
    })

    const zhTrack = await prisma.subtitleTrack.create({
      data: {
        videoId: videos[i].id,
        lang: 'ZH',
      },
    })

    const entries = allSubtitles[i]

    await Promise.all([
      ...entries.map((entry, index) =>
        prisma.subtitleEntry.create({
          data: {
            trackId: koTrack.id,
            index,
            startTime: entry.startTime,
            endTime: entry.endTime,
            text: entry.ko,
          },
        })
      ),
      ...entries.map((entry, index) =>
        prisma.subtitleEntry.create({
          data: {
            trackId: zhTrack.id,
            index,
            startTime: entry.startTime,
            endTime: entry.endTime,
            text: entry.zh,
          },
        })
      ),
    ])
  }

  console.log('已为所有视频添加字幕')
  console.log('Mock 数据插入完成!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
