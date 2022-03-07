import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getUrlsInfo } from "../utils";
import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import SvgIcon from "@mui/material/SvgIcon";
import CircularProgress from "@mui/material/CircularProgress";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MetadataDisplay from "../shared/MetadataDisplay";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

// mui theme
const muiTheme = createTheme({
	palette: {
		mode: "light",
	},
});

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
function InsertCard({ urls }) {
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
		event.stopPropagation();
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
			<div style={{ height: 18, width: 18 }}>
				<CocoIcon onClick={handlePopperOpen} />
			</div>

			<Popper id={id} open={open} anchorEl={anchorEl}>
				<ClickAwayListener onClickAway={handlePopperOpen}>
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
						{urls.length == 0 ? (
							<Paper
								sx={{
									backgroundColor: "grey.100",
									borderRadius: 2,
									padding: 1,
									width: "100%",
								}}
							>
								<Typography variant="body2">
									No link found
								</Typography>
							</Paper>
						) : undefined}
						{loading == true ? (
							<CircularProgress size={30} />
						) : undefined}
						{urlsInfo.map((info, index) => {
							return <MetadataDisplay key={index} info={info} />;
						})}
					</Box>
				</ClickAwayListener>
			</Popper>
		</div>
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
	div.setAttribute(
		"style",
		`
		display: flex;
		align-items: center;
		`
	);
	root.appendChild(div);
}

export function renderGoogle(root, urls) {
	ReactDOM.render(
		<React.StrictMode>
			<ThemeProvider theme={muiTheme}>
				<InsertCard urls={urls} />
			</ThemeProvider>
		</React.StrictMode>,
		root.getElementById("root")
	);
}

export function renderTwitter(root, urls) {
	ReactDOM.render(
		<React.StrictMode>
			<ThemeProvider theme={muiTheme}>
				<InsertCard urls={urls} />
			</ThemeProvider>
		</React.StrictMode>,
		root.getElementById("root")
	);
}
