import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { MemoryRouter } from "react-router";
import { mode } from "@chakra-ui/theme-tools";
import { store } from "./redux/store";
import { Provider } from "react-redux";


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
		<Provider store={store}>
			<ChakraProvider theme={theme}>
				<App />
			</ChakraProvider>
		</Provider>
	</MemoryRouter>,
	window.document.getElementById("root")
);

if (module.hot) {
	module.hot.accept();
}
