import {
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	useDisclosure,
	Button,
	IconButton,
	Stack,
	Heading,
	Link,
	Box,
	StackDivider,
} from "@chakra-ui/react";
import { useRef } from "react";
import { FaBars } from "react-icons/fa6";
import { Link as RemixLink } from "@remix-run/react";

type SidebarProps = {
	data: any;
	params: any;
};

const CourseSidebar = ({ data, params }: SidebarProps) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const btnRef = useRef<HTMLButtonElement>(null);

	return (
		<>
			<Button
				colorScheme="gray"
				position={"fixed"}
				top={105}
				right={4}
				zIndex={11}
				size="sm"
				leftIcon={<FaBars />}
				display={{ base: "inline-flex", md: "none" }}
				ref={btnRef}
				onClick={onOpen}
			>
				Open Menu
			</Button>
			<Stack
				bg="whiteAlpha.300"
				w={"md"}
				p={8}
				top={90}
				position="sticky"
				h="100%"
				borderTopRightRadius={"3xl"}
				boxShadow={"xl"}
				divider={<StackDivider />}
				display={{ base: "none", md: "flex" }}
			>
				<Heading fontWeight={"black"} size="2xl">
					{data.title}
				</Heading>
				{data.units.map((unit: any, i: number) => (
					<Box key={i}>
						<Stack spacing={0}>
							<Box
								color="whiteAlpha.600"
								fontWeight="semibold"
								letterSpacing="wide"
								fontSize="xs"
								textTransform="uppercase"
							>
								Unit {i + 1}
							</Box>
							<Link
								as={RemixLink}
								fontSize="xl"
								fontWeight={"bold"}
								to={`/course/${params.courseId}/${i}`}
							>
								{unit.title}
							</Link>
						</Stack>
						<Stack spacing={0}>
							{unit.chapters.map((chapter: any, index: number) => (
								<Link
									key={index}
									as={RemixLink}
									to={`/course/${params.courseId}/${i}/${index}`}
								>
									{chapter.title}
								</Link>
							))}
						</Stack>
					</Box>
				))}
			</Stack>
			<Drawer
				isOpen={isOpen}
				placement="right"
				onClose={onClose}
				finalFocusRef={btnRef}
			>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton mt={2} />
					<DrawerHeader>{data.title}</DrawerHeader>

					<DrawerBody>
						<Stack spacing={4}>
							{data.units.map((unit: any, i: number) => (
								<Box key={i}>
									<Stack spacing={0}>
										<Box
											color="whiteAlpha.600"
											fontWeight="semibold"
											letterSpacing="wide"
											fontSize="xs"
											textTransform="uppercase"
										>
											Unit {i + 1}
										</Box>
										<Link
											as={RemixLink}
											fontSize="xl"
											fontWeight={"bold"}
											to={`/course/${params.courseId}/${i}`}
										>
											{unit.title}
										</Link>
									</Stack>
									<Stack spacing={0}>
										{unit.chapters.map((chapter: any, index: number) => (
											<Link
												key={index}
												as={RemixLink}
												to={`/course/${params.courseId}/${i}/${index}`}
											>
												{chapter.title}
											</Link>
										))}
									</Stack>
								</Box>
							))}
						</Stack>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
};

export default CourseSidebar;
