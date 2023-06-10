import { type DownloadUrl, Meowvie } from "@meowvie-collector/client";
import { JSDOMCrawler } from "crawlee";

export interface Options {
	meowvie: {
		secret: string;
		endpoint: string;
	};
	domain: string;
}

export function createCrawler({ meowvie: m, domain }: Options) {
	const meowvie = new Meowvie(m.secret, m.endpoint);
	const crawler = new JSDOMCrawler({});

	crawler.router.addDefaultHandler(
		async ({ request, enqueueLinks, log, window: { document } }) => {
			log.info("crawling", {
				url: request.url,
			});

			const dlbox = document.querySelector("div.dlbodz > div#dl");
			if (dlbox) {
				const thumbnailUrl =
					document.querySelector("div.post-thumb > img")
						?.getAttribute("src") || request.url;
				const els = dlbox.querySelectorAll(".smokeddlrh");
				const promises = Array.from(els).map(async c => {
					const title = c.querySelector(":first-child")?.textContent
						|| "unknwon";
					const downloadUrl = [] as DownloadUrl[];
					for (const div of c.querySelectorAll(".smokeurlrh")) {
						if (!div.querySelector("strong")) {
							continue;
						}
						const resolution =
							div.querySelector("strong")?.textContent
							|| "unknown";
						for (const a of div.querySelectorAll("a")) {
							const url = a.href;
							const server = a.textContent || "unknwon";
							downloadUrl.push({
								resolution,
								server,
								size: "",
								url,
							});
						}
					}
					await meowvie.movie.create({
						downloadUrl,
						pageUrl: request.url,
						provider: "kusonime",
						title,
						thumbnailUrl,
					}).then(m => {
						log.info("stored into meowvie", {
							...m,
							downloadUrl: downloadUrl.length,
						});
					});
				});
				await Promise.all(promises);
			}

			await enqueueLinks();
		},
	);

	return {
		crawler,
		run() {
			return crawler.run([
				`https://${domain}/boruto-batch-subtitle-indonesia-5/`,
			]);
		},
	};
}
