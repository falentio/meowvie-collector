import { JSDOMCrawler, NonRetryableError, ProxyConfiguration, RetryRequestError } from "crawlee"
import { Meowvie } from "@meowvie-collector/client"
import { DownloadUrl } from "@meowvie-collector/client"
import { Movie } from "@meowvie-collector/client"
export interface CreateCrawlerOptions {
    meowvie: {
        endpoint: string
        secret: string
    }
    proxies: string[]
}

export const createCrawler = (opts: CreateCrawlerOptions) => {
    // const proxyConfiguration = new ProxyConfiguration({
    //     proxyUrls: opts.proxies,
    // })
    const meowvie = new Meowvie(opts.meowvie.secret, opts.meowvie.endpoint)
    const crawler = new JSDOMCrawler({
        maxConcurrency: 5,
        // proxyConfiguration,
    })

    crawler.router.addDefaultHandler(async ({ enqueueLinks, request, log, window  }) => {
        log.info("crawling", {
            url: request.url,
            meowvie: opts.meowvie.endpoint,
        })
        const { document } = window

        if (document.querySelector(".fab.fa-youtube")) {
            const movie = [v1].map(fn => fn()).filter(Boolean)[0]
            if (!movie) {
                log.error("page not extractable", {
                    url: request.url,
                })
                throw NonRetryableError
            }
            await meowvie.movie.create(movie).then(m => {
                log.info("stored into meowvie", {
                    ...m,
                    downloadUrl: undefined,
                })
            })
        }
        await enqueueLinks()

        function v1(): Movie | void {
            const liEls = window.document.querySelectorAll("div.dzdesu ul li")
            const downloadUrl = [] as DownloadUrl[]
            for (const li of liEls) {
                if (li.querySelector(":first-child")?.tagName !== "STRONG") {
                    continue
                }
                const resolution = li.querySelector("strong:first-child")?.textContent
                let size = li.querySelector("strong:last-child")?.textContent
                if (size === resolution) {
                    size = null
                }
                for (const a of li.querySelectorAll("a")) {
                    const url = a.href || ""
                    const server = a.textContent || ""
                    downloadUrl.push({
                        size: size || "",
                        url,
                        resolution: resolution || "",
                        server,
                    })
                }
            }
            if (!downloadUrl.length) {
                return
            }
            const title = document.querySelector("h1")?.textContent || 
                document.querySelector("title")?.textContent ||
                request.url
            const thumbnailUrl = document.querySelector("img.entry-image.wp-post-image")?.getAttribute("src")
            return {
                title,
                pageUrl: request.url,
                thumbnailUrl: thumbnailUrl || request.url,
                downloadUrl,
                provider: "melong"
            } as Movie
        }
    })

    return {
        crawler,
        run() {
            return crawler.run(["https://melongmovie.site/reality-2023/", "https://melongmovie.site"])
        }
    }
}