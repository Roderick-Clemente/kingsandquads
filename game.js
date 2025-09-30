// Constants
const BOARD_SIZE = 9;

class KingsAndQuadraphages {
    constructor() {
        // Game state
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.currentPlayer = 1;
        this.kingPositions = [[0, 4], [8, 4]]; // [row, col] for player 1 and 2
        this.quadraphageCounts = [30, 30];
        this.kingMoved = false;

        // DOM elements
        this.boardElement = document.getElementById('board');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.p1CountElement = document.getElementById('p1-count');
        this.p2CountElement = document.getElementById('p2-count');
        this.resetBtn = document.getElementById('reset-btn');

        // Initialize game
        this.createBoard();
        this.placeInitialKings();
        this.updateUI();

        // Add reset button listener
        this.resetBtn.addEventListener('click', () => this.resetGame());
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
        // Check if square is empty
        if (this.board[row][col] !== null) {
            return;
        }

        // Phase 1: Move king
        if (!this.kingMoved && this.isKingMove(row, col)) {
            this.moveKing(row, col);
            this.kingMoved = true;
            this.updateUI();
        }
        // Phase 2: Place quadraphage
        else if (this.kingMoved && this.canPlaceQuadraphage()) {
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

        // Clear old position
        this.board[oldRow][oldCol] = null;
        this.updateSquare(oldRow, oldCol);

        // Set new position
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
        this.turnIndicator.textContent = `${playerColor} Player's Turn: ${action}`;

        // Update turn indicator styling
        this.turnIndicator.className = 'turn-indicator';
        this.turnIndicator.classList.add(this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn');

        // Update all squares to refresh cursor states
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.updateSquare(row, col);
            }
        }

        // Add blink effect to current player's king when it's time to move
        // (Do this AFTER updateSquare so it doesn't get removed)
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
        // Check all 8 surrounding squares
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const newRow = kingRow + dr;
                const newCol = kingCol + dc;

                // If any square is in bounds and empty, king is not trapped
                if (newRow >= 0 && newRow < BOARD_SIZE &&
                    newCol >= 0 && newCol < BOARD_SIZE &&
                    this.board[newRow][newCol] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    resetGame() {
        // Reset all game state
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.currentPlayer = 1;
        this.kingPositions = [[0, 4], [8, 4]];
        this.quadraphageCounts = [30, 30];
        this.kingMoved = false;

        // Reset UI
        this.placeInitialKings();
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.updateSquare(row, col);
            }
        }
        this.updateUI();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new KingsAndQuadraphages();
});