import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Flex, Link, Spacer, Text } from "@chakra-ui/react";
import { COLORS } from "../utils";

function Page() {
	return (
		<Flex flexDirection={"column"} width={"100%"} marginTop={2}>
			<Flex
				marginBottom={2}
				backgroundColor={COLORS.PRIMARY}
				flexDirection={"column"}
				padding={2}
				borderRadius={8}
			>
                
				<Text fontSize={13} marginBottom={1} fontWeight="semibold">
					www.gooogle.commdmoidmwodimwmdomom
				</Text>
				<Flex>
					<Link
						fontSize={12}
						href={"https://cocosafeapp.efprivacyscaling.org/app/"}
						isExternal
					>
						{"Visit page!"}
						<ExternalLinkIcon mx="2px" />
					</Link>
					<Spacer />
					<Text>Status</Text>
				</Flex>
			</Flex>
		</Flex>
	);
}

export default Page;
