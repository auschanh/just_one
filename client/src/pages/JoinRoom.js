"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from "../components/Chat";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Copy, Check, MessageSquare, LockKeyhole } from "lucide-react";
import { useSocketContext } from "../contexts/SocketContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";

function JoinRoom() {

    const [socket, setSocket] = useSocketContext();

    const [inLobby, setInLobby] = useLobbyContext();

    const [,,,, [selectedPlayers, setSelectedPlayers],,] = useGameInfoContext();

    const [username, setUsername] = useState();

    const [success, setSuccess] = useState(0);

    const [sessionUrl, setSessionUrl] = useState();

    const [copied, setCopied] = useState(false);

    const [roomDetails, setRoomDetails] = useState();

    const [isReady, setIsReady] = useState(false);

    const [isClosedRoom, setIsClosedRoom] = useState();

    const [beenRemoved, setBeenRemoved] = useState(false);

    const [chatExpanded, setChatExpanded] = useState(false);

    const [newMessage, setNewMessage] = useState(false);

    const [open, setOpen] = useState(true);

    // use %20 in address bar for space
    const { roomID } = useParams();

    const navigate = useNavigate();

    useEffect(() => {

        if (roomDetails === undefined && !isClosedRoom && !beenRemoved) {

            console.log("checking room");

            (async () => {

                try {
    
                    await socket.emit("roomCheck", roomID);
    
                } catch (error) {
    
                    throw error;
    
                }
    
            })();
        }

        if (username && !inLobby.find(({playerName}) => { return playerName === username })) {

            console.log("username triggered");

            (async () => {

                try {

                    await socket.emit("joinRoom", roomID, username);

                } catch (error) {

                    throw error;

                }

            })();

        } else {

            console.log("not gonna try to join room");

        }

        socket.on("roomExists", (othersInLobby, sessionUrl, roomDetails, inRoom, isClosedRoom) => {

            if (othersInLobby) {

                setSuccess(1);

                setInLobby(othersInLobby);

                setSessionUrl(sessionUrl);

                setRoomDetails(roomDetails);

            } else {

                if (isClosedRoom) {

                    setIsClosedRoom(true);

                } else {

                    console.log(`could not join room ${roomID}`);

                    setSuccess();

                }
            }

        });

        socket.on("getLobby", (othersInLobby, roomDetails, isClosedRoom) => {

            if (othersInLobby) {

                setInLobby(othersInLobby);

                setRoomDetails(roomDetails);

            } else {

                if (isClosedRoom) {

                    setUsername();

                    setIsClosedRoom(true);

                } else {

                    console.log(`could not join room ${roomID}`);

                }

                setSuccess();

                setOpen(true);

                setRoomDetails();

            }

        });

        socket.on("updateRoomInfo", (link, othersInLobby, roomID, newDetails) => {

            setInLobby(othersInLobby);

            setRoomDetails(newDetails);

        });

        socket.on("getSelectedPlayers", (selectedPlayers) => {

            setSelectedPlayers(selectedPlayers);

        });

        socket.on("isRoomClosed", (isClosedRoom) => {

            setIsClosedRoom(isClosedRoom);

        });

        socket.on("newHost", () => {

            navigate(`/newhost/${roomID}`);

        });

        socket.on("exitLobby", () => {

            setBeenRemoved(true);

            setUsername();

            setSuccess();

            setOpen(true);

            setRoomDetails();

        });

        return () => {

            socket.removeAllListeners("roomExists");
            socket.removeAllListeners("getLobby");
            socket.removeAllListeners("updateRoomInfo");
            socket.removeAllListeners("getSelectedPlayers");
            socket.removeAllListeners("isRoomClosed");
            socket.removeAllListeners("newHost");
            socket.removeAllListeners("exitLobby");

        }

    }, [socket, roomID, username, inLobby, navigate, roomDetails, isClosedRoom, beenRemoved]);

    useEffect(() => {

        if (chatExpanded) {

            setNewMessage(false);

        }

    }, [chatExpanded]);

    const handleChatExpansion = () => {

		setChatExpanded(!chatExpanded);

	}

    const form = useForm();

    function onSubmit(values) {

        // cannot enter an existing username
        if (values.username !== "") {

            console.log(values.username);

            setUsername(values.username);

            setOpen(false);

        }

	}

    const handleCopy = async () => {

		try {

			if ("clipboard" in navigator) {

				await navigator.clipboard.writeText(sessionUrl);
				
			} else {

				document.execCommand("copy", true, sessionUrl);

			}

			setCopied(true);

			setTimeout(() => {

				setCopied(false);

			}, 1000);

		} catch (error) {

			throw error;

		}

	}

    const handleReady = () => {

        setIsReady(!isReady);

        try {

            socket.emit("sendIsReady", roomID);

        } catch (error) {

            throw error;

        }

    }

	return (

        <>

            <div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-700">

                {success && (

                    <div className={`flex flex-none flex-col h-[85vh] bg-slate-50 border rounded-lg p-12 gap-8 overflow-hidden transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60vw]" : "w-[35vw]"}`}>

                        <div className="flex flex-row h-full w-full gap-6">

                            <div className={`flex flex-col flex-none h-full gap-6 transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60%]" : "w-full"}`}>

                                <div className="flex flex-row items-end w-full">

                                    <h1 className="font-semibold text-xl underline">{roomDetails.roomName}</h1>

                                    <Button className="flex justify-end mb-4 ml-auto gap-x-2 relative" variant="border" onClick={handleChatExpansion}>
                                        <h2 className="text-xs leading-none m-0 p-0">Chat</h2>
                                        <MessageSquare size={14} />
                                        <div className={`absolute -right-1.5 -top-1.5 aspect-square h-3.5 rounded-full bg-cyan-500 transition-all duration-1000" ${newMessage ? "" : "invisible opacity-20"}`} />
                                    </Button>

                                </div>

                                {username && (

                                    <TooltipProvider>                      
                                        <Tooltip>
                                            <div className="py-2 w-fit">
                                                <h1 className="text-xl font-extralight">{`Welcome `}
                                                    <TooltipTrigger asChild>
                                                        <span className="font-normal hover:underline hover:cursor-pointer" onClick={() => {setOpen(true)}}>{username}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="font-semibold">{`Change Username`}</p>
                                                    </TooltipContent>
                                                !</h1>
                                            </div>
                                        </Tooltip>
                                    </TooltipProvider>

                                )}

                                <div>

                                    <div className="mb-6">
                                        <div className="flex flex-row items-center mb-2">
                                            <h1 className="text-sm font-semibold">Link</h1>
                                        </div>

                                        <div className={`flex flex-row items-center w-full p-4 pr-14 rounded-md border border-slate-400 dark:border-slate-800 dark:bg-slate-950 relative transition-all duration-300 ${!isClosedRoom ? "bg-white" : "bg-slate-200"}`}>

                                            {!isClosedRoom && (

                                                <>

                                                    <p className="text-sm break-all">{sessionUrl}</p>
                                                    <Button className="flex absolute right-3 h-fit p-2 transition-colors ease-out duration-500" onClick={handleCopy} variant={copied ? "greenNoHover" : "border"}>{ (!copied && <Copy size={12} />) || <Check size={14} /> }</Button>

                                                </>

                                            ) || (

                                                <>
                                                    <LockKeyhole className="stroke-2 stroke-slate-900 mr-3" size={15} />
                                                    <p className="text-sm">Your host <span className="font-semibold underline">{roomDetails.host}</span> has closed this room</p>
                                                </>

                                            )}

                                        </div>
                                        
                                    </div>

                                    <h1 className="text-sm font-semibold mb-2">{`${roomDetails.host} is selecting ${roomDetails.numPlayers} ${roomDetails.numPlayers === 1 ? "player" : "players"} for this round:`}</h1>

                                    <div className="flex flex-wrap gap-x-3 gap-y-3">

                                        {inLobby?.map((player, index) => {

                                            if (player.playerName === roomDetails.host) {

                                                return (

                                                    <TooltipProvider key={index}>                      
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button 
                                                                    className={`flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer`}
                                                                    variant={
                                                                        selectedPlayers.includes(player.playerName)
                                                                            ? "green"
                                                                            : "indigo"
                                                                    }
                                                                >
                                                                    <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                                        <p className="text-slate-900 text-xs font-semibold">{player.playerName.charAt(0).toUpperCase()}</p>
                                                                    </div>
                                                                    <p className="text-xs">{player.playerName}</p>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="font-semibold">{`👑 Host`}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                )

                                            } else {

                                                return (

                                                    <TooltipProvider key={index}>                      
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
                                                                    variant={
                                                                        selectedPlayers.includes(player.playerName) 
                                                                            ? "green" 
                                                                            : 
                                                                                player.isReady 
                                                                                ? "default" 
                                                                                : "disabled"
                                                                    }
                                                                >
                                                                    <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                                        <p className="text-slate-900 text-xs font-semibold">{player.playerName.charAt(0).toUpperCase()}</p>
                                                                    </div>
                                                                    <p className="text-xs">{player.playerName}</p>
                                                                </Button>
                                                            </TooltipTrigger>

                                                            {!player.isReady && (

                                                                <TooltipContent>
                                                                    <p className="font-semibold">This player is not ready</p>
                                                                </TooltipContent>

                                                            )}

                                                        </Tooltip>
                                                    </TooltipProvider>

                                                );
                                            }
                                        })}

                                        {inLobby && Array.from({ length: roomDetails.numPlayers - inLobby.length }, (_, index) => {

                                            if (inLobby.length < roomDetails.numPlayers) {

                                                return (

                                                    <Badge className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer" variant="empty" key={index}>
                                                        <div className="flex aspect-square h-full bg-slate-400 rounded-full items-center justify-center mr-3" />
                                                        <p>Player {inLobby.length + index + 1}</p>
                                                    </Badge>
                        
                                                );
                                            }

                                        })}

                                        {Array.from({ length: roomDetails.aiPlayers }, (_, index) => {

                                            return (

                                                <Badge className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer" variant="bot" key={index}>
                                                    <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                        <p className="text-slate-900">🤖</p>
                                                    </div>
                                                    <p>Bot {index + 1}</p>
                                                </Badge>

                                            );

                                        })}

                                    </div>

                                </div>

                                <div className="flex flex-row mt-auto w-full justify-end">
                                    <Button className="w-28" onClick={handleReady} variant={ isReady ? "green": "default" }>{ isReady ? "Ready!" : "Ready Up" }</Button>
                                </div>

                            </div>

                            <Chat chatExpanded={chatExpanded} username={username} roomName={roomDetails.roomName} inLobby={inLobby} roomID={roomID} setNewMessage={setNewMessage} />

                        </div>

                    </div>

                )}

            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="gap-0">

                    {roomDetails && (

                        <>

                            <AlertDialogHeader className="space-y-0 mb-8">
                                <AlertDialogTitle>Welcome to Just One!</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You'll be joining {roomDetails.roomName}
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <Form {...form}>
                                <form className="flex flex-col gap-12" onSubmit={form.handleSubmit(onSubmit)}>
                                    <FormField
                                        defaultValue={''}
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        autoFocus
                                                        placeholder={"Enter Your Username"} 
                                                        {...field}
                                                        id="username"
                                                        onFocus={(event) => event.target.select()}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button className="flex flex-row self-end" type="submit">Submit</Button>
                                </form>
                            </Form>

                        </>

                    ) || beenRemoved && (

                        <>

                            <AlertDialogHeader className="space-y-2">
                                <AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
                            </AlertDialogHeader>

                            <div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
                                <p>You have been removed from this lobby.</p>
                                <p>Please contact the host for further details.</p>
                            </div>

                        </>

                    ) || isClosedRoom && (

                        <>

                            <AlertDialogHeader className="space-y-2">
                                <AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
                            </AlertDialogHeader>

                            <div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
                                <p>This is a closed room.</p>
                                <p>Please contact the host to join this room.</p>
                            </div>

                        </>

                    ) || (

                        <>

                            <AlertDialogHeader className="space-y-2">
                                <AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
                            </AlertDialogHeader>

                            <div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
                                <p>Oops! It looks like this room doesn't exist.</p>
                                <p>Please double check the link you were sent.</p>
                            </div>

                        </>

                    )}
                    
                </AlertDialogContent>
            </AlertDialog>

        </>

	);

}

export default JoinRoom;
