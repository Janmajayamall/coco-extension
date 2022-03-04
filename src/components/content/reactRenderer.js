import reactDom from "@hot-loader/react-dom";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
	ChakraProvider,
	Text,
	Flex,
	Popover,
	PopoverTrigger,
	Portal,
	PopoverContent,
	Spinner,
	extendTheme,
	Tag,
	Spacer,
	Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { mode } from "@chakra-ui/theme-tools";
import {
	findUrlName,
	getUrlsInfo,
	webUrl,
	constants,
	truncateStrToLength,
} from "../utils";
import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";

// chakra ui theme
const theme = extendTheme({
	styles: {
		global: (props) => ({
			body: {
				bg: mode("#edf2f7", "#edf2f7")(props),
			},
		}),
	},
});

// Priority for metadata is given in following order:
// Twitter -> Open Graph -> Normal
function formatMetadata(info) {
	let final = {};

	let metadata = info.metadata;
	if (metadata.twitterTitle != undefined) {
		final.title = metadata.twitterTitle;
	} else if (metadata.ogTitle != undefined) {
		final.title = metadata.ogTitle;
	}

	if (metadata.twitterDescription != undefined) {
		final.description = metadata.twitterDescription;
	} else if (metadata.ogDescription != undefined) {
		final.description = metadata.ogDescription;
	}

	if (metadata.twitterImage != undefined) {
		final.imageUrl = metadata.twitterImage.url;
	} else if (metadata.ogImage != undefined) {
		final.imageUrl = metadata.ogImage.url;
	}

	final.url = info.url;

	return final;
}

function InsertCardG({ url }) {
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleClick = (event) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	const open = Boolean(anchorEl);
	const id = open ? "simple-popper" : undefined;

	return (
		<div>
			<button aria-describedby={id} type="button" onClick={handleClick}>
				Toggle
			</button>
			<Popper id={id} open={open} anchorEl={anchorEl}>
				<Box sx={{ border: 1, p: 1, bgcolor: "background.paper" }}>
					The content of the Popper.
				</Box>
			</Popper>
		</div>
	);
}

function InsertCard({ urls }) {
	const [urlsInfo, setUrlsInfo] = useState([]);

	const [loading, setLoading] = useState(false);

	async function urlsInfoHelper() {
		try {
			if (urls.length == 0 || urlsInfo.length != 0) {
				return;
			}
			setLoading(true);
			const res = await getUrlsInfo(urls);
			if (res == undefined) {
				return;
			}
			setUrlsInfo(res.urlsInfo);
			setLoading(false);
		} catch (e) {
			setLoading(false);
		}
	}

	return (
		<Popover onOpen={urlsInfoHelper} isLazy={true}>
			<PopoverTrigger>
				<Text>COCO</Text>
			</PopoverTrigger>

			<Portal>
				<PopoverContent minW={400}>
					<Flex flexDirection={"column"}>
						{loading == true ? <Spinner /> : undefined}
						{urls.length == 0 ? (
							<Text>No link found</Text>
						) : undefined}
						{urlsInfo.map((info) => {
							const formattedMetadata = formatMetadata(info);
							return (
								<Flex
									padding={2}
									backgroundColor={constants.COLORS.PRIMARY}
									borderRadius={8}
									marginBottom={4}
									flexDirection={"column"}
								>
									<Text fontSize={13}>
										{findUrlName(formattedMetadata.url)}
									</Text>
									<Text fontSize={15}>
										{truncateStrToLength(
											formattedMetadata.title,
											constants.CHAR_COUNTS.URL_TITLE
										)}
									</Text>
									<Text fontSize={13}>
										{truncateStrToLength(
											formattedMetadata.description,
											constants.CHAR_COUNTS
												.URL_DESCRIPTION
										)}
									</Text>
									<Flex marginTop={1}>
										{info.qStatus ==
											constants.QUERY_STATUS.FOUND &&
										onChainData.outcome ? (
											<Tag
												size={"md"}
												variant="solid"
												colorScheme={
													onChainData.outcome == 1
														? "green"
														: "red"
												}
											>
												{`Status: ${
													onChainData.outcome == 1
														? "YES"
														: "NO"
												}`}
											</Tag>
										) : (
											<Tag
												size={"md"}
												variant="solid"
												colorScheme={
													info.qStatus ==
													constants.QUERY_STATUS.FOUND
														? "green"
														: "red"
												}
											>
												{info.qStatus ==
												constants.QUERY_STATUS.FOUND
													? "Found"
													: "Not found"}
											</Tag>
										)}
										<Spacer />
										{info.qStatus ==
										constants.QUERY_STATUS.FOUND ? (
											<Link
												fontSize={13}
												fontWeight="semibold"
												href={`${webUrl}/post/${info.post.marketIdentifier}`}
												isExternal
											>
												{"View on COCO"}
												<ExternalLinkIcon mx="2px" />
											</Link>
										) : (
											<Link
												fontSize={13}
												fontWeight="semibold"
												// appends googleTitle if the link to
												// be added is from google search
												href={`${webUrl}/new/${encodeURIComponent(
													info.url
												)}`}
												isExternal
											>
												{"Add to COCO"}
												<ExternalLinkIcon mx="2px" />
											</Link>
										)}
									</Flex>
								</Flex>
							);
						})}
					</Flex>
				</PopoverContent>
			</Portal>
		</Popover>
	);
}

export function setupShadowRoot(root) {
	// setup Material UI links
	let link = document.createElement("link");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute(
		"href",
		"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
	);
	root.appendChild(link);

	// add div with id "root" for react
	let div = document.createElement("div");
	div.setAttribute("id", "root");
	div.innerHTML = "JDIAWJDOI";
	root.appendChild(div);
}

export function renderGoogle(root, urls) {
	ReactDOM.render(
		<React.StrictMode>
			<InsertCardG urls={urls} />
		</React.StrictMode>,
		root.getElementById("root")
	);
}

export function renderTwitter(rootSpan, urls) {
	ReactDOM.render(
		<React.StrictMode>
			<ChakraProvider theme={theme}>
				<InsertCardG urls={urls} />
			</ChakraProvider>
		</React.StrictMode>,
		root.getElementById("root")
	);
}
