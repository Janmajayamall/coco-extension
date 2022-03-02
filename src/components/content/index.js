import {
	constants,
	findDataFromGoogleSearch,
	getUrlsInfo,
	webUrl,
} from "../utils";

function buildGoogleDivForInfo(info) {
	// create COCO section
	let parentDiv = document.createElement("div");
	parentDiv.className = "cocoParentDiv";

	if (info.qStatus == constants.QUERY_STATUS.FOUND) {
		// status text
		let statusText = document.createElement("div");
		statusText.innerHTML = `Status : ${
			info.onChainData.outcome == 1 ? "YES" : "NO"
		}`;

		// COCO link
		let visitLink = document.createElement("a");
		visitLink.innerHTML = "View on COCO";
		visitLink.href = `${webUrl}/post/${info.marketIdentifier}`;
		visitLink.target = "_blank";

		parentDiv.appendChild(statusText);
		parentDiv.appendChild(visitLink);
	} else {
		// status text
		let statusText = document.createElement("div");
		statusText.innerHTML = "Not Found";
		// COCO link
		let addLink = document.createElement("a");
		addLink.innerHTML = "Add on COCO";
		addLink.href = `${webUrl}/new/${encodeURIComponent(info.url)}/${
			info.clientMetadata.googleTitle
		}`;
		addLink.target = "_blank";

		parentDiv.appendChild(statusText);
		parentDiv.appendChild(addLink);
	}

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
				element.appendChild(buildGoogleDivForInfo(info));
			} else if (info.clientMetadata.googleNormal == true) {
				// handle normal search link
				let element = document.body.querySelector(
					`[href="${info.url}"]`
				);
				let mainParent =
					element.parentElement.parentElement.parentElement;

				mainParent.appendChild(buildGoogleDivForInfo(info));
			}
		}
	});
}

handleGoogleSearchTab();
