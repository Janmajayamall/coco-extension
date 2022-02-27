export const constants = {
	COLORS: { PRIMARY: "#FFFFFF" },
	REQUEST_TYPES: {
		URL_ADD: "URL_ADD",
	},
	STORAGE_KEYS: {
		URLS: "URLS",
	},
};

// TODO
// Filter for links that
// should not be checked for.
// Ex, the ones beginning with news.hacker
// or Google.com and other such pattern
export function urlFilter(url) {
	return true;
}

const defaultHeaders = {
	"Content-Type": "application/json",
};

const baseURL = "http://65.108.59.231:8080/";

// queries URLs info from the backend
export async function getUrlsInfo(urls) {
	const res = await fetch(baseURL, {
		method: "POST", // *GET, POST, PUT, DELETE, etc.
		mode: "cors", // no-cors, *cors, same-origin
		headers: defaultHeaders,
		body: JSON.stringify({
			filter: {
				url: [urls],
			},
			sort: {
				createdAt: -1,
			},
		}),
	});
	return res;
}
