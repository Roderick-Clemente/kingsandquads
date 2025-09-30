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

Both versions are fully functional and supported for now. **The Python version may be sunset in the future.**

### 🌐 Web Version (Recommended)

**Files:** `index.html`, `style.css`, `game.js`

**To Play:**
- Simply open `index.html` in any modern web browser
- Works on desktop, tablet, and mobile devices
- No installation required

**Features:**
- Modern, responsive UI with gradient design
- Smooth animations and hover effects
- King blinks when it's time to move it
- Semi-transparent preview when placing quadraphages
- Live quadraphage counters
- Visual feedback (cursor changes for unclickable pieces)
- Reset button for quick restarts
- Mobile-friendly

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

## Development

Current branch: `web-version`

The web version represents a modernization of the original Python/Tkinter implementation, with improved UI/UX while maintaining all core game mechanics.

## Future Enhancements
- AI opponent for single-player mode
- Online multiplayer support

## License
This project is open source, and you are free to modify and distribute it as you wish.

Feel free to contribute or make suggestions by creating an issue or a pull request on the GitHub repository!

