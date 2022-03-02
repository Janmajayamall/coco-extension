import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { constants } from "../../../utils";

const initialState = {
	foundUrlsWithInfo: new Object(),
	notFoundUrlsWithInfo: new Object(),
	urlsInfoToDisplay: new Object(),
	activeTab: {
		tabUrl: undefined,
		tabId: undefined,
		tabType: "NONE",
	},
	activeTabInfo: undefined,
};

const slice = createSlice({
	name: "urls",
	initialState,
	reducers: {
		sUpdateActiveTab(state, action) {
			state.activeTab = {
				...action.payload.activeTab,
			};
		},
		sUpdateActiveTabInfo(state, action) {
			state.activeTabInfo = {
				...action.payload.activeTabInfo,
			};
		},
		sUpdateUrlsInfoToDisplay(state, action) {
			let update = {
				...state.urlsInfoToDisplay,
			};
			action.payload.urlsInfoToDisplay.forEach((obj) => {
				update[obj.url] = obj;
			});
			state.urlsInfoToDisplay = update;
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
				// if info.url is active tab then set and return
				if (info.url == state.activeTabUrl) {
					delete uNotFoundUrlsWithInfo[info.url];
					delete uFoundUrlsWithInfo[info.url];
					// set info of active tab url
					state.activeTabInfo = info;
					return;
				}

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

export const {
	sUpdateActiveTab,
	sUpdateUrlsWithInfo,
	sClearUrlsWithInfo,
	sUpdateUrlsInfoToDisplay,
	sUpdateActiveTabInfo,
} = slice.actions;

export const selectActiveTab = (state) => state.urls.activeTab;
export const selectActiveTabInfo = (state) => state.urls.activeTabInfo;
export const selectFoundUrlsWithInfo = (state) => state.urls.foundUrlsWithInfo;
export const selectNotFoundUrlsWithInfo = (state) =>
	state.urls.notFoundUrlsWithInfo;
export const selectUrlsInfoToDisplay = (state) => state.urls.urlsInfoToDisplay;

export default slice.reducer;
