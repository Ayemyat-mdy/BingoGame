const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Player အသစ်ဝင်လာခြင်း
    socket.on('joinGame', (username) => {
        players.push({ id: socket.id, name: username });
        io.emit('updatePlayerCount', players.length);
    });

    // နံပါတ်နှိပ်လိုက်ချိန် (Draw Number)
    socket.on('drawNumber', () => {
        const number = Math.floor(Math.random() * 99) + 1;
        io.emit('numberDrawn', number);
    });

    // တစ်ယောက်ယောက် Bingo ဖြစ်သည့်အခါ
    socket.on('playerWin', (name) => {
        io.emit('announceWinner', name);
    });

    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit('updatePlayerCount', players.length);
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
