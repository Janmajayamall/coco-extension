import React, { useEffect, useState } from "react";
import { Flex, Text, Image, Spacer } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import CocoFull from "./../../assets/icon128.png";
import { Routes, Route, useNavigate } from "react-router";
import Main from "./pages/Main";
import { constants, filterUrls, getUrlsInfo, findAllDOMLinks } from "../utils";

function App() {
	const navigate = useNavigate();

	const [activeTabId, setActiveTabId] = useState(undefined);
	const [activeTabUrl, setActiveTabUrl] = useState(undefined);

	const [urlsWithInfo, setUrlsWithInfo] = useState({});

	useEffect(async () => {
		// listen for the active tab url
		chrome.tabs.onUpdated.addListener(async function (
			tabId,
			changeInfo,
			tab
		) {
			if (
				tab &&
				tab.status == "complete" &&
				tab.url != undefined &&
				tab.id != undefined
			) {
				// change the tabUrl
				setActiveTabId(tab.id);
				setActiveTabUrl(tab.url);
			}
		});
	}, []);

	// TODO - remove this is just for testing
	useEffect(() => {
		console.log(Object.keys(urlsWithInfo).length, " URLS with info length");
	}, [urlsWithInfo]);

	useEffect(() => {
		// listen for messages
		chrome.runtime.onMessage.addListener(async function (
			request,
			sender,
			sendResponse
		) {
			if (request) {
				if (request.type == constants.REQUEST_TYPES.ADD_URLS) {
					if (activeTabUrl != undefined) {
						const urls = filterUrls(request.urls);
						await addUrls(urls);
					}
				}
			}
		});
	}, []);

	// whenever tab URL changes, empty urlsWithInfo
	// and query links from content script
	useEffect(async () => {
		if (activeTabUrl != undefined && activeTabId != undefined) {
			chrome.scripting.executeScript({
				target: { tabId: activeTabId },
				function: findAllDOMLinks,
			});
		}
	}, [activeTabUrl, activeTabId]);

	// gets info on queued urls every 2 seconds
	// useEffect(() => {
	// 	const interval = setInterval(async () => {
	// 		// console.log("QUEUE url getting info");
	// 		await queryQueuedUrlsInfo();
	// 	}, 60000);
	// 	return () => clearInterval(interval);
	// }, []);

	// // invalidate URLS cache every 1 min
	// useEffect(() => {
	// 	const interval = setInterval(async () => {
	// 		// console.log("URLs cache invalidated");
	// 		await invalidateURLSCache();
	// 	}, 60000);
	// 	return () => clearInterval(interval);
	// }, []);

	// Finds url's info and adds it to
	// urlsWithInfo state object.
	// It first checks whether
	// url's info exists in URLS
	// cache or not. If it does, then
	// it adds url along with it's info to
	// the state object. Otherwise,
	// queries url's info from the
	// backend and updates cache
	async function addUrls(urls) {
		if (urls.length == 0) {
			return;
		}

		// get urls cache
		const urlsInfoCache = await queryFromURLSCache();

		let urlsWithCachedInfo = {};
		let urlsToBeQueried = [];

		urls.forEach((u) => {
			if (urlsInfoCache[u] != undefined) {
				// add to urls with info obj
				urlsWithCachedInfo[u] = {
					...urlsInfoCache[u],
				};
			} else {
				// add to urls without info arr
				urlsToBeQueried.push(u);
			}
		});

		// query urls without info
		const res = await getUrlsInfo(urlsToBeQueried);
		if (res == undefined) {
			return;
		}
		let resUrlsInfo = res.posts;

		// update urls cache
		updateURLSCache(resUrlsInfo);

		resUrlsInfo.forEach((info) => {
			urlsWithCachedInfo[info.url] = info;
		});
		setUrlsWithInfo((prevUrlsWithInfo) => ({
			...prevUrlsWithInfo,
			...urlsWithCachedInfo,
		}));
	}

	// queries  URLS cache
	// stored in storage.local
	async function queryFromURLSCache() {
		const response = await chrome.storage.local.get([
			constants.STORAGE_KEYS.URLS,
		]);

		return response[constants.STORAGE_KEYS.URLS] != undefined &&
			typeof response[constants.STORAGE_KEYS.URLS] == "object"
			? JSON.parse(response[constants.STORAGE_KEYS.URLS])
			: {};
	}

	async function updateURLSCache(urlsInfoArr) {
		const response = await chrome.storage.local.get([
			constants.STORAGE_KEYS.URLS,
		]);
		let urlsCache =
			response[constants.STORAGE_KEYS.URLS] != undefined
				? JSON.parse(response[constants.STORAGE_KEYS.URLS])
				: {};

		// update cache
		urlsInfoArr.forEach((info) => {
			urlsCache[info.url] = info;
		});

		let storageObj = {};
		storageObj[constants.STORAGE_KEYS.URLS] = JSON.stringify(urlsCache);
		await chrome.storage.local.set(storageObj);
	}

	async function invalidateURLSCache() {
		let storageObj = {};
		storageObj[constants.STORAGE_KEYS.URLS] = JSON.stringify({});
		await chrome.storage.local.set(storageObj);
	}

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
