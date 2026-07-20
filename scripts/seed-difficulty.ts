import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Seeding mock difficulty (1-5 stars) for videos without difficulty set...')

  const videos = await prisma.video.findMany({
    where: { difficulty: null },
  })

  if (videos.length === 0) {
    console.log('All videos already have difficulty set. Nothing to do.')
    return
  }

  for (const video of videos) {
    // Assign a random difficulty between 1 and 5
    const stars = Math.floor(Math.random() * 5) + 1
    await prisma.video.update({
      where: { id: video.id },
      data: { difficulty: stars },
    })
    console.log(`  ✓ ${video.titleZh} → ${stars}星`)
  }

  console.log(`Done! Updated ${videos.length} videos.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
