import { StylesProvider } from "@chakra-ui/react";
import {
	constants,
	findDataFromGoogleSearch,
	getUrlsInfo,
	webUrl,
} from "../utils";
import { renderGoogle, renderTwitter, setupShadowRoot } from "./reactRenderer";

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

async function handleGoogleSearch() {
	console.log(window.location, " is this google/ ");

	// normal search divs
	var divs = document.getElementsByClassName("yuRUbf");
	for (var i = 0; i < divs.length; i++) {
		let url = divs[i].getElementsByTagName("a")[0].href;

		// add coco's shadow DOM
		let rootSpan = document.createElement("span");
		divs[i].appendChild(rootSpan);

		// setup shadow root
		rootSpan.attachShadow({ mode: "open" });
		setupShadowRoot(rootSpan.shadowRoot);

		renderGoogle(rootSpan.shadowRoot, [url]);
	}

	// // find all google news info
	// var newsDivs = document.getElementsByClassName("ftSUBd");
	// for (var i = 0; i < newsDivs.length; i++) {
	// 	// get link and title
	// 	const url = newsDivs[i].getElementsByTagName("a")[0].href;
	// 	const googleTitle = newsDivs[i].getElementsByClassName(
	// 		"mCBkyc y355M JQe2Ld nDgy9d"
	// 	)[0].innerHTML;

	// 	res.push({
	// 		url,
	// 		clientMetadata: {
	// 			tabType: "GOOGLE_SEARCH",
	// 			googleTitle,
	// 			googleNormal: false,
	// 			googleNews: true,
	// 		},
	// 	});
	// }

	// return res;

	// const urlsObjs = findDataFromGoogleSearch();

	// // get urls info from backend
	// const res = await getUrlsInfo(urlsObjs);
	// if (res == undefined) {
	// 	return;
	// }
	// let resUrlsInfo = res.posts;

	// // update DOM to reflect urls info
	// resUrlsInfo.forEach((info) => {
	// 	if (
	// 		info.clientMetadata &&
	// 		info.clientMetadata.tabType ==
	// 			constants.ACTIVE_TAB_TYPES.GOOGLE_SEARCH
	// 	) {
	// 		if (info.clientMetadata.googleNews == true) {
	// 			// handle news link
	// 			let element = document.body.querySelector(
	// 				`[href="${info.url}"]`
	// 			);

	// 			let parentDiv = document.createElement("div");
	// 			let rootId = getRandomId();
	// 			parentDiv.id = rootId;

	// 			element.appendChild(parentDiv);
	// 			renderReact(rootId, info);
	// 		} else if (info.clientMetadata.googleNormal == true) {
	// 			// handle normal search link
	// 			let element = document.body.querySelector(
	// 				`[href="${info.url}"]`
	// 			);
	// 			let mainParent =
	// 				element.parentElement.parentElement.parentElement;

	// 			let parentDiv = document.createElement("div");
	// 			let rootId = getRandomId();
	// 			parentDiv.id = rootId;

	// 			mainParent.appendChild(parentDiv);
	// 			renderReact(rootId, info);
	// 		}
	// 	}
	// });
}

export function handleTwitter() {
	var target = document.getElementById("react-root");

	if (target) {
		// create an observer instance
		var observer = new MutationObserver(function (mutations) {
			// tweets are in article
			const cards = document.getElementsByTagName("article");

			// check each card
			for (let n = 0; n < cards.length; n++) {
				const card = cards[n];

				// check that cards is a tweet / has not been seen before
				if (
					card.hasAttribute("data-testid") &&
					card.getAttribute("data-testid") == "tweet" &&
					!card.hasAttribute("coco-scan")
				) {
					// set coco-scan attribute to mark this
					// card as "seen before"
					card.setAttribute("coco-scan", true);

					// find all "https://t.co" type urls
					// in the tweet
					let links = card.getElementsByTagName("a");
					let urls = {};
					for (let j = 0; j < links.length; j++) {
						let reg = /https:\/\/+t.co\//;
						if (reg.test(links[j].href)) {
							urls[links[j].href] = true;
						}
					}
					// convert to urls arr
					urls = Object.keys(urls);

					// find strip div by role
					let strip = card.querySelector(`[role="group"]`);
					if (strip == undefined) {
						return;
					}

					// add coco's shadow DOM
					let rootSpan = document.createElement("span");
					strip.appendChild(rootSpan);

					// setup shadow root
					rootSpan.attachShadow({ mode: "open" });
					setupShadowRoot(rootSpan);

					renderTwitter(rootSpan, urls);
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
		window.setTimeout(handleTwitter, 1000);
	}
}

handleTwitter();
handleGoogleSearch();
