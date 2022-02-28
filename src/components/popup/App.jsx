import React, { useEffect, useState } from "react";
import { Flex, Text, Image, Spacer } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import CocoFull from "./../../assets/icon128.png";
import { Routes, Route, useNavigate } from "react-router";
import Main from "./pages/Main";
import { constants, filterUrls, getUrlsInfo, findAllDOMLinks } from "../utils";

function App() {
	const navigate = useNavigate();

	return (
		<div style={{ width: 350 }}>
			<Flex
				width={"100%"}
				alignItems="center"
				borderBottom="1px"
				borderColor="#BDBDBD"
				padding={1}
				backgroundColor={constants.COLORS.PRIMARY}
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
					onClick={async () => {
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
