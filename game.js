// Multiplayer Kings and Quadraphages Game
const BOARD_SIZE = 9;

class MultiplayerGame {
    constructor() {
        // Connection state
        this.socket = null;
        this.gameId = null;
        this.playerNumber = null; // 1 or 2
        this.isMyTurn = false;

        // Game state
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.currentPlayer = 1;
        this.kingPositions = [[0, 4], [8, 4]];
        this.quadraphageCounts = [30, 30];
        this.kingMoved = false;

        // DOM elements
        this.menuScreen = document.getElementById('menu-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.findGameBtn = document.getElementById('find-game-btn');
        this.statusText = document.getElementById('status-text');
        this.boardElement = document.getElementById('board');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.p1CountElement = document.getElementById('p1-count');
        this.p2CountElement = document.getElementById('p2-count');
        this.playerNumberElement = document.getElementById('player-number');

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
            this.playerNumber = data.playerNumber;
            this.board = data.board;
            this.currentPlayer = data.currentPlayer;
            this.kingMoved = data.kingMoved;
            this.kingPositions = data.kingPositions;
            this.quadraphageCounts = data.quadraphageCounts;
            this.isMyTurn = this.currentPlayer === this.playerNumber;

            this.startGame();
        });

        this.socket.on('gameUpdate', (data) => {
            console.log('Game update:', data);
            this.board = data.board;
            this.currentPlayer = data.currentPlayer;
            this.kingMoved = data.kingMoved;
            this.kingPositions = data.kingPositions;
            this.quadraphageCounts = data.quadraphageCounts;
            this.isMyTurn = this.currentPlayer === this.playerNumber;

            this.updateUI();
        });

        this.socket.on('gameOver', (data) => {
            const youWon = data.winner === this.playerNumber;
            const winnerColor = data.winner === 1 ? 'Red' : 'Blue';
            const loserColor = data.winner === 1 ? 'Blue' : 'Red';
            setTimeout(() => {
                alert(youWon
                    ? `You won! ${loserColor} Player's king is trapped!`
                    : `You lost! ${winnerColor} Player wins!`);
            }, 100);
        });

        this.socket.on('opponentDisconnected', () => {
            alert('Opponent disconnected. You win!');
            this.backToMenu();
        });

        this.socket.on('error', (data) => {
            console.error('Server error:', data.message);
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

        const playerColor = this.playerNumber === 1 ? 'Red' : 'Blue';
        this.playerNumberElement.textContent = `You are: ${playerColor} Player`;

        console.log('Starting game with board:', this.board);
        console.log('King at [0][4]:', this.board[0][4]);
        console.log('King at [8][4]:', this.board[8][4]);

        this.createBoard();
        this.updateUI();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        this.squares = [];

        for (let row = 0; row < BOARD_SIZE; row++) {
            this.squares[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                const square = document.createElement('button');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', () => this.onSquareClick(row, col));
                square.addEventListener('mouseenter', () => this.onSquareHover(row, col));
                square.addEventListener('mouseleave', () => this.onSquareLeave(row, col));
                this.boardElement.appendChild(square);
                this.squares[row][col] = square;
            }
        }
    }

    onSquareClick(row, col) {
        // Can't move if not your turn
        if (!this.isMyTurn) {
            return;
        }

        // Check if square is empty
        if (this.board[row][col] !== null) {
            return;
        }

        // Phase 1: Move king
        if (!this.kingMoved && this.isKingMove(row, col)) {
            this.socket.emit('moveKing', { row, col });
        }
        // Phase 2: Place quadraphage
        else if (this.kingMoved && this.canPlaceQuadraphage()) {
            this.socket.emit('placeQuadraphage', { row, col });
        }
    }

    isKingMove(row, col) {
        const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];
        const rowDiff = Math.abs(kingRow - row);
        const colDiff = Math.abs(kingCol - col);
        return rowDiff <= 1 && colDiff <= 1 && this.board[row][col] === null;
    }

    canPlaceQuadraphage() {
        return this.quadraphageCounts[this.currentPlayer - 1] > 0;
    }

    updateSquare(row, col) {
        const square = this.squares[row][col];
        const content = this.board[row][col];

        // Clear all classes
        square.className = 'square';

        if (content === null) {
            square.textContent = '';
        } else if (content === '👑1') {
            square.textContent = '👑';
            square.classList.add('king-red');
            // Add not-clickable class if it's not this king's turn
            if (this.currentPlayer !== 1) {
                square.classList.add('not-clickable');
            }
        } else if (content === '👑2') {
            square.textContent = '👑';
            square.classList.add('king-blue');
            // Add not-clickable class if it's not this king's turn
            if (this.currentPlayer !== 2) {
                square.classList.add('not-clickable');
            }
        } else {
            square.textContent = content;
            square.classList.add('occupied');
        }
    }

    updateUI() {
        // Update quadraphage counts
        this.p1CountElement.textContent = this.quadraphageCounts[0];
        this.p2CountElement.textContent = this.quadraphageCounts[1];

        // Update turn indicator
        const playerColor = this.currentPlayer === 1 ? 'Red' : 'Blue';
        const action = this.kingMoved ? 'Place a Quadraphage' : 'Move the King';

        if (this.isMyTurn) {
            this.turnIndicator.textContent = `Your Turn: ${action}`;
        } else {
            this.turnIndicator.textContent = `Opponent's Turn: ${action}`;
        }

        // Update turn indicator styling
        this.turnIndicator.className = 'turn-indicator';
        if (this.isMyTurn) {
            this.turnIndicator.classList.add('your-turn');
        } else {
            this.turnIndicator.classList.add('opponent-turn');
        }
        this.turnIndicator.classList.add(this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn');

        // Update all squares
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.updateSquare(row, col);
            }
        }

        // Add blink effect to current player's king when it's time to move
        if (!this.kingMoved) {
            const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];
            const kingSquare = this.squares[kingRow][kingCol];
            kingSquare.classList.add('king-active');
        }
    }

    onSquareHover(row, col) {
        // Only show preview when it's your turn, placing quadraphage, and square is empty
        if (this.isMyTurn && this.kingMoved && this.board[row][col] === null && this.canPlaceQuadraphage()) {
            const square = this.squares[row][col];
            const previewSymbol = this.currentPlayer === 1 ? '🔴' : '🔵';
            square.textContent = previewSymbol;
            square.classList.add('quad-preview');
        }
    }

    onSquareLeave(row, col) {
        // Remove preview if square is still empty
        if (this.board[row][col] === null) {
            const square = this.squares[row][col];
            square.textContent = '';
            square.classList.remove('quad-preview');
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
