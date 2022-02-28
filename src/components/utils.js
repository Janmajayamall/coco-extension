export const constants = {
	COLORS: { PRIMARY: "#FFFFFF" },
	REQUEST_TYPES: {
		ADD_URLS: "ADD_URLS",
		DOM_LINKS: "DOM_LINKS",
	},
	STORAGE_KEYS: {
		URLS: "URLS",
	},
	QUERY_STATUS: {
		FOUND: "FOUND",
		NOT_FOUND: "NOT_FOUND",
	},
};

export const webUrl = "http://65.108.59.231:3000";

// Filter for links that
// should not be checked.
// Ex, the ones containing with news.hacker
// or Google.com and other such pattern
export function filterUrls(urls) {
	return urls.filter((val) => {
		// check that val is valid url
		let reg =
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
		if (!reg.test(val)) {
			return false;
		}

		// check URL isn't subdomain of google
		reg = /\bgoogle\.com\b/;
		if (reg.test(val)) {
			return false;
		}
		return true;
	});
}

const defaultHeaders = {
	"Content-Type": "application/json",
};

const baseURL = "http://65.108.59.231:8000";

// queries URLs info from the backend
export async function getUrlsInfo(urls) {
	try {
		let res = await fetch(baseURL + "/post/findUrlsInfo", {
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
	console.log(urls, "BRO");
	await chrome.runtime.sendMessage({
		// constants.REQUEST_TYPES.ADD_URLS fails
		// for some reason
		type: "ADD_URLS",
		urls,
	});
	console.log(urls, "BRO AFTER");
}
