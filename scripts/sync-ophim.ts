import 'dotenv/config'
import { syncMoviesFromOPhim } from '../src/lib/server/ophim-sync'

async function main() {
  const maxPagesPerType = Number(process.env.CRAWL_MAX_PAGES_PER_TYPE || 10)
  const maxDetailFetch = Number(process.env.CRAWL_MAX_DETAIL_FETCH || 3000)
  console.log('Starting sync...', { maxPagesPerType, maxDetailFetch })

  const summary = await syncMoviesFromOPhim({ maxPagesPerType, maxDetailFetch })
  console.log('Sync completed:', summary)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
