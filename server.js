// ============================================================
// MULTIPLAYER TIC-TAC-TOE
// Node.js + Express + Socket.io
// ============================================================

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");


// ============================================================
// APP SETUP
// ============================================================

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const PORT = 3000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


// ============================================================
// IN-MEMORY GAME ROOMS
// ============================================================

const rooms = new Map();


// ============================================================
// ROOM CODE GENERATOR
// ============================================================

function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code;

    do {

        code = "";

        for (let i = 0; i < 6; i++) {

            code +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }

    } while (rooms.has(code));

    return code;
}


// ============================================================
// CREATE EMPTY ROOM
// ============================================================

function createRoom(roomCode) {

    return {

        roomCode,

        board: [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ],

        turn: "X",

        status: "waiting",

        winner: null,

        players: {

            X: null,

            O: null

        },

        rematch: {

            X: false,

            O: false

        }

    };
}


// ============================================================
// WINNING COMBINATIONS
// ============================================================

const winningPatterns = [

    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // Diagonals
    [0, 4, 8],
    [2, 4, 6]

];


// ============================================================
// CHECK WINNER
// ============================================================

function checkWinner(board) {

    for (const pattern of winningPatterns) {

        const [a, b, c] = pattern;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            return {

                winner: board[a],

                line: pattern

            };

        }

    }


    // Check draw

    const boardFull =
        board.every(
            cell => cell !== null
        );


    if (boardFull) {

        return {

            winner: "draw",

            line: []

        };

    }


    return null;
}


// ============================================================
// GET PUBLIC GAME STATE
// ============================================================

function getGameState(room) {

    const result =
        checkWinner(room.board);


    return {

        roomCode:
            room.roomCode,

        board:
            room.board,

        turn:
            room.turn,

        status:
            room.status,

        winner:
            room.winner,

        winningLine:
            result &&
            result.winner !== "draw"
                ? result.line
                : [],

        players: {

            X:
                Boolean(
                    room.players.X
                ),

            O:
                Boolean(
                    room.players.O
                )

        },

        rematch: {

            X:
                room.rematch.X,

            O:
                room.rematch.O

        }

    };
}


// ============================================================
// SEND GAME STATE
// ============================================================

function broadcastGameState(room) {

    io.to(room.roomCode).emit(
        "game-state",
        getGameState(room)
    );

}


// ============================================================
// CREATE ROOM
// ============================================================

function createGameRoom(socket) {

    const roomCode =
        generateRoomCode();


    const room =
        createRoom(roomCode);


    room.players.X =
        socket.id;


    rooms.set(
        roomCode,
        room
    );


    socket.join(roomCode);


    socket.data.roomCode =
        roomCode;


    socket.data.symbol =
        "X";


    socket.emit(
        "room-created",
        {

            roomCode,

            symbol: "X"

        }
    );


    broadcastGameState(room);


    console.log(
        `Room created: ${roomCode} | Player X: ${socket.id}`
    );

}


// ============================================================
// JOIN ROOM
// ============================================================

function joinGameRoom(
    socket,
    roomCode
) {

    const normalizedCode =
        String(roomCode)
            .trim()
            .toUpperCase();


    const room =
        rooms.get(
            normalizedCode
        );


    // Room does not exist

    if (!room) {

        socket.emit(
            "error-message",
            "Room not found. Please check the room code."
        );

        return;
    }


    // Room already has two players

    if (
        room.players.X &&
        room.players.O
    ) {

        socket.emit(
            "error-message",
            "This room is already full."
        );

        return;
    }


    // Prevent same socket from joining twice

    if (
        room.players.X === socket.id ||
        room.players.O === socket.id
    ) {

        socket.emit(
            "error-message",
            "You are already in this room."
        );

        return;
    }


    // Assign Player O

    room.players.O =
        socket.id;


    room.status =
        "playing";


    room.turn =
        "X";


    socket.join(
        normalizedCode
    );


    socket.data.roomCode =
        normalizedCode;


    socket.data.symbol =
        "O";


    socket.emit(
        "room-joined",
        {

            roomCode:
                normalizedCode,

            symbol:
                "O"

        }
    );


    io.to(normalizedCode).emit(
        "notification",
        {

            message:
                "Player O joined the match."

        }
    );


    broadcastGameState(room);


    console.log(
        `Player O joined room: ${normalizedCode} | Socket: ${socket.id}`
    );

}


// ============================================================
// MAKE MOVE
// ============================================================

function makeMove(
    socket,
    index
) {

    const roomCode =
        socket.data.roomCode;


    const symbol =
        socket.data.symbol;


    if (!roomCode || !symbol) {

        socket.emit(
            "error-message",
            "You are not currently in a game."
        );

        return;
    }


    const room =
        rooms.get(roomCode);


    if (!room) {

        socket.emit(
            "error-message",
            "Game room no longer exists."
        );

        return;
    }


    // Game must be active

    if (
        room.status !== "playing"
    ) {

        socket.emit(
            "error-message",
            "This game is not currently active."
        );

        return;
    }


    // Check correct player

    if (
        room.players[symbol] !==
        socket.id
    ) {

        socket.emit(
            "error-message",
            "You are not registered as this player."
        );

        return;
    }


    // Check turn

    if (
        room.turn !== symbol
    ) {

        socket.emit(
            "error-message",
            "It is not your turn."
        );

        return;
    }


    // Validate index

    const position =
        Number(index);


    if (
        !Number.isInteger(position) ||
        position < 0 ||
        position > 8
    ) {

        socket.emit(
            "error-message",
            "Invalid board position."
        );

        return;
    }


    // Cell already occupied

    if (
        room.board[position] !== null
    ) {

        socket.emit(
            "error-message",
            "That cell is already occupied."
        );

        return;
    }


    // ==========================================
    // APPLY MOVE
    // ==========================================

    room.board[position] =
        symbol;


    // ==========================================
    // CHECK WIN / DRAW
    // ==========================================

    const result =
        checkWinner(
            room.board
        );


    if (result) {

        room.status =
            "finished";


        room.winner =
            result.winner;


        room.rematch = {

            X: false,

            O: false

        };


        broadcastGameState(room);


        console.log(
            `Room ${roomCode}: Player ${symbol} won.`
        );


        return;
    }


    // ==========================================
    // SWITCH TURN
    // ==========================================

    room.turn =
        symbol === "X"
            ? "O"
            : "X";


    broadcastGameState(room);


    console.log(
        `Room ${roomCode}: Player ${symbol} moved to ${position}`
    );

}


// ============================================================
// REMATCH REQUEST
// ============================================================

function requestRematch(socket) {

    const roomCode =
        socket.data.roomCode;


    const symbol =
        socket.data.symbol;


    if (!roomCode || !symbol) {

        return;
    }


    const room =
        rooms.get(roomCode);


    if (!room) {

        return;
    }


    // Rematch only available after game ends

    if (
        room.status !== "finished"
    ) {

        socket.emit(
            "error-message",
            "The current match has not finished yet."
        );

        return;
    }


    room.rematch[symbol] =
        true;


    io.to(roomCode).emit(
        "notification",
        {

            message:
                `Player ${symbol} requested a rematch.`

        }
    );


    // ==========================================
    // BOTH PLAYERS ACCEPT
    // ==========================================

    if (
        room.rematch.X &&
        room.rematch.O
    ) {

        room.board = [

            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null

        ];


        room.turn =
            "X";


        room.status =
            "playing";


        room.winner =
            null;


        room.rematch = {

            X: false,

            O: false

        };


        io.to(roomCode).emit(
            "notification",
            {

                message:
                    "Both players are ready. New match started!"

            }
        );

    }


    broadcastGameState(room);

}


// ============================================================
// DISCONNECT HANDLING
// ============================================================

function handleDisconnect(socket) {

    const roomCode =
        socket.data.roomCode;


    const symbol =
        socket.data.symbol;


    if (!roomCode || !symbol) {

        return;
    }


    const room =
        rooms.get(roomCode);


    if (!room) {

        return;
    }


    console.log(
        `Player ${symbol} disconnected from room ${roomCode}`
    );


    // Remove player

    if (
        room.players[symbol] ===
        socket.id
    ) {

        room.players[symbol] =
            null;

    }


    // ==========================================
    // IF OTHER PLAYER EXISTS
    // ==========================================

    const opponentSymbol =
        symbol === "X"
            ? "O"
            : "X";


    const opponentSocketId =
        room.players[
            opponentSymbol
        ];


    if (opponentSocketId) {

        io.to(
            opponentSocketId
        ).emit(
            "opponent-left",
            {

                message:
                    `Player ${symbol} disconnected from the match.`

            }
        );

    }


    // ==========================================
    // DELETE ROOM
    // ==========================================

    rooms.delete(
        roomCode
    );


    console.log(
        `Room removed: ${roomCode}`
    );

}


// ============================================================
// SOCKET.IO CONNECTION
// ============================================================

io.on(
    "connection",
    socket => {

        console.log(
            `Client connected: ${socket.id}`
        );


        // ------------------------------------------
        // CREATE ROOM
        // ------------------------------------------

        socket.on(
            "create-room",
            () => {

                createGameRoom(
                    socket
                );

            }
        );


        // ------------------------------------------
        // JOIN ROOM
        // ------------------------------------------

        socket.on(
            "join-room",
            roomCode => {

                joinGameRoom(
                    socket,
                    roomCode
                );

            }
        );


        // ------------------------------------------
        // MAKE MOVE
        // ------------------------------------------

        socket.on(
            "make-move",
            index => {

                makeMove(
                    socket,
                    index
                );

            }
        );


        // ------------------------------------------
        // REMATCH
        // ------------------------------------------

        socket.on(
            "rematch",
            () => {

                requestRematch(
                    socket
                );

            }
        );


        // ------------------------------------------
        // DISCONNECT
        // ------------------------------------------

        socket.on(
            "disconnect",
            () => {

                handleDisconnect(
                    socket
                );

                console.log(
                    `Client disconnected: ${socket.id}`
                );

            }
        );

    }
);


// ============================================================
// BASIC HEALTH ROUTE
// ============================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            application:
                "XO Arena",

            status:
                "running",

            rooms:
                rooms.size,

            websocket:
                "active"

        });

    }
);


// ============================================================
// START SERVER
// ============================================================

server.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "=========================================="
        );

        console.log(
            "        XO ARENA - SERVER STARTED"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Local: http://localhost:${PORT}`
        );

        console.log(
            `API:   http://localhost:${PORT}/api/status`
        );

        console.log(
            "WebSocket: Socket.io active"
        );

        console.log(
            "=========================================="
        );

        console.log("");

    }
);