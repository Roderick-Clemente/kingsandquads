/**
 * Kings and Quadraphages Game - Local and Network Multiplayer
 * 
 * A strategic two-player board game where players move their kings and place
 * quadraphages to trap their opponent's king.
 * 
 * @author Kings and Quadraphages Team
 * @version 1.0.0
 */

/** @constant {number} BOARD_SIZE - Size of the game board (9x9) */
const BOARD_SIZE = 9;

/** @type {AudioContext|null} Global audio context for sound effects */
let audioContext = null;

/** @type {boolean} Global flag to enable/disable sound effects */
let soundEnabled = true;

/**
 * Initialize sound toggle and help modal on page load
 * Sets up event listeners for UI controls
 */
document.addEventListener('DOMContentLoaded', () => {
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', (e) => {
            soundEnabled = e.target.checked;
        });
    }

    // Help modal functionality
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeBtn = document.querySelector('.close');

    if (helpBtn && helpModal && closeBtn) {
        helpBtn.addEventListener('click', () => {
            helpModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            helpModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
    }
});

/**
 * Plays a pleasant two-note ding sound when a turn is completed
 * Uses Web Audio API to generate oscillator tones
 * 
 * @returns {void}
 */
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

/**
 * Plays a celebratory ascending melody when a player wins
 * Creates a triumphant C-E-G-C progression
 * 
 * @returns {void}
 */
function playWinSound() {
    if (!soundEnabled) return;

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const now = audioContext.currentTime;

        // Triumphant ascending melody
        const notes = [
            { freq: 523, time: 0, duration: 0.15 },      // C
            { freq: 659, time: 0.15, duration: 0.15 },   // E
            { freq: 784, time: 0.3, duration: 0.15 },    // G
            { freq: 1047, time: 0.45, duration: 0.3 },   // C high
            { freq: 784, time: 0.75, duration: 0.1 },    // G
            { freq: 1047, time: 0.85, duration: 0.4 }    // C high (hold)
        ];

        notes.forEach(note => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(0.3, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });
    } catch (error) {
        console.log('Audio not supported:', error);
    }
}

/**
 * Plays a descending sad melody when a player loses
 * Creates a melancholic C-A#-G-F progression
 * 
 * @returns {void}
 */
function playLossSound() {
    if (!soundEnabled) return;

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const now = audioContext.currentTime;

        // Descending sad melody
        const notes = [
            { freq: 523, time: 0, duration: 0.2 },       // C
            { freq: 466, time: 0.2, duration: 0.2 },     // A#
            { freq: 392, time: 0.4, duration: 0.2 },     // G
            { freq: 349, time: 0.6, duration: 0.4 }      // F (hold)
        ];

        notes.forEach(note => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.frequency.value = note.freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.25, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });
    } catch (error) {
        console.log('Audio not supported:', error);
    }
}

/**
 * Base Game Class - Shared logic for both local and network modes
 * 
 * Contains all common game logic including:
 * - Board state management
 * - UI rendering and updates
 * - Move validation
 * - Win condition checking
 * - Visual effects and animations
 * 
 * @abstract
 * @class
 */
class BaseGame {
    /**
     * Initializes the base game state and DOM references
     * 
     * @constructor
     */
    constructor() {
        // Game state
        /** @type {Array<Array<string|null>>} 2D array representing the board */
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        
        /** @type {number} Current player (1 or 2) */
        this.currentPlayer = 1;
        
        /** @type {Array<Array<number>>} King positions [row, col] for each player */
        this.kingPositions = [[0, 4], [8, 4]];
        
        /** @type {Array<number>} Remaining quadraphages for each player */
        this.quadraphageCounts = [30, 30];
        
        /** @type {boolean} Whether the current player has moved their king this turn */
        this.kingMoved = false;

        // DOM elements
        /** @type {HTMLElement} The game board container */
        this.boardElement = document.getElementById('board');
        
        /** @type {HTMLElement} Turn indicator text element */
        this.turnIndicator = document.getElementById('turn-indicator');
        
        /** @type {HTMLElement} Player 1 quadraphage count display */
        this.p1CountElement = document.getElementById('p1-count');
        
        /** @type {HTMLElement} Player 2 quadraphage count display */
        this.p2CountElement = document.getElementById('p2-count');
        
        /** @type {HTMLElement} Player number/color display */
        this.playerNumberElement = document.getElementById('player-number');
        
        /** @type {Array<Array<HTMLElement>>} 2D array of square DOM elements */
        this.squares = [];
    }

    /**
     * Creates the game board DOM structure
     * Generates a 9x9 grid with coordinate labels (A1-I9)
     * Attaches event listeners for click, hover, and leave events
     * 
     * @returns {void}
     */
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

    /**
     * Checks if a move to the specified position is a valid king move
     * Kings can move one square in any direction (8-directional)
     * 
     * @param {number} row - Target row (0-8)
     * @param {number} col - Target column (0-8)
     * @returns {boolean} True if the move is valid for the current player's king
     */
    isKingMove(row, col) {
        const [kingRow, kingCol] = this.kingPositions[this.currentPlayer - 1];
        const rowDiff = Math.abs(kingRow - row);
        const colDiff = Math.abs(kingCol - col);
        return rowDiff <= 1 && colDiff <= 1 && this.board[row][col] === null;
    }

    /**
     * Checks if the current player can place a quadraphage
     * 
     * @returns {boolean} True if the player has quadraphages remaining
     */
    canPlaceQuadraphage() {
        return this.quadraphageCounts[this.currentPlayer - 1] > 0;
    }

    /**
     * Updates the visual representation of a single square
     * Sets appropriate emoji, styling, and CSS classes based on square content
     * 
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {void}
     */
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

    /**
     * Updates the entire game UI
     * Refreshes quadraphage counts, turn indicator, and all board squares
     * Adds visual effects like king blinking when it's time to move
     * 
     * @returns {void}
     */
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

    /**
     * Gets the turn indicator text
     * Can be overridden by subclasses for custom messaging
     * 
     * @returns {string} Text describing whose turn it is and what action to take
     */
    getTurnText() {
        const playerColor = this.currentPlayer === 1 ? 'Red' : 'Blue';
        const action = this.kingMoved ? 'Place a Quadraphage' : 'Move the King';
        return `${playerColor} Player's Turn: ${action}`;
    }

    /**
     * Adds CSS classes to the turn indicator element
     * Can be overridden by subclasses for custom styling
     * 
     * @returns {void}
     */
    addTurnIndicatorClasses() {
        this.turnIndicator.classList.add(this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn');
    }

    /**
     * Handles mouse hover over a square
     * Shows preview of quadraphage or king placement
     * 
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {void}
     */
    onSquareHover(row, col) {
        const square = this.squares[row][col];
        const contentDiv = square.querySelector('.square-content');

        if (this.shouldShowQuadPreview(row, col)) {
            const previewSymbol = this.currentPlayer === 1 ? '🔴' : '🔵';
            contentDiv.textContent = previewSymbol;
            square.classList.add('quad-preview');
        } else if (this.shouldShowKingPreview(row, col)) {
            // Show ghost king preview for valid king moves
            contentDiv.textContent = '👑';
            square.classList.add('king-preview');
            square.classList.add(this.currentPlayer === 1 ? 'preview-red' : 'preview-blue');
        }
    }

    /**
     * Handles mouse leave from a square
     * Removes preview effects from empty squares
     * 
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {void}
     */
    onSquareLeave(row, col) {
        if (this.board[row][col] === null) {
            const square = this.squares[row][col];
            const contentDiv = square.querySelector('.square-content');
            contentDiv.textContent = '';
            square.classList.remove('quad-preview');
            square.classList.remove('king-preview', 'preview-red', 'preview-blue');
        }
    }

    /**
     * Determines if a quadraphage preview should be shown on hover
     * Can be overridden by subclasses (e.g., network mode checks turn)
     * 
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {boolean} True if preview should be shown
     */
    shouldShowQuadPreview(row, col) {
        return this.kingMoved && this.board[row][col] === null && this.canPlaceQuadraphage();
    }

    /**
     * Determines if a king preview should be shown on hover
     * Can be overridden by subclasses (e.g., network mode checks turn)
     * 
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {boolean} True if preview should be shown
     */
    shouldShowKingPreview(row, col) {
        return !this.kingMoved && this.board[row][col] === null && this.isKingMove(row, col);
    }

    /**
     * Checks if a king at the specified position is trapped
     * A king is trapped if all 8 surrounding squares are occupied
     * 
     * @param {number} kingRow - King's row position (0-8)
     * @param {number} kingCol - King's column position (0-8)
     * @returns {boolean} True if the king has no valid moves
     */
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

    /**
     * Checks if the game has ended (king is trapped)
     * Should be called after each turn completes
     * 
     * Note: After switchPlayer() is called, currentPlayer is the NEXT player to move.
     * If currentPlayer's king is trapped, the PREVIOUS player wins.
     * 
     * @returns {boolean} True if the game has ended
     */
    checkEndCondition() {
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

    /**
     * Triggers celebration animation when a player wins
     * Converts all quadraphages to fireworks with staggered timing
     * 
     * @param {number} winner - Winning player number (1 or 2)
     * @param {string} winnerColor - Color name of winner ('Red' or 'Blue')
     * @param {string} loserColor - Color name of loser ('Red' or 'Blue')
     * @returns {void}
     */
    celebrateWin(winner, winnerColor, loserColor) {
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
            this.showGameOverMessage(winner, winnerColor, loserColor);
        }, delay + 500);
    }

    /**
     * Displays the game over message
     * Can be overridden by subclasses for custom messaging
     * 
     * @param {number} winner - Winning player number (1 or 2)
     * @param {string} winnerColor - Color name of winner ('Red' or 'Blue')
     * @param {string} loserColor - Color name of loser ('Red' or 'Blue')
     * @returns {void}
     */
    showGameOverMessage(winner, winnerColor, loserColor) {
        playWinSound();
        alert(`🎉 Game Over!\n\n${winnerColor} Player wins!\n${loserColor} Player's king is trapped!`);
    }

    /**
     * Handles square click events
     * ABSTRACT METHOD - Must be implemented by subclasses
     * 
     * @abstract
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @throws {Error} If not implemented by subclass
     * @returns {void}
     */
    onSquareClick(row, col) {
        throw new Error('onSquareClick must be implemented by subclass');
    }

    /**
     * Places the initial kings on the board at starting positions
     * Red king at A1 (top center), Blue king at I1 (bottom center)
     * 
     * @returns {void}
     */
    placeInitialKings() {
        this.board[0][4] = '👑1';
        this.board[8][4] = '👑2';
        this.updateSquare(0, 4);
        this.updateSquare(8, 4);
    }

    /**
     * Moves the current player's king to a new position
     * Updates board state and visual representation
     * 
     * @param {number} row - Target row (0-8)
     * @param {number} col - Target column (0-8)
     * @returns {void}
     */
    moveKing(row, col) {
        const [oldRow, oldCol] = this.kingPositions[this.currentPlayer - 1];
        this.board[oldRow][oldCol] = null;
        this.updateSquare(oldRow, oldCol);

        this.board[row][col] = `👑${this.currentPlayer}`;
        this.kingPositions[this.currentPlayer - 1] = [row, col];
        this.updateSquare(row, col);
    }

    /**
     * Places a quadraphage at the specified position
     * Uses current player's color (red or blue)
     * 
     * @param {number} row - Target row (0-8)
     * @param {number} col - Target column (0-8)
     * @returns {void}
     */
    placeQuadraphage(row, col) {
        const symbol = this.currentPlayer === 1 ? '🔴' : '🔵';
        this.board[row][col] = symbol;
        this.updateSquare(row, col);
    }

    /**
     * Switches to the other player's turn
     * Plays turn sound and updates UI
     * 
     * @returns {void}
     */
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        playTurnSound();
        this.updateUI();
    }
}

/**
 * Local Multiplayer Game - All game logic runs client-side
 * 
 * Implements a local two-player game where both players share the same device.
 * All game state and logic is managed on the client without server communication.
 * 
 * @extends BaseGame
 * @class
 */
class LocalGame extends BaseGame {
    /**
     * Initializes a new local game
     * Creates the board, places initial kings, and starts the game
     * 
     * @constructor
     */
    constructor() {
        super();
        this.createBoard();
        this.placeInitialKings();
        this.updateUI();
    }

    /**
     * Handles square click events for local game
     * Processes king moves and quadraphage placements
     * 
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {void}
     */
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
}

/**
 * Network Multiplayer Game - Game logic runs on server
 * 
 * Implements online multiplayer using Socket.IO for real-time communication.
 * The server manages game state and validates all moves.
 * Clients send move requests and receive state updates.
 * 
 * @extends BaseGame
 * @class
 */
class NetworkGame extends BaseGame {
    /**
     * Initializes a new network game
     * Connects to the server and starts matchmaking
     * 
     * @constructor
     */
    constructor() {
        super();

        // Network-specific state
        /** @type {Socket|null} Socket.IO connection to game server */
        this.socket = null;
        
        /** @type {string|null} Unique identifier for this game session */
        this.gameId = null;
        
        /** @type {number|null} This player's number (1 or 2) */
        this.playerNumber = null;
        
        /** @type {boolean} Whether it's currently this player's turn */
        this.isMyTurn = false;

        // Additional DOM elements
        /** @type {HTMLElement} Menu screen element */
        this.menuScreen = document.getElementById('menu-screen');
        
        /** @type {HTMLElement} Game screen element */
        this.gameScreen = document.getElementById('game-screen');
        
        /** @type {HTMLElement} Status text element for connection messages */
        this.statusText = document.getElementById('status-text');

        this.connectAndFindGame();
    }

    /**
     * Connects to the game server and initiates matchmaking
     * Sets up all Socket.IO event listeners for game communication
     * 
     * @returns {void}
     */
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

            // Check if turn switched (quadraphage was placed)
            const turnSwitched = this.currentPlayer !== data.currentPlayer;

            this.board = data.board;
            this.currentPlayer = data.currentPlayer;
            this.kingMoved = data.kingMoved;
            this.kingPositions = data.kingPositions;
            this.quadraphageCounts = data.quadraphageCounts;
            this.isMyTurn = this.currentPlayer === this.playerNumber;

            // Play turn sound when turn switches
            if (turnSwitched) {
                playTurnSound();
            }

            this.updateUI();
        });

        this.socket.on('gameOver', (data) => {
            const youWon = data.winner === this.playerNumber;
            const winnerColor = data.winner === 1 ? 'Red' : 'Blue';
            const loserColor = data.winner === 1 ? 'Blue' : 'Red';

            setTimeout(() => {
                if (youWon) {
                    playWinSound();
                    alert(`🎉 You won! ${loserColor} Player's king is trapped!`);
                } else {
                    playLossSound();
                    alert(`😔 You lost! ${winnerColor} Player wins!\n\nBetter luck next time!`);
                }
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

    /**
     * Starts the network game after matchmaking completes
     * Transitions from menu to game screen and initializes the board
     * 
     * @returns {void}
     */
    startGame() {
        this.menuScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';

        const playerColor = this.playerNumber === 1 ? 'Red' : 'Blue';
        this.playerNumberElement.textContent = `You are: ${playerColor} Player`;

        this.createBoard();
        this.updateUI();
    }

    /**
     * Handles square click events for network game
     * Sends move requests to the server instead of updating state directly
     * 
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {void}
     */
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

    /**
     * Gets the turn indicator text for network mode
     * Shows "Your Turn" or "Opponent's Turn" instead of player colors
     * 
     * @override
     * @returns {string} Text describing whose turn it is
     */
    getTurnText() {
        const action = this.kingMoved ? 'Place a Quadraphage' : 'Move the King';

        if (this.isMyTurn) {
            return `Your Turn: ${action}`;
        } else {
            return `Opponent's Turn: ${action}`;
        }
    }

    /**
     * Adds CSS classes to the turn indicator for network mode
     * Adds both turn-specific and player-color classes
     * 
     * @override
     * @returns {void}
     */
    addTurnIndicatorClasses() {
        if (this.isMyTurn) {
            this.turnIndicator.classList.add('your-turn');
        } else {
            this.turnIndicator.classList.add('opponent-turn');
        }
        this.turnIndicator.classList.add(this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn');
    }

    /**
     * Determines if quadraphage preview should show in network mode
     * Only shows preview when it's the player's turn
     * 
     * @override
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {boolean} True if preview should be shown
     */
    shouldShowQuadPreview(row, col) {
        return this.isMyTurn && this.kingMoved && this.board[row][col] === null && this.canPlaceQuadraphage();
    }

    /**
     * Determines if king preview should show in network mode
     * Only shows preview when it's the player's turn
     * 
     * @override
     * @param {number} row - Row index (0-8)
     * @param {number} col - Column index (0-8)
     * @returns {boolean} True if preview should be shown
     */
    shouldShowKingPreview(row, col) {
        return this.isMyTurn && !this.kingMoved && this.board[row][col] === null && this.isKingMove(row, col);
    }

    /**
     * Returns to the main menu and cleans up the network connection
     * Disconnects from server and reloads the page
     * 
     * @returns {void}
     */
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

/**
 * Initialize game based on mode selection
 * Sets up event listeners for local and network game buttons
 */
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
