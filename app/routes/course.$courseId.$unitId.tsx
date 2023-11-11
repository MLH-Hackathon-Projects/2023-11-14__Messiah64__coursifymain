import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCourse } from "~/models/course.server";
import { Box, Stack } from "@chakra-ui/react";
import CourseSidebar from "src/components/CourseSidebar";

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

	return (
		<Stack direction={"row"} h="100%">
			<CourseSidebar data={data} params={params} />

			<Box overflowY={"scroll"} p={8} w="100%">
				Course Name: {data.title}, Unit Name: {data.units[0].title}
			</Box>
		</Stack>
	);
}
