const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

let gameState = {
    history: [],
    availableNumbers: Array.from({ length: 75 }, (_, i) => i + 1),
    players: 0
};

io.on('connection', (socket) => {
    gameState.players++;
    io.emit('updatePlayerCount', gameState.players);
    socket.emit('gameUpdate', gameState);

    // Host calls a new number
    socket.on('callNumber', () => {
        if (gameState.availableNumbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * gameState.availableNumbers.length);
            const num = gameState.availableNumbers.splice(randomIndex, 1)[0];
            gameState.history.push(num);
            io.emit('gameUpdate', gameState);
        }
    });

    // Player claims Bingo
    socket.on('claimBingo', (playerName) => {
        io.emit('announceWinner', { winnerName: playerName });
    });

    // Reset game
    socket.on('resetGame', () => {
        gameState = {
            history: [],
            availableNumbers: Array.from({ length: 75 }, (_, i) => i + 1),
            players: gameState.players
        };
        io.emit('gameUpdate', gameState);
    });

    socket.on('disconnect', () => {
        gameState.players--;
        io.emit('updatePlayerCount', gameState.players);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Bingo server running at http://localhost:${PORT}`);
});
