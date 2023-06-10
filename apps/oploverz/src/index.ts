import { Actor } from "apify";
import type { Dictionary } from "crawlee";
import { createCrawler } from "./crawler";

await Actor.init();
const input = await Actor.getInput() as Dictionary;
const { run } = createCrawler({
	meowvie: {
		endpoint: input?.meowvieEndpoint
			|| process.env.MEOWVIE_ENDPOINT
			|| "http://localhost:8080",
		secret: input?.meowvieSecret || process.env.MEOWVIE_SECRET || "secret",
	},
	domain: process.env.DOMAIN || "oploverz.best",
});

await run();
await Actor.exit();
