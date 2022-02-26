async function getURLStatus() {
	// use fetch to check url
	return "INACTIVE";
}

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
	// check that the tab is active && url is present
	console.log(tab);
	if (tab.active == true && tab.url) {
		// check the status of the url
		const status = await getURLStatus();

		await chrome.tabs.sendMessage(tab.id, { status });
	}
});

async function getCurrentTab() {
	let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

chrome.runtime.onMessage.addListener(async function (
	message,
	sender,
	sendResponse
) {
	console.log(message, " messagee was receivd");
	if (message.type == "CURRENT_TAB") {
		// get the URL of active tab
		let tab = await getCurrentTab();
		console.log(tab, " this is the tab");
		sendResponse(tab);
	}
	return true;
});
