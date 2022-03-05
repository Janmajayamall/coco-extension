import React from "react";
import {
	formatMetadata,
	findUrlName,
	constants,
	truncateStrToLength,
	webUrl,
} from "./../utils";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";

function MetadataDisplay({ info }) {
	const formattedMetadata = formatMetadata(info);
	return (
		<Paper
			sx={{
				backgroundColor: "grey.100",
				borderRadius: 2,
				padding: 1,
				width: "100%",
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
						constants.CHAR_COUNTS.URL_DESCRIPTION
					)}
				</Typography>
				<Stack direction={"row"} spacing={4}>
					{info.qStatus == constants.QUERY_STATUS.FOUND &&
					info.onChainData ? (
						<Typography
							variant="body2"
							display="block"
							sx={{
								color:
									info.onChainData.outcome == 1
										? "success.main"
										: "error.main",
							}}
						>
							{`Status: ${
								info.onChainData.outcome == 1 ? "YES" : "NO"
							}`}
						</Typography>
					) : (
						<Typography
							variant="body2"
							display="block"
							sx={{
								color:
									info.qStatus == constants.QUERY_STATUS.FOUND
										? "success.main"
										: "error.main",
							}}
						>
							{info.qStatus == constants.QUERY_STATUS.FOUND
								? "Found"
								: "Not found"}
						</Typography>
					)}
					{info.qStatus == constants.QUERY_STATUS.FOUND ? (
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
}

export default MetadataDisplay;
