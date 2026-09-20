const socket = io();


// =============================================
// DOM
// =============================================

const lobby =
    document.getElementById("lobby");

const gameSection =
    document.getElementById("gameSection");

const createRoomBtn =
    document.getElementById("createRoomBtn");

const joinRoomBtn =
    document.getElementById("joinRoomBtn");

const roomInput =
    document.getElementById("roomInput");

const roomCode =
    document.getElementById("roomCode");

const copyRoomBtn =
    document.getElementById("copyRoomBtn");

const cells =
    document.querySelectorAll(".cell");

const connectionDot =
    document.getElementById("connectionDot");

const connectionText =
    document.getElementById("connectionText");

const playerX =
    document.getElementById("playerX");

const playerO =
    document.getElementById("playerO");

const playerXState =
    document.getElementById("playerXState");

const playerOState =
    document.getElementById("playerOState");

const gameStatus =
    document.getElementById("gameStatus");

const gameMessage =
    document.getElementById("gameMessage");

const moveCount =
    document.getElementById("moveCount");

const turnDisplay =
    document.getElementById("turnDisplay");

const mySymbolElement =
    document.getElementById("mySymbol");

const turnIcon =
    document.getElementById("turnIcon");

const turnText =
    document.getElementById("turnText");

const resultPanel =
    document.getElementById("resultPanel");

const resultIcon =
    document.getElementById("resultIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultText =
    document.getElementById("resultText");

const rematchBtn =
    document.getElementById("rematchBtn");

const newGameBtn =
    document.getElementById("newGameBtn");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


// =============================================
// CLIENT STATE
// =============================================

let mySymbol = null;

let currentRoom = null;

let currentState = null;

let toastTimer = null;


// =============================================
// CONNECTION
// =============================================

socket.on("connect", () => {

    connectionDot.classList.add("connected");

    connectionDot.classList.remove(
        "disconnected"
    );

    connectionText.textContent =
        "Connected";

});


socket.on("disconnect", () => {

    connectionDot.classList.remove(
        "connected"
    );

    connectionDot.classList.add(
        "disconnected"
    );

    connectionText.textContent =
        "Disconnected";

});


// =============================================
// CREATE ROOM
// =============================================

createRoomBtn.addEventListener(
    "click",
    () => {

        createRoomBtn.disabled = true;

        createRoomBtn.innerHTML =
            `
            <span>Creating room...</span>
            <span>...</span>
            `;

        socket.emit("create-room");

        setTimeout(() => {

            createRoomBtn.disabled = false;

            createRoomBtn.innerHTML =
                `
                <span>Create Game</span>
                <span class="button-arrow">→</span>
                `;

        }, 1500);

    }
);


// =============================================
// JOIN ROOM
// =============================================

joinRoomBtn.addEventListener(
    "click",
    joinRoom
);


roomInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            joinRoom();

        }

    }
);


roomInput.addEventListener(
    "input",
    () => {

        roomInput.value =
            roomInput.value
                .replace(/[^a-zA-Z0-9]/g, "")
                .toUpperCase();

    }
);


function joinRoom() {

    const code =
        roomInput.value
            .trim()
            .toUpperCase();


    if (code.length !== 6) {

        showToast(
            "Enter a valid 6-character room code."
        );

        roomInput.focus();

        return;
    }


    joinRoomBtn.disabled = true;

    joinRoomBtn.textContent =
        "Joining...";


    socket.emit(
        "join-room",
        code
    );


    setTimeout(() => {

        joinRoomBtn.disabled = false;

        joinRoomBtn.textContent =
            "Join Game";

    }, 1500);

}


// =============================================
// ROOM CREATED
// =============================================

socket.on(
    "room-created",
    data => {

        mySymbol =
            data.symbol;

        currentRoom =
            data.roomCode;

        showGame();

        showToast(
            `Room ${currentRoom} created successfully.`
        );

    }
);


// =============================================
// ROOM JOINED
// =============================================

socket.on(
    "room-joined",
    data => {

        mySymbol =
            data.symbol;

        currentRoom =
            data.roomCode;

        showGame();

        showToast(
            "You joined the match."
        );

    }
);


// =============================================
// SHOW GAME
// =============================================

function showGame() {

    lobby.classList.add("hidden");

    gameSection.classList.remove(
        "hidden"
    );

    roomCode.textContent =
        currentRoom;

    mySymbolElement.textContent =
        mySymbol;

    updatePlayerCards();

}


// =============================================
// GAME STATE
// =============================================

socket.on(
    "game-state",
    state => {

        currentState =
            state;

        renderBoard(state);

        updatePlayerCards();

        updateStatus(state);

        updateStats(state);

        updateTurnBanner(state);

        updateResult(state);

    }
);


// =============================================
// RENDER BOARD
// =============================================

function renderBoard(state) {

    cells.forEach(
        cell => {

            cell.classList.remove(
                "x",
                "o",
                "winning"
            );

        }
    );


    state.board.forEach(
        (value, index) => {

            const cell =
                cells[index];


            cell.textContent =
                value || "";


            if (value === "X") {

                cell.classList.add("x");

            }


            if (value === "O") {

                cell.classList.add("o");

            }


            cell.disabled =
                Boolean(value) ||
                state.status !== "playing" ||
                state.turn !== mySymbol;

        }
    );


    /*
        Highlight winning line.
    */

    if (
        state.status === "finished" &&
        state.winner !== "draw"
    ) {

        const winningLine =
            findWinningLine(
                state.board,
                state.winner
            );


        if (winningLine) {

            winningLine.forEach(
                index => {

                    cells[index]
                        .classList.add(
                            "winning"
                        );

                }
            );

        }

    }

}


// =============================================
// FIND WINNING LINE
// =============================================

function findWinningLine(
    board,
    winner
) {

    const patterns = [

        [0,1,2],
        [3,4,5],
        [6,7,8],

        [0,3,6],
        [1,4,7],
        [2,5,8],

        [0,4,8],
        [2,4,6]

    ];


    return patterns.find(
        pattern => {

            return pattern.every(
                index =>
                    board[index] === winner
            );

        }
    );

}


// =============================================
// CELL CLICK
// =============================================

cells.forEach(
    cell => {

        cell.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        cell.dataset.index
                    );


                if (!currentState) {
                    return;
                }


                if (
                    currentState.status !==
                    "playing"
                ) {

                    return;

                }


                if (
                    currentState.turn !==
                    mySymbol
                ) {

                    showToast(
                        "Wait for your turn."
                    );

                    return;
                }


                socket.emit(
                    "make-move",
                    index
                );

            }
        );

    }
);


// =============================================
// PLAYER CARDS
// =============================================

function updatePlayerCards() {

    playerX.classList.remove(
        "active"
    );

    playerO.classList.remove(
        "active"
    );


    if (!currentState) {
        return;
    }


    playerXState.textContent =
        currentState.players.X
            ? "CONNECTED"
            : "WAITING";


    playerOState.textContent =
        currentState.players.O
            ? "CONNECTED"
            : "WAITING";


    if (
        currentState.status ===
        "playing"
    ) {

        if (
            currentState.turn === "X"
        ) {

            playerX.classList.add(
                "active"
            );

            playerXState.textContent =
                "YOUR TURN";

        }


        if (
            currentState.turn === "O"
        ) {

            playerO.classList.add(
                "active"
            );

            playerOState.textContent =
                "YOUR TURN";

        }

    }


    if (
        currentState.status ===
        "finished"
    ) {

        if (
            currentState.winner === "X"
        ) {

            playerXState.textContent =
                "WINNER";

        }


        if (
            currentState.winner === "O"
        ) {

            playerOState.textContent =
                "WINNER";

        }

    }

}


// =============================================
// GAME STATUS
// =============================================

function updateStatus(state) {

    if (
        state.status === "waiting"
    ) {

        gameStatus.textContent =
            "Waiting for Player O";

        gameMessage.textContent =
            "Share the room code with your opponent.";

        return;
    }


    if (
        state.status === "playing"
    ) {

        if (
            state.turn === mySymbol
        ) {

            gameStatus.textContent =
                "Your Turn";

            gameMessage.textContent =
                "Make your move on the board.";

        } else {

            gameStatus.textContent =
                "Opponent's Turn";

            gameMessage.textContent =
                `Player ${state.turn} is making a move.`;

        }

        return;
    }


    if (
        state.status === "finished"
    ) {

        gameStatus.textContent =
            "Match Complete";


        if (
            state.winner === "draw"
        ) {

            gameMessage.textContent =
                "The board is full. The match ended in a draw.";

        } else {

            gameMessage.textContent =
                `Player ${state.winner} won the match.`;

        }

    }

}


// =============================================
// STATISTICS
// =============================================

function updateStats(state) {

    const moves =
        state.board.filter(
            cell => cell !== null
        ).length;


    moveCount.textContent =
        `${moves} / 9`;


    turnDisplay.textContent =
        state.status === "playing"
            ? state.turn
            : "—";

}


// =============================================
// TURN BANNER
// =============================================

function updateTurnBanner(state) {

    if (
        state.status === "waiting"
    ) {

        turnIcon.textContent =
            "…";

        turnText.textContent =
            "Waiting for opponent";

        return;
    }


    if (
        state.status === "finished"
    ) {

        turnIcon.textContent =
            "✓";

        turnText.textContent =
            "Match complete";

        return;
    }


    turnIcon.textContent =
        state.turn;


    if (
        state.turn === mySymbol
    ) {

        turnText.textContent =
            "Your turn — make a move";

    } else {

        turnText.textContent =
            `Player ${state.turn}'s turn`;

    }

}


// =============================================
// RESULT
// =============================================

function updateResult(state) {

    if (
        state.status !== "finished"
    ) {

        resultPanel.classList.add(
            "hidden"
        );

        return;
    }


    resultPanel.classList.remove(
        "hidden"
    );


    if (
        state.winner === "draw"
    ) {

        resultIcon.textContent =
            "🤝";

        resultTitle.textContent =
            "It's a Draw";

        resultText.textContent =
            "Neither player managed to complete a line.";

    } else if (
        state.winner === mySymbol
    ) {

        resultIcon.textContent =
            "🏆";

        resultTitle.textContent =
            "You Win";

        resultText.textContent =
            "Excellent game. You completed the winning line.";

    } else {

        resultIcon.textContent =
            "○";

        resultTitle.textContent =
            "Match Over";

        resultText.textContent =
            `Player ${state.winner} won this round.`;

    }


    if (
        state.rematch &&
        state.rematch[mySymbol]
    ) {

        rematchBtn.textContent =
            "Waiting for Opponent...";

        rematchBtn.disabled =
            true;

    } else {

        rematchBtn.textContent =
            "Request Rematch";

        rematchBtn.disabled =
            false;

    }

}


// =============================================
// REMATCH
// =============================================

rematchBtn.addEventListener(
    "click",
    () => {

        rematchBtn.disabled =
            true;

        rematchBtn.textContent =
            "Waiting for Opponent...";

        socket.emit(
            "rematch"
        );

    }
);


// =============================================
// COPY ROOM
// =============================================

copyRoomBtn.addEventListener(
    "click",
    async () => {

        if (!currentRoom) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                currentRoom
            );

            showToast(
                "Room code copied to clipboard."
            );

        } catch {

            showToast(
                `Room code: ${currentRoom}`
            );

        }

    }
);


// =============================================
// LEAVE
// =============================================

newGameBtn.addEventListener(
    "click",
    () => {

        window.location.reload();

    }
);


// =============================================
// SERVER ERROR
// =============================================

socket.on(
    "error-message",
    message => {

        showToast(
            message
        );

    }
);


// =============================================
// SERVER NOTIFICATION
// =============================================

socket.on(
    "notification",
    data => {

        showToast(
            data.message
        );

    }
);


// =============================================
// OPPONENT LEFT
// =============================================

socket.on(
    "opponent-left",
    data => {

        showToast(
            "Opponent disconnected."
        );


        gameStatus.textContent =
            "Opponent Disconnected";


        gameMessage.textContent =
            data.message;


        cells.forEach(
            cell => {

                cell.disabled =
                    true;

            }
        );


        resultPanel.classList.remove(
            "hidden"
        );


        resultIcon.textContent =
            "⚠️";


        resultTitle.textContent =
            "Player Disconnected";


        resultText.textContent =
            "The match has ended. Return to the lobby to start another game.";


        rematchBtn.classList.add(
            "hidden"
        );

    }
);


// =============================================
// TOAST
// =============================================

function showToast(message) {

    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}