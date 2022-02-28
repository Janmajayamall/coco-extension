import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { constants } from "../../../utils";

const initialState = {
	foundUrlsWithInfo: new Object(),
	notFoundUrlsWithInfo: new Object(),
	activeTabUrl: undefined,
	activeTabId: undefined,
};

const slice = createSlice({
	name: "urls",
	initialState,
	reducers: {
		sUpdateActiveTab(state, action) {
			state.activeTabId = action.payload.activeTabId;
			state.activeTabUrl = action.payload.activeTabUrl;
		},
		sUpdateUrlsWithInfo(state, action) {
			let urlsWithInfo = action.payload.urlsWithInfo;

			let uFoundUrlsWithInfo = {
				...state.foundUrlsWithInfo,
			};
			let uNotFoundUrlsWithInfo = {
				...state.notFoundUrlsWithInfo,
			};
			urlsWithInfo.forEach((info) => {
				if (info.qStatus == constants.QUERY_STATUS.FOUND) {
					// delete the url from "not found urls with info"
					// if exists.
					delete uNotFoundUrlsWithInfo[info.url];
					uFoundUrlsWithInfo[info.url] = info;
				} else {
					// delete the url from "found urls with info"
					// if exists.
					delete uFoundUrlsWithInfo[info.url];
					uNotFoundUrlsWithInfo[info.url] = info;
				}
			});

			state.foundUrlsWithInfo = uFoundUrlsWithInfo;
			state.notFoundUrlsWithInfo = uNotFoundUrlsWithInfo;
		},

		sClearUrlsWithInfo(state, action) {
			state.foundUrlsWithInfo = new Object();
			state.notFoundUrlsWithInfo = new Object();
		},
	},
});

export const { sUpdateActiveTab, sUpdateUrlsWithInfo, sClearUrlsWithInfo } =
	slice.actions;

export const selectActiveTabUrl = (state) => state.urls.activeTabUrl;
export const selectActiveTabId = (state) => state.urls.activeTabId;
export const selectFoundUrlsWithInfo = (state) => state.urls.foundUrlsWithInfo;
export const selectNotFoundUrlsWithInfo = (state) =>
	state.urls.notFoundUrlsWithInfo;

export default slice.reducer;
