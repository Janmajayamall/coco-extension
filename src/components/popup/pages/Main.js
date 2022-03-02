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
	popUpGoogleSearchScript,
	findUrlType,
	findUrlName,
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
	sUpdateActiveTabInfo,
	selectActiveTabInfo,
} from "../redux/reducers";

function Page() {
	const dispatch = useDispatch();

	// const activeTabUrl = useSelector(selectActiveTabUrl);
	// const activeTabId = useSelector(selectActiveTabId);
	// const activeTabInfo = useSelector(selectActiveTabInfo);

	const activeTab = useSelector(selectActiveTab);
	const activeTabInfo = useSelector(selectActiveTabInfo);
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
						tabType: findUrlType(tab.url),
					},
				})
			);
		}
	}, []);

	useEffect(() => {
		// listen for messages
		chrome.runtime.onMessage.addListener(async function (
			request,
			sender,
			sendResponse
		) {
			console.log("received request", request);
			if (request) {
				if (request.type == constants.REQUEST_TYPES.POPUP_ADD_URLS) {
					if (request.urlsObjs) {
						// add urls for display
						await addUrls(request.urlsObjs);
					}
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
				// ask for google search urls from content script
				console.log("executing google");
				chrome.scripting.executeScript({
					target: { tabId: activeTab.tabId },
					files: ["injectScript.bundle.js"],
				});
			}

			if (activeTab.tabType == constants.ACTIVE_TAB_TYPES.RANDOM_TAB) {
				// TODO filter out unecessary urls like new tab of chrome://extension
				const res = await getUrlsInfo([
					{
						url: activeTab.tabUrl,
						clientMetadata: {
							tabType: constants.ACTIVE_TAB_TYPES.RANDOM_TAB,
						},
					},
				]);
				if (res == undefined || res.posts.length == 0) {
					return;
				}
				console.log(" random res ", res);
				dispatch(
					sUpdateActiveTabInfo({
						activeTabInfo: res.posts[0],
					})
				);
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

		// update urls to display
		dispatch(
			sUpdateUrlsInfoToDisplay({
				urlsInfoToDisplay: res.posts,
			})
		);
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

	function StatusStrip({ info }) {
		const onChainData = formatOnChainData(info.onChainData);
		return (
			<Flex>
				{info.qStatus == constants.QUERY_STATUS.FOUND &&
				onChainData.outcome ? (
					<Tag
						size={"sm"}
						variant="solid"
						colorScheme={onChainData.outcome == 1 ? "green" : "red"}
					>
						{`Status: ${onChainData.outcome == 1 ? "YES" : "NO"}`}
					</Tag>
				) : (
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
				)}
				<Spacer />
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
						// appends googleTitle if the link to
						// be added is from google search
						href={`${webUrl}/new/${encodeURIComponent(info.url)}${
							info.clientMetadata &&
							info.clientMetadata.googleTitle
								? "/" + info.clientMetadata.googleTitle
								: ""
						}`}
						isExternal
					>
						{"Add to COCO"}
						<ExternalLinkIcon mx="2px" />
					</Link>
				)}
			</Flex>
		);
	}

	function GoogleUrlBox({ info }) {
		return (
			<Flex
				marginBottom={2}
				backgroundColor={constants.COLORS.PRIMARY}
				flexDirection={"column"}
				padding={2}
				borderRadius={8}
			>
				{/* google title is only for google search tab */}
				{info.clientMetadata.googleTitle ? (
					<Text fontSize={14} fontWeight="semibold">
						{info.googleTitle}
					</Text>
				) : undefined}

				{/* info url should always be present */}
				{info.url ? (
					<Link fontSize={14} href={info.url} isExternal>
						{formatUrlForDisplay(info.url)}
						<ExternalLinkIcon mx="2px" />
					</Link>
				) : undefined}

				<StatusStrip info={info} />
			</Flex>
		);
	}

	function RandomUrlBox({ info }) {
		return (
			<Flex
				marginBottom={2}
				backgroundColor={constants.COLORS.PRIMARY}
				flexDirection={"column"}
				padding={2}
				borderRadius={8}
			>
				<Link fontSize={14} href={info.url} isExternal>
					{formatUrlForDisplay(info.url)}
					<ExternalLinkIcon mx="2px" />
				</Link>
				<StatusStrip info={info} />
			</Flex>
		);
	}

	function ActiveHostname({ activeTabUrl }) {
		return (
			<Flex
				marginBottom={2}
				backgroundColor={constants.COLORS.PRIMARY}
				flexDirection={"column"}
				padding={2}
				borderRadius={8}
			>
				<Text fontSize={14} fontWeight="semibold">
					{`Active on: ${findUrlName(activeTabUrl)}`}
				</Text>
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
			<ActiveHostname activeTabUrl={activeTab.tabUrl} />

			{activeTab.tabType == constants.ACTIVE_TAB_TYPES.RANDOM_TAB &&
			activeTabInfo ? (
				<RandomUrlBox info={activeTabInfo} />
			) : undefined}

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

			{/* {activeTab.tabType == constants.ACTIVE_TAB_TYPES.GOOGLE_SEARCH &&
			Object.values(urlsInfoToDisplay).length == 0 ? (
				<Flex justifyContent={"center"}>
					<Text fontSize={14}>Nothing to show</Text>
				</Flex>
			) : undefined} */}
			{activeTab.tabType == constants.ACTIVE_TAB_TYPES.GOOGLE_SEARCH
				? Object.values(urlsInfoToDisplay).map((info, index) => {
						return <GoogleUrlBox key={index} info={info} />;
				  })
				: undefined}
		</Flex>
	);
}

export default Page;
