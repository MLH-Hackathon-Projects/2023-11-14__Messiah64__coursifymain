import { Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

type UnitProps = {
	index: number;
	onChange: (value: string) => void;
	disabled: boolean;
};

export default function Unit({ index, onChange, disabled }: UnitProps) {
	const [value, setValue] = useState("");

	return (
		<Stack
			direction={["column", "row"]}
			align={{ base: "start", md: "center" }}
			justify={"space-between"}
			spacing={{ base: 1, md: 0 }}
		>
			<Text fontSize={{ base: "lg", md: "xl" }} fontWeight={"bold"}>
				Unit {index + 1}:
			</Text>
			<Input
				maxW="sm"
				disabled={disabled}
				isRequired
				name={"unit"}
				size="lg"
				placeholder={
					index == 0
						? "Axis Powers"
						: index == 1
						? "Allied Powers"
						: index == 2
						? "Major Battles"
						: "Unit Title"
				}
				value={value}
				onChange={(e) => {
					setValue(e.target.value);
					onChange(e.target.value);
				}}
			/>
		</Stack>
	);
}
