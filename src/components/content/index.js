import { constants, findUrlType } from "../utils";
import { renderGoogle, renderTwitter, setupShadowRoot } from "./reactRenderer";

async function handleGoogleSearch() {
	console.log(window.location, " is this google/ ");

	// only proceed if host is google
	if (
		findUrlType(window.location.href) != constants.URL_TYPES.GOOGLE_SEARCH
	) {
		return;
	}

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

	// google news a
	// className is <a> elem
	var a = document.getElementsByClassName("WlydOe");
	for (var i = 0; i < a.length; i++) {
		// get link and title
		let url = a[i].href;

		// add coco's shadow DOM
		let rootSpan = document.createElement("span");
		a[i].parentElement.parentElement.prepend(rootSpan);

		// setup shadow root
		rootSpan.attachShadow({ mode: "open" });
		setupShadowRoot(rootSpan.shadowRoot);

		renderGoogle(rootSpan.shadowRoot, [url]);
	}
}

export function handleTwitter() {
	// only proceed if host is twitter
	if (findUrlType(window.location.href) != constants.URL_TYPES.TWITTER) {
		return;
	}

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
					setupShadowRoot(rootSpan.shadowRoot);

					renderTwitter(rootSpan.shadowRoot, urls);
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
