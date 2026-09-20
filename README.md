# 🎮 XO Arena — Multiplayer Tic-Tac-Toe

> A real-time two-player Tic-Tac-Toe game built with **Node.js, Express.js and Socket.io**, featuring private game rooms, server-side move validation, real-time synchronization, rematch functionality, and a responsive professional UI.

---

## 📌 Project Overview

**XO Arena** is a real-time multiplayer Tic-Tac-Toe web application where two players can create or join a private game room and play against each other in real time.

The application uses **Socket.io/WebSockets** to synchronize the game state between players. The server maintains the authoritative game state, validates every move, manages player turns, detects wins and draws, and handles player disconnections.

The project was developed as **Day 20 of the VEDA Technology Web Development Track**.

---

## ✨ Features

### 🎮 Multiplayer Gameplay

- Two-player real-time Tic-Tac-Toe
- Player X and Player O assignment
- Turn-based gameplay
- Automatic win detection
- Automatic draw detection
- Winning-cell highlighting

### 🔐 Room-Based Multiplayer

- Create a private game room
- Automatically generated 6-character room codes
- Join an existing room using the code
- Maximum of two players per room
- Independent game state for each room

### ⚡ Real-Time Synchronization

- WebSocket communication using Socket.io
- Instant board updates
- Real-time turn synchronization
- Player connection status
- Real-time game notifications

### 🛡️ Server-Side Validation

The server validates:

- Player identity
- Player turn
- Board position
- Occupied cells
- Game status
- Win conditions
- Draw conditions

This prevents clients from directly controlling the game state.

### 🔄 Rematch System

- Request a rematch after a completed game
- Wait for the opponent's confirmation
- Automatically reset the board when both players accept
- Start a new round without leaving the room

### 📋 Room Management

- Display current room code
- Copy room code to clipboard
- Detect full rooms
- Detect invalid room codes
- Handle player disconnections

### 📱 Responsive UI

The interface is optimized for:

- Desktop
- Laptop
- Tablet
- Mobile devices

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript | Client-side game logic |
| Node.js | Backend runtime |
| Express.js | Web server |
| Socket.io | Real-time WebSocket communication |
| npm | Package management |

---

## 🏗️ Project Architecture

```text
                         ┌─────────────────────┐
                         │     Player X        │
                         │      Browser        │
                         └──────────┬──────────┘
                                    │
                                    │ WebSocket
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │                     │
                         │      Node.js        │
                         │      Express        │
                         │      Socket.io      │
                         │                     │
                         │  Authoritative      │
                         │   Game State        │
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    │ WebSocket
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Player O        │
                         │      Browser        │
                         └─────────────────────┘
```

### Game Flow

```text
Create Room
     ↓
Server Generates Room Code
     ↓
Player X Assigned
     ↓
Player O Joins Using Room Code
     ↓
Game Starts
     ↓
Player Makes Move
     ↓
Server Validates Move
     ↓
Game State Updated
     ↓
Socket.io Broadcasts State
     ↓
Both Players Receive Update
     ↓
Win / Draw Detection
     ↓
Match Complete
     ↓
Rematch or Leave
```

---

## 📁 Project Structure

```text
multiplayer-tic-tac-toe/
│
├── node_modules/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── package.json
├── package-lock.json
└── server.js
```

### File Description

#### `server.js`

Main backend server responsible for:

- Express server
- Socket.io configuration
- Room creation
- Player assignment
- Game state management
- Move validation
- Turn management
- Winner detection
- Draw detection
- Rematch handling
- Disconnect handling

#### `public/index.html`

Contains the complete frontend structure including:

- Lobby
- Create room interface
- Join room interface
- Player cards
- Game board
- Match status
- Room information
- Result screen

#### `public/style.css`

Provides:

- Professional dark UI
- Responsive layout
- Game board styling
- Animations
- Player states
- Buttons
- Toast notifications
- Mobile responsiveness

#### `public/app.js`

Handles:

- Socket.io client connection
- Room creation
- Room joining
- Board rendering
- Player interactions
- Turn updates
- Game results
- Rematch requests
- Clipboard functionality
- Notifications

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/multiplayer-tic-tac-toe.git
```

### 2. Navigate to the Project

```bash
cd multiplayer-tic-tac-toe
```

### 3. Install Dependencies

```bash
npm install
```

---

## ▶️ Running the Application

### Development Mode

Run:

```bash
npm run dev
```

This starts the server using Nodemon.

### Production/Normal Mode

Run:

```bash
npm start
```

The server will start at:

```text
http://localhost:3000
```

---

## 🎮 How to Play

### Step 1 — Create a Room

Open:

```text
http://localhost:3000
```

Click:

```text
Create Game
```

The server generates a unique room code.

Example:

```text
A7K29P
```

The first player becomes:

```text
Player X
```

---

### Step 2 — Join the Room

Open the application in another browser window or device.

Enter the room code:

```text
A7K29P
```

Click:

```text
Join Game
```

The second player becomes:

```text
Player O
```

---

### Step 3 — Play

Player X starts the game.

Players alternate turns:

```text
X → O → X → O → ...
```

A player cannot:

- Play out of turn
- Select an occupied cell
- Make a move after the game ends

---

### Step 4 — Win

A player wins by completing:

```text
X | X | X
---------
  | O |
---------
O |   |
```

or any other valid row, column, or diagonal.

The winning cells are highlighted automatically.

---

### Step 5 — Draw

If all nine cells are occupied without a winner, the game ends in a draw.

---

### Step 6 — Rematch

After the match:

```text
Request Rematch
```

Both players must request a rematch.

Once both players accept:

```text
Board → Reset
Turn → X
Status → Playing
```

A new round starts automatically.

---

## 🔌 Socket.io Events

The application uses Socket.io events for real-time communication.

### Client → Server

| Event | Purpose |
|---|---|
| `create-room` | Creates a new game room |
| `join-room` | Joins an existing room |
| `make-move` | Sends a player's selected board position |
| `rematch` | Requests a new game |

### Server → Client

| Event | Purpose |
|---|---|
| `room-created` | Sends newly created room information |
| `room-joined` | Confirms successful room joining |
| `game-state` | Broadcasts the current game state |
| `error-message` | Sends validation/error messages |
| `notification` | Sends game notifications |
| `opponent-left` | Notifies a player when the opponent disconnects |

---

## 🧠 Game State

The server maintains the authoritative state of each room.

Example:

```javascript
{
    roomCode: "A7K29P",

    board: [
        "X",
        null,
        "O",
        null,
        "X",
        null,
        "O",
        null,
        null
    ],

    turn: "O",

    status: "playing",

    winner: null,

    players: {
        X: true,
        O: true
    }
}
```

---

## 🛡️ Server-Side Validation

The application does not rely only on frontend validation.

Every move is validated by the server.

### Validation includes:

```text
Is the player inside a room?
        ↓
Does the room exist?
        ↓
Is the game active?
        ↓
Is this the correct player?
        ↓
Is it this player's turn?
        ↓
Is the board position valid?
        ↓
Is the cell empty?
        ↓
Apply the move
        ↓
Check winner/draw
        ↓
Broadcast updated state
```

This architecture prevents a client from simply modifying its own board without server approval.

---

## 🔒 Why the Server Holds the Authoritative Game State

The server maintains the official game state because clients should not be trusted to determine whether their own moves are valid.

For example, a malicious or incorrectly implemented client could attempt to:

```text
Play twice
↓
Play when it is not their turn
↓
Overwrite an occupied cell
↓
Modify the winner
```

The server prevents these actions by validating every move before updating and broadcasting the game state.

---

## 📡 API Health Check

The project also includes a basic server status endpoint.

Open:

```text
http://localhost:3000/api/status
```

Example response:

```json
{
    "application": "XO Arena",
    "status": "running",
    "rooms": 1,
    "websocket": "active"
}
```

This can be used to verify that the backend and Socket.io service are running.

---

## 🧪 Testing Checklist

Before submitting the project, test the following:

### Room Management

- [ ] Create a room
- [ ] Generate unique room code
- [ ] Join room using valid code
- [ ] Try invalid room code
- [ ] Try joining a full room

### Gameplay

- [ ] Player X receives X
- [ ] Player O receives O
- [ ] Player X starts
- [ ] Turns alternate correctly
- [ ] Occupied cells cannot be selected
- [ ] Out-of-turn moves are rejected

### Win Detection

- [ ] Horizontal win
- [ ] Vertical win
- [ ] Diagonal win

### Draw Detection

- [ ] Full board without winner
- [ ] Draw result displayed

### Real-Time Features

- [ ] Board updates on both browsers
- [ ] Turn updates on both browsers
- [ ] Player status updates
- [ ] Notifications appear

### Rematch

- [ ] Player can request rematch
- [ ] Opponent can accept rematch
- [ ] Board resets
- [ ] New match starts

### Disconnect

- [ ] Close Player O browser
- [ ] Player X receives notification
- [ ] Match is terminated correctly

### Responsive Design

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] Small-screen devices

---

## 🖥️ Browser Testing

For multiplayer testing, open two browser windows.

### Player 1

```text
http://localhost:3000
```

Select:

```text
Create Game
```

### Player 2

Open:

```text
http://localhost:3000
```

Enter the generated room code and select:

```text
Join Game
```

Both players should see the same board state in real time.

---

## 🚀 Future Improvements

The current application stores rooms in server memory, which is suitable for a learning/demo project.

Possible future improvements include:

- User authentication
- Player profiles
- Persistent game history
- MongoDB integration
- Redis-based room storage
- Reconnection support
- Spectator mode
- Leaderboards
- Match history
- Player statistics
- Multiple game modes
- Private invitation links
- Online player list
- Production deployment
- Horizontal Socket.io scaling

---

## 📚 Learning Outcomes

This project demonstrates practical understanding of:

- Node.js backend development
- Express.js
- WebSocket communication
- Socket.io
- Event-driven programming
- Client-server architecture
- Real-time state synchronization
- Room-based communication
- Server-side validation
- Game-state management
- Responsive web design
- DOM manipulation
- Asynchronous JavaScript

---

## 💡 Interview Questions

### 1. Why use WebSockets?

WebSockets provide a persistent two-way communication channel between the client and server, making them suitable for applications that require real-time updates.

### 2. Why use Socket.io?

Socket.io simplifies real-time communication and provides features such as rooms, events, reconnection handling, and broadcasting.

### 3. Why should the server maintain the game state?

The server should maintain the authoritative state so that players cannot bypass game rules by manipulating the client-side application.

### 4. How are players assigned?

The first player joining a room is assigned `X`, while the second player is assigned `O`.

### 5. How is a winner detected?

The server checks all possible winning combinations after every valid move.

### 6. What happens when a player disconnects?

The server detects the socket disconnection, removes the player from the room, and informs the remaining player.

---

## 📸 Project Screenshots

Add screenshots of the following sections to your GitHub repository:

```text
screenshots/
│
├── lobby.png
├── create-room.png
├── multiplayer-game.png
├── winning-screen.png
└── mobile-view.png
```

Then add them to this README:

```markdown
## 📸 Screenshots

### Lobby

![Lobby](screenshots/lobby.png)

### Multiplayer Game

![Multiplayer Game](screenshots/multiplayer-game.png)

### Winning Screen

![Winning Screen](screenshots/winning-screen.png)

### Mobile View

![Mobile View](screenshots/mobile-view.png)
```

---

## 👩‍💻 Developer

**Manya Shetty**

BE — Information Science & Engineering

### Interests

- Web Development
- Full-Stack Development
- Artificial Intelligence
- Machine Learning
- Real-Time Applications

---

## 🏢 Internship

Developed as part of the:

**VEDA Technology — Web Development Track**

### Task

**Day 20 — Multiplayer Tic-Tac-Toe (WebSockets)**

---

## 📄 License

This project is developed for educational and portfolio purposes.

Licensed under the **MIT License**.

---

## ⭐ Acknowledgement

Thanks to **VEDA Technology** for providing practical web development tasks focused on building real-world applications and strengthening full-stack development skills.

---

### ⭐ If you find this project useful, consider giving the repository a star!