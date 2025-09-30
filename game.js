// Kings and Quadraphages Game - Local and Network Multiplayer
const BOARD_SIZE = 9;

// Local Multiplayer Game (original)
class LocalGame {
    constructor() {
        // Game state
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.currentPlayer = 1;
        this.kingPositions = [[0, 4], [8, 4]];
        this.quadraphageCounts = [30, 30];
        this.kingMoved = false;

        // DOM elements
        this.boardElement = document.getElementById('board');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.p1CountElement = document.getElementById('p1-count');
        this.p2CountElement = document.getElementById('p2-count');
        this.playerNumberElement = document.getElementById('player-number');

        // Initialize game
        this.createBoard();
        this.placeInitialKings();
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

    placeInitialKings() {
        this.board[0][4] = '👑1';
        this.board[8][4] = '👑2';
        this.updateSquare(0, 4);
        this.updateSquare(8, 4);
    }

    onSquareClick(row, col) {
        if (this.board[row][col] !== null) {
            return;
        }

        if (!this.kingMoved && this.isKingMove(row, col)) {
            this.moveKing(row, col);
            this.kingMoved = true;
            this.updateUI();
        } else if (this.kingMoved && this.canPlaceQuadraphage()) {
            this.placeQuadraphage(row, col);
            this.quadraphageCounts[this.currentPlayer - 1]--;
            this.kingMoved = false;
            this.switchPlayer();
        }

        this.checkEndCondition();
    }

    isKingMove(row, col) {
        const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];
        const rowDiff = Math.abs(kingRow - row);
        const colDiff = Math.abs(kingCol - col);
        return rowDiff <= 1 && colDiff <= 1 && this.board[row][col] === null;
    }

    moveKing(row, col) {
        const [oldRow, oldCol] = this.kingPositions[this.currentPlayer - 1];
        this.board[oldRow][oldCol] = null;
        this.updateSquare(oldRow, oldCol);

        this.board[row][col] = `👑${this.currentPlayer}`;
        this.kingPositions[this.currentPlayer - 1] = [row, col];
        this.updateSquare(row, col);
    }

    canPlaceQuadraphage() {
        return this.quadraphageCounts[this.currentPlayer - 1] > 0;
    }

    placeQuadraphage(row, col) {
        const symbol = this.currentPlayer === 1 ? '🔴' : '🔵';
        this.board[row][col] = symbol;
        this.updateSquare(row, col);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateUI();
    }

    updateSquare(row, col) {
        const square = this.squares[row][col];
        const content = this.board[row][col];

        square.className = 'square';

        if (content === null) {
            square.textContent = '';
        } else if (content === '👑1') {
            square.textContent = '👑';
            square.classList.add('king-red');
            if (this.currentPlayer !== 1) {
                square.classList.add('not-clickable');
            }
        } else if (content === '👑2') {
            square.textContent = '👑';
            square.classList.add('king-blue');
            if (this.currentPlayer !== 2) {
                square.classList.add('not-clickable');
            }
        } else {
            square.textContent = content;
            square.classList.add('occupied');
        }
    }

    updateUI() {
        this.p1CountElement.textContent = this.quadraphageCounts[0];
        this.p2CountElement.textContent = this.quadraphageCounts[1];

        const playerColor = this.currentPlayer === 1 ? 'Red' : 'Blue';
        const action = this.kingMoved ? 'Place a Quadraphage' : 'Move the King';
        this.turnIndicator.textContent = `${playerColor} Player's Turn: ${action}`;

        this.turnIndicator.className = 'turn-indicator';
        this.turnIndicator.classList.add(this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn');

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.updateSquare(row, col);
            }
        }

        if (!this.kingMoved) {
            const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];
            const kingSquare = this.squares[kingRow][kingCol];
            kingSquare.classList.add('king-active');
        }
    }

    checkEndCondition() {
        for (let player = 0; player < 2; player++) {
            const [kingRow, kingCol] = this.kingPositions[player];
            if (this.isKingTrapped(kingRow, kingCol)) {
                const winner = player === 0 ? 2 : 1;
                const winnerColor = winner === 1 ? 'Red' : 'Blue';
                const loserColor = winner === 1 ? 'Blue' : 'Red';
                setTimeout(() => {
                    alert(`Game Over! ${winnerColor} Player wins! ${loserColor} Player's king is trapped!`);
                }, 100);
                return true;
            }
        }
        return false;
    }

    isKingTrapped(kingRow, kingCol) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const newRow = kingRow + dr;
                const newCol = kingCol + dc;

                if (newRow >= 0 && newRow < BOARD_SIZE &&
                    newCol >= 0 && newCol < BOARD_SIZE &&
                    this.board[newRow][newCol] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    onSquareHover(row, col) {
        if (this.kingMoved && this.board[row][col] === null && this.canPlaceQuadraphage()) {
            const square = this.squares[row][col];
            const previewSymbol = this.currentPlayer === 1 ? '🔴' : '🔵';
            square.textContent = previewSymbol;
            square.classList.add('quad-preview');
        }
    }

    onSquareLeave(row, col) {
        if (this.board[row][col] === null) {
            const square = this.squares[row][col];
            square.textContent = '';
            square.classList.remove('quad-preview');
        }
    }
}

// Network Multiplayer Game
class NetworkGame {
    constructor() {
        // Connection state
        this.socket = null;
        this.gameId = null;
        this.playerNumber = null;
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
        this.statusText = document.getElementById('status-text');
        this.boardElement = document.getElementById('board');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.p1CountElement = document.getElementById('p1-count');
        this.p2CountElement = document.getElementById('p2-count');
        this.playerNumberElement = document.getElementById('player-number');

        this.connectAndFindGame();
    }

    connectAndFindGame() {
        this.statusText.textContent = 'Connecting to server...';

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
        if (!this.isMyTurn || this.board[row][col] !== null) {
            return;
        }

        if (!this.kingMoved && this.isKingMove(row, col)) {
            this.socket.emit('moveKing', { row, col });
        } else if (this.kingMoved && this.canPlaceQuadraphage()) {
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

        square.className = 'square';

        if (content === null) {
            square.textContent = '';
        } else if (content === '👑1') {
            square.textContent = '👑';
            square.classList.add('king-red');
            if (this.currentPlayer !== 1) {
                square.classList.add('not-clickable');
            }
        } else if (content === '👑2') {
            square.textContent = '👑';
            square.classList.add('king-blue');
            if (this.currentPlayer !== 2) {
                square.classList.add('not-clickable');
            }
        } else {
            square.textContent = content;
            square.classList.add('occupied');
        }
    }

    updateUI() {
        this.p1CountElement.textContent = this.quadraphageCounts[0];
        this.p2CountElement.textContent = this.quadraphageCounts[1];

        const playerColor = this.currentPlayer === 1 ? 'Red' : 'Blue';
        const action = this.kingMoved ? 'Place a Quadraphage' : 'Move the King';

        if (this.isMyTurn) {
            this.turnIndicator.textContent = `Your Turn: ${action}`;
        } else {
            this.turnIndicator.textContent = `Opponent's Turn: ${action}`;
        }

        this.turnIndicator.className = 'turn-indicator';
        if (this.isMyTurn) {
            this.turnIndicator.classList.add('your-turn');
        } else {
            this.turnIndicator.classList.add('opponent-turn');
        }
        this.turnIndicator.classList.add(this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn');

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.updateSquare(row, col);
            }
        }

        if (!this.kingMoved) {
            const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];
            const kingSquare = this.squares[kingRow][kingCol];
            kingSquare.classList.add('king-active');
        }
    }

    onSquareHover(row, col) {
        if (this.isMyTurn && this.kingMoved && this.board[row][col] === null && this.canPlaceQuadraphage()) {
            const square = this.squares[row][col];
            const previewSymbol = this.currentPlayer === 1 ? '🔴' : '🔵';
            square.textContent = previewSymbol;
            square.classList.add('quad-preview');
        }
    }

    onSquareLeave(row, col) {
        if (this.board[row][col] === null) {
            const square = this.squares[row][col];
            square.textContent = '';
            square.classList.remove('quad-preview');
        }
    }

    backToMenu() {
        this.gameScreen.style.display = 'none';
        this.menuScreen.style.display = 'flex';
        this.statusText.textContent = '';

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        location.reload();
    }
}

// Initialize game based on mode selection
document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const localBtn = document.getElementById('local-btn');
    const networkBtn = document.getElementById('network-btn');
    const statusText = document.getElementById('status-text');

    localBtn.addEventListener('click', () => {
        menuScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        new LocalGame();
    });

    networkBtn.addEventListener('click', () => {
        networkBtn.disabled = true;
        localBtn.disabled = true;
        new NetworkGame();
    });
});
