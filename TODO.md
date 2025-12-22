# Kings and Quadraphages - TODO List

## 🔥 High Priority (Critical UX)

### 1. How to Play / Rules Modal
- [x] Add "?" or "How to Play" button in header
- [ ] Create modal component with game rules
- [ ] Explain king moves (8-directional, 1 square)
- [ ] Explain quadraphage placement (after king move)
- [ ] Explain win condition (trap opponent's king)
- [ ] Include visual examples with emoji pieces
- [ ] Add keyboard shortcut (ESC to close)

### 2. Better Game Over Experience
- [ ] Replace `alert()` with custom modal/overlay
- [ ] Show winner with celebration animation
- [ ] Add "Play Again" button
- [ ] Add "Back to Menu" button
- [ ] Display game statistics:
  - [ ] Total moves made
  - [ ] Pieces placed by each player
  - [ ] Game duration
- [ ] Different messages for winner/loser in network mode

### 3. Exit/Rematch Buttons During Game
- [ ] Add header with "Exit Game" button
- [ ] Add "Offer Rematch" button (local and network)
- [ ] Confirm dialog before exiting active game
- [ ] In network mode: notify opponent when someone exits
- [ ] Handle graceful transition back to menu
- [ ] Reset game state properly

### 4. Visual Move Indicators
- [ ] Highlight valid king move squares (subtle glow/border)
- [ ] Highlight valid quadraphage placement squares
- [ ] Different visual style for valid vs preview
- [ ] Toggle option to show/hide indicators
- [ ] Color-code by player (red/blue)
- [ ] Remove indicators when not player's turn (network mode)

## 🎮 Medium Priority (Gameplay Enhancement)

### 5. Move History Panel
- [ ] Create collapsible move history sidebar
- [ ] Format: "Red: E5→F5, place F6"
- [ ] Show last 10 moves (scrollable)
- [ ] Highlight current turn in history
- [ ] Export move history as text/JSON
- [ ] Optional: Undo button for local games only
- [ ] Optional: Step through move replay

### 6. Room Codes for Private Matches
- [ ] Add "Create Private Room" option
- [ ] Generate unique 6-character room code
- [ ] Add "Join Room" with code input
- [ ] Show shareable room code in UI
- [ ] Copy-to-clipboard button for room code
- [ ] Keep random matchmaking as default
- [ ] Handle room expiration/cleanup

### 7. Connection Status Indicator
- [ ] Add connection status dot (🟢 connected, 🔴 disconnected)
- [ ] Show "Connecting..." state
- [ ] Show "Reconnecting..." state
- [ ] Auto-reconnect on connection loss
- [ ] Save game state for reconnection
- [ ] Timeout handling (30s max reconnect)

### 8. Waiting Room Enhancement
- [ ] Add "Cancel Search" button during matchmaking
- [ ] Animated spinner/loading indicator
- [ ] Show queue position if possible
- [ ] Show estimated wait time (if data available)
- [ ] Allow players to practice vs simple AI while waiting
- [ ] Tip of the day / strategy hints while waiting

## 🎨 Low Priority (Polish & Nice-to-Have)

### 9. Improved Mobile Experience
- [ ] Increase square label font size for mobile
- [ ] Larger touch targets (min 44x44px)
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Adjust emoji sizes for small screens
- [ ] Landscape orientation optimization
- [ ] Prevent zoom on double-tap

### 10. Smooth Piece Animations
- [ ] Animate king moves (slide from old to new position)
- [ ] Fade-in effect for quadraphage placement
- [ ] Bounce animation on piece placement
- [ ] Smooth transition for game state changes
- [ ] Configurable animation speed
- [ ] Option to disable animations (accessibility)

### 11. Single-Player AI Opponent
- [ ] Implement minimax algorithm with alpha-beta pruning
- [ ] Add difficulty levels (Easy, Medium, Hard)
- [ ] AI move thinking delay (feel more human)
- [ ] Show AI "thinking" indicator
- [ ] AI move preview/explanation
- [ ] Option for AI vs AI demo mode

### 12. Game Statistics & Analytics
- [ ] Track wins/losses per session
- [ ] Track total games played
- [ ] Average game length
- [ ] Fastest win
- [ ] Most quadraphages used in a game
- [ ] Win rate percentage
- [ ] Store stats in localStorage

### 13. Timer & Time Controls
- [ ] Add optional move timer
- [ ] Configurable time limits (1min, 3min, 5min, etc.)
- [ ] Visual countdown indicator
- [ ] Sound alert at 10 seconds remaining
- [ ] Auto-forfeit on timeout
- [ ] Increment time per move (Fischer clock)

### 14. Additional Features
- [ ] **Spectator mode** for network games
- [ ] **Dark mode toggle** (save preference)
- [ ] **Sound effects library** (more variety beyond ding/win/loss)
- [ ] **Player profiles/usernames** for network games
- [ ] **Chat system** for network games (optional)
- [ ] **Replay/share game** functionality
- [ ] **Achievements/badges** system
- [ ] **Tutorial mode** with guided steps
- [ ] **Theme customization** (different color schemes)
- [ ] **Board size options** (7x7, 11x11)

## 🐛 Bug Fixes & Technical Debt

- [ ] Review firework animation performance (currently updates many DOM elements)
- [ ] Optimize re-renders in updateUI()
- [ ] Add error boundaries for better error handling
- [ ] Improve server-side validation
- [ ] Add rate limiting to prevent spam
- [ ] Add unit tests for game logic
- [ ] Add integration tests for server
- [x] Improve code documentation
- [x] Refactor duplicate code between LocalGame and NetworkGame
- [ ] Add TypeScript for better type safety
- [ ] Environment variable configuration for server

## 📝 Notes

- Prioritize items that improve first-time user experience
- Test all features in both local and network modes
- Maintain backwards compatibility with existing games
- Keep mobile-first approach for new features
- Consider accessibility (ARIA labels, keyboard navigation)
- Performance: Target 60fps animations on mobile devices

---

**Last Updated:** 2025-10-09
**Version:** 1.0.0
