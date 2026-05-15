const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

let callHistory = [];
let players = {};
let isGameOver = false;

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    socket.emit('gameUpdate', { history: callHistory });
    io.emit('updatePlayerCount', Object.keys(players).length);

    socket.on('registerPlayer', (name) => {
        players[socket.id] = name;
        io.emit('updatePlayerCount', Object.keys(players).length);
    });

    socket.on('disconnect', () => {
        if (players[socket.id]) {
            delete players[socket.id];
            io.emit('updatePlayerCount', Object.keys(players).length);
        }
    });

    socket.on('callNumber', () => {
        if (isGameOver || callHistory.length >= 75) return;
        let num;
        do { num = Math.floor(Math.random() * 75) + 1; } while (callHistory.includes(num));
        callHistory.push(num);
        io.emit('gameUpdate', { history: callHistory, calledAt: Date.now() });
    });

    socket.on('playerWin', (data) => {
        isGameOver = true;
        io.emit('announceWinner', { winnerName: data.name });
    });

    socket.on('resetGame', () => {
        callHistory = [];
        isGameOver = false;
        io.emit('gameUpdate', { history: [], calledAt: null });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}!`));
