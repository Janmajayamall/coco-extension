import { constants, findDataFromGoogleSearch, findUrlType } from "../utils";

async function main() {
	// let queryOptions = { active: true, currentWindow: true };
	// console.log(chrome.runtime, chrome.tabs, " inj");
	// let [tab] = await chrome.tabs.query(queryOptions);
	let url = window.location;
	if (url) {
		if (findUrlType(url) == constants.ACTIVE_TAB_TYPES.GOOGLE_SEARCH) {
			const urlsObjs = findDataFromGoogleSearch();
			await chrome.runtime.sendMessage({
				// constants.REQUEST_TYPES.ADD_URLS fails
				// for some reason
				type: constants.REQUEST_TYPES.POPUP_ADD_URLS,
				urlsObjs,
			});
		}
	}
}

main();
