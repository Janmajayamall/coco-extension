chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request) {
		if (request.status == "INACTIVE") {
			// show inactive symbol on top right

			// get div
			let div = document.getElementById("coco");
			if (div == null) {
				div = document.createElement("div");
				div.id = "coco";
			} else {
				div.innerHTML == "";
			}

			// add the text
			let textNode = document.createTextNode("INACTIVE");
			div.appendChild(textNode);
			document.body.insertBefore(div, document.body.firstChild);
		}
	}
});
