import reactDom from "@hot-loader/react-dom";
import React from "react";
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
} from "@chakra-ui/react";

function GoogleSearchStrip({ info }) {
	return (
		<Flex backgroundColor={"whatsapp.100"}>
			<Text>Status: YES</Text>
			<Spacer />
			<Text>Visit</Text>
		</Flex>
	);
}
function TwitterCard({ urls }) {
	return (
		<Flex>
			<Popover>
				<PopoverTrigger>
					<Text>COCO</Text>
				</PopoverTrigger>

				<PopoverContent>
					<Flex flexDirection={"column"}>
						{urls.map((u) => {
							return <Text>{u}</Text>;
						})}
					</Flex>
				</PopoverContent>
			</Popover>
		</Flex>
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
