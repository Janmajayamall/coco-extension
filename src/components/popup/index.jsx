import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { MemoryRouter } from "react-router";
import { mode } from "@chakra-ui/theme-tools";

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

ReactDOM.render(
	<MemoryRouter>
		<ChakraProvider theme={theme}>
			<App />
		</ChakraProvider>
	</MemoryRouter>,
	window.document.getElementById("root")
);

if (module.hot) {
	module.hot.accept();
}
