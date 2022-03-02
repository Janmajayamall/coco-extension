import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Flex, Link, Spacer, Text, Tag, Switch } from "@chakra-ui/react";
import {
	constants,
	filterUrls,
	getUrlsInfo,
	findAllDOMLinks,
	webUrl,
	formatUrlForDisplay,
	formatOnChainData,
	observeLinkChanges,
	findDataFromGoogleSearch,
	findUrlType,
} from "./../../utils";
import { ReactReduxContext, useDispatch, useSelector } from "react-redux";
import {
	sClearUrlsWithInfo,
	selectActiveTab,
	selectFoundUrlsWithInfo,
	selectNotFoundUrlsWithInfo,
	selectUrlsInfoToDisplay,
	sUpdateActiveTab,
	sUpdateUrlsInfoToDisplay,
	sUpdateUrlsWithInfo,
} from "../redux/reducers";

function Page() {
	const dispatch = useDispatch();

	// const activeTabUrl = useSelector(selectActiveTabUrl);
	// const activeTabId = useSelector(selectActiveTabId);
	// const activeTabInfo = useSelector(selectActiveTabInfo);

	const activeTab = useSelector(selectActiveTab);
	const foundUrlsWithInfo = useSelector(selectFoundUrlsWithInfo);
	const notFoundUrlsWithInfo = useSelector(selectNotFoundUrlsWithInfo);
	const urlsInfoToDisplay = useSelector(selectUrlsInfoToDisplay);

	const [showNotFound, setShowNotFound] = useState(false);

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
				dispatch(
					sUpdateActiveTab({
						activeTab: {
							tabId: tab.id,
							tabUrl: tab.url,
							tabType: findUrlType(tab.url),
							tabInfo: undefined,
						},
					})
				);
			}
		});
	}, []);

	// get current tab, when extension opens
	useEffect(async () => {
		let queryOptions = { active: true, currentWindow: true };
		let [tab] = await chrome.tabs.query(queryOptions);
		if (tab && tab.url != undefined && tab.id != undefined) {
			// change tabId and tabUrl
			dispatch(
				sUpdateActiveTab({
					activeTab: {
						tabId: tab.id,
						tabUrl: tab.url,
						tabType: getUrlType(tab.url),
						tabInfo: undefined,
					},
				})
			);
		}
	}, []);

	// TODO - remove this is just for testing
	// useEffect(() => {
	// 	console.log(
	// 		Object.keys(notFoundUrlsWithInfo).length,
	// 		Object.keys(foundUrlsWithInfo).length,
	// 		" URLS with info length"
	// 	);
	// }, [notFoundUrlsWithInfo, foundUrlsWithInfo]);

	// // TODO - remove this is just for testing
	// useEffect(() => {
	// 	console.log(" Active tab update ", activeTabId, activeTabUrl);
	// }, [activeTabId, activeTabUrl]);

	useEffect(() => {
		// listen for messages
		chrome.runtime.onMessage.addListener(async function (
			request,
			sender,
			sendResponse
		) {
			if (request) {
				if (request.type == constants.REQUEST_TYPES.ADD_URLS) {
					if (true) {
						console.log(request.urls, " received urls");
						const urls = filterUrls(request.urls);

						await addUrls(urls);
					}
				}

				if (request.type == constants.REQUEST_TYPES.GOOGLE_DOM_INFO) {
					console.log("received dom info", request.info);
					await addUrls(request.info);
				}
			}
		});
	}, []);

	// whenever tab URL changes, empty urlsWithInfo
	// and query links from content script
	// and add mutation observation for lin
	useEffect(async () => {
		dispatch(sClearUrlsWithInfo());
		if (activeTab.tabUrl != undefined && activeTab.tabId != undefined) {
			// chrome.scripting.executeScript({
			// 	target: { tabId: activeTabId },
			// 	function: findAllDOMLinks,
			// });

			// chrome.scripting.executeScript({
			// 	target: { tabId: activeTabId },
			// 	function: observeLinkChanges,
			// });

			if (activeTab.tabType == constants.ACTIVE_TAB_TYPES.GOOGLE_SEARCH) {
				chrome.scripting.executeScript({
					target: { tabId: activeTab.tabId },
					function: findDataFromGoogleSearch,
				});
			}

			// call add URL for active tab
			// await addUrls(filterUrls([activeTab.tabUrl]));
		}
	}, [activeTab]);

	async function addUrls(urlObjs) {
		if (urlObjs.length == 0) {
			return;
		}

		const res = await getUrlsInfo(urlObjs);
		if (res == undefined) {
			return;
		}
		let resUrlsInfo = res.posts;
		// update urls to display
		dispatch(
			sUpdateUrlsInfoToDisplay({
				urlsInfoToDisplay: resUrlsInfo,
			})
		);
		// dispatch(
		// 	sUpdateUrlsWithInfo({
		// 		urlsWithInfo: resUrlsInfo,
		// 	})
		// );
	}

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
	async function _addUrls(urls) {
		console.log(urls, " to be added urls");
		if (urls.length == 0) {
			return;
		}

		// get urls cache
		const urlsInfoCache = await queryFromURLSCache();

		let urlsWithCachedInfo = [];
		let urlsToBeQueried = [];

		urls.forEach((u) => {
			if (urlsInfoCache[u] != undefined) {
				// add to urls with info obj
				urlsWithCachedInfo.push(urlsInfoCache[u]);
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

		// update urlsWithInfo state
		dispatch(
			sUpdateUrlsWithInfo({
				urlsWithInfo: resUrlsInfo,
			})
		);

		// resUrlsInfo.forEach((info) => {
		// 	urlsWithCachedInfo[info.url] = info;
		// });

		// setUrlsWithInfo((prevUrlsWithInfo) => ({
		// 	...prevUrlsWithInfo,
		// 	...urlsWithCachedInfo,
		// }));
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
		const urlMetadata = info.urlMetadata
			? JSON.parse(info.urlMetadata)
			: {};
		const onChainData = formatOnChainData(info.onChainData);
		return (
			<Flex
				marginBottom={2}
				backgroundColor={constants.COLORS.PRIMARY}
				flexDirection={"column"}
				padding={2}
				borderRadius={8}
			>
				<Flex>
					<Tag
						size={"sm"}
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
					<Spacer />
				</Flex>

				{/* google title is only for google search tab */}
				{activeTab.tabType ==
					constants.ACTIVE_TAB_TYPES.GOOGLE_SEARCH &&
				info.googleTitle ? (
					<Text fontSize={14} fontWeight="semibold">
						{info.googleTitle}
					</Text>
				) : undefined}

				{/* only show metadata title when tab type is none */}
				{activeTab.tabType == constants.ACTIVE_TAB_TYPES.NONE &&
				urlMetadata.title &&
				urlMetadata.title != "" ? (
					<Text fontSize={14} fontWeight="semibold">
						{urlMetadata.title}
					</Text>
				) : undefined}

				{info.url ? (
					<Link fontSize={14} href={info.url} isExternal>
						{formatUrlForDisplay(info.url)}
						<ExternalLinkIcon mx="2px" />
					</Link>
				) : undefined}

				<Flex>
					{info.qStatus == constants.QUERY_STATUS.FOUND ? (
						<Link
							fontSize={12}
							fontWeight="semibold"
							href={`${webUrl}/post/${info.marketIdentifier}`}
							isExternal
						>
							{"View on COCO"}
							<ExternalLinkIcon mx="2px" />
						</Link>
					) : (
						<Link
							fontSize={12}
							fontWeight="semibold"
							href={`${webUrl}/new/${encodeURIComponent(
								info.url
							)}`}
							isExternal
						>
							{"Add to COCO"}
							<ExternalLinkIcon mx="2px" />
						</Link>
					)}
					<Spacer />
					{onChainData.outcome ? (
						<Tag
							size={"sm"}
							variant="solid"
							colorScheme={
								onChainData.outcome == 1 ? "green" : "red"
							}
						>
							{onChainData.outcome == 1 ? "YES" : "NO"}
						</Tag>
					) : undefined}
				</Flex>
			</Flex>
		);
	}

	return (
		<Flex
			flexDirection={"column"}
			width={"100%"}
			marginTop={2}
			marginBottom={2}
		>
			{/* {activeTabInfo != undefined ? (
				<>
					<Text
						fontSize={14}
						marginBottom={1}
						fontWeight={"semibold"}
					>
						Active webpage
					</Text>
					<UrlBox info={activeTabInfo} />
				</>
			) : undefined} */}
			{/* <Text marginBottom={1} fontSize={14} fontWeight={"semibold"}>
				Other links found
			</Text>
			{Object.values(foundUrlsWithInfo).map((info, index) => {
				return <UrlBox key={index} info={info} />;
			})}
			{Object.values(foundUrlsWithInfo).length == 0 ? (
				<Flex justifyContent={"center"}>
					<Text fontSize={14}>Nothing to show</Text>
				</Flex>
			) : undefined}
			<Flex marginBottom={1}>
				<Text fontSize={14} fontWeight={"semibold"}>
					Other links not found
				</Text>
				<Spacer />
				<Switch
					value={showNotFound}
					onChange={(e) => {
						setShowNotFound(e.target.checked);
					}}
				/>
			</Flex>
			{showNotFound == true
				? Object.values(notFoundUrlsWithInfo).map((info, index) => {
						return <UrlBox key={index} info={info} />;
				  })
				: undefined}
			{showNotFound == true &&
			Object.values(notFoundUrlsWithInfo).length == 0 ? (
				<Flex justifyContent={"center"}>
					<Text fontSize={14}>Nothing to show</Text>
				</Flex>
			) : undefined} */}
			{Object.values(urlsInfoToDisplay).length == 0 ? (
				<Flex justifyContent={"center"}>
					<Text fontSize={14}>Nothing to show</Text>
				</Flex>
			) : undefined}
			{Object.values(urlsInfoToDisplay).map((info, index) => {
				return <UrlBox key={index} info={info} />;
			})}
		</Flex>
	);
}

export default Page;
