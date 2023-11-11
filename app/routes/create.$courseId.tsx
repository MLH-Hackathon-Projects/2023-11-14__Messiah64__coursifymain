import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Divider,
	Heading,
	Stack,
	Text,
	Step,
	StepIcon,
	StepIndicator,
	StepNumber,
	StepSeparator,
	StepStatus,
	StepTitle,
	Stepper,
	useSteps,
	IconButton,
	Icon,
} from "@chakra-ui/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	FaCheck,
	FaChevronRight,
	FaEnvelope,
	FaChevronLeft,
	FaBars,
} from "react-icons/fa6";
import CreateCourseChapter from "src/components/CreateCourseChapter";
import { db } from "src/utils/firebase";
import {
	getCourse,
	getTranscript,
	promptPalm,
	searchYouTube,
} from "~/models/course.server";

export const loader = async ({ params }: LoaderArgs) => {
	const data = await getCourse(params.courseId as string);
	if (data.error) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	} else {
		return json({
			params: params,
			data: await getCourse(params.courseId as string),
		});
	}
};

export const action = async ({ request }: ActionArgs) => {
	try {
		const formData = await request.formData();
		const final_data = formData.get("final_data") as string;
		if (final_data == "true") {
			const courseInfo = JSON.parse(formData.get("courseInfo") as string);
			const courseId = formData.get("courseId") as string;
			const imageResponseRaw = await fetch(
				`https://api.unsplash.com/search/photos?per_page=1&query=${courseInfo.title}&client_id=${process.env.UNSPLASH_API}`
			);
			const imageResponse = await imageResponseRaw.json();
			courseInfo.image = imageResponse.results[0].urls.small_s3;
			await updateDoc(doc(db, "courses", courseId), courseInfo);
			return redirect(`/course/${courseId}/0/0`);
		} else {
			let chapter_title = formData.get("chapter_title") as string;
			let youtube_search_query = formData.get("youtube_search_query") as string;
			const videoId = await searchYouTube(youtube_search_query);
			const transcript = await getTranscript(videoId);
			const summaryPrompt = `summarize in 250 words or less and don't talk of the sponsors or anything unrelated to the main topic. also do not introduce what the summary is about:\n${transcript}`;
			let summary;
			let gotSummary = false;
			let triedSummary = 0;
			while (!gotSummary) {
				if (triedSummary < 5) {
					try {
						summary = await promptPalm(summaryPrompt);
						gotSummary = true;
						console.log("got summary");
					} catch (error) {
						console.log("FAILED: Error Info getting summary");
						console.log("prompt:\n", summaryPrompt);
						console.log("error:\n", error, "\n\n");
					}
					triedSummary++;
				} else {
					throw new Error("tried getting summary too many times");
				}
			}

			let quizPrompt = `${transcript}\n
			Generate at least a 3 question educational informative quiz on the text given above. The questions should be on the material of the entire transcript as a whole. The question should be knowledgeable and not about the specifics. The question should relate to ${chapter_title}. The output has to be an array of questions. Each question should have a question, which is a string question, the choices, which is 4 possible answer choices represented in an array, and the answer, which is the index of the answer in the choices array.

			Here is an example answer:
			[
			{
				"question": "What is (sqrt(16)+5-4)/1/24",
				"choices": ["100", "120", "40", "12"],
				"answer": 1
			},
			{
				"question": "What is a forrier trnasformation?",
				"choices": ["a transform that converts a function into a form that describes the frequencies present in the original function", "infinite sum of terms that approximate a function as a polynomial", "mathematical function that can be formally defined as an improper Riemann integral", "certain kind of approximation of an integral by a finite sum"],
				"answer": 0
			}
			]`;
			let quizJSON;
			let gotQuiz = false;
			let triedQuiz = 0;
			while (!gotQuiz) {
				if (triedQuiz < 5) {
					try {
						let quiz = await promptPalm(quizPrompt);
						console.log("got palm quiz response");
						const quizFragments = quiz.split("[");
						let quizString = "";
						for (const i in quizFragments) {
							if (Number(i) == 0) {
							} else {
								if (Number(i) == quizFragments.length - 1) {
									quizString += "[";
									quizString += quizFragments[i].split("`")[0];
								} else {
									quizString += "[";
									quizString += quizFragments[i];
								}
							}
						}
						console.log("about to parse quiz");
						quizJSON = await JSON.parse(quizString);
						gotQuiz = true;
						console.log("parsed quiz");
					} catch (error) {
						console.log("FAILED: Error Info getting guiz");
						console.log("prompt:\n", quizPrompt);
						console.log("error:\n", error, "\n\n");
					}
					triedQuiz++;
				} else {
					throw new Error("tried getting quiz too many times");
				}
			}
			return {
				success: true,
				chapterInfo: {
					title: chapter_title,
					video: videoId,
					summary: summary,
					quiz: quizJSON,
				},
			};
		}
	} catch (error) {
		console.error(error);
		return {
			success: false,
		};
	}
};

export default function FinishCourse() {
	const { params, data } = useLoaderData<typeof loader>();

	const [isErrored, setIsErrored] = useState(false);
	const [isLoading, setIsLoading] = useState<string[]>([]);
	const [finalData, setFinalData] = useState<any[][]>([]);
	const [allDone, setAllDone] = useState(false);

	const elementsRefs: any = data.units.map((unit: any) =>
		unit.chapters.map(() => useRef())
	);

	useEffect(() => {
		if (finalData.length === 0) {
			setFinalData(
				data.units.map((unit: any) =>
					unit.chapters.map(() => {
						return {};
					})
				)
			);
		}
	}, [finalData]);

	const navigate = useNavigate();

	const generateChapterInfos = useCallback(() => {
		setIsErrored(false);
		data.units.forEach((unit: any, i: number) => {
			unit.chapters.forEach((chapter: any, j: number) => {
				elementsRefs[i][j].current.triggerLoad();
				setIsLoading((prev) => [...prev, `${i} ${j}`]);
			});
		});
	}, []);

	const steps = [
		{ title: "First", description: "Enter Units" },
		{ title: "Second", description: "Confirm Chapters" },
		{ title: "Third", description: "Save & Finish" },
	];

	const { activeStep, setActiveStep } = useSteps({
		index: 1,
		count: steps.length,
	});

	const onComplete = () => {
		setAllDone(true);
		setActiveStep(2);
	};

	const fetcher = useFetcher();

	const saveAndFinish = () => {
		const newLoading = isLoading;
		newLoading.push("submitting");
		setIsLoading(newLoading);
		const formattedData = {
			title: data.title,
			public: true,
			completed: true,
			units: [
				...data.units.map((unit: any, i: number) => {
					return {
						title: unit.title,
						chapters: [
							...unit.chapters.map(
								(chapter: any, j: number) => finalData[i][j]
							),
						],
					};
				}),
			],
		};
		const formData = new FormData();
		formData.append("final_data", "true");
		formData.append("courseId", params.courseId);
		formData.append("courseInfo", JSON.stringify(formattedData));
		fetcher.submit(formData, { method: "post" });
	};

	return (
		<Stack margin="auto" maxW="xl" p={8} h="calc(100vh - 90px)" spacing={4}>
			<Stepper size="sm" index={activeStep}>
				{steps.map((step, index) => (
					<Step key={index}>
						<Stack align={"center"}>
							<StepIndicator>
								<StepStatus
									complete={<StepIcon />}
									incomplete={<StepNumber />}
									active={<StepNumber />}
								/>
							</StepIndicator>

							<Box textAlign={"center"} flexShrink="0">
								<StepTitle>{step.description}</StepTitle>
							</Box>
						</Stack>

						<StepSeparator />
					</Step>
				))}
			</Stepper>

			<Divider />

			<Stack spacing={0}>
				<Text
					color="whiteAlpha.600"
					fontWeight="semibold"
					letterSpacing="wide"
					fontSize="xs"
					textTransform="uppercase"
				>
					Course Name:
				</Text>
				<Heading size="xl">{data.title}</Heading>D
			</Stack>

			<Box>
				<Alert status="info" borderRadius={"lg"}>
					<AlertIcon />
					<Text fontSize={{ base: "sm", md: "md" }}>
						We generated chapters for each of your units. Look over them and
						then click the "Finish Course Generation" button to confirm and
						continue.
					</Text>
				</Alert>
			</Box>

			{data.units.map((unit: any, i: number) => (
				<Stack key={i}>
					<Stack spacing={0}>
						<Text
							color="whiteAlpha.600"
							fontWeight="semibold"
							letterSpacing="wide"
							fontSize="xs"
							textTransform="uppercase"
						>
							Unit {i + 1}:
						</Text>
						<Heading size="md">{unit.title}</Heading>
					</Stack>
					<Stack spacing={2}>
						{unit.chapters.map((chapter: any, j: number) => (
							<CreateCourseChapter
								key={`${i}${j}`}
								chapterTitle={chapter.chapter_title}
								chapterNumber={j}
								searchQuery={chapter.youtube_search_query}
								ref={elementsRefs[i][j]}
								onError={() => {
									setIsErrored(true);
									setIsLoading((prev) =>
										prev.splice(prev.indexOf(`${i} ${j}`), 1)
									);
								}}
								onComplete={(chapterInfo: any) => {
									const newLoading = isLoading;
									if (newLoading.indexOf(`${i} ${j}`) !== -1) {
										newLoading.splice(newLoading.indexOf(`${i} ${j}`), 1);
										setIsLoading(newLoading);
									}

									const updatedData = finalData;
									updatedData[i][j] = chapterInfo;
									setFinalData(updatedData);

									if (isLoading.length == 0 && !allDone) {
										onComplete();
									}
								}}
							/>
						))}
					</Stack>
				</Stack>
			))}
			{isErrored && (
				<Alert status="error" borderRadius={"lg"}>
					<AlertIcon />
					<Text fontSize={{ base: "sm", md: "md" }}>
						An error occurred while creating one of your chapters. Click the
						"Contact Us" button to report the issue.
					</Text>
				</Alert>
			)}

			<Stack direction={"row"} pb={8} align="center" spacing={4}>
				<Divider orientation="horizontal" />
				<Box>
					<Button
						leftIcon={<FaChevronLeft />}
						onClick={() => {
							navigate(-1);
						}}
					>
						Back
					</Button>
				</Box>
				<Box>
					<Button
						rightIcon={
							isErrored ? (
								<FaEnvelope />
							) : allDone ? (
								<FaCheck />
							) : (
								<FaChevronRight />
							)
						}
						onClick={
							isErrored
								? () => navigate("/contact")
								: allDone
								? saveAndFinish
								: generateChapterInfos
						}
						colorScheme={isErrored ? "red" : allDone ? "green" : "blue"}
						isLoading={isLoading.length > 0}
						loadingText={allDone ? "Saving" : "Generating"}
					>
						{isErrored ? "Contact Us" : allDone ? "Save & Finish" : "Generate"}
					</Button>
				</Box>
				<Divider orientation="horizontal" />
			</Stack>
		</Stack>
	);
}
