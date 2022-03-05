import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Flex, Link, Spacer, Text, Tag, Switch } from "@chakra-ui/react";
import {
	constants,
	filterUrls,
	getUrlsInfo,
	findAllDOMLinks,
	webUrl,
	truncateStrToLength,
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
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MetadataDisplay from "../../shared/MetadataDisplay";

function Page() {
	const dispatch = useDispatch();

	const activeTab = useSelector(selectActiveTab);
	const activeTabInfo = useSelector(selectActiveTabInfo);
	const urlsInfoToDisplay = useSelector(selectUrlsInfoToDisplay);

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
			if (activeTab.tabType == constants.URL_TYPES.RANDOM) {
				const res = await getUrlsInfo(filterUrls([activeTab.tabUrl]));
				if (res == undefined || res.urlsInfo.length == 0) {
					return;
				}

				dispatch(
					sUpdateActiveTabInfo({
						activeTabInfo: res.urlsInfo[0],
					})
				);
			}

			// call add URL for active tab
			// await addUrls(filterUrls([activeTab.tabUrl]));
		}
	}, [activeTab]);

	async function addUrls(urls) {
		if (urls.length == 0) {
			return;
		}

		const res = await getUrlsInfo(urls);
		if (res == undefined) {
			return;
		}

		// update urls to display
		dispatch(
			sUpdateUrlsInfoToDisplay({
				urlsInfoToDisplay: res.urlsInfo,
			})
		);
	}

	function ActiveHostname({ activeTabUrl }) {
		return (
			<Paper
				sx={{
					padding: 1,
					marginBottom: 1,
					width: "100%",
				}}
				elevation={1}
			>
				<Typography fontWeight={"semibold"} variant="body1">
					{`Active on: ${findUrlName(activeTabUrl)}`}
				</Typography>
			</Paper>
		);
	}

	return (
		<Box
			sx={{
				display: "flex",
				flex: 1,
				padding: 1,
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<ActiveHostname activeTabUrl={activeTab.tabUrl} />

			{activeTab.tabType == constants.URL_TYPES.RANDOM &&
			activeTabInfo ? (
				<MetadataDisplay info={activeTabInfo} />
			) : undefined}
		</Box>
	);
}

export default Page;
