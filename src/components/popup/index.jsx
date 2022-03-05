import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { MemoryRouter } from "react-router";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// mui theme
const muiTheme = createTheme({
	palette: {
		mode: "light",
	},
});

ReactDOM.render(
	<MemoryRouter>
		<Provider store={store}>
			<ThemeProvider theme={muiTheme}>
				<App />
			</ThemeProvider>
		</Provider>
	</MemoryRouter>,
	window.document.getElementById("root")
);

if (module.hot) {
	module.hot.accept();
}
