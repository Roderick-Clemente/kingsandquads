// Kings and Quadraphages Game - Local and Network Multiplayer
const BOARD_SIZE = 9;

// Audio context for turn sound
let audioContext = null;
let soundEnabled = true;

// Initialize sound toggle
document.addEventListener('DOMContentLoaded', () => {
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', (e) => {
            soundEnabled = e.target.checked;
        });
    }
});

// Function to play a simple ding sound
function playTurnSound() {
    if (!soundEnabled) return;

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Simple pleasant ding: two quick notes
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);

        // Second note
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 1000;
        gainNode2.gain.value = 0.2;
        oscillator2.start(audioContext.currentTime + 0.1);
        oscillator2.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.log('Audio not supported:', error);
    }
}

// Base Game Class - Shared logic for both modes
class BaseGame {
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
        this.squares = [];
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

                // Create coordinate label (e.g., "A1", "B3")
                const label = document.createElement('div');
                label.className = 'square-label';
                const colLetter = String.fromCharCode(65 + col); // A-I
                const rowNumber = row + 1; // 1-9
                label.textContent = `${colLetter}${rowNumber}`;
                square.appendChild(label);

                // Create content container for emojis
                const content = document.createElement('div');
                content.className = 'square-content';
                square.appendChild(content);

                square.addEventListener('click', () => this.onSquareClick(row, col));
                square.addEventListener('mouseenter', () => this.onSquareHover(row, col));
                square.addEventListener('mouseleave', () => this.onSquareLeave(row, col));
                this.boardElement.appendChild(square);
                this.squares[row][col] = square;
            }
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
        const contentDiv = square.querySelector('.square-content');
        const boardContent = this.board[row][col];

        square.className = 'square';

        if (boardContent === null) {
            contentDiv.textContent = '';
        } else if (boardContent === '👑1') {
            contentDiv.textContent = '👑';
            square.classList.add('king-red');
            if (this.currentPlayer !== 1) {
                square.classList.add('not-clickable');
            }
        } else if (boardContent === '👑2') {
            contentDiv.textContent = '👑';
            square.classList.add('king-blue');
            if (this.currentPlayer !== 2) {
                square.classList.add('not-clickable');
            }
        } else {
            contentDiv.textContent = boardContent;
            square.classList.add('occupied');
        }
    }

    updateUI() {
        this.p1CountElement.textContent = this.quadraphageCounts[0];
        this.p2CountElement.textContent = this.quadraphageCounts[1];

        // Update turn indicator - subclasses can override getTurnText()
        this.turnIndicator.textContent = this.getTurnText();

        // Update turn indicator styling
        this.turnIndicator.className = 'turn-indicator';
        this.addTurnIndicatorClasses();

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

    getTurnText() {
        // Default implementation - subclasses can override
        const playerColor = this.currentPlayer === 1 ? 'Red' : 'Blue';
        const action = this.kingMoved ? 'Place a Quadraphage' : 'Move the King';
        return `${playerColor} Player's Turn: ${action}`;
    }

    addTurnIndicatorClasses() {
        // Default implementation - subclasses can override
        this.turnIndicator.classList.add(this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn');
    }

    onSquareHover(row, col) {
        const square = this.squares[row][col];
        const contentDiv = square.querySelector('.square-content');

        if (this.shouldShowQuadPreview(row, col)) {
            const previewSymbol = this.currentPlayer === 1 ? '🔴' : '🔵';
            contentDiv.textContent = previewSymbol;
            square.classList.add('quad-preview');
        } else if (!this.kingMoved && this.board[row][col] === null && this.isKingMove(row, col)) {
            // Show ghost king preview for valid king moves
            contentDiv.textContent = '👑';
            square.classList.add('king-preview');
        }
    }

    onSquareLeave(row, col) {
        if (this.board[row][col] === null) {
            const square = this.squares[row][col];
            const contentDiv = square.querySelector('.square-content');
            contentDiv.textContent = '';
            square.classList.remove('quad-preview');
            square.classList.remove('king-preview');
        }
    }

    shouldShowQuadPreview(row, col) {
        // Default - subclasses can override for network mode
        return this.kingMoved && this.board[row][col] === null && this.canPlaceQuadraphage();
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

    checkEndCondition() {
        // After switchPlayer() is called, currentPlayer is now the NEXT player to move
        // So we check if currentPlayer's king is trapped - if so, the PREVIOUS player wins
        const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];

        if (this.isKingTrapped(kingRow, kingCol)) {
            // The current player's king is trapped, so the OTHER player wins
            const winner = this.currentPlayer === 1 ? 2 : 1;
            const winnerColor = winner === 1 ? 'Red' : 'Blue';
            const loserColor = winner === 1 ? 'Blue' : 'Red';

            // Trigger celebration animation
            this.celebrateWin(winner, winnerColor, loserColor);
            return true;
        }

        return false;
    }

    celebrateWin(winner, winnerColor, loserColor) {
        // Convert all quadraphages to fireworks with staggered animation
        let delay = 0;
        const fireworkSquares = [];

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const content = this.board[row][col];
                if (content === '🔴' || content === '🔵') {
                    const square = this.squares[row][col];
                    fireworkSquares.push({ square, delay });

                    setTimeout(() => {
                        square.textContent = '🎆';
                        square.classList.add('firework');
                    }, delay);

                    delay += 50; // Stagger the animations
                }
            }
        }

        // Show victory message after fireworks start
        setTimeout(() => {
            alert(`Game Over! ${winnerColor} Player wins! ${loserColor} Player's king is trapped!`);
        }, delay + 500);
    }

    // Abstract method - must be implemented by subclasses
    onSquareClick(row, col) {
        throw new Error('onSquareClick must be implemented by subclass');
    }
}

// Local Multiplayer Game - All game logic runs client-side
class LocalGame extends BaseGame {
    constructor() {
        super();
        this.createBoard();
        this.placeInitialKings();
        this.updateUI();
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

    moveKing(row, col) {
        const [oldRow, oldCol] = this.kingPositions[this.currentPlayer - 1];
        this.board[oldRow][oldCol] = null;
        this.updateSquare(oldRow, oldCol);

        this.board[row][col] = `👑${this.currentPlayer}`;
        this.kingPositions[this.currentPlayer - 1] = [row, col];
        this.updateSquare(row, col);
    }

    placeQuadraphage(row, col) {
        const symbol = this.currentPlayer === 1 ? '🔴' : '🔵';
        this.board[row][col] = symbol;
        this.updateSquare(row, col);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        playTurnSound();
        this.updateUI();
    }
}

// Network Multiplayer Game - Game logic runs on server
class NetworkGame extends BaseGame {
    constructor() {
        super();

        // Network-specific state
        this.socket = null;
        this.gameId = null;
        this.playerNumber = null;
        this.isMyTurn = false;

        // Additional DOM elements
        this.menuScreen = document.getElementById('menu-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.statusText = document.getElementById('status-text');

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

    // Override getTurnText for network mode
    getTurnText() {
        const action = this.kingMoved ? 'Place a Quadraphage' : 'Move the King';

        if (this.isMyTurn) {
            return `Your Turn: ${action}`;
        } else {
            return `Opponent's Turn: ${action}`;
        }
    }

    // Override addTurnIndicatorClasses for network mode
    addTurnIndicatorClasses() {
        if (this.isMyTurn) {
            this.turnIndicator.classList.add('your-turn');
        } else {
            this.turnIndicator.classList.add('opponent-turn');
        }
        this.turnIndicator.classList.add(this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn');
    }

    // Override shouldShowQuadPreview for network mode
    shouldShowQuadPreview(row, col) {
        return this.isMyTurn && this.kingMoved && this.board[row][col] === null && this.canPlaceQuadraphage();
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
