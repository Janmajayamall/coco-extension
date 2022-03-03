import {
	constants,
	findDataFromGoogleSearch,
	getUrlsInfo,
	webUrl,
} from "../utils";
import { renderReact, renderTwitterCard } from "./reactRenderer";

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

// function o() {
// var target = document.querySelectorAll(
// 	`[aria-label="Timeline: Your Home Timeline"]`
// );

// 	if (target.length != 0) {
// 		console.log(target[0].childNodes[0], "CJ Finding N");
// 		var observer = new MutationObserver(async function (mutations) {
// 			console.log("CJ Mutations triggered");
// 			mutations.forEach(function (mutation) {
// 				mutation.addedNodes.forEach((node) => {
// 					console.log(
// 						node.getAttribute("class") ==
// 							"css-1dbjc4n r-1ta3fxp r-18u37iz r-1wtj0ep r-1s2bzr4 r-1mdbhws",
// 						" CJ Yo I was added :P"
// 					);
// 				});
// 			});

// 			console.log("CJ Mutations triggered finished");
// 		});

// 		// configuration of the observer:
// 		var config = {
// 			childList: true,
// 			subtree: true,
// 		};

// 		// pass in the target node, as well as the observer options
// 		observer.observe(target[0], config);
// 	} else {
// 		window.setTimeout(o, 1000);
// 	}
// }

function twitterInsert(parent, urls) {
	console.log("CJ urls recieved", urls, parent);
	let mainDiv = document.createElement("div");

	let rootId = getRandomId();
	mainDiv.id = rootId;
	parent.appendChild(mainDiv);
	renderTwitterCard(rootId);
}

// starts observing DOM Link changes
export function obb() {
	// select the target node
	// var target = document.querySelectorAll(
	// 	`[aria-label="Timeline: Your Home Timeline"]`
	// );
	var target = document.getElementById("react-root");

	if (target) {
		// create an observer instance
		var observer = new MutationObserver(function (mutations) {
			const cards = document.getElementsByTagName("article");
			// check each card
			for (let n = 0; n < cards.length; n++) {
				const card = cards[n];

				// check that cards is new / has not been seen before
				if (
					card.hasAttribute("data-testid") &&
					card.getAttribute("data-testid") == "tweet" &&
					!card.hasAttribute("coco-scan")
				) {
					console.log("CJ ", "I was trigg");
					card.setAttribute("coco-scan", true);
					// var link = card.getElementsByTagName("a");
					// for (let j = 0; j < link.length; j++) {
					// 	console.log(link[j].href);
					// }

					// // mark the card as "processed" by adding the custom tag

					// find the urls
					var link = card.getElementsByTagName("a");
					let urls = [];
					for (let j = 0; j < link.length; j++) {
						let reg = /https:\/\/+t.co\//;
						if (reg.test(link[j].href)) {
							urls.push(link[j].href);
						}
					}

					// get strip by classname
					var strip = card.querySelector(`[role="group"]`);
					// strips arent there for reply tweets
					if (strip == undefined) {
						return;
					}

					twitterInsert(strip, urls);
				}
			}
		});

		// configuration of the observer:
		var config = {
			subtree: true,
			childList: true,
		};

		// pass in the target node, as well as the observer options
		observer.observe(target, config);

		// later, you can stop observing
		// observer.disconnect();
	} else {
		window.setTimeout(obb, 1000);
	}
}

function handleTwitter() {
	// console.log("CJ - I was here 1");
	// const articles = document.getElementsByTagName("article");
	const articles = document.getElementsByClassName("css-1dbjc4n");

	for (var i = 0; i < articles.length; i++) {
		// get link and title
		// const url = articles[i].getElementsByTagName("a")[0].href;
		// console.log("CJ ", articles);
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

// handleTwitter();
obb();

// handleGoogleSearchTab();

// id__b5r3d3imsu;

// css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu

// css-1dbjc4n r-1ta3fxp r-18u37iz r-1wtj0ep r-1s2bzr4 r-1mdbhws

// id__6hn1m9gpq9w

// css-1dbjc4n r-1ta3fxp r-18u37iz r-1wtj0ep r-1s2bzr4 r-1mdbhws

// id__lwn776wwd9i
