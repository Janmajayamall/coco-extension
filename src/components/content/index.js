import {
	constants,
	findDataFromGoogleSearch,
	getUrlsInfo,
	webUrl,
} from "../utils";
import { renderReact } from "./reactRenderer";

function getRandomId() {
	return `coco_${Math.floor(Math.random() * 10000000)}`;
}

function buildGoogleDivForInfo(info) {
	// create COCO section
	let parentDiv = document.createElement("div");
	let rootId = getRandomId();
	// parentDiv.id = parentDiv.className = "cocoParentDiv";
	parentDiv.id = rootId;

	// if (info.qStatus == constants.QUERY_STATUS.FOUND) {
	// 	// status text
	// 	let statusText = document.createElement("div");
	// 	statusText.innerHTML = `Status : ${
	// 		info.onChainData.outcome == 1 ? "YES" : "NO"
	// 	}`;

	// 	// COCO link
	// 	let visitLink = document.createElement("a");
	// 	visitLink.innerHTML = "View on COCO";
	// 	visitLink.href = `${webUrl}/post/${info.marketIdentifier}`;
	// 	visitLink.target = "_blank";

	// 	parentDiv.appendChild(statusText);
	// 	parentDiv.appendChild(visitLink);
	// } else {
	// 	// status text
	// 	let statusText = document.createElement("div");
	// 	statusText.innerHTML = "Not Found";
	// 	// COCO link
	// 	let addLink = document.createElement("a");
	// 	addLink.innerHTML = "Add on COCO";
	// 	addLink.href = `${webUrl}/new/${encodeURIComponent(
	// 		info.url
	// 	)}/${encodeURIComponent(info.clientMetadata.googleTitle)}`;
	// 	addLink.target = "_blank";

	// 	parentDiv.appendChild(statusText);
	// 	parentDiv.appendChild(addLink);
	// }

	return parentDiv;
}

// for google search
async function handleGoogleSearchTab() {
	const urlsObjs = findDataFromGoogleSearch();

	// get urls info from backend
	const res = await getUrlsInfo(urlsObjs);
	if (res == undefined) {
		return;
	}
	let resUrlsInfo = res.posts;

	// update DOM to reflect urls info
	resUrlsInfo.forEach((info) => {
		if (
			info.clientMetadata &&
			info.clientMetadata.tabType ==
				constants.ACTIVE_TAB_TYPES.GOOGLE_SEARCH
		) {
			if (info.clientMetadata.googleNews == true) {
				// handle news link
				let element = document.body.querySelector(
					`[href="${info.url}"]`
				);

				let parentDiv = document.createElement("div");
				let rootId = getRandomId();
				parentDiv.id = rootId;

				element.appendChild(parentDiv);
				renderReact(rootId, info);
			} else if (info.clientMetadata.googleNormal == true) {
				// handle normal search link
				let element = document.body.querySelector(
					`[href="${info.url}"]`
				);
				let mainParent =
					element.parentElement.parentElement.parentElement;

				let parentDiv = document.createElement("div");
				let rootId = getRandomId();
				parentDiv.id = rootId;

				mainParent.appendChild(parentDiv);
				renderReact(rootId, info);
			}
		}
	});
}

function o() {
	var target = document.body;
	var observer = new MutationObserver(async function (mutations) {
		console.log("CJ Mutations triggered");
		mutations.forEach(function (mutation) {
			console.log("CJ jk ", mutation.target.href);
		});

		console.log("CJ Mutations triggered finished");
	});

	// configuration of the observer:
	var config = {
		attributes: true,
		attributeFilter: ["href"],
		subtree: true,
	};

	// pass in the target node, as well as the observer options
	observer.observe(target, config);
}

function handleTwitter() {
	console.log("CJ - I was here 1");
	const articles = document.getElementsByTagName("article");
	console.log("CJ - I was here", articles);
	for (var i = 0; i < articles.length; i++) {
		// get link and title
		const url = articles[i].getElementsByTagName("a")[0].href;
		console.log("CJ ", url);
		// const googleTitle = divs[i].getElementsByClassName(
		// 	"LC20lb MBeuO DKV0Md"
		// )[0].innerHTML;

		// res.push({
		// 	url,
		// 	clientMetadata: {
		// 		tabType: "GOOGLE_SEARCH",
		// 		googleTitle,
		// 		googleNormal: true,
		// 		googleNews: false,
		// 	},
		// });
	}
}

handleTwitter();
o();

// handleGoogleSearchTab();
