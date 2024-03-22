import { React, useState } from "react";
import { Button } from "../components/ui/button";

import axios from "axios";

const Game = function (props) {

	const [word, setWord] = useState("");

	const words = [
		"Coffee",
		"Americano",
		"Latte",
		"Flat White",
		"Espresso",
		"Mocha",
	];

	const generateWord = async () => {
		const url = "http://localhost:3001/getMysteryWord";
		try {
			const response = await axios.get(url);
			setWord(response.data);
			console.log(response.data);
		} catch (error) {
			throw error;
		}
	};

	const createJSON = async () => {

		const url = "http://localhost:3001/newJsonFile";

		try {

			const response = await axios.post(url);

			console.log(response.data);

		} catch(error) {

			throw error;

		}

	}

	return (
		<div className="flex flex-col justify-center items-center h-screen">
			<div>
				<h1 className="font-bold text-2xl text-center">Game</h1>
			</div>
			<div className="w-40 text-center">
				<Button
					className="border-2 border-blue-600 text-white"
					onClick={generateWord}
				>
					Generate a Word
				</Button>
				<Button
					className="border-2 border-red-600 text-white"
					onClick={createJSON}
				>
					New JSON
				</Button>
			</div>
			{word && <div className="mt-4">Generated Word: {word}</div>}
		</div>
	);
};

export default Game;
