import {
	ChakraProvider,
	Box,
	Heading,
	Text,
	Flex,
	Link,
	HStack,
	StackDivider,
	Center,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
} from "@chakra-ui/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useNavigation,
} from "@remix-run/react";
import theme from "../src/utils/theme";
import { Link as RemixLink } from "@remix-run/react";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css";
import { useEffect } from "react";

export const meta: MetaFunction = () => ({
	charset: "utf-8",
});

export let links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: nProgressStyles }];
};

function Document({
	children,
	title = "Coursify | AI-Generated Courses",
}: {
	children: React.ReactNode;
	title?: string;
}) {
	return (
		<html lang="en">
			<head>
				<Meta />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<script
					async
					src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6458965765037147"
					crossOrigin="anonymous"
				></script>
				<title>{title}</title>
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export default function App() {
	const transition = useNavigation();

	useEffect(() => {
		if (transition.state !== "idle") {
			NProgress.start();
		} else {
			NProgress.done();
		}
	}, [transition.state]);

	return (
		<Document>
			<ChakraProvider theme={theme}>
				<Box h="100vh" overflow={"scroll"}>
					<Flex
						as="header"
						align="center"
						justify="space-between"
						bg="gray.800"
						px={4}
						h="90px"
						position="sticky"
						top={0}
						zIndex={10}
						boxShadow={"xl"}
					>
						<Text
							display={{ lg: "flex", base: "none" }}
							as={RemixLink}
							to="/"
							fontSize="2xl"
							fontWeight="black"
							color="white"
						>
							Coursify
						</Text>
						<HStack spacing={{ base: 1, md: 4 }}>
							<Link as={RemixLink} to="/" mx={2} color="white">
								Create New Course
							</Link>
							<Link as={RemixLink} to="/gallery" mx={2} color="white">
								Gallery
							</Link>
							<Link as={RemixLink} to="/contact" mx={2} color="white">
								Contact
							</Link>
						</HStack>
					</Flex>
					<Box h="calc(100vh - 90px)">
						<Outlet />
					</Box>
				</Box>
			</ChakraProvider>
		</Document>
	);
}

// How ChakraProvider should be used on CatchBoundary
export function CatchBoundary() {
	const caught = useCatch();

	return (
		<Document title={`${caught.status} ${caught.statusText}`}>
			<ChakraProvider theme={theme}>
				<Box>
					<Heading as="h1" bg="purple.600">
						[CatchBoundary]: {caught.status} {caught.statusText}
					</Heading>
				</Box>
			</ChakraProvider>
		</Document>
	);
}

// How ChakraProvider should be used on ErrorBoundary
export function ErrorBoundary({ error }: { error: Error }) {
	console.log("root ErrorBoundary");
	console.error(error);
	return (
		<Document title="Error!">
			<ChakraProvider theme={theme}>
				<Box h="100vh" overflow={"scroll"}>
					<Flex
						as="header"
						align="center"
						justify="space-between"
						bg="gray.800"
						px={4}
						h="90px"
						position="sticky"
						top={0}
						zIndex="sticky"
						boxShadow={"xl"}
					>
						<Text
							display={{ lg: "flex", base: "none" }}
							as={RemixLink}
							to="/"
							fontSize="2xl"
							fontWeight="black"
							color="white"
						>
							Coursify
						</Text>
						<HStack spacing={{ base: 2, md: 4 }}>
							<Link as={RemixLink} to="/" mx={2} color="white">
								Create New Course
							</Link>
							<Link as={RemixLink} to="/gallery" mx={2} color="white">
								Course Gallery
							</Link>
						</HStack>
					</Flex>

					<Center h="calc(100vh - 90px)">
						<Alert
							borderRadius={"lg"}
							maxW={"sm"}
							status="error"
							variant="subtle"
							flexDirection="column"
							alignItems="center"
							justifyContent="center"
							textAlign="center"
						>
							<AlertIcon boxSize="40px" mr={0} />
							<AlertTitle mt={4} mb={1} fontSize="xl">
								Uh oh! An error occurred!
							</AlertTitle>
							<AlertDescription maxWidth="sm">
								<Text fontWeight={"bold"}>Please reload and try again.</Text> If
								that doesn't work, check back later.
							</AlertDescription>
						</Alert>
					</Center>
				</Box>
			</ChakraProvider>
		</Document>
	);
}
