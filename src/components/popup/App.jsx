import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import Main from "./pages/Main";
import Box from "@mui/material/Box";
import { SvgIcon } from "@mui/material";

function COCOIcon(props) {
	return (
		<SvgIcon {...props}>
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

function App() {
	return (
		<div style={{ width: 350 }}>
			<Box
				sx={{
					backgroundColor: "background.main",
					display: "flex",
					alignItems: "center",
					padding: 1,
				}}
			>
				<COCOIcon
					sx={{
						height: 25,
						width: 25,
						alignSelf: "center",
					}}
				/>
			</Box>
			<Box
				sx={{
					backgroundColor: "background.main",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",

					borderColor: "gray.100",
					padding: 1,
				}}
			>
				<Routes>
					<Route path={"/"} element={<Main />} />
				</Routes>
			</Box>
		</div>
	);
}

export default App;
