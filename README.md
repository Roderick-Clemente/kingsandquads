# Kings and Quadraphages

A two-player strategy board game where players move their Kings and place Quadraphages to trap their opponent.

Buy the physical game from [Math Pentathlon](https://www.mathpentath.org/product/kings-quadraphages-complete-game/)

## Game Rules

- **Board:** 9x9 grid
- **Players:** 2 (Red vs Blue)
- **Pieces:** Each player has 1 King (👑) and 30 Quadraphages (🔴/🔵)
- **Starting Position:** Red King at top center, Blue King at bottom center

### How to Play

1. **Move your King:** Move one square in any direction (including diagonally)
2. **Place a Quadraphage:** After moving, place one of your Quadraphages on any empty square
3. **Win Condition:** Trap your opponent's King so it has no valid moves

## Play Options

### 🌐 Web Version - Local Play

**Files:** `index.html`, `style.css`, `game.js`

**To Play:**
- Simply open `index.html` in any modern web browser
- Play locally on the same device (hot seat mode)
- No installation or server required

**Features:**
- Modern, responsive UI with gradient design
- Smooth animations and hover effects
- King blinks when it's time to move it
- Semi-transparent preview when placing quadraphages
- Live quadraphage counters
- Visual feedback (cursor changes for unclickable pieces)
- Reset button for quick restarts
- Mobile-friendly

### 🌐 Web Version - Online Multiplayer

**Files:** `server.js`, `index.html`, `style.css`, `game.js`

**Requirements:**
- Node.js
- npm

**To Play:**
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```

3. Open `http://localhost:3000` in your browser

4. (Optional) Share with remote players using ngrok:
   ```bash
   ngrok http 3000
   ```

**Features:**
- Real-time online multiplayer via Socket.IO
- Automatic matchmaking
- Game state synchronization
- Disconnect handling

### 🐍 Python Version (Legacy)

**File:** `KandQ.py`

**Requirements:**
- Python 3.x with Tkinter (usually included by default)

**To Play:**
```bash
python KandQ.py
```

**Features:**
- Lightweight desktop application
- Simple Tkinter UI
- Cross-platform (Windows, Mac, Linux)
- Basic game mechanics

**Note:** The Python version may be sunset in the future.

## Development

Current branch: `multiplayer-web`

The web version represents a modernization of the original Python/Tkinter implementation, with improved UI/UX and online multiplayer support.

## Future Enhancements
- AI opponent for single-player mode

## License
This project is open source, and you are free to modify and distribute it as you wish.

Feel free to contribute or make suggestions by creating an issue or a pull request on the GitHub repository!

