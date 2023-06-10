import { type DownloadUrl, Meowvie } from "@meowvie-collector/client";
import { JSDOMCrawler } from "crawlee";

export interface Options {
	meowvie: {
		secret: string;
		endpoint: string;
	};
	domain: string;
}

export function createCrawler({ meowvie: m, domain, proxies }: Options) {
	const meowvie = new Meowvie(m.secret, m.endpoint);
	const crawler = new JSDOMCrawler({  });

	crawler.router.addDefaultHandler(
		async ({ request, enqueueLinks, log, window: { document } }) => {
			log.info("crawling", {
				url: request.url,
			});

			const titleEl = document.querySelector(
				".lm > h1.entry-title",
			);
			if (titleEl) {
				const title = titleEl.textContent!;
				const thumbnailUrl =
					document.querySelector(`meta[property="og:image"]`)
						?.getAttribute("content") || request.url;
				const pageUrl = request.url;
				const downloadUrl = [] as DownloadUrl[];
				for (const div of document.querySelectorAll("div.pencenter > div.download-eps")) {
					const format = div.querySelector("p b")?.textContent || ""
					for (const li of div.querySelectorAll("ul li")) {
						const resolution = li.querySelector("strong")?.textContent || ""
						for (const a of li.querySelectorAll("a")) {
							const url = a.href
							const server = a.textContent || ""
							downloadUrl.push({
								resolution: `${resolution} ${format}`,
								server,
								size: "",
								url,
							})
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
				`https://${domain}/tonikaku-kawaii-season-2-episode-10/`,
			]);
		},
	};
}
