export const constants = {
	COLORS: { PRIMARY: "#FFFFFF" },
	REQUEST_TYPES: {
		POPUP_ADD_URLS: "POPUP_ADD_URLS",
		DOM_LINKS: "DOM_LINKS",
		GOOGLE_DOM_INFO: "GOOGLE_DOM_INFO",
		POPUP_GOOGLE_URLS: "POPUP_GOOGLE_URLS",
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
	URL_TYPES: {
		NONE: "NONE",
		GOOGLE_SEARCH: "GOOGLE_SEARCH",
		TWITTER: "TWITTER",
		RANDOM: "RANDOM",
	},
	// Char count for display
	CHAR_COUNTS: {
		URL_TITLE: 110,
		URL_DESCRIPTION: 200,
		URL: 100,
	},
};

// prod
// export const webUrl = "http://extension.cocoverse.club";
// export const baseURL = "https://extension.backend.cocoverse.club";

// dev
export const webUrl = "http://65.108.59.231:3000";
export const baseURL = "http://localhost:8000";

export function findUrlName(url) {
	let tmp = document.createElement("a");
	tmp.setAttribute("href", url);
	return tmp.hostname;
}

export function truncateStrToLength(str, length) {
	if (str == undefined) {
		return;
	}

	if (str.length <= length) {
		return str;
	}
	return str.substring(0, length - 3) + "...";
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

export function findUrlType(url) {
	// google search
	if (/https:\/\/(www.)?google.co(m)?\/search/.test(url)) {
		return constants.URL_TYPES.GOOGLE_SEARCH;
	}

	// twitter
	if (/https:\/\/(www.)?twitter.co(m)?/.test(url)) {
		return constants.URL_TYPES.TWITTER;
	}

	return constants.URL_TYPES.RANDOM;
}

// Filter for links that
// should not be checked.
// ex. chrome://
export function filterUrls(urls) {
	return urls.filter((val) => {
		// check chrome browser urls
		if (/chrome.*:\/\/*/.test(val)) {
			return false;
		}

		return true;
	});
}

const defaultHeaders = {
	"Content-Type": "application/json",
};

// Priority for metadata is given in following order:
// Twitter -> Open Graph -> Normal
export function formatMetadata(info) {
	let final = {};

	let metadata = info.metadata;
	if (metadata.twitterTitle != undefined) {
		final.title = metadata.twitterTitle;
	} else if (metadata.ogTitle != undefined) {
		final.title = metadata.ogTitle;
	}

	if (metadata.twitterDescription != undefined) {
		final.description = metadata.twitterDescription;
	} else if (metadata.ogDescription != undefined) {
		final.description = metadata.ogDescription;
	}

	if (metadata.twitterImage != undefined) {
		final.imageUrl = metadata.twitterImage.url;
	} else if (metadata.ogImage != undefined) {
		final.imageUrl = metadata.ogImage.url;
	}

	final.url = info.url;

	return final;
}

// queries URLs info from the backend
export async function getUrlsInfo(urls) {
	if (urls.length == 0) {
		return;
	}

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

	// create an observer instance
	var observer = new MutationObserver(async function (mutations) {
		let arr = [];

		mutations.forEach(function (mutation) {
			arr.push(mutation.target.href);
		});

		await chrome.runtime.sendMessage({
			// constants.REQUEST_TYPES.ADD_URLS fails
			// for some reason
			type: "ADD_URLS",
			urls: arr,
		});
	});

	// configuration of the observer:
	var config = { attributes: true, attributeFilter: ["href"], subtree: true };

	// pass in the target node, as well as the observer options
	observer.observe(target, config);

	// later, you can stop observing
	// observer.disconnect();
}

// execute google search script for pop up
export async function popUpGoogleSearchScript() {
	conole.log(urlsInfo, " popUpGoogleSearchScript 1");
	const urlsInfo = findDataFromGoogleSearch();
	conole.log(urlsInfo, " popUpGoogleSearchScript");
	await chrome.runtime.sendMessage({
		// constants.REQUEST_TYPES.ADD_URLS fails
		// for some reason
		type: "GOOGLE_DOM_INFO",
		info: urlsInfo,
	});
}

// find links from google search
export function findDataFromGoogleSearch() {
	let res = [];

	// find all normal search info
	var divs = document.getElementsByClassName("yuRUbf");
	for (var i = 0; i < divs.length; i++) {
		// get link and title
		const url = divs[i].getElementsByTagName("a")[0].href;
		const googleTitle = divs[i].getElementsByClassName(
			"LC20lb MBeuO DKV0Md"
		)[0].innerHTML;

		res.push({
			url,
			clientMetadata: {
				tabType: "GOOGLE_SEARCH",
				googleTitle,
				googleNormal: true,
				googleNews: false,
			},
		});
	}

	// find all google news info
	var newsDivs = document.getElementsByClassName("ftSUBd");
	for (var i = 0; i < newsDivs.length; i++) {
		// get link and title
		const url = newsDivs[i].getElementsByTagName("a")[0].href;
		const googleTitle = newsDivs[i].getElementsByClassName(
			"mCBkyc y355M JQe2Ld nDgy9d"
		)[0].innerHTML;

		res.push({
			url,
			clientMetadata: {
				tabType: "GOOGLE_SEARCH",
				googleTitle,
				googleNormal: false,
				googleNews: true,
			},
		});
	}

	return res;
}
