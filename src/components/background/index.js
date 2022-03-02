// import {
// 	constants,
// 	findAllDOMLinks,
// 	findUrlType,
// 	findDataFromGoogleSearch,
// 	backgroundHandleGoogleSearchTab,
// } from "../utils";

// // listen for the active tab url
// chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
// 	if (
// 		tab &&
// 		tab.status == "complete" &&
// 		tab.url != undefined &&
// 		tab.id != undefined
// 	) {
// 		// tab type
// 		const tabType = findUrlType(tab.url);
// 		console.log("found the tab", tab);
// 		if (tabType == constants.ACTIVE_TAB_TYPES.GOOGLE_SEARCH) {
// 			chrome.scripting.executeScript({
// 				target: { tabId: tab.id },
// 				function: backgroundHandleGoogleSearchTab,
// 			});
// 		} else {
// 			// when tab type of NONEs
// 		}
// 	}
// });
