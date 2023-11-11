import {
	Stack,
	Box,
	Divider,
	Input,
	Button,
	HStack,
	Wrap,
	InputRightElement,
	InputGroup,
	InputLeftElement,
	Icon,
} from "@chakra-ui/react";
import { getAllCourses } from "~/models/course.server";
import { useLoaderData } from "@remix-run/react";
import { Form } from "@remix-run/react";
import GalleryResult from "src/components/GalleryResult";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import Fuse from "fuse.js";

export const loader = async (query: string) => {
	return await getAllCourses();
};

export default function PostSlug() {
	const coursesData = useLoaderData<typeof loader>();

	const fuse = new Fuse(coursesData, {
		keys: ["id", "data.title", "data.units.title"],
		threshold: 0.4,
	});

	const [data, setData] = useState(coursesData);

	function handleChange(e: any) {
		if (e.target.value == "") {
			setData(coursesData);
		} else {
			setData(fuse.search(e.target.value));
		}
	}

	return (
		<Stack spacing={8} py={8} px={4}>
			<HStack spacing={2} px={4}>
				<InputGroup size="lg">
					<InputLeftElement>
						<Icon as={FaSearch} />
					</InputLeftElement>
					<Input
						onChange={handleChange}
						name="search"
						pr="6rem"
						type="text"
						placeholder="Search by keyword, title, or units"
					/>
				</InputGroup>
			</HStack>
			<Divider
				borderColor="white.400"
				borderWidth={"1px"}
				borderRadius="0.5px"
				w="90%"
				alignSelf="center"
			/>
			<Wrap spacing={4} justify={"center"}>
				{data.map((course: any, index: number) => (
					<GalleryResult
						courseView={course.data ? course.data : course.item.data}
						courseId={course.id ? course.id : course.item.id}
						key={index}
					/>
				))}
			</Wrap>
		</Stack>
	);
}
