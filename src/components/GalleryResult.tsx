import {
	Image,
	Text,
	Stack,
	Box,
	Divider,
	Link,
	WrapItem,
	LinkBox,
	LinkOverlay,
	Heading,
	Center,
	Spinner,
} from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";

function titleCase(st: string) {
	return st
		.toLowerCase()
		.split(" ")
		.reduce(
			(s, c) => s + "" + (c.charAt(0).toUpperCase() + c.slice(1) + " "),
			""
		);
}

type courseViewProps = {
	courseView: any;
	courseId: string;
};

export default function GalleryResult({
	courseView,
	courseId,
}: courseViewProps) {
	return (
		<WrapItem>
			<LinkBox
				w="xs"
				minH="sm"
				borderWidth="1px"
				borderRadius="lg"
				boxShadow={"lg"}
				display={"flex"}
				flexDirection={"column"}
				overflow={"clip"}
			>
				<Stack>
					<Image
						src={courseView.image}
						fit="cover"
						alt="Course Pic"
						h={200}
						fallback={
							<Center h={200}>
								<Spinner />
							</Center>
						}
					/>
					<Stack py={2} px={4}>
						<Heading size="md">
							<LinkOverlay as={RemixLink} to={`/course/${courseId}/0/0`}>
								{courseView.title.charAt(0).toUpperCase() ===
								courseView.title.charAt(0)
									? courseView.title
									: titleCase(courseView.title)}
							</LinkOverlay>
						</Heading>
						<Divider borderColor="gray.400" />

						<Stack spacing={1}>
							<Box
								color="gray.500"
								fontWeight="semibold"
								letterSpacing="wide"
								fontSize="xs"
								textTransform="uppercase"
							>
								units
							</Box>
							{courseView.units.map((unit: any, i: number) => (
								<Link as={RemixLink} to={`/course/${courseId}/${i}/0`}>
									{unit.title}
								</Link>
							))}
						</Stack>
					</Stack>
				</Stack>
			</LinkBox>
		</WrapItem>
	);
}
