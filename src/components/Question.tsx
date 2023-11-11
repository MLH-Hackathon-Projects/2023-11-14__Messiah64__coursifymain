import {
	Box,
	Radio,
	RadioGroup,
	Stack,
	StackDivider,
	Text,
} from "@chakra-ui/react";
import { useState } from "react";

type QuestionProps = {
	question: any;
	onChange: Function;
	correct: boolean;
	incorrect: boolean;
};

export default function Question({
	question,
	onChange,
	correct,
	incorrect,
}: QuestionProps) {
	const [value, setValue] = useState("");

	return (
		<Box
			bg={correct ? "green.800" : incorrect ? "red.800" : "whiteAlpha.300"}
			borderRadius={"md"}
			p={4}
		>
			<Stack>
				<Text fontWeight={"bold"}>{question.question}</Text>
				<RadioGroup
					onChange={(e) => {
						onChange(e);
						setValue(e);
					}}
					value={value}
				>
					<Stack spacing={1} divider={<StackDivider />}>
						{question.answers
							? question.answers.map((answer: any, i: number) => (
									<Radio
										size="sm"
										name={`question${i}`}
										key={i}
										colorScheme="blue"
										value={`${i}`}
									>
										{answer.choice}
									</Radio>
							  ))
							: question.choices.map((choices: any, i: number) => (
									<Radio
										size="sm"
										name={`question${i}`}
										key={i}
										value={`${i}`}
										colorScheme="blue"
									>
										{choices}
									</Radio>
							  ))}
					</Stack>
				</RadioGroup>
			</Stack>
		</Box>
	);
}
