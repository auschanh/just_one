const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const cors = require("cors");
app.use(cors());

app.use(express.json());

server.listen(3001, () => {
    console.log("SERVER RUNNING");
}); 

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

let roomLookup = [];

io.on("connection", (socket) => { // every connection has a unique socket id

    console.log(`User Connected: ${socket.id}`); // prints socket id of connection

    const getSocketInfo = () => {

        const activeUsers = [...io.sockets.sockets.values()].map((socketObj) => {

            return {

                username: socketObj.username,
                socketID: socketObj.id,
                rooms: socketObj.rooms

            }
    
        });

        console.log(activeUsers);

    }

    const getPlayersInLobby = (roomName) => {

        const lobby = [...io.sockets.adapter.rooms].find((room) => {return room[0] === roomName})[1];

        return usernameLookup([...lobby]);

    }

    const usernameLookup = (lobbyArray) => {

        const usernames = lobbyArray.map((socketID) => {

            let foundSocket = [...io.sockets.sockets.values()].find((socketObj) => {return socketObj.id === socketID});

            return foundSocket.username;

        });

        return usernames;

    }

    getSocketInfo();
    
    socket.on("gameInfo", ({ username, roomName, numPlayers, aiPlayers }, isRoomCreated) => {

        if (!isRoomCreated) {

            roomLookup.push({

                roomID: socket.id,
                roomName: roomName,
                numPlayers: numPlayers,
                aiPlayers: aiPlayers
    
            });

        } else {

            const findRoom = roomLookup.find(({roomID}) => {return roomID === socket.id});

            findRoom.roomName = roomName;
            findRoom.numPlayers = numPlayers;
            findRoom.aiPlayers = aiPlayers;

        }

        socket.username = username;

        getSocketInfo();

        const roomList = getPlayersInLobby(socket.id);

        socket.emit("getRoomInfo", `http://localhost:3000/game/${socket.id}`, roomList);

        console.log(roomLookup);

    });

    socket.on("listLobby", (setPlayersInLobby) => {

        setPlayersInLobby(getPlayersInLobby(socket.id));

    });

    socket.on("roomCheck", (roomName, setRoomExists) => {

        const check = [...io.sockets.adapter.rooms.keys()].find((room) => {return room === roomName});

        if (check) {

            setRoomExists(true);

        } else {

            setRoomExists(false);
            
        }

    });

    socket.on("joinRoom", (roomName, username) => {

        socket.username = username;

        console.log(username + " is joining " + roomName);

        socket.join(roomName);

        const roomList = getPlayersInLobby(roomName);

        console.log("players in " + roomName + ": " + roomList);

        getSocketInfo();

        const roomDetails = roomLookup.find(({roomID}) => {return roomID === roomName});

        const lobby = io.sockets.adapter.rooms.get(roomName);

        if (lobby.has(socket.id)) {

            socket.emit("getLobby", roomList, `http://localhost:3000/game/${roomName}`, roomDetails);

            io.to(roomName).emit("joinedLobby", roomList);

        } else {

            socket.emit("getLobby");

        }

    });

    socket.on("disconnecting", () => {

        const leavingRooms = [...socket.rooms];

        console.log(leavingRooms);

        leavingRooms.forEach((room) => {

            if (io.sockets.adapter.rooms.get(room).size === 1) {

                roomLookup = roomLookup.filter(({roomID}) => {return roomID !== room});

            } else {

                // ---------------------------------------------------------
                socket.broadcast.to(room).emit("leftRoom", socket.username);
                // ---------------------------------------------------------

            }

        });

    });

    socket.on("disconnect", () => {

        console.log(roomLookup);

        console.log("User Disconnected: ", socket.id);

    });

});



