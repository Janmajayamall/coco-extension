import React, { useEffect, useState } from "react";
import { Flex, Text, Image, Spacer } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import CocoFull from "./../../assets/icon128.png";
import { Routes, Route, useNavigate } from "react-router";
import Main from "./pages/Main";
import { COLORS } from "./utils";

function App() {
	const navigate = useNavigate();

	const [tabUrl, setTabUrl] = useState();

	useEffect(() => {
		chrome.tabs.onUpdated.addListener(async function (
			tabId,
			changeInfo,
			tab
		) {
			if (tab == undefined) {
				return;
			}

			// check that the tab is active && url is present
			setTabUrl(tab.url);
		});
	}, []);

	async function getCurrentTab() {
		let queryOptions = { active: true, lastFocusedWindow: true };
		let [tab] = await chrome.tabs.query(queryOptions);
		return tab;
	}

	return (
		<div style={{ width: 350 }}>
			<Flex
				width={"100%"}
				alignItems="center"
				borderBottom="1px"
				borderColor="#BDBDBD"
				padding={1}
				backgroundColor={COLORS.PRIMARY}
			>
				<Image
					_hover={{ cursor: "pointer" }}
					src={CocoFull}
					width={10}
					onClick={() => {
						navigate("/");
					}}
				/>
				<Spacer />
				<SettingsIcon
					w={8}
					h={8}
					color="red.500"
					onClick={() => {
						navigate("/settings");
					}}
				/>
			</Flex>
			<Flex width={"100%"}>
				<Spacer />
				<Flex width={"90%"}>
					<Routes>
						<Route path={"/"} element={<Main />} />
						<Route
							path={"/settings"}
							element={<Text>THis is settings screen</Text>}
						/>
					</Routes>
				</Flex>
				<Spacer />
			</Flex>
		</div>
	);
}

export default App;
