import reactDom from "@hot-loader/react-dom";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
	ChakraProvider,
	Text,
	Flex,
	Popover,
	PopoverTrigger,
	Button,
	Portal,
	PopoverContent,
	PopoverHeader,
	PopoverCloseButton,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	Spinner,
} from "@chakra-ui/react";
import { getUrlsInfo } from "../utils";

function GoogleSearchStrip({ info }) {
	return (
		<Flex backgroundColor={"whatsapp.100"}>
			<Text>Status: YES</Text>
			<Spacer />
			<Text>Visit</Text>
		</Flex>
	);
}

function twitterMetadata(info) {
	let final = {};

	let metadata = info.metadata;
	if (metadata.twitterTitle != undefined) {
		final.title = metadata.twitterTitle;
	} else if (metadata.ogTitle != undefined) {
		final.title = ogTitle;
	}

	if (metadata.twitterDescription != undefined) {
		final.description = metadata.twitterDescription;
	} else if (metadata.ogDescription != undefined) {
		final.description = metadata.ogDescription;
	}

	if (metadata.twitterImage != undefined) {
		final.imageUrl = metadata.twitterImage.url;
	} else if (metadata.ogTitle != undefined) {
		final.imageUrl = metadata.ogImage.url;
	}

	final.url = info.url;

	return final;
}

function TwitterCard({ urls }) {
	const [urlsInfo, setUrlsInfo] = useState([]);

	const [loading, setLoading] = useState(false);

	async function urlsInfoHelper() {
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
	}

	return (
		<Popover onOpen={urlsInfoHelper} isLazy={true}>
			<PopoverTrigger>
				<Text>COCO</Text>
			</PopoverTrigger>

			<Portal>
				<PopoverContent background={"white"}>
					<Flex background={"white"} flexDirection={"column"}>
						{urlsInfo.length == 0 ? <Spinner /> : undefined}
						<Text>Content</Text>
						{urlsInfo.map((info) => {
							const twitterData = twitterMetadata(info);
							return (
								<Flex flexDirection={"column"}>
									<Text>{twitterData.title}</Text>
									<Text>{twitterData.description}</Text>
								</Flex>
							);
						})}
					</Flex>
				</PopoverContent>
			</Portal>
		</Popover>
	);
}

export function renderReact(elementId, info) {
	ReactDOM.render(
		<React.StrictMode>
			<GoogleSearchStrip info={info} />
		</React.StrictMode>,
		document.getElementById(elementId)
	);
}

export function renderTwitterCard(rootSpan, urls) {
	ReactDOM.render(
		<React.StrictMode>
			<ChakraProvider>
				<TwitterCard urls={urls} />
			</ChakraProvider>
		</React.StrictMode>,
		rootSpan.shadowRoot
	);
}
