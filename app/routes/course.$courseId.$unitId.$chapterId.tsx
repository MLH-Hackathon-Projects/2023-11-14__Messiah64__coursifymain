import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getCourse } from "~/models/course.server";
import {
	Alert,
	AlertIcon,
	AspectRatio,
	Box,
	Button,
	Divider,
	Heading,
	Icon,
	LinkBox,
	LinkOverlay,
	Spacer,
	Stack,
	Text,
} from "@chakra-ui/react";
import Question from "../../src/components/Question";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import CourseSidebar from "src/components/CourseSidebar";
import { useState } from "react";

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

export default function PostSlug() {
	const { params, data } = useLoaderData<typeof loader>();

	const chapterInfo = data.units[params.unitId].chapters[params.chapterId];

	const [answers, setAnswers] = useState(
		Array.from(chapterInfo.quiz, () => "")
	);

	const [alert, setAlert] = useState("");

	const [percentCorrect, setPercentCorrect] = useState(0);

	const submitQuiz = () => {
		const newAnswers = [...answers];
		answers.forEach((answer, index) => {
			newAnswers[index] =
				chapterInfo.quiz[index].answer.toString() === answer ||
				answer === "correct"
					? "correct"
					: "incorrect";
		});
		setAnswers(newAnswers);

		const percentCorrect =
			(Object.fromEntries([
				...newAnswers.reduce(
					(map, key) => map.set(key, (map.get(key) || 0) + 1),
					new Map()
				),
			])["correct"]
				? Object.fromEntries([
						...newAnswers.reduce(
							(map, key) => map.set(key, (map.get(key) || 0) + 1),
							new Map()
						),
				  ])["correct"]
				: 0) / newAnswers.length;

		setPercentCorrect(percentCorrect);

		setAlert(
			`${percentCorrect > 0.8 ? "Woohoo! " : ""}You got ${(
				percentCorrect * 100
			).toFixed(2)}% correct${percentCorrect > 0.8 ? "!" : ". Try again!"}`
		);
	};

	return (
		<Stack direction={"row"} h="100%">
			<CourseSidebar data={data} params={params} />
			<Box overflowY={"scroll"} p={8} w="100%">
				<Stack w="100%" h="100%">
					<Stack direction={{ base: "column", md: "row" }} spacing={8}>
						<Stack w="100%">
							<Stack spacing={0}>
								<Box
									color="whiteAlpha.600"
									fontWeight="semibold"
									letterSpacing="wide"
									fontSize="xs"
									textTransform="uppercase"
								>
									Unit {params.unitId + 1} &bull; Chapter {params.chapterId + 1}
								</Box>
								<Heading> {chapterInfo.title}</Heading>
							</Stack>

							<AspectRatio
								overflow="clip"
								borderRadius="md"
								w="100%"
								maxH="sm"
								ratio={16 / 9}
							>
								<iframe
									title="chapter video"
									src={`https://www.youtube.com/embed/${
										chapterInfo.video ? chapterInfo.video : chapterInfo.video_id
									}`}
									allowFullScreen
								/>
							</AspectRatio>

							<Heading size="lg">Video Summary</Heading>
							<Text>
								{chapterInfo.summary
									? chapterInfo.summary
									: chapterInfo.video_summary}
							</Text>
						</Stack>

						<Stack w={{ base: "100%", md: "xl" }}>
							<Heading size="lg">Knowledge Check</Heading>
							{chapterInfo.quiz.map((question: any, index: number) => (
								<Question
									correct={answers[index] === "correct"}
									incorrect={answers[index] === "incorrect"}
									question={question}
									onChange={(newValue: string) => {
										const newAnswers = [...answers];
										newAnswers[index] = newValue;
										setAnswers(newAnswers);
									}}
									key={index}
								/>
							))}
							<Button onClick={submitQuiz}>Submit</Button>
							{alert.length > 0 ? (
								<Box>
									<Alert
										status={percentCorrect > 0.8 ? "success" : "error"}
										borderRadius={"md"}
									>
										<AlertIcon />
										<Text fontSize={{ base: "sm", md: "md" }}>{alert}</Text>
									</Alert>
								</Box>
							) : (
								""
							)}
						</Stack>
					</Stack>
					<Spacer />
					<Divider />
					<Stack direction="row" pb={8}>
						{data.units[params.unitId].chapters[+params.chapterId - 1] ? (
							<LinkBox>
								<Stack direction={"row"} align="center">
									<Icon as={FaChevronLeft} />
									<Stack justify="start" spacing={0}>
										<Text textAlign="left">Previous</Text>
										<Heading size="md" textAlign="left">
											<LinkOverlay
												as={Link}
												to={`/course/${params.courseId}/${params.unitId}/${
													+params.chapterId - 1
												}`}
											>
												{
													data.units[params.unitId].chapters[
														+params.chapterId - 1
													].title
												}
											</LinkOverlay>
										</Heading>
									</Stack>
								</Stack>
							</LinkBox>
						) : params.unitId > 0 ? (
							<LinkBox>
								<Stack direction={"row"} align="center">
									<Icon as={FaChevronLeft} />
									<Stack justify="start" spacing={0}>
										<Text textAlign="left">Previous</Text>
										<Heading size="md" textAlign="left">
											<LinkOverlay
												as={Link}
												to={`/course/${params.courseId}/${+params.unitId - 1}/${
													data.units[+params.unitId - 1].chapters.length - 1
												}`}
											>
												{
													data.units[+params.unitId - 1].chapters[
														data.units[+params.unitId - 1].chapters.length - 1
													].title
												}
											</LinkOverlay>
										</Heading>
									</Stack>
								</Stack>
							</LinkBox>
						) : (
							""
						)}
						<Spacer />
						{data.units[params.unitId].chapters.length ==
						+params.chapterId + 1 ? (
							data.units.length == +params.unitId + 1 ? (
								""
							) : (
								<LinkBox>
									<Stack direction={"row"} align="center">
										<Stack justify="end" spacing={0}>
											<Text textAlign="right">Next</Text>
											<Heading size="md" textAlign="right">
												<LinkOverlay
													as={Link}
													to={`/course/${params.courseId}/${
														+params.unitId + 1
													}/0`}
												>
													{data.units[+params.unitId + 1].chapters[0].title}
												</LinkOverlay>
											</Heading>
										</Stack>
										<Icon as={FaChevronRight} />
									</Stack>
								</LinkBox>
							)
						) : (
							<LinkBox>
								<Stack direction={"row"} align="center">
									<Stack justify="end" spacing={0}>
										<Text textAlign="right">Next</Text>
										<Heading size="md" textAlign="right">
											<LinkOverlay
												as={Link}
												to={`/course/${params.courseId}/${params.unitId}/${
													+params.chapterId + 1
												}`}
											>
												{
													data.units[params.unitId].chapters[
														+params.chapterId + 1
													].title
												}
											</LinkOverlay>
										</Heading>
									</Stack>
									<Icon as={FaChevronRight} />
								</Stack>
							</LinkBox>
						)}
					</Stack>
				</Stack>
			</Box>
		</Stack>
	);
}
