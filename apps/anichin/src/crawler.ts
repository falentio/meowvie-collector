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
	const crawler = new JSDOMCrawler({
		autoscaledPoolOptions: {
			minConcurrency: +(process.env.CONCURRENCY || "30"),
		}
	});
	crawler.router.addDefaultHandler(
		async ({ request, enqueueLinks, log, window: { document } }) => {
			log.info("crawling", {
				url: request.url,
			});

			const downloadUrl = [] as DownloadUrl[]
			for (const soraurlx of document.querySelectorAll("div.soraurlx")) {
				const resolution = soraurlx.querySelector("strong")?.textContent || ""
				for (const a of soraurlx.querySelectorAll("a")) {
					const url = a.href
					const server = a.textContent || ""
					downloadUrl.push({
						server,
						resolution,
						url,
						size: ""
					})
				}
			}
			if (downloadUrl.length) {
				const thumbnailUrl = document.querySelector<HTMLImageElement>("img.ts-post-image")?.src || request.url
				const pageUrl = request.url
				const title = document.querySelector(".title-section .entry-title")?.textContent
					|| document.querySelector("head > title")?.textContent
					|| document.querySelector("div.listupd > div > div > div.inf > h2 > a")?.textContent
					|| request.url
				const provider = request.url.includes("kazefuri") ? "kazefuri" : "anichin"

				await meowvie.movie.create({
					title,
					thumbnailUrl,
					pageUrl,
					downloadUrl,
					provider,
				}).then(m => {
					log.info("stored into meowvie", {
						...m,
						downloadUrl: downloadUrl.length,
					});
				})
			}

			await enqueueLinks();
		},
	);


	return {
		crawler,
		run() {
			return crawler.run([
				{ url: `https://anichin.art/`, uniqueKey: new Date().toString() + "anichin" },
				{ url: `https://kazefuri.net/`, uniqueKey: new Date().toString() + "kazefuri" },
			]);
		},
	};
}
