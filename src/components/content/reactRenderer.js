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
import SvgIcon from "@mui/material/SvgIcon";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// mui theme
const darkTheme = createTheme({
	palette: {
		mode: "light",
	},
});

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

function CocoIcon(props) {
	return (
		<SvgIcon fontSize="xs" {...props}>
			<circle cx="12" cy="12" r="12" fill="#373A3E" />
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M12.0248 18.7506C15.9564 18.7506 20.6546 16.3026 20.6546 11.9259H21.075C20.9761 16.9208 16.995 20.9761 12.0248 20.9761C7.07934 20.9761 3.07352 16.9455 2.97461 12.0743C2.98913 11.3303 3.08515 10.6065 3.25446 9.91306C3.09048 9.5162 3.00002 9.08124 3.00002 8.62515C3.00002 6.90983 4.27968 5.49338 5.93643 5.27839C7.52464 3.78681 9.64378 2.87573 12.0248 2.87573C15.3135 2.87573 18.2066 4.60664 19.8633 7.40082H18.5033C16.7724 5.81828 14.3244 5.10119 12.0248 5.10119C10.7265 5.10119 9.41132 5.32518 8.20503 5.78889C9.13471 6.38997 9.75002 7.4357 9.75002 8.62515C9.75002 10.4891 8.23898 12.0002 6.37502 12.0002C5.20975 12.0002 4.18242 11.4096 3.57597 10.5115C3.45417 10.9698 3.39497 11.4413 3.39497 11.9259C3.39497 16.3274 8.11788 18.7506 12.0248 18.7506Z"
				fill="#F0F0F0"
			/>
		</SvgIcon>
	);
}
function InsertCardG({ urls }) {
	const [anchorEl, setAnchorEl] = useState(null);

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

	const handlePopperOpen = (event) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	useEffect(() => {
		if (anchorEl != undefined) {
			urlsInfoHelper();
		}
	}, [anchorEl]);

	const open = Boolean(anchorEl);
	const id = open ? "coco-popper" : undefined;

	return (
		<div>
			<div style={{ height: 15, width: 15 }}>
				<CocoIcon onClick={handlePopperOpen} />
			</div>

			<Popper id={id} open={open} anchorEl={anchorEl}>
				<Box
					sx={{
						width: 400,
						backgroundColor: "background.default",
						borderRadius: 2,
						padding: 2,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					{loading == true ? <CircularProgress size={30} /> : undefined}
					{urlsInfo.map((info) => {
						const formattedMetadata = formatMetadata(info);
						return (
							<Paper
								sx={{
									backgroundColor: "grey.100",
									borderRadius: 2,
									padding: 1,
								}}
							>
								<Stack>
									<Typography variant="body2">
										{findUrlName(formattedMetadata.url)}
									</Typography>

									<Typography variant="body1" gutterBottom>
										{truncateStrToLength(
											formattedMetadata.title,
											constants.CHAR_COUNTS.URL_TITLE
										)}
									</Typography>
									<Typography variant="body2" gutterBottom>
										{truncateStrToLength(
											formattedMetadata.description,
											constants.CHAR_COUNTS
												.URL_DESCRIPTION
										)}
									</Typography>
									<Stack direction={"row"} spacing={4}>
										{info.qStatus ==
											constants.QUERY_STATUS.FOUND &&
										info.onChainData ? (
											<Typography
												variant="body2"
												display="block"
												sx={{
													color:
														info.onChainData
															.outcome == 1
															? "success.main"
															: "error.main",
												}}
											>
												{`Status: ${
													info.onChainData.outcome ==
													1
														? "YES"
														: "NO"
												}`}
											</Typography>
										) : (
											<Typography
												variant="body2"
												display="block"
												sx={{
													color:
														info.qStatus ==
														constants.QUERY_STATUS
															.FOUND
															? "success.main"
															: "error.main",
												}}
											>
												{info.qStatus ==
												constants.QUERY_STATUS.FOUND
													? "Found"
													: "Not found"}
											</Typography>
										)}
										{info.qStatus ==
										constants.QUERY_STATUS.FOUND ? (
											<Link
												variant="body2"
												href={`${webUrl}/post/${info.post.marketIdentifier}`}
												target="_blank"
											>
												{"View on COCO"}
											</Link>
										) : (
											<Link
												variant="body2"
												href={`${webUrl}/new/${encodeURIComponent(
													info.url
												)}`}
												target="_blank"
											>
												{"Add to COCO"}
											</Link>
										)}
									</Stack>
								</Stack>
							</Paper>
						);
					})}
				</Box>
			</Popper>
		</div>
	);
}

function InsertCard({ urls }) {
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
			<ThemeProvider theme={darkTheme}>
				<InsertCardG urls={urls} />
			</ThemeProvider>
		</React.StrictMode>,
		root.getElementById("root")
	);
}

export function renderTwitter(rootSpan, urls) {
	ReactDOM.render(
		<React.StrictMode>
			<ThemeProvider theme={darkTheme}>
				<InsertCardG urls={urls} />
			</ThemeProvider>
		</React.StrictMode>,
		root.getElementById("root")
	);
}
