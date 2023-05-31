import { fetch, Headers } from "cross-fetch";
import { createHmac } from "crypto";

export class MeowvieError extends Error {}

export class Base {
	#secret: string;
	#url: URL;
	constructor(secret: string, url: string, base: string) {
		this.#secret = secret;
		this.#url = new URL(url);
		this.#url = new URL(base, this.#url);
	}

	protected sign(data: string): string {
		return createHmac("sha256", this.#secret).update(data).digest("hex");
	}

	protected async fetch(path: string, body?: unknown, method = "GET") {
		const url = new URL(path, this.#url);
		const headers = new Headers();
		headers.set("user-agent", "meowvie-collector/1.0.0");
		const init: RequestInit = {
			method,
			headers,
		};
		if (body) {
			if (method === "GET") {
				for (const [k, v] of Object.entries(body)) {
					url.searchParams.set(k, v);
				}
			} else {
				init.body = JSON.stringify(body);
				headers.set("content-type", "application/json");
			}
		}
		const res = await fetch(url.href, init);
		if (!res.ok) {
			const text = await res.text();
			throw new Error(
				"non 2xx status code received, status code: " + res.status,
			);
		}
		return res.json();
	}
}

export interface Movie {
	title: string;
	pageUrl: string;
	thumbnailUrl: string;
	provider: string;
	signature?: string;

	downloadUrl: DownloadUrl[];
}

export interface DownloadUrl {
	url: string;
	resolution: string;
	server: string;
	size: string
}

export class MovieClient extends Base {
	create(movie: Movie) {
		movie = {
			...movie,
			signature: this.sign(movie.title),
		};
		return this.fetch("create/", movie, "POST");
	}
}

export class Meowvie {
	movie: MovieClient;
	constructor(secret: string, url: string) {
		this.movie = new MovieClient(secret, url, "/movie/");
	}
}
