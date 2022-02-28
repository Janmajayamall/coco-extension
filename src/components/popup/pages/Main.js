import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Flex, Link, Spacer, Text, Tag } from "@chakra-ui/react";
import {
	constants,
	filterUrls,
	getUrlsInfo,
	findAllDOMLinks,
} from "./../../utils";

function Page() {
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
				// change tabId and tabUrl
				setActiveTabId(tab.id);
				setActiveTabUrl(tab.url);
			}
		});
	}, []);

	// // TODO - remove this is just for testing
	// useEffect(() => {
	// 	console.log(Object.keys(urlsWithInfo).length, " URLS with info length");
	// }, [urlsWithInfo]);

	useEffect(() => {
		// listen for messages
		chrome.runtime.onMessage.addListener(async function (
			request,
			sender,
			sendResponse
		) {
			console.log("received urls ", request, activeTabId);
			if (request) {
				if (request.type == constants.REQUEST_TYPES.ADD_URLS) {
					if (true) {
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
		setUrlsWithInfo({});
		if (activeTabUrl != undefined && activeTabId != undefined) {
			chrome.scripting.executeScript({
				target: { tabId: activeTabId },
				function: findAllDOMLinks,
			});
		}
	}, [activeTabUrl, activeTabId]);

	// invalidate URLS cache every 1 min
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
		console.log(" in add urls ", activeTabId, activeTabUrl);
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

	function UrlBox({ info }) {
		return (
			<Flex
				marginBottom={2}
				backgroundColor={constants.COLORS.PRIMARY}
				flexDirection={"column"}
				padding={2}
				borderRadius={8}
			>
				<Tag
					size={"md"}
					variant="solid"
					colorScheme={
						info.qStatus == constants.QUERY_STATUS.FOUND
							? "green"
							: "red"
					}
				>
					{info.qStatus == constants.QUERY_STATUS.FOUND
						? "Found"
						: "Not found"}
				</Tag>
				{info.url ? (
					<Text fontSize={13} marginBottom={1} fontWeight="semibold">
						{info.url}
					</Text>
				) : undefined}
				<Flex>
					<Link fontSize={12} href={info.url} isExternal>
						{"Visit page!"}
						<ExternalLinkIcon mx="2px" />
					</Link>
					<Spacer />
					<Text>Status</Text>
				</Flex>
			</Flex>
		);
	}

	return (
		<Flex flexDirection={"column"} width={"100%"} marginTop={2}>
			{Object.values(urlsWithInfo).map((info) => {
				return <UrlBox info={info} />;
			})}
		</Flex>
	);
}

export default Page;
