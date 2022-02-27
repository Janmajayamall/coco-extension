import { urlFilter, constants } from "./../utils";

// // listen for
// chrome.runtime.onMessage.addListener(async function (
// 	request,
// 	sender,
// 	sendResponse
// ) {
// 	console.log("request received");
// 	if (request) {
// 		console.log("request received");
// 		if (request.type == constants.REQUEST_TYPES.DOM_LINKS) {
// 			const links = findAllDOMLinks();
// 			await passOnTheLinks(links);
// 		}
// 	}
// });

async function passOnTheLinks(links) {
	await chrome.runtime.sendMessage({
		type: constants.REQUEST_TYPES.ADD_URLS,
		urls: links,
	});
}

async function observeLinkChanges() {
	// select the target node
	var target = document.body;

	// create an observer instance
	var observer = new MutationObserver(async function (mutations) {
		let arr = [];
		console.log(" these are the mutation ");
		mutations.forEach(function (mutation) {
			arr.push(mutation.target.href);
		});
		await passOnTheLinks(arr);
	});

	// configuration of the observer:
	var config = { attributes: true, attributeFilter: ["href"], subtree: true };

	// pass in the target node, as well as the observer options
	observer.observe(target, config);

	// later, you can stop observing
	// observer.disconnect();
}

observeLinkChanges();
