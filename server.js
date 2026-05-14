const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let callHistory = [];
let players = {};
let isGameOver = false;

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    // လက်ရှိအခြေအနေကို ပို့ပေးခြင်း
    socket.emit('gameUpdate', { history: callHistory });
    
    socket.on('registerPlayer', (name) => {
        players[socket.id] = name;
        io.emit('updatePlayerCount', Object.keys(players).length);
    });

    socket.on('callNumber', () => {
        if (isGameOver || callHistory.length >= 75) return;
        let num;
        do { num = Math.floor(Math.random() * 75) + 1; } 
        while (callHistory.includes(num));
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

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayerCount', Object.keys(players).length);
    });
});

// Render ပေါ်တင်ရန်အတွက် PORT ကို ပြောင်းလဲပြင်ဆင်ထားသည်
const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Bingo Server is running on port ${PORT}`);
});