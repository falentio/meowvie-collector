import { JSDOMCrawler } from "crawlee"
import { Meowvie, type DownloadUrl } from "@meowvie-collector/client"

export interface Options {
    meowvie: {
        secret: string
        endpoint: string
    }
    domain: string
}

export function createCrawler({ meowvie: m, domain }: Options) {
    const meowvie = new Meowvie(m.secret, m.endpoint)
    const crawler = new JSDOMCrawler({
        maxConcurrency: 1,
    })
    
    crawler.router.addDefaultHandler(async ({ window, request, log, enqueueLinks }) => {
        const { document } = window
        log.info("crawling", {
            url: request.url,
        })
    
        const downloadEl = document.querySelector("div.download > h4")
        if (downloadEl) {
            const title = document.querySelector("h1.posttl")?.textContent ||
                document.querySelector("title")?.textContent || 
                request.url
            const thumbnailUrl = document.querySelector("div.cukder > img")?.getAttribute("src") || ""
            const pageUrl = request.url
            const downloadUrl = [] as DownloadUrl[]
            for (const li of document.querySelectorAll("div.download > ul > li")) {
                const resolution = (li.querySelector("strong")?.textContent || "unknown").trim()
                const size = (li.querySelector("i")?.textContent || "unknown").trim()
                for (const a of li.querySelectorAll("a")) {
                    const server = (a.textContent || "unknown").trim()
                    const url = a.href
                    downloadUrl.push({
                        resolution,
                        server,
                        size,
                        url,
                    })
                }
            }
            const movie = await meowvie.movie.create({
                title,
                pageUrl,
                thumbnailUrl,
                provider: "otakudesu",
                downloadUrl,
            })
            log.info("stored into meowvie", {
                ...movie,
                downloadUrl: undefined,
            })
        }
    
        await enqueueLinks({
            strategy: "same-hostname",
        })
    })
    
    return {
        crawler,
        run() {
            return crawler.run([
                `https://${domain}/episode/ics-episode-9-sub-indo/`,
            ])
        }
    }
}