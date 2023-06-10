import { type DownloadUrl, Meowvie } from "@meowvie-collector/client";
import { JSDOMCrawler, ProxyConfiguration } from "crawlee";

export interface Options {
	meowvie: {
		secret: string;
		endpoint: string;
	};
	domain: string;
	proxies?: string[];
}

export function createCrawler({ meowvie: m, domain, proxies }: Options) {
	const proxyConfiguration = new ProxyConfiguration({
		proxyUrls: proxies,
	});
	const meowvie = new Meowvie(m.secret, m.endpoint);
	const crawler = new JSDOMCrawler({ proxyConfiguration });

	crawler.router.addDefaultHandler(
		async ({ request, enqueueLinks, log, window: { document } }) => {
			log.info("crawling", {
				url: request.url,
			});

			const titleEl = document.querySelector(
				"div.bixbox > div.releases > h3",
			);
			const videocontainer = document.querySelector(
				".video-content #embed_holder",
			);
			scrape:
			if (titleEl && videocontainer) {
				const title = titleEl.textContent!;
				if (title === "Komentar") {
					break scrape;
				}
				const thumbnailUrl =
					document.querySelector(`meta[property="og:image"]`)
						?.getAttribute("content") || request.url;
				const pageUrl = request.url;
				const downloadUrl = [] as DownloadUrl[];
				const bixbox = titleEl.parentElement?.parentElement!;
				for (const soraddlx of bixbox.querySelectorAll(".soraddlx")) {
					const format = soraddlx.querySelector("h3")?.textContent
						|| "";
					for (
						const soraurlx of soraddlx.querySelectorAll(".soraurlx")
					) {
						const resolution =
							soraurlx.querySelector("strong")?.textContent || "";
						for (const a of soraurlx.querySelectorAll("a")) {
							const url = a.href;
							const server = a.textContent || "unknwon";
							downloadUrl.push({
								resolution: `${format} ${resolution}`.trim(),
								url,
								server,
								size: "",
							});
						}
					}
				}
				if (!downloadUrl.length) {
					log.error("empty downloadurl", { request });
				} else {
					meowvie.movie.create({
						title,
						downloadUrl,
						pageUrl,
						provider: "oploverz",
						thumbnailUrl,
					}).then(m => {
						log.info("stored into meowvie", {
							...m,
							downloadUrl: downloadUrl.length,
						});
					}).catch(e => {
						log.error("error while storing into meowive", { e });
					});
				}
			}

			await enqueueLinks();
		},
	);

	return {
		crawler,
		run() {
			return crawler.run([
				`https://${domain}/dr-stone-season-3-episode-10-subtitle-indonesia/`,
			]);
		},
	};
}
