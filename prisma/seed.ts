import { PrismaClient, Role, CategoryType, SubtitleLang } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const levelCategories = [
  { name: 'TOPIK 1-2', nameZh: '初级', slug: 'beginner', sortOrder: 1 },
  { name: 'TOPIK 3-4', nameZh: '中级', slug: 'intermediate', sortOrder: 2 },
  { name: 'TOPIK 5-6', nameZh: '高级', slug: 'advanced', sortOrder: 3 },
]

const topicCategories = [
  { name: 'Daily Life', nameZh: '日常生活', slug: 'daily-life', sortOrder: 1 },
  { name: 'Travel', nameZh: '旅行出行', slug: 'travel', sortOrder: 2 },
  { name: 'Food', nameZh: '美食餐饮', slug: 'food', sortOrder: 3 },
  { name: 'Business', nameZh: '职场商务', slug: 'business', sortOrder: 4 },
  { name: 'Culture', nameZh: '文化娱乐', slug: 'culture', sortOrder: 5 },
  { name: 'Technology', nameZh: '科技数码', slug: 'technology', sortOrder: 6 },
  { name: 'Health', nameZh: '健康医疗', slug: 'health', sortOrder: 7 },
  { name: 'Education', nameZh: '教育学习', slug: 'education', sortOrder: 8 },
  { name: 'Shopping', nameZh: '购物消费', slug: 'shopping', sortOrder: 9 },
]

const instructors = ['Kim Teacher', 'Park 쌤', 'Lee 강사', 'Choi 선생님']

const videoData = [
  {
    title: 'Self-Introduction in Korean',
    titleZh: '韩语自我介绍',
    description: 'Learn how to introduce yourself naturally in Korean',
    descriptionZh: '学习如何用韩语自然地介绍自己',
    duration: 185,
    episodeNumber: 1,
    difficulty: 1,
    visitorAccessible: true,
    topics: ['daily-life'],
    levels: ['beginner'],
    instructor: 'Kim Teacher',
    subtitles: [
      { ko: '안녕하세요', zh: '你好', start: 0, end: 2.5 },
      { ko: '저는 김민수입니다', zh: '我是金民秀', start: 2.5, end: 5.5 },
      { ko: '한국에서 왔어요', zh: '我来自韩国', start: 5.5, end: 8 },
      { ko: '반갑습니다', zh: '很高兴认识你', start: 8, end: 10.5 },
      { ko: '오늘 첫 수업을 시작하겠습니다', zh: '今天开始第一堂课', start: 10.5, end: 14 },
      { ko: '자기소개부터 해볼까요?', zh: '先来做自我介绍吧？', start: 14, end: 17 },
      { ko: '이름이 뭐예요?', zh: '你叫什么名字？', start: 17, end: 19.5 },
      { ko: '저는 학생이에요', zh: '我是学生', start: 19.5, end: 22 },
    ],
    words: [
      { word: '안녕하세요', meaning: 'Hello (formal)', meaningZh: '你好（敬语）' },
      { word: '저', meaning: 'I (formal)', meaningZh: '我（敬语）' },
      { word: '이름', meaning: 'Name', meaningZh: '名字' },
      { word: '반갑습니다', meaning: 'Nice to meet you', meaningZh: '很高兴认识你' },
      { word: '학생', meaning: 'Student', meaningZh: '学生' },
    ],
  },
  {
    title: 'Ordering at a Restaurant',
    titleZh: '餐厅点餐',
    description: 'Essential phrases for ordering food in Korean restaurants',
    descriptionZh: '在韩国餐厅点餐的必备用语',
    duration: 240,
    episodeNumber: 2,
    difficulty: 1,
    visitorAccessible: true,
    topics: ['food'],
    levels: ['beginner'],
    instructor: 'Kim Teacher',
    subtitles: [
      { ko: '메뉴판 좀 주세요', zh: '请给我菜单', start: 0, end: 3 },
      { ko: '이거 뭐예요?', zh: '这是什么？', start: 3, end: 5.5 },
      { ko: '비빔밥 하나 주세요', zh: '请给我一份拌饭', start: 5.5, end: 8.5 },
      { ko: '물도 주세요', zh: '也请给我水', start: 8.5, end: 11 },
      { ko: '얼마예요?', zh: '多少钱？', start: 11, end: 13 },
      { ko: '맛있어요!', zh: '很好吃！', start: 13, end: 15 },
      { ko: '계산서 주세요', zh: '请给我账单', start: 15, end: 17.5 },
      { ko: '카드 가능합니다?', zh: '可以刷卡吗？', start: 17.5, end: 20 },
    ],
    words: [
      { word: '메뉴판', meaning: 'Menu', meaningZh: '菜单' },
      { word: '비빔밥', meaning: 'Bibimbap (mixed rice)', meaningZh: '拌饭' },
      { word: '물', meaning: 'Water', meaningZh: '水' },
      { word: '얼마', meaning: 'How much', meaningZh: '多少钱' },
      { word: '맛있어요', meaning: 'Delicious', meaningZh: '好吃' },
    ],
  },
  {
    title: 'Taking the Subway',
    titleZh: '乘坐地铁',
    description: 'Navigate the Korean subway system with confidence',
    descriptionZh: '自信地乘坐韩国地铁',
    duration: 210,
    episodeNumber: 3,
    difficulty: 1,
    visitorAccessible: true,
    topics: ['travel'],
    levels: ['beginner'],
    instructor: 'Park 쌤',
    subtitles: [
      { ko: '지하철역이 어디예요?', zh: '地铁站在哪里？', start: 0, end: 3 },
      { ko: '이 지하철은 어디로 가요?', zh: '这趟地铁去哪里？', start: 3, end: 6 },
      { ko: '강남역에서 내려야 해요', zh: '需要在江南站下车', start: 6, end: 9.5 },
      { ko: '환승하세요', zh: '请换乘', start: 9.5, end: 12 },
      { ko: '다음 역이에요', zh: '是下一站', start: 12, end: 14.5 },
      { ko: '교통카드가 있어요?', zh: '有交通卡吗？', start: 14.5, end: 17 },
    ],
    words: [
      { word: '지하철', meaning: 'Subway', meaningZh: '地铁' },
      { word: '역', meaning: 'Station', meaningZh: '站' },
      { word: '환승', meaning: 'Transfer', meaningZh: '换乘' },
      { word: '교통카드', meaning: 'Transportation card', meaningZh: '交通卡' },
    ],
  },
  {
    title: 'Job Interview Basics',
    titleZh: '面试基础',
    description: 'Common questions and answers for Korean job interviews',
    descriptionZh: '韩国面试常见问题与回答',
    duration: 320,
    episodeNumber: 4,
    difficulty: 3,
    topics: ['business'],
    levels: ['intermediate'],
    instructor: 'Lee 강사',
    subtitles: [
      { ko: '자기소개 해주세요', zh: '请做自我介绍', start: 0, end: 3 },
      { ko: '지원 동기가 뭐예요?', zh: '应聘动机是什么？', start: 3, end: 6.5 },
      { ko: '장단점이 뭐예요?', zh: '优缺点是什么？', start: 6.5, end: 9.5 },
      { ko: '팀워크를 중요하게 생각합니다', zh: '我认为团队合作很重要', start: 9.5, end: 13.5 },
      { ko: '열심히 하겠습니다', zh: '我会努力的', start: 13.5, end: 16 },
      { ko: 'qualifications이 어떻게 되세요?', zh: '您的资质如何？', start: 16, end: 19.5 },
    ],
    words: [
      { word: '면접', meaning: 'Interview', meaningZh: '面试' },
      { word: '지원', meaning: 'Application', meaningZh: '应聘' },
      { word: '동기', meaning: 'Motivation', meaningZh: '动机' },
      { word: '장점', meaning: 'Strength', meaningZh: '优点' },
      { word: '단점', meaning: 'Weakness', meaningZh: '缺点' },
      { word: '팀워크', meaning: 'Teamwork', meaningZh: '团队合作' },
    ],
  },
  {
    title: 'K-Drama Expressions',
    titleZh: '韩剧常用表达',
    description: 'Popular expressions from Korean dramas',
    descriptionZh: '韩剧中的热门表达',
    duration: 275,
    episodeNumber: 5,
    difficulty: 2,
    topics: ['culture'],
    levels: ['beginner'],
    instructor: 'Choi 선생님',
    subtitles: [
      { ko: '사랑해요', zh: '我爱你', start: 0, end: 2.5 },
      { ko: '가지 마', zh: '不要走', start: 2.5, end: 4.5 },
      { ko: '왜 그래?', zh: '怎么了？', start: 4.5, end: 6.5 },
      { ko: '진짜요?', zh: '真的吗？', start: 6.5, end: 8.5 },
      { ko: '괜찮아요', zh: '没关系', start: 8.5, end: 11 },
      { ko: '미안해', zh: '对不起', start: 11, end: 13 },
      { ko: '고마워', zh: '谢谢', start: 13, end: 14.5 },
      { ko: '화이팅!', zh: '加油！', start: 14.5, end: 16.5 },
    ],
    words: [
      { word: '사랑', meaning: 'Love', meaningZh: '爱' },
      { word: '가지 마', meaning: "Don't go", meaningZh: '不要走' },
      { word: '진짜', meaning: 'Really', meaningZh: '真的' },
      { word: '괜찮아요', meaning: "It's okay", meaningZh: '没关系' },
      { word: '미안해', meaning: 'Sorry (informal)', meaningZh: '对不起（非敬语）' },
      { word: '고마워', meaning: 'Thank you (informal)', meaningZh: '谢谢（非敬语）' },
    ],
  },
  {
    title: 'Tech News Discussion',
    titleZh: '科技新闻讨论',
    description: 'Discuss latest technology news in Korean',
    descriptionZh: '用韩语讨论最新科技新闻',
    duration: 350,
    episodeNumber: 6,
    difficulty: 4,
    topics: ['technology'],
    levels: ['advanced'],
    instructor: 'Park 쌤',
    subtitles: [
      { ko: '인공지능이 빠르게 발전하고 있어요', zh: '人工智能正在快速发展', start: 0, end: 4 },
      { ko: '스마트폰 없이 살 수 있어요?', zh: '没有智能手机能生活吗？', start: 4, end: 7.5 },
      { ko: '새로운 앱이 나왔대요', zh: '听说出了新应用', start: 7.5, end: 10.5 },
      { ko: '데이터가 중요해요', zh: '数据很重要', start: 10.5, end: 13 },
      { ko: '보안이 걱정이에요', zh: '安全令人担忧', start: 13, end: 15.5 },
    ],
    words: [
      { word: '인공지능', meaning: 'Artificial Intelligence', meaningZh: '人工智能' },
      { word: '스마트폰', meaning: 'Smartphone', meaningZh: '智能手机' },
      { word: '앱', meaning: 'App', meaningZh: '应用' },
      { word: '데이터', meaning: 'Data', meaningZh: '数据' },
      { word: '보안', meaning: 'Security', meaningZh: '安全' },
    ],
  },
  {
    title: 'At the Hospital',
    titleZh: '在医院',
    description: 'Essential Korean for hospital visits',
    descriptionZh: '去医院就诊的必备韩语',
    duration: 290,
    episodeNumber: 7,
    difficulty: 2,
    topics: ['health'],
    levels: ['intermediate'],
    instructor: 'Lee 강사',
    subtitles: [
      { ko: '아픈 데가 어디예요?', zh: '哪里不舒服？', start: 0, end: 3 },
      { ko: '머리가 아파요', zh: '头疼', start: 3, end: 5 },
      { ko: '열이 나요', zh: '发烧了', start: 5, end: 7 },
      { ko: '약을 드릴게요', zh: '给您开药', start: 7, end: 9.5 },
      { ko: '하루에 세 번 드세요', zh: '一天吃三次', start: 9.5, end: 12.5 },
      { ko: '다음 주에 다시 오세요', zh: '下周再来', start: 12.5, end: 15.5 },
    ],
    words: [
      { word: '아프다', meaning: 'To be sick', meaningZh: '生病' },
      { word: '머리', meaning: 'Head', meaningZh: '头' },
      { word: '열', meaning: 'Fever', meaningZh: '发烧' },
      { word: '약', meaning: 'Medicine', meaningZh: '药' },
      { word: '병원', meaning: 'Hospital', meaningZh: '医院' },
    ],
  },
  {
    title: 'University Life',
    titleZh: '大学生活',
    description: 'Vocabulary and expressions for Korean university life',
    descriptionZh: '韩国大学生活的词汇和表达',
    duration: 310,
    episodeNumber: 8,
    difficulty: 3,
    topics: ['education'],
    levels: ['intermediate'],
    instructor: 'Choi 선생님',
    subtitles: [
      { ko: '수업이 몇 시에 시작해요?', zh: '几点开始上课？', start: 0, end: 3.5 },
      { ko: '도서관에서 공부해요', zh: '在图书馆学习', start: 3.5, end: 6.5 },
      { ko: '과제가 많아요', zh: '作业很多', start: 6.5, end: 9 },
      { ko: '시험이 어려워요', zh: '考试很难', start: 9, end: 11.5 },
      { ko: '동아리에 들어가고 싶어요', zh: '想加入社团', start: 11.5, end: 15 },
      { ko: '방학이 기다려져요', zh: '期待放假', start: 15, end: 17.5 },
    ],
    words: [
      { word: '수업', meaning: 'Class/Lesson', meaningZh: '课程' },
      { word: '도서관', meaning: 'Library', meaningZh: '图书馆' },
      { word: '과제', meaning: 'Assignment', meaningZh: '作业' },
      { word: '시험', meaning: 'Exam', meaningZh: '考试' },
      { word: '동아리', meaning: 'Club', meaningZh: '社团' },
      { word: '방학', meaning: 'Vacation', meaningZh: '放假' },
    ],
  },
  {
    title: 'Online Shopping in Korea',
    titleZh: '韩国网购',
    description: 'How to shop online in Korean',
    descriptionZh: '如何用韩语网购',
    duration: 260,
    episodeNumber: 9,
    difficulty: 2,
    topics: ['shopping'],
    levels: ['intermediate'],
    instructor: 'Kim Teacher',
    subtitles: [
      { ko: '쿠폰이 있어요?', zh: '有优惠券吗？', start: 0, end: 2.5 },
      { ko: '배송은 얼마나 걸려요?', zh: '配送要多久？', start: 2.5, end: 5.5 },
      { ko: '사이즈가 작아요', zh: '尺码偏小', start: 5.5, end: 8 },
      { ko: '교환할 수 있어요?', zh: '可以换货吗？', start: 8, end: 10.5 },
      { ko: '환불 부탁드려요', zh: '请退款', start: 10.5, end: 13 },
      { ko: '리뷰를 쓸게요', zh: '我来写评价', start: 13, end: 15.5 },
    ],
    words: [
      { word: '쿠폰', meaning: 'Coupon', meaningZh: '优惠券' },
      { word: '배송', meaning: 'Delivery', meaningZh: '配送' },
      { word: '사이즈', meaning: 'Size', meaningZh: '尺码' },
      { word: '교환', meaning: 'Exchange', meaningZh: '换货' },
      { word: '환불', meaning: 'Refund', meaningZh: '退款' },
      { word: '리뷰', meaning: 'Review', meaningZh: '评价' },
    ],
  },
  {
    title: 'Korean Business Email',
    titleZh: '韩语商务邮件',
    description: 'Writing professional emails in Korean',
    descriptionZh: '用韩语写专业商务邮件',
    duration: 340,
    episodeNumber: 10,
    difficulty: 4,
    topics: ['business'],
    levels: ['advanced'],
    instructor: 'Lee 강사',
    subtitles: [
      { ko: '안녕하십니까, 김부장입니다', zh: '您好，我是金部长', start: 0, end: 3.5 },
      { ko: '회의 일정을 확인 부탁드립니다', zh: '请确认会议日程', start: 3.5, end: 7 },
      { ko: '자료를 보내드리겠습니다', zh: '我会发送资料', start: 7, end: 10 },
      { ko: '검토해 주시면 감사하겠습니다', zh: '如果能审阅将不胜感激', start: 10, end: 14.5 },
      { ko: '회신 기다리겠습니다', zh: '等待您的回复', start: 14.5, end: 17.5 },
      { ko: '감사합니다', zh: '谢谢', start: 17.5, end: 19.5 },
    ],
    words: [
      { word: '회의', meaning: 'Meeting', meaningZh: '会议' },
      { word: '일정', meaning: 'Schedule', meaningZh: '日程' },
      { word: '자료', meaning: 'Materials', meaningZh: '资料' },
      { word: '검토', meaning: 'Review', meaningZh: '审阅' },
      { word: '회신', meaning: 'Reply', meaningZh: '回复' },
      { word: '부장', meaning: 'Department head', meaningZh: '部长' },
    ],
  },
  {
    title: 'Going to the Market',
    titleZh: '逛市场',
    description: 'Bargaining and shopping at Korean traditional markets',
    descriptionZh: '在韩国传统市场讨价还价和购物',
    duration: 195,
    episodeNumber: 11,
    difficulty: 2,
    topics: ['shopping', 'food'],
    levels: ['beginner'],
    instructor: 'Park 쌤',
    subtitles: [
      { ko: '이거 얼마예요?', zh: '这个多少钱？', start: 0, end: 2.5 },
      { ko: '깎아 주세요', zh: '便宜点吧', start: 2.5, end: 4.5 },
      { ko: '두 개 사면 할인 돼요?', zh: '买两个能打折吗？', start: 4.5, end: 7.5 },
      { ko: '신선해요?', zh: '新鲜吗？', start: 7.5, end: 9.5 },
      { ko: '시식해 볼 수 있어요?', zh: '可以试吃吗？', start: 9.5, end: 12 },
      { ko: '봉투 주세요', zh: '请给我袋子', start: 12, end: 14 },
    ],
    words: [
      { word: '깎아 주세요', meaning: 'Please give a discount', meaningZh: '请便宜点' },
      { word: '할인', meaning: 'Discount', meaningZh: '打折' },
      { word: '신선하다', meaning: 'Fresh', meaningZh: '新鲜' },
      { word: '시식', meaning: 'Taste test', meaningZh: '试吃' },
      { word: '봉투', meaning: 'Bag', meaningZh: '袋子' },
    ],
  },
  {
    title: 'Korean Weather and Seasons',
    titleZh: '韩国天气与季节',
    description: 'Talk about weather and seasons in Korean',
    descriptionZh: '用韩语谈论天气和季节',
    duration: 225,
    episodeNumber: 12,
    difficulty: 1,
    topics: ['daily-life'],
    levels: ['beginner'],
    instructor: 'Choi 선생님',
    subtitles: [
      { ko: '오늘 날씨가 어때요?', zh: '今天天气怎么样？', start: 0, end: 3 },
      { ko: '비가 올 것 같아요', zh: '好像要下雨', start: 3, end: 5.5 },
      { ko: '날씨가 추워졌어요', zh: '天气变冷了', start: 5.5, end: 8.5 },
      { ko: '가을이 좋아요', zh: '喜欢秋天', start: 8.5, end: 10.5 },
      { ko: '여름에는 바다에 가요', zh: '夏天去海边', start: 10.5, end: 13 },
      { ko: '봄에 벚꽃이 펴요', zh: '春天樱花盛开', start: 13, end: 15.5 },
    ],
    words: [
      { word: '날씨', meaning: 'Weather', meaningZh: '天气' },
      { word: '비', meaning: 'Rain', meaningZh: '雨' },
      { word: '추워', meaning: 'Cold', meaningZh: '冷' },
      { word: '가을', meaning: 'Autumn', meaningZh: '秋天' },
      { word: '여름', meaning: 'Summer', meaningZh: '夏天' },
      { word: '봄', meaning: 'Spring', meaningZh: '春天' },
    ],
  },
]

const feedbackData = [
  { type: '功能建议', content: '希望能增加单词复习功能，比如闪卡模式', contact: 'user1@example.com' },
  { type: '问题反馈', content: '视频播放到一半会卡顿，网络不好的时候更明显', contact: 'user2@example.com' },
  { type: '功能建议', content: '建议增加学习笔记功能，可以边看视频边记笔记', contact: '' },
  { type: '问题反馈', content: '单词本的排序功能希望能按难度排序', contact: 'learner@test.com' },
  { type: '其他', content: '内容很好，非常喜欢真实语料的学习方式', contact: '' },
]

async function main() {
  console.log('🌱 Starting seed...\n')

  // 1. Clean existing data
  console.log('🗑️  Cleaning existing data...')
  await prisma.userWordBag.deleteMany()
  await prisma.videoWord.deleteMany()
  await prisma.userVideoProgress.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.subtitleEntry.deleteMany()
  await prisma.subtitleTrack.deleteMany()
  await prisma.videoCategory.deleteMany()
  await prisma.video.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.siteSetting.deleteMany()
  console.log('✅ Cleaned\n')

  // 2. Create users
  console.log('👤 Creating users...')
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@shadowkorean.com',
      passwordHash,
      role: Role.ADMIN,
    },
  })

  const user1 = await prisma.user.create({
    data: {
      email: 'user@test.com',
      passwordHash,
      role: Role.USER,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'learner@test.com',
      passwordHash,
      role: Role.USER,
    },
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'student@test.com',
      passwordHash,
      role: Role.USER,
    },
  })
  console.log(`✅ Created ${4} users (admin@shadowkorean.com / password123)\n`)

  // 3. Create categories
  console.log('📂 Creating categories...')
  const createdLevels = await Promise.all(
    levelCategories.map((c) =>
      prisma.category.create({ data: { ...c, type: CategoryType.LEVEL } })
    )
  )
  const createdTopics = await Promise.all(
    topicCategories.map((c) =>
      prisma.category.create({ data: { ...c, type: CategoryType.TOPIC } })
    )
  )
  const allCategories = [...createdLevels, ...createdTopics]
  const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]))
  console.log(`✅ Created ${allCategories.length} categories\n`)

  // 4. Create videos with subtitles, words, and categories
  console.log('🎬 Creating videos...')
  const createdVideos = []
  for (const v of videoData) {
    const video = await prisma.video.create({
      data: {
        title: v.title,
        titleZh: v.titleZh,
        description: v.description,
        descriptionZh: v.descriptionZh,
        coverUrl: `https://picsum.photos/seed/${v.episodeNumber}/640/360`,
        videoUrl: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`,
        duration: v.duration,
        episodeNumber: v.episodeNumber,
        difficulty: v.difficulty,
        instructor: v.instructor,
        published: true,
        visitorAccessible: v.visitorAccessible || false,
      },
    })
    createdVideos.push(video)

    // Create KO subtitle track
    const koTrack = await prisma.subtitleTrack.create({
      data: {
        videoId: video.id,
        lang: SubtitleLang.KO,
      },
    })
    // Create ZH subtitle track
    const zhTrack = await prisma.subtitleTrack.create({
      data: {
        videoId: video.id,
        lang: SubtitleLang.ZH,
      },
    })

    // Create subtitle entries
    for (let i = 0; i < v.subtitles.length; i++) {
      const sub = v.subtitles[i]
      await prisma.subtitleEntry.create({
        data: {
          trackId: koTrack.id,
          index: i,
          startTime: sub.start,
          endTime: sub.end,
          text: sub.ko,
        },
      })
      await prisma.subtitleEntry.create({
        data: {
          trackId: zhTrack.id,
          index: i,
          startTime: sub.start,
          endTime: sub.end,
          text: sub.zh,
        },
      })
    }

    // Create words
    for (const w of v.words) {
      await prisma.videoWord.create({
        data: {
          videoId: video.id,
          word: w.word,
          meaning: w.meaning,
          meaningZh: w.meaningZh,
        },
      })
    }

    // Link categories
    const levelSlug = v.levels?.[0]
    if (levelSlug && categoryMap.has(levelSlug)) {
      await prisma.videoCategory.create({
        data: { videoId: video.id, categoryId: categoryMap.get(levelSlug)! },
      })
    }
    for (const topicSlug of v.topics || []) {
      if (categoryMap.has(topicSlug)) {
        await prisma.videoCategory.create({
          data: { videoId: video.id, categoryId: categoryMap.get(topicSlug)! },
        })
      }
    }

    console.log(`  ✅ Ep${v.episodeNumber}: ${v.titleZh} (${v.subtitles.length} subtitles, ${v.words.length} words)`)
  }
  console.log(`\n✅ Created ${createdVideos.length} videos with subtitles and words\n`)

  // 5. Create favorites
  console.log('❤️  Creating favorites...')
  const favPairs = [
    [user1.id, createdVideos[0].id],
    [user1.id, createdVideos[1].id],
    [user1.id, createdVideos[4].id],
    [user2.id, createdVideos[0].id],
    [user2.id, createdVideos[3].id],
    [user2.id, createdVideos[5].id],
    [user2.id, createdVideos[7].id],
    [user3.id, createdVideos[2].id],
    [user3.id, createdVideos[6].id],
    [admin.id, createdVideos[0].id],
  ]
  for (const [userId, videoId] of favPairs) {
    await prisma.favorite.create({ data: { userId, videoId } })
  }
  console.log(`✅ Created ${favPairs.length} favorites\n`)

  // 6. Create user video progress
  console.log('📊 Creating user progress...')
  const progressData = [
    { userId: user1.id, videoId: createdVideos[0].id, completed: true, progress: 100 },
    { userId: user1.id, videoId: createdVideos[1].id, completed: true, progress: 100 },
    { userId: user1.id, videoId: createdVideos[2].id, completed: false, progress: 45 },
    { userId: user1.id, videoId: createdVideos[3].id, completed: false, progress: 20 },
    { userId: user2.id, videoId: createdVideos[0].id, completed: true, progress: 100 },
    { userId: user2.id, videoId: createdVideos[3].id, completed: false, progress: 60 },
    { userId: user2.id, videoId: createdVideos[5].id, completed: false, progress: 30 },
    { userId: user2.id, videoId: createdVideos[7].id, completed: true, progress: 100 },
    { userId: user2.id, videoId: createdVideos[9].id, completed: false, progress: 15 },
    { userId: user3.id, videoId: createdVideos[0].id, completed: true, progress: 100 },
    { userId: user3.id, videoId: createdVideos[1].id, completed: true, progress: 100 },
    { userId: user3.id, videoId: createdVideos[2].id, completed: true, progress: 100 },
    { userId: user3.id, videoId: createdVideos[4].id, completed: false, progress: 50 },
    { userId: user3.id, videoId: createdVideos[6].id, completed: false, progress: 70 },
  ]
  for (const p of progressData) {
    await prisma.userVideoProgress.create({ data: p })
  }
  console.log(`✅ Created ${progressData.length} progress records\n`)

  // 7. Create word bag entries
  console.log('📝 Creating word bags...')
  const allWords = await prisma.videoWord.findMany()
  const wordBagPairs: [string, string][] = [
    [user1.id, allWords[0].id],
    [user1.id, allWords[1].id],
    [user1.id, allWords[5].id],
    [user1.id, allWords[10].id],
    [user1.id, allWords[15].id],
    [user2.id, allWords[0].id],
    [user2.id, allWords[3].id],
    [user2.id, allWords[8].id],
    [user2.id, allWords[12].id],
    [user2.id, allWords[20].id],
    [user2.id, allWords[25].id],
    [user2.id, allWords[30].id],
    [user3.id, allWords[2].id],
    [user3.id, allWords[7].id],
    [user3.id, allWords[14].id],
    [user3.id, allWords[18].id],
    [user3.id, allWords[22].id],
    [admin.id, allWords[0].id],
    [admin.id, allWords[4].id],
  ]
  for (const [userId, wordId] of wordBagPairs) {
    await prisma.userWordBag.create({ data: { userId, wordId } })
  }
  console.log(`✅ Created ${wordBagPairs.length} word bag entries\n`)

  // 8. Create feedback
  console.log('💬 Creating feedback...')
  for (const f of feedbackData) {
    await prisma.feedback.create({ data: f })
  }
  console.log(`✅ Created ${feedbackData.length} feedback entries\n`)

  // 9. Create site settings
  console.log('⚙️  Creating site settings...')
  await prisma.siteSetting.create({
    data: { key: 'wechat-qrcode', value: '/qr-wechat.png' },
  })
  console.log('✅ Created site settings\n')

  console.log('🎉 Seed completed successfully!')
  console.log('\n📋 Test accounts:')
  console.log('   Admin: admin@shadowkorean.com / password123')
  console.log('   User:  user@test.com / password123')
  console.log('   User:  learner@test.com / password123')
  console.log('   User:  student@test.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
