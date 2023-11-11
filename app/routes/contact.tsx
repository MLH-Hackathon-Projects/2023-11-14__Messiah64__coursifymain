import Unit from "../../src/components/Unit";
import {
	Box,
	Heading,
	Input,
	Stack,
	Text,
	Button,
	Divider,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
	Textarea,
} from "@chakra-ui/react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect } from "react";
import { ActionArgs, json } from "@remix-run/node";
import { addDoc, collection } from "firebase/firestore";
import { db } from "src/utils/firebase";

export async function action({ request }: ActionArgs) {
	try {
		const formData = await request.formData();

		await addDoc(collection(db, "messages"), {
			email: formData.get("email") as string,
			subject: formData.get("subject") as string,
			message: formData.get("message") as string,
		});

		return json(
			{ message: "Message sent!" },
			{
				status: 200,
			}
		);
	} catch (error: unknown) {
		console.error(error);
		return json(
			{
				error:
					"Sorry, we couldn't send your message. Try emailing us at ping.mithil@gmail.com instead.",
			},
			{
				status: 500,
			}
		);
	}
}

export default function Home() {
	const navigation = useNavigation();
	const actionData = useActionData<any>();

	useEffect(() => {
		if (actionData) {
			console.log(actionData);
		}
	}, []);

	return (
		<Form method="post">
			<Stack maxW="xl" justify="center" margin={"auto"} p={8} spacing={4}>
				<Heading
					as="h1"
					fontWeight={"black"}
					size={{ base: "3xl", md: "4xl" }}
					textAlign={"center"}
				>
					Contact Us
				</Heading>

				<Alert status="info" borderRadius={"lg"}>
					<AlertIcon />
					<Text fontSize={{ base: "sm", md: "md" }}>
						We'll reply to your message as soon as possible!
					</Text>
				</Alert>

				<Stack spacing={{ base: 2, md: 4 }}>
					<Stack
						direction={["column", "row"]}
						align={{ base: "start", md: "center" }}
						justify={"space-between"}
						spacing={{ base: 1, md: 0 }}
					>
						<Text fontWeight={"bold"} fontSize={{ base: "lg", md: "xl" }}>
							Email:
						</Text>
						<Input
							maxW="sm"
							disabled={navigation.state === "submitting"}
							name="email"
							type="email"
							isRequired
							size="lg"
						/>
					</Stack>
					<Stack
						direction={["column", "row"]}
						align={{ base: "start", md: "center" }}
						justify={"space-between"}
						spacing={{ base: 1, md: 0 }}
					>
						<Text fontWeight={"bold"} fontSize={{ base: "lg", md: "xl" }}>
							Subject:
						</Text>
						<Input
							maxW="sm"
							disabled={navigation.state === "submitting"}
							name="subject"
							isRequired
							size="lg"
						/>
					</Stack>
					<Stack
						direction={["column", "row"]}
						align={"start"}
						justify={"space-between"}
						spacing={{ base: 1, md: 0 }}
					>
						<Text fontWeight={"bold"} fontSize={{ base: "lg", md: "xl" }}>
							Message:
						</Text>
						<Textarea
							maxW="sm"
							disabled={navigation.state === "submitting"}
							name="message"
							isRequired
							size="lg"
						/>
					</Stack>
				</Stack>

				<Stack spacing={4}>
					<Button
						colorScheme="blue"
						isLoading={navigation.state === "submitting"}
						loadingText={"Sending..."}
						type="submit"
					>
						Send!
					</Button>

					{actionData && (
						<Alert
							borderRadius={"lg"}
							status={actionData.error ? "error" : "success"}
							variant="subtle"
							flexDirection="column"
							alignItems="center"
							justifyContent="center"
							textAlign="center"
						>
							<AlertIcon boxSize="40px" mr={0} />
							<AlertTitle mt={4} mb={1} fontSize="xl">
								{actionData.error ? "Something went wrong!" : "Success!"}
							</AlertTitle>
							<AlertDescription maxWidth="sm">
								{actionData.error
									? actionData.error
									: "Your message was sent. We will respond to your message as soon as possible!"}
							</AlertDescription>
						</Alert>
					)}
				</Stack>
			</Stack>
		</Form>
	);
}
