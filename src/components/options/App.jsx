import React, { useEffect } from "react";

function App() {
	useEffect(async () => {
		const res = await chrome.storage.local.get(["queryUrl"]);
		console.log("this is the res", res);
	}, []);

	return <div>Options</div>;
}

export default App;
