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
