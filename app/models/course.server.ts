import { YoutubeTranscript } from "youtube-transcript";
import { db } from "../../src/utils/firebase";
import {
	getDoc,
	addDoc,
	doc,
	collection,
	getDocs,
	query,
	where,
} from "@firebase/firestore";

export type Course = {
	title: string;
	units: {
		title: string;
		chapters: {
			title: string;
		}[];
	}[];
};

export async function getAllCourses() {
	const coursesRef = await collection(db, "courses");
	const queryRef = query(
		coursesRef,
		where("completed", "==", true),
		where("public", "==", true)
	);
	const coursesSnapshot = await getDocs(queryRef);
	const coursesData = await coursesSnapshot.docs.map((doc) => {
		return { data: doc.data(), id: doc.id };
	});
	return coursesData;
}

export async function getCourse(id: string): Promise<any> {
	console.log("get course id", id);
	let data: Course = {
		title: "",
		units: [],
	};
	const document = await getDoc(doc(db, "courses", id));

	if (document.exists()) {
		data = document.data() as Course;
		return data;
	} else {
		return {
			error: "Course not found",
		};
	}
}

export async function promptPalm(prompt: string) {
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.PALM_API}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: {
					text: prompt,
				},
				temperature: 0.9,
				top_k: 40,
				top_p: 0.95,
				candidate_count: 1,
				max_output_tokens: 2048,
				stop_sequences: [],
				safety_settings: [
					{ category: "HARM_CATEGORY_DEROGATORY", threshold: 3 },
					{ category: "HARM_CATEGORY_TOXICITY", threshold: 3 },
					{ category: "HARM_CATEGORY_VIOLENCE", threshold: 3 },
					{ category: "HARM_CATEGORY_SEXUAL", threshold: 3 },
					{ category: "HARM_CATEGORY_MEDICAL", threshold: 3 },
					{ category: "HARM_CATEGORY_DANGEROUS", threshold: 3 },
				],
			}),
		}
	);
	console.log("PaLM api status: ", response.status);
	const json = await response.json();
	return json.candidates[0].output;
}

export async function searchYouTube(searchQuery: string) {
	const response = await fetch(
		`https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&part=snippet&maxResults=1`,
		{
			method: "GET",
		}
	);
	const json = await response.json();
	if (json.items[0] == undefined) {
		console.log("search yt");
	}
	return json.items[0].id.videoId;
}

export async function getTranscript(videoId: string) {
	try {
		let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
			lang: "en",
			country: "EN",
		});
		let transcript = "";
		for (let i = 0; i < transcript_arr.length; i++) {
			transcript += transcript_arr[i].text + " ";
		}
		return transcript.replaceAll("\n", " ");
	} catch (e) {
		const response = await fetch(
			`https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API}&id=${videoId}&videoDuration=medium&videoEmbeddable=true&type=video&part=snippet&maxResults=1`,
			{
				method: "GET",
			}
		);
		const json = await response.json();
		return json.items[0].snippet.title;
	}
}

export async function createChapters(title: string, unitsArray: string[]) {
	let unitsString = "";
	for (let i = 1; i <= unitsArray.length; i++) {
		unitsString += `Unit ${i}: ${unitsArray[i - 1]}\n`;
	}
	const prompt = `${unitsString}
	It is your job to create a course about ${title}. The user has requested to create chapters for each of the above units. Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educational video for each chapter. Each query should give an educational informative course in youtube.
	Important: Give the response in an array of JSON like the example below with the title of each array index corresponding to the unit title:
	[
		{
			"title": "World War II Battles",
			"chapters": [
				{
					"youtube_search_query": "all about important battles in WW2",
					"chapter_title": "Important Battles"
				},
				{
					"youtube_search_query": "battle strategies in WW2",
					"chapter_title": "Battle Strategies"
				},
				{
					"youtube_search_query": "Battle of Stalingrad short explanation",
					"chapter_title": "Battle of Stalingrad"
				} etc...
			]
		},
		{
			"title": "World War II Alliances",
			"chapters": [
				{
					"youtube_search_query": "all about the allied powers in WW2",
					"chapter_title": "Allied Powers"
				},
				{
					"youtube_search_query": "all about the axis powers in WW2",
					"chapter_title": "Axis Powers"
				},
				{
					"youtube_search_query": "netural powers and their roles in WW2",
					"chapter_title": "Neutral Powers"
				} etc...
			]
		}
	]
	`;
	try {
		console.log("starting to create chapters");
		let palmResponse = await promptPalm(prompt);
		const courseInfoFragments = palmResponse.split("[");
		let courseInfoString = "";
		for (const i in courseInfoFragments) {
			if (Number(i) === 0) {
			} else {
				if (Number(i) == courseInfoFragments.length - 1) {
					courseInfoString += "[";
					courseInfoString += courseInfoFragments[i].split("`")[0];
				} else {
					courseInfoString += "[";
					courseInfoString += courseInfoFragments[i];
				}
			}
		}
		const units = await JSON.parse(courseInfoString);
		console.log("created chapters");
		const docRef = await addDoc(collection(db, "courses"), {
			title: title,
			units: units,
			completed: false,
			public: false,
		});
		console.log("added to firebase", docRef.id);
		return {
			courseId: await docRef.id,
		};
	} catch (error) {
		console.log("FAILED: Error Info getting course info");
		console.log("error:\n", error, "\n\n");
		return {
			message: error as string,
		};
	}
}
