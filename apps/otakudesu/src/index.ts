import { Actor } from "apify"
import { createCrawler } from "./crawler"
import type { Dictionary } from "crawlee"

await Actor.init()
const { run } = createCrawler({
    meowvie: {
        secret: process.env.MEOWVIE_SECRET || "",
        endpoint: process.env.MEOWVIE_ENDPOINT || "",
    },
    domain: process.env.DOMAIN || "otakudesu.lol"
})

await run()
await Actor.exit()