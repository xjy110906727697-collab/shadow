import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始插入 mock 数据...')

  // 清空现有数据
  await prisma.subtitleEntry.deleteMany()
  await prisma.subtitleTrack.deleteMany()
  await prisma.videoCategory.deleteMany()
  await prisma.video.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  console.log('已清空现有数据')

  // 创建用户
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const userPasswordHash = await bcrypt.hash('user123', 10)

  await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin1@example.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin2@example.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        passwordHash: userPasswordHash,
        role: 'USER',
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        passwordHash: userPasswordHash,
        role: 'USER',
        expireAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后过期
      },
    }),
  ])

  console.log('已创建用户 (admin1/admin2@example.com, user1/user2@example.com, 密码: admin123/user123)')

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

  // 创建视频 - 增加到24个以测试滚动加载
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
        visitorAccessible: true,
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
        visitorAccessible: true,
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
        visitorAccessible: true,
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
        published: true,
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
    // 新增视频 8-23
    prisma.video.create({
      data: {
        title: '부산 여행 가이드',
        titleZh: '釜山旅行指南',
        description: '부산의 해운대와 광안리 해변을 소개합니다.',
        descriptionZh: '介绍釜山的海云台和广安里海滩。',
        coverUrl: 'https://images.unsplash.com/photo-1517821362941-f7f753200421?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 380,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '제주도 여행 팁',
        titleZh: '济州岛旅行贴士',
        description: '제주도의 아름다운 풍경과 여행 코스를 알아봅니다.',
        descriptionZh: '了解济州岛的美丽风景和旅行路线。',
        coverUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 450,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 카페 문화',
        titleZh: '韩国咖啡文化',
        description: '한국의 독특한 카페 문화를 경험해 보세요.',
        descriptionZh: '体验韩国独特的咖啡文化。',
        coverUrl: 'https://images.unsplash.com/photo-1583224944844-5b268c057b5b?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 280,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 길거리 음식',
        titleZh: '韩国街头美食',
        description: '명동의 인기 길거리 음식을 소개합니다.',
        descriptionZh: '介绍明洞的热门街头美食。',
        coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 320,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국어 숫자 세기',
        titleZh: '韩语数字计数',
        description: '한국어 숫자의 두 가지 시스템을 배워봅니다.',
        descriptionZh: '学习韩语数字的两种系统。',
        coverUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 200,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국어 시간 표현',
        titleZh: '韩语时间表达',
        description: '시간을 표현하는 다양한 방법을 연습합니다.',
        descriptionZh: '练习表达时间的多种方法。',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 220,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 전통 문화',
        titleZh: '韩国传统文化',
        description: '한복과 전통 음악을 알아봅니다.',
        descriptionZh: '了解韩服和传统音乐。',
        coverUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 400,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 쇼핑 가이드',
        titleZh: '韩国购物指南',
        description: '명동과 홍대에서의 쇼핑 팁을 소개합니다.',
        descriptionZh: '介绍明洞和弘大的购物技巧。',
        coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 350,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국어 자기소개',
        titleZh: '韩语自我介绍',
        description: '자기소개하는 방법을 배워봅니다.',
        descriptionZh: '学习如何自我介绍。',
        coverUrl: 'https://images.unsplash.com/photo-1517821362941-f7f753200421?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 180,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국어 질문하기',
        titleZh: '韩语提问',
        description: '다양한 질문 표현을 연습합니다.',
        descriptionZh: '练习各种提问表达。',
        coverUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 260,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 날씨 표현',
        titleZh: '韩国天气表达',
        description: '날씨에 대해 이야기하는 방법을 배워봅니다.',
        descriptionZh: '学习如何谈论天气。',
        coverUrl: 'https://images.unsplash.com/photo-1583224944844-5b268c057b5b?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 240,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 교통 이용법',
        titleZh: '韩国交通使用法',
        description: '지하철과 버스 이용 방법을 알아봅니다.',
        descriptionZh: '了解地铁和公交的使用方法。',
        coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 300,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국어 감정 표현',
        titleZh: '韩语情感表达',
        description: '감정을 표현하는 다양한 방법을 배워봅니다.',
        descriptionZh: '学习表达情感的多种方法。',
        coverUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 280,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 미용 문화',
        titleZh: '韩国美容文化',
        description: 'K-뷰티의 트렌드를 알아봅니다.',
        descriptionZh: '了解K-Beauty的趋势。',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 340,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국어 전화 대화',
        titleZh: '韩语电话对话',
        description: '전화 상황에서 사용하는 표현을 배워봅니다.',
        descriptionZh: '学习电话场景中使用的表达。',
        coverUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 260,
        published: true,
      },
    }),
    prisma.video.create({
      data: {
        title: '한국 축제 문화',
        titleZh: '韩国节日文化',
        description: '한국의 다양한 축제와 이벤트를 소개합니다.',
        descriptionZh: '介绍韩国各种节日和活动。',
        coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 380,
        published: true,
      },
    }),
  ])

  console.log('已创建视频')

  // 关联视频和分类
  const categoryRelations = [
    // Video 0: 韩语基础问候语 - 初级/日常会话
    { videoId: videos[0].id, categoryId: levels[0].id },
    { videoId: videos[0].id, categoryId: topics[0].id },
    // Video 1: 首尔旅行指南 - 初级/旅行
    { videoId: videos[1].id, categoryId: levels[0].id },
    { videoId: videos[1].id, categoryId: topics[1].id },
    // Video 2: 韩国饮食文化 - 初级/文化
    { videoId: videos[2].id, categoryId: levels[0].id },
    { videoId: videos[2].id, categoryId: topics[3].id },
    // Video 3: 商务韩语 - 中级/商务
    { videoId: videos[3].id, categoryId: levels[1].id },
    { videoId: videos[3].id, categoryId: topics[2].id },
    // Video 4: 韩语发音练习 - 初级/日常会话
    { videoId: videos[4].id, categoryId: levels[0].id },
    { videoId: videos[4].id, categoryId: topics[0].id },
    // Video 5: K-POP歌词学韩语 - 中级/文化
    { videoId: videos[5].id, categoryId: levels[1].id },
    { videoId: videos[5].id, categoryId: topics[3].id },
    // Video 6: 韩剧台词学习 - 高级/文化
    { videoId: videos[6].id, categoryId: levels[2].id },
    { videoId: videos[6].id, categoryId: topics[3].id },
    // Video 7: 韩语语法基础 - 初级/日常会话
    { videoId: videos[7].id, categoryId: levels[0].id },
    { videoId: videos[7].id, categoryId: topics[0].id },
    // Video 8: 釜山旅行指南 - 初级/旅行
    { videoId: videos[8].id, categoryId: levels[0].id },
    { videoId: videos[8].id, categoryId: topics[1].id },
    // Video 9: 济州岛旅行贴士 - 中级/旅行
    { videoId: videos[9].id, categoryId: levels[1].id },
    { videoId: videos[9].id, categoryId: topics[1].id },
    // Video 10: 韩国咖啡文化 - 初级/文化
    { videoId: videos[10].id, categoryId: levels[0].id },
    { videoId: videos[10].id, categoryId: topics[3].id },
    // Video 11: 韩国街头美食 - 初级/文化
    { videoId: videos[11].id, categoryId: levels[0].id },
    { videoId: videos[11].id, categoryId: topics[3].id },
    // Video 12: 韩语数字计数 - 初级/日常会话
    { videoId: videos[12].id, categoryId: levels[0].id },
    { videoId: videos[12].id, categoryId: topics[0].id },
    // Video 13: 韩语时间表达 - 初级/日常会话
    { videoId: videos[13].id, categoryId: levels[0].id },
    { videoId: videos[13].id, categoryId: topics[0].id },
    // Video 14: 韩国传统文化 - 中级/文化
    { videoId: videos[14].id, categoryId: levels[1].id },
    { videoId: videos[14].id, categoryId: topics[3].id },
    // Video 15: 韩国购物指南 - 初级/旅行
    { videoId: videos[15].id, categoryId: levels[0].id },
    { videoId: videos[15].id, categoryId: topics[1].id },
    // Video 16: 韩语自我介绍 - 初级/日常会话
    { videoId: videos[16].id, categoryId: levels[0].id },
    { videoId: videos[16].id, categoryId: topics[0].id },
    // Video 17: 韩语提问 - 初级/日常会话
    { videoId: videos[17].id, categoryId: levels[0].id },
    { videoId: videos[17].id, categoryId: topics[0].id },
    // Video 18: 韩国天气表达 - 初级/日常会话
    { videoId: videos[18].id, categoryId: levels[0].id },
    { videoId: videos[18].id, categoryId: topics[0].id },
    // Video 19: 韩国交通使用法 - 中级/旅行
    { videoId: videos[19].id, categoryId: levels[1].id },
    { videoId: videos[19].id, categoryId: topics[1].id },
    // Video 20: 韩语情感表达 - 中级/日常会话
    { videoId: videos[20].id, categoryId: levels[1].id },
    { videoId: videos[20].id, categoryId: topics[0].id },
    // Video 21: 韩国美容文化 - 中级/文化
    { videoId: videos[21].id, categoryId: levels[1].id },
    { videoId: videos[21].id, categoryId: topics[3].id },
    // Video 22: 韩语电话对话 - 中级/商务
    { videoId: videos[22].id, categoryId: levels[1].id },
    { videoId: videos[22].id, categoryId: topics[2].id },
    // Video 23: 韩国节日文化 - 高级/文化
    { videoId: videos[23].id, categoryId: levels[2].id },
    { videoId: videos[23].id, categoryId: topics[3].id },
  ]

  await Promise.all(
    categoryRelations.map(rel =>
      prisma.videoCategory.create({ data: rel })
    )
  )

  console.log('已关联视频和分类')

  // 为所有视频添加字幕
  const defaultSubtitles = [
    { ko: '안녕하세요', zh: '你好', startTime: 0, endTime: 3 },
    { ko: '반갑습니다', zh: '很高兴认识你', startTime: 3, endTime: 6 },
    { ko: '오늘 날씨가 좋네요', zh: '今天天气真好', startTime: 6, endTime: 10 },
    { ko: '네, 정말 좋어요', zh: '是的，真的很好', startTime: 10, endTime: 14 },
    { ko: '어디에 가요?', zh: '去哪里？', startTime: 14, endTime: 17 },
    { ko: '학교에 가요', zh: '去学校', startTime: 17, endTime: 20 },
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

    const entries = defaultSubtitles

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
