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
        this.currentPlayer = 1; // 1 or 2
        this.board = Array(9).fill(null).map(() => Array(9).fill(null));
        this.kingPositions = [[0, 4], [8, 4]]; // [row, col] for player 1 and 2
        this.quadraphageCounts = [30, 30];
        this.kingMoved = false;
        this.gameOver = false;
        this.winner = null;

        // Initialize kings
        this.board[0][4] = '👑1';
        this.board[8][4] = '👑2';
    }

    isKingMove(row, col) {
        const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];
        const rowDiff = Math.abs(kingRow - row);
        const colDiff = Math.abs(kingCol - col);
        return rowDiff <= 1 && colDiff <= 1 && this.board[row][col] === null;
    }

    moveKing(row, col) {
        if (!this.isKingMove(row, col)) {
            return { success: false, error: 'Invalid king move' };
        }

        const [oldRow, oldCol] = this.kingPositions[this.currentPlayer - 1];

        // Clear old position
        this.board[oldRow][oldCol] = null;

        // Set new position
        this.board[row][col] = `👑${this.currentPlayer}`;
        this.kingPositions[this.currentPlayer - 1] = [row, col];

        this.kingMoved = true;

        return {
            success: true,
            board: this.board,
            kingMoved: this.kingMoved,
            currentPlayer: this.currentPlayer,
            kingPositions: this.kingPositions,
            quadraphageCounts: this.quadraphageCounts
        };
    }

    placeQuadraphage(row, col) {
        if (this.board[row][col] !== null) {
            return { success: false, error: 'Square is not empty' };
        }

        if (!this.kingMoved) {
            return { success: false, error: 'Must move king first' };
        }

        if (this.quadraphageCounts[this.currentPlayer - 1] <= 0) {
            return { success: false, error: 'No quadraphages left' };
        }

        const symbol = this.currentPlayer === 1 ? '🔴' : '🔵';
        this.board[row][col] = symbol;
        this.quadraphageCounts[this.currentPlayer - 1]--;

        // Switch turn
        this.kingMoved = false;
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

        // Check for game over AFTER switching turn
        // If the current player's king is trapped, the OTHER player wins
        this.checkGameOver();

        return {
            success: true,
            board: this.board,
            kingMoved: this.kingMoved,
            currentPlayer: this.currentPlayer,
            kingPositions: this.kingPositions,
            quadraphageCounts: this.quadraphageCounts,
            gameOver: this.gameOver,
            winner: this.winner
        };
    }

    checkGameOver() {
        // After switchPlayer() is called, currentPlayer is now the NEXT player to move
        // So we check if currentPlayer's king is trapped - if so, the PREVIOUS player wins
        const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];

        if (this.isKingTrapped(kingRow, kingCol)) {
            // The current player's king is trapped, so the OTHER player wins
            this.gameOver = true;
            this.winner = this.currentPlayer === 1 ? 2 : 1;
        }
    }

    isKingTrapped(kingRow, kingCol) {
        // Check all 8 surrounding squares
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const newRow = kingRow + dr;
                const newCol = kingCol + dc;

                // If any square is in bounds and empty, king is not trapped
                if (newRow >= 0 && newRow < 9 &&
                    newCol >= 0 && newCol < 9 &&
                    this.board[newRow][newCol] === null) {
                    return false;
                }
            }
        }
        return true;
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
                playerNumber: 1,
                opponentId: opponent.id
            });
            players.set(opponent.id, {
                gameId,
                playerNumber: 2,
                opponentId: socket.id
            });

            // Join both players to game room
            socket.join(gameId);
            opponent.socket.join(gameId);

            // Notify both players
            console.log('Server board length:', game.board.length);
            console.log('Server board[0][4]:', game.board[0][4]);
            console.log('Server board[8][4]:', game.board[8][4]);

            socket.emit('gameStart', {
                gameId,
                playerNumber: 1,
                board: game.board,
                currentPlayer: game.currentPlayer,
                kingMoved: game.kingMoved,
                kingPositions: game.kingPositions,
                quadraphageCounts: game.quadraphageCounts
            });
            opponent.socket.emit('gameStart', {
                gameId,
                playerNumber: 2,
                board: game.board,
                currentPlayer: game.currentPlayer,
                kingMoved: game.kingMoved,
                kingPositions: game.kingPositions,
                quadraphageCounts: game.quadraphageCounts
            });

            console.log('Game started:', gameId);
        } else {
            // Add to waiting queue
            waitingPlayers.push({ id: socket.id, socket });
            socket.emit('waiting');
            console.log('Player added to queue:', socket.id);
        }
    });

    socket.on('moveKing', (data) => {
        const player = players.get(socket.id);
        if (!player) return;

        const game = games.get(player.gameId);
        if (!game) return;

        // Verify it's the player's turn
        if (game.currentPlayer !== player.playerNumber) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        // Verify king hasn't moved yet this turn
        if (game.kingMoved) {
            socket.emit('error', { message: 'King already moved, place quadraphage' });
            return;
        }

        const { row, col } = data;
        const result = game.moveKing(row, col);

        if (result.success) {
            // Broadcast move to both players
            io.to(player.gameId).emit('gameUpdate', result);
        } else {
            socket.emit('error', { message: result.error });
        }
    });

    socket.on('placeQuadraphage', (data) => {
        const player = players.get(socket.id);
        if (!player) return;

        const game = games.get(player.gameId);
        if (!game) return;

        // Verify it's the player's turn
        if (game.currentPlayer !== player.playerNumber) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        const { row, col } = data;
        const result = game.placeQuadraphage(row, col);

        if (result.success) {
            // Broadcast move to both players
            io.to(player.gameId).emit('gameUpdate', result);

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
