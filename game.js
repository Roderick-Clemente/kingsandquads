// Multiplayer Kings and Quadraphages Game

class MultiplayerGame {
    constructor() {
        // Connection state
        this.socket = null;
        this.gameId = null;
        this.playerColor = null;
        this.isMyTurn = false;

        // Game state
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.validMoves = [];

        // DOM elements
        this.menuScreen = document.getElementById('menu-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.findGameBtn = document.getElementById('find-game-btn');
        this.statusText = document.getElementById('status-text');
        this.boardElement = document.getElementById('board');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.playerColorElement = document.getElementById('player-color');

        // Initialize
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.findGameBtn.addEventListener('click', () => this.connectAndFindGame());
    }

    connectAndFindGame() {
        this.statusText.textContent = 'Connecting to server...';
        this.findGameBtn.disabled = true;

        // Connect to Socket.IO server
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.statusText.textContent = 'Looking for opponent...';
            this.socket.emit('findGame');
        });

        this.socket.on('waiting', () => {
            this.statusText.textContent = 'Waiting for opponent...';
        });

        this.socket.on('gameStart', (data) => {
            console.log('Game started:', data);
            this.gameId = data.gameId;
            this.playerColor = data.color;
            this.board = data.board;
            this.currentTurn = data.currentTurn;
            this.isMyTurn = this.currentTurn === this.playerColor;

            this.startGame();
        });

        this.socket.on('moveUpdate', (data) => {
            console.log('Move update:', data);
            this.board = data.board;
            this.currentTurn = data.currentTurn;
            this.isMyTurn = this.currentTurn === this.playerColor;
            this.selectedPiece = null;
            this.validMoves = [];

            this.renderBoard();
            this.updateTurnIndicator();
        });

        this.socket.on('gameOver', (data) => {
            const youWon = data.winner === this.playerColor;
            setTimeout(() => {
                alert(youWon ? 'You won!' : 'You lost!');
            }, 100);
        });

        this.socket.on('opponentDisconnected', () => {
            alert('Opponent disconnected. You win!');
            this.backToMenu();
        });

        this.socket.on('error', (data) => {
            console.error('Server error:', data.message);
            alert(data.message);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            if (this.gameScreen.style.display !== 'none') {
                alert('Connection lost');
                this.backToMenu();
            }
        });
    }

    startGame() {
        this.menuScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';

        this.playerColorElement.textContent = `You are: ${this.playerColor.charAt(0).toUpperCase() + this.playerColor.slice(1)}`;

        this.createBoard();
        this.renderBoard();
        this.updateTurnIndicator();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        this.squares = [];

        for (let row = 0; row < 8; row++) {
            this.squares[row] = [];
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('button');
                square.className = 'square';

                // Alternate colors
                if ((row + col) % 2 === 0) {
                    square.classList.add('light');
                } else {
                    square.classList.add('dark');
                }

                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', () => this.onSquareClick(row, col));

                this.boardElement.appendChild(square);
                this.squares[row][col] = square;
            }
        }
    }

    renderBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.updateSquare(row, col);
            }
        }
    }

    updateSquare(row, col) {
        const square = this.squares[row][col];
        const piece = this.board[row][col];

        // Clear content
        square.innerHTML = '';
        square.classList.remove('selected', 'valid-move', 'has-piece');

        // Check if this square is selected
        if (this.selectedPiece &&
            this.selectedPiece.row === row &&
            this.selectedPiece.col === col) {
            square.classList.add('selected');
        }

        // Check if this is a valid move
        if (this.validMoves.some(m => m.row === row && m.col === col)) {
            square.classList.add('valid-move');
        }

        // Render piece
        if (piece) {
            square.classList.add('has-piece');
            const pieceElement = document.createElement('div');
            pieceElement.className = `piece ${piece.type} ${piece.color}`;

            if (piece.type === 'king') {
                pieceElement.textContent = '♔';
            } else {
                pieceElement.textContent = '●';
            }

            square.appendChild(pieceElement);
        }
    }

    onSquareClick(row, col) {
        if (!this.isMyTurn) {
            return;
        }

        const piece = this.board[row][col];

        // If a piece is selected
        if (this.selectedPiece) {
            // Check if clicked square is a valid move
            const isValidMove = this.validMoves.some(m => m.row === row && m.col === col);

            if (isValidMove) {
                // Make the move
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            } else if (piece && piece.color === this.playerColor) {
                // Select different piece
                this.selectPiece(row, col);
            } else {
                // Deselect
                this.selectedPiece = null;
                this.validMoves = [];
                this.renderBoard();
            }
        } else {
            // No piece selected, try to select one
            if (piece && piece.color === this.playerColor) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.playerColor) {
            return;
        }

        this.selectedPiece = { row, col, piece };
        this.validMoves = this.getValidMoves(row, col);
        this.renderBoard();
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];

        if (piece.type === 'king') {
            // King moves one square in any direction
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;

                    const newRow = row + dr;
                    const newCol = col + dc;

                    if (this.isValidMove(row, col, newRow, newCol)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        } else if (piece.type === 'quadraphage') {
            // Quadraphage moves one square orthogonally
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;

                if (this.isValidMove(row, col, newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        // Check bounds
        if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
            return false;
        }

        const targetPiece = this.board[toRow][toCol];

        // Can't move to square with own piece
        if (targetPiece && targetPiece.color === this.playerColor) {
            return false;
        }

        return true;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        // Send move to server
        this.socket.emit('move', {
            fromRow,
            fromCol,
            toRow,
            toCol
        });

        // Optimistically update UI (server will send update)
        this.selectedPiece = null;
        this.validMoves = [];
    }

    updateTurnIndicator() {
        if (this.isMyTurn) {
            this.turnIndicator.textContent = 'Your turn';
            this.turnIndicator.className = 'turn-indicator your-turn';
        } else {
            this.turnIndicator.textContent = "Opponent's turn";
            this.turnIndicator.className = 'turn-indicator opponent-turn';
        }
    }

    backToMenu() {
        this.gameScreen.style.display = 'none';
        this.menuScreen.style.display = 'flex';
        this.findGameBtn.disabled = false;
        this.statusText.textContent = '';

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MultiplayerGame();
});
