import { Icon, Spacer, Spinner, Stack, Text } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { FaCheck, FaExclamation } from "react-icons/fa6";

type ChapterProps = {
	chapterNumber: number;
	chapterTitle: string;
	searchQuery: string;
	onError: Function;
	onComplete: Function;
	ref: any;
};

const CreateCourseChapter = forwardRef(
	(
		{
			chapterNumber,
			chapterTitle,
			searchQuery,
			onError,
			onComplete,
		}: ChapterProps,
		ref
	) => {
		const fetcher = useFetcher();

		useImperativeHandle(ref, () => ({
			triggerLoad() {
				const formData = new FormData();
				formData.append("final_data", "false");
				formData.append("chapter_title", chapterTitle);
				formData.append("youtube_search_query", searchQuery);
				fetcher.submit(formData, { method: "post" });
			},
		}));

		useEffect(() => {
			if (fetcher.data) {
				if (fetcher.data.success == false) {
					onError();
				} else {
					onComplete(fetcher.data.chapterInfo);
				}
			}
		}, [fetcher]);

		return (
			<Stack
				direction={"row"}
				bg={
					fetcher.data
						? fetcher.data.success
							? "green.800"
							: "red.800"
						: "whiteAlpha.300"
				}
				borderRadius={"lg"}
				py={2}
				px={4}
				align="center"
			>
				<Text fontWeight={"bold"}>
					Chapter {chapterNumber + 1}: {chapterTitle}
				</Text>
				<Spacer />
				{fetcher.data ? (
					fetcher.data.success ? (
						<Icon boxSize={5} as={FaCheck} />
					) : (
						<Icon boxSize={5} as={FaExclamation} />
					)
				) : (
					<Spinner
						boxSize={5}
						display={fetcher.state == "submitting" ? "block" : "none"}
					/>
				)}
			</Stack>
		);
	}
);

export default CreateCourseChapter;
