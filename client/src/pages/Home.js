import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import DialogPlay from '../components/DialogPlay.js';
import DialogHTP from '../components/DialogHTP';
import { useSocketContext } from '../contexts/SocketContext';

const Home = function () {

	const location = useLocation();

	const [socket, setSocket] = useSocketContext();

	const [playOpen, setPlayOpen] = useState(false);

	const [htpOpen, setHTPOpen] = useState(false);

	useEffect(() => {

		socket.on("connectToRoom", (message) => {

			console.log(message);

		});

		return () => { socket.removeAllListeners("connectToRoom"); }

	}, [socket]);

	const htpToPlay = () => {

		setHTPOpen(false);

		setPlayOpen(true);

	}

	return (

		<div className="flex relative h-screen w-screen max-h-[100vw] max-w-[100vw] justify-center overflow-hidden">

			<div className="aspect-square h-[180%] absolute top-[-40%] rounded-full bg-slate-800 flex flex-col items-center justify-center">

				<div className="w-[60%]">

					<div className="flex flex-row flex-none items-end mb-8">

						<h1 className="text-slate-50 font-semibold text-7xl">Callsigns</h1>
						<h1 className="text-7xl ml-8">📡</h1>

						<div className="flex flex-row w-full justify-end gap-8">

							<DialogPlay tailwindStyles={"w-32 bg-green-600 text-slate-50 hover:bg-green-600/80 active:bg-green-500"} triggerName={"Play"} isOpen={[playOpen, setPlayOpen]} />

							<DialogHTP tailwindStyles={"w-32 bg-red-600 text-slate-50 hover:bg-red-600/80 active:bg-red-500"} isHTPOpen={[htpOpen, setHTPOpen]} htpToPlay={htpToPlay} />

						</div>

					</div>

					<Accordion className="text-slate-300 space-y-4 pt-8 border-solid border-t border-slate-50 font-extralight" type="single" collapsible>
						<AccordionItem className="w-full border-slate-400" value="item-2">
							<AccordionTrigger>Your mission:</AccordionTrigger>
							<AccordionContent>
								<div className="text-slate-300 space-y-4 py-8 border-solid border-t border-slate-400 font-extralight">
									<p>
										HQ is sending out the new callsigns for this week and this time you and your team are worried. You just found out that one of your agents is still alive but they’re too far behind enemy lines to reach. You and your team will need to somehow send them their <span className="font-semibold underline">callsign</span> so they can authenticate with HQ before it’s too late! 
									</p>
									<p>
										It’s far too risky to send the callsign itself out on the airwaves, if it gets intercepted, the whole team could be in danger! To stay under the radar, you and your team will need to send just <span className="font-semibold underline">one-word hints</span> out to your agent and hope that they will be able to figure out their callsign using just those hints before it’s too late. But be careful, the enemy is always listening! <span className="font-semibold underline">There can’t be any duplicate hints</span> or else the agency’s secret channels could be exposed! 
									</p>
									<p>
										Will your agent be able to figure out their callsign before it’s too late or will they be captured before they get the chance?
									</p>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>

				</div>

			</div>
			
		</div>

	);
}

export default Home;