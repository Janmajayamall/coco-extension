import { urlFilter, constants } from "./../utils";

async function passOnTheLink(link) {
	if (urlFilter(link)) {
		await chrome.runtime.sendMessage({
			type: constants.REQUEST_TYPES.URL_ADD,
			url: link,
		});
	}
}

async function observeLinkChanges() {
	// select the target node
	var target = document.body;

	// create an observer instance
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(async function (mutation) {
			await passOnTheLink(mutation.target.href);
		});
	});

	// configuration of the observer:
	var config = { attributes: true, attributeFilter: ["href"], subtree: true };

	// pass in the target node, as well as the observer options
	observer.observe(target, config);

	// later, you can stop observing
	// observer.disconnect();
}

// runs once DOM is loaded
// since content_script is marked
// as run_at=document_idle
async function findAllLinkOnLoad() {
	var links = document.getElementsByTagName("a");
	for (var i = 0; i < links.length; i++) {
		await passOnTheLink(links[i].href);
	}
}

observeLinkChanges();
findAllLinkOnLoad();
