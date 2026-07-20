import { prisma } from '../src/lib/prisma'

const mockTopicTags = [
  { name: 'travel', nameZh: '出行', slug: 'travel' },
  { name: 'medical', nameZh: '医疗', slug: 'medical' },
  { name: 'film-tv', nameZh: '影视', slug: 'film-tv' },
  { name: 'business', nameZh: '商务', slug: 'business' },
  { name: 'foreign-trade', nameZh: '外贸', slug: 'foreign-trade' },
  { name: 'catering', nameZh: '餐饮', slug: 'catering' },
  { name: 'technology', nameZh: '科技', slug: 'technology' },
  { name: 'interview', nameZh: '访谈', slug: 'interview' },
  { name: 'speech', nameZh: '演讲', slug: 'speech' },
  { name: 'trip', nameZh: '旅行', slug: 'trip' },
  { name: 'emotion', nameZh: '情感', slug: 'emotion' },
  { name: 'daily', nameZh: '日常', slug: 'daily' },
  { name: 'education', nameZh: '教育', slug: 'education' },
  { name: 'food', nameZh: '美食', slug: 'food' },
  { name: 'culture', nameZh: '文化', slug: 'culture' },
  { name: 'sports', nameZh: '运动', slug: 'sports' },
  { name: 'music', nameZh: '音乐', slug: 'music' },
]

async function main() {
  console.log('Seeding mock topic tags...')

  let sortOrder = 0
  for (const tag of mockTopicTags) {
    await prisma.category.upsert({
      where: { slug: tag.slug },
      update: { nameZh: tag.nameZh, name: tag.name, type: 'TOPIC', sortOrder },
      create: {
        name: tag.name,
        nameZh: tag.nameZh,
        slug: tag.slug,
        type: 'TOPIC',
        sortOrder,
      },
    })
    sortOrder++
    console.log(`  ✓ ${tag.nameZh} (${tag.slug})`)
  }

  console.log('Done!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
