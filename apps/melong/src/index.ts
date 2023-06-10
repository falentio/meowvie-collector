import { Actor } from "apify"
import { createCrawler } from "./crawler"
import { Dictionary } from "crawlee"

await Actor.init()
const input = await Actor.getInput() as Dictionary
const { run } = createCrawler({
    meowvie: {
        endpoint: input.meowvieEndpoint || process.env.MEOWVIE_ENDPOINT || "http://localhost:8080",
        secret: input.meowvieSecret || process.env.MEOWVIE_SECRET || "secret",
    },
    proxies: [],
    domain: "melongmovie.site"
})

await run()
await Actor.exit()