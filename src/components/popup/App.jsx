import React, { useEffect, useState } from "react";
import { Flex, Text, Image, Spacer } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import CocoFull from "./../../assets/icon128.png";
import { Routes, Route, useNavigate } from "react-router";
import Main from "./pages/Main";
import { constants, getUrlsInfo } from "../utils";

function App() {
	const navigate = useNavigate();

	const [tabUrl, setTabUrl] = useState();

	const [urlQueue, setUrlQueue] = useState([]);

	const [urlsWithInfo, setUrlsWithInfo] = useState({});

	useEffect(async () => {
		// listen for the active tab url
		chrome.tabs.onUpdated.addListener(async function (
			tabId,
			changeInfo,
			tab
		) {
			if (tab == undefined) {
				return;
			}
		});

		// let obj = {};
		// obj[constants.STORAGE_KEYS.URLS] = JSON.stringify({ k: "op" });
		// console.log(obj, " object stored");
		// await chrome.storage.local.set(obj);
	}, []);

	useEffect(() => {
		// listen for messages
		chrome.runtime.onMessage.addListener(async function (
			request,
			sender,
			sendResponse
		) {
			if (request) {
				if (request.type == constants.REQUEST_TYPES.URL_ADD) {
					const url = request.url;
					await addUrl(url);
					// 1. Check whether the URL already exists or not
					// 2. Query its information from backend (try batching many of them into one)
					// 3. Probably maintain a queue for URLs to be processed?
				}
			}
		});
	}, []);

	async function getCurrentTab() {
		let queryOptions = { active: true, lastFocusedWindow: true };
		let [tab] = await chrome.tabs.query(queryOptions);
		return tab;
	}

	// Finds url's info and adds it to
	// urlsWithInfo state object, only
	// when url's info exists in URLS cache.
	// It first checks whether
	// url's info exists in URLS
	// cache or not. If it does, then
	// it adds url along with it's info to
	// the state object. Otherwise,
	// adds url to urlQueue, for querying its
	// information from backend.
	async function addUrl(url) {
		// return if url already
		// exists in urlsWithInfo
		if (urlsWithInfo[url] != undefined) {
			return;
		}

		// check whether url related info
		// exists in urls cache
		const cacheRes = await queryFromURLSCache(url);
		if (cacheRes.success == true) {
			if (urlsWithInfo[url] == undefined) {
				setUrlsWithInfo({
					...urlsWithInfo,
					url: cacheRes.urlInfo,
				});
			}
			return;
		}
		// url related info does
		// not exists in urls cache
		else {
			// add url to urlQueue,
			// if it does already exists
			if (urlQueue.findIndex((val) => val == url) == -1) {
				setUrlQueue([...urlQueue, url]);
			}
		}
	}

	// finds url's info from URLS cache
	// stored in storage.local
	async function queryFromURLSCache(url) {
		const response = await chrome.storage.local.get([
			constants.STORAGE_KEYS.URLS,
		]);

		// check whether urls are present &&
		// urls is of type Object
		if (
			response[constants.STORAGE_KEYS.URLS] != undefined &&
			typeof response[constants.STORAGE_KEYS.URLS] == "object"
		) {
			const urlsObj = JSON.parse(response[constants.STORAGE_KEYS.URLS]);
			const info = Object.keys(urlsObj).find((val) => val == url);
			if (info != undefined) {
				return {
					success: true,
					urlInfo: info,
				};
			}
		}

		// url info was not found in cache
		return {
			success: false,
			urlInfo: undefined,
		};
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

	async function queryQueuedUrlsInfo() {
		let urls = urlQueue;
		if (urls.length > 0) {
			// consume entire queue
			setUrlQueue([]);

			// get urls info
			const urlsInfo = await getUrlsInfo(urls);

			// update cache
			updateURLSCache(urlsInfo);

			// add queries urls info to urlsWithInfo state
			let _urlsWithInfo = {
				...urlsWithInfo,
			};
			urlsInfo.forEach((info) => {
				_urlsWithInfo[info.url] = info;
			});
			setUrlsWithInfo(_urlsWithInfo);
		}
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
