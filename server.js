const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Game state
const games = new Map(); // gameId -> game state
const players = new Map(); // socketId -> player info
const waitingPlayers = []; // Queue for matchmaking

class Game {
    constructor(gameId, player1Id, player2Id) {
        this.gameId = gameId;
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.currentTurn = 'white'; // white goes first
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.gameOver = false;
        this.winner = null;
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Place white kings (bottom)
        board[7][3] = { type: 'king', color: 'white' };
        board[7][4] = { type: 'king', color: 'white' };

        // Place black kings (top)
        board[0][3] = { type: 'king', color: 'black' };
        board[0][4] = { type: 'king', color: 'black' };

        // Place white quadraphages
        for (let col = 0; col < 8; col++) {
            if (col !== 3 && col !== 4) {
                board[6][col] = { type: 'quadraphage', color: 'white' };
            }
        }

        // Place black quadraphages
        for (let col = 0; col < 8; col++) {
            if (col !== 3 && col !== 4) {
                board[1][col] = { type: 'quadraphage', color: 'black' };
            }
        }

        return board;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.currentTurn) return false;

        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (piece.type === 'king') {
            return rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0);
        } else if (piece.type === 'quadraphage') {
            return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        }

        return false;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return { success: false, error: 'Invalid move' };
        }

        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Check for promotion
        if (piece.type === 'quadraphage') {
            if ((piece.color === 'white' && toRow === 0) ||
                (piece.color === 'black' && toRow === 7)) {
                this.board[toRow][toCol] = { type: 'king', color: piece.color };
            }
        }

        // Check for game over
        this.checkGameOver();

        // Switch turn
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

        return {
            success: true,
            board: this.board,
            currentTurn: this.currentTurn,
            gameOver: this.gameOver,
            winner: this.winner
        };
    }

    checkGameOver() {
        let whiteKings = 0;
        let blackKings = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king') {
                    if (piece.color === 'white') whiteKings++;
                    else blackKings++;
                }
            }
        }

        if (whiteKings === 0) {
            this.gameOver = true;
            this.winner = 'black';
        } else if (blackKings === 0) {
            this.gameOver = true;
            this.winner = 'white';
        }
    }
}

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('findGame', () => {
        console.log('Player looking for game:', socket.id);

        if (waitingPlayers.length > 0) {
            // Match with waiting player
            const opponent = waitingPlayers.shift();
            const gameId = `game_${Date.now()}`;

            // Create new game
            const game = new Game(gameId, socket.id, opponent.id);
            games.set(gameId, game);

            // Store player info
            players.set(socket.id, {
                gameId,
                color: 'white',
                opponentId: opponent.id
            });
            players.set(opponent.id, {
                gameId,
                color: 'black',
                opponentId: socket.id
            });

            // Join both players to game room
            socket.join(gameId);
            opponent.socket.join(gameId);

            // Notify both players
            socket.emit('gameStart', {
                gameId,
                color: 'white',
                board: game.board,
                currentTurn: game.currentTurn
            });
            opponent.socket.emit('gameStart', {
                gameId,
                color: 'black',
                board: game.board,
                currentTurn: game.currentTurn
            });

            console.log('Game started:', gameId);
        } else {
            // Add to waiting queue
            waitingPlayers.push({ id: socket.id, socket });
            socket.emit('waiting');
            console.log('Player added to queue:', socket.id);
        }
    });

    socket.on('move', (data) => {
        const player = players.get(socket.id);
        if (!player) return;

        const game = games.get(player.gameId);
        if (!game) return;

        // Verify it's the player's turn
        if (game.currentTurn !== player.color) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        const { fromRow, fromCol, toRow, toCol } = data;
        const result = game.makeMove(fromRow, fromCol, toRow, toCol);

        if (result.success) {
            // Broadcast move to both players
            io.to(player.gameId).emit('moveUpdate', {
                board: result.board,
                currentTurn: result.currentTurn,
                fromRow,
                fromCol,
                toRow,
                toCol
            });

            if (result.gameOver) {
                io.to(player.gameId).emit('gameOver', { winner: result.winner });
            }
        } else {
            socket.emit('error', { message: result.error });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Remove from waiting queue
        const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitingIndex !== -1) {
            waitingPlayers.splice(waitingIndex, 1);
        }

        // Handle game disconnect
        const player = players.get(socket.id);
        if (player) {
            const game = games.get(player.gameId);
            if (game) {
                // Notify opponent
                const opponentId = player.opponentId;
                io.to(opponentId).emit('opponentDisconnected');

                // Clean up
                games.delete(player.gameId);
                players.delete(socket.id);
                players.delete(opponentId);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
