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
	URL_DISPLAY_LENGTH: 100,
	MARKET_STATUS: {
		YES: "YES",
		NO: "NOs",
	},
};

export const webUrl = "http://65.108.59.231:3000";

export function formatUrlForDisplay(url) {
	if (url.length > constants.URL_DISPLAY_LENGTH) {
		return url.substring(0, constants.URL_DISPLAY_LENGTH - 3) + "...";
	}
	return url;
}

export function formatOnChainData(onChainData) {
	if (onChainData == undefined) {
		return {};
	}

	if (onChainData.existsOnChain == true) {
		return onChainData;
	}
	return {
		...onChainData,
		outcome: 1,
	};
}

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
		reg =
			/\b(google\.com|news\.ycombinator\.com|youtube\.com|googleadservices\.com)\b/;
		if (reg.test(val)) {
			return false;
		}

		// Filter out all links with more than 100 characters.
		// Links having more than 100 chars are in most cases
		// used for ads or something irrelevant purpose
		if (val.length > 200) {
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
	console.log(" Yo I rsioawjdaoisjoceived :P");
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

// starts observing DOM Link changes
export async function observeLinkChanges() {
	// select the target node
	var target = document.body;
	console.log(" Yo I received :P");
	// create an observer instance
	var observer = new MutationObserver(async function (mutations) {
		let arr = [];
		console.log("Mutations triggered");
		mutations.forEach(function (mutation) {
			arr.push(mutation.target.href);
		});

		await chrome.runtime.sendMessage({
			// constants.REQUEST_TYPES.ADD_URLS fails
			// for some reason
			type: "ADD_URLS",
			urls: arr,
		});
		console.log("Mutations triggered finished");
	});

	// configuration of the observer:
	var config = { attributes: true, attributeFilter: ["href"], subtree: true };

	// pass in the target node, as well as the observer options
	observer.observe(target, config);

	// later, you can stop observing
	// observer.disconnect();
}
