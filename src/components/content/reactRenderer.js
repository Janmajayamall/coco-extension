import reactDom from "@hot-loader/react-dom";
import React from "react";
import ReactDOM from "react-dom";

function GoogleSearchStrip({ info }) {
	return (
		<Flex backgroundColor={"whatsapp.100"}>
			<Text>Status: YES</Text>
			<Spacer />
			<Text>Visit</Text>
		</Flex>
	);
}

export function renderReact(elementId, info) {
	ReactDOM.render(
		<React.StrictMode>
			<GoogleSearchStrip info={info} />
		</React.StrictMode>,
		document.getElementById(elementId)
	);
}
