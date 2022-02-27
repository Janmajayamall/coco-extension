export const constants = {
	COLORS: { PRIMARY: "#FFFFFF" },
	REQUEST_TYPES: {
		ADD_URLS: "ADD_URLS",
		DOM_LINKS: "DOM_LINKS",
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
export function filterUrls(urls) {
	return urls;
}

const defaultHeaders = {
	"Content-Type": "application/json",
};

const baseURL = "http://localhost:8000/";

// queries URLs info from the backend
export async function getUrlsInfo(urls) {
	try {
		let res = await fetch(baseURL + "post/findPosts", {
			method: "POST", // *GET, POST, PUT, DELETE, etc.
			mode: "cors", // no-cors, *cors, same-origin
			headers: defaultHeaders,
			body: JSON.stringify({
				urls,
			}),
		});
		res = await res.json();
		return res.response;
	} catch (e) {}
}

async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

// finds all links in DOM
export async function findAllDOMLinks() {
	var links = document.getElementsByTagName("a");
	let urls = [];
	for (var i = 0; i < links.length; i++) {
		urls.push(links[i].href);
	}

	await chrome.runtime.sendMessage({
		// constants.REQUEST_TYPES.ADD_URLS fails
		// for some reason
		type: "ADD_URLS",
		urls,
	});
}
