# Kings and Quadraphages - Development Roadmap

## Current Status
- ✅ Working local and network multiplayer
- ✅ Well-documented codebase with JSDoc
- ✅ Hosted on Raspberry Pi (http://pioluv:3000)
- ✅ Help modal with game rules (sticky close button)
- ✅ Sound effects and visual polish
- ✅ Mobile-optimized responsive design (portrait & landscape)
- ✅ Sticky turn indicator for scrollable gameplay
- ✅ PM2 process management with auto-restart and boot persistence
- ✅ One-command deployment script (./deploy.sh)

---

## Phase 1: Critical UX Fixes (Week 1-2)
**Goal**: Fix the most jarring user experience issues

### 1.1 Game State Persistence ⭐ HIGH PRIORITY
**Why**: Prevent accidental game loss from refresh (especially on mobile pull-to-refresh)
**Impact**: Major UX improvement, builds user trust

- [ ] Implement localStorage game state persistence
  - [ ] Save board state after every move
  - [ ] Save turn state, player info, piece counts
  - [ ] Track game mode (local vs network)
  - [ ] Store timestamp of last move
- [ ] Auto-restore game on page load
  - [ ] Show "Resume previous game?" prompt if found
  - [ ] Clear old games (>24 hours)
  - [ ] Handle edge cases (game already finished, corrupted data)
- [ ] Add "New Game" button with confirmation
  - [ ] Confirm only if active game in progress
  - [ ] Custom modal instead of browser alert
  - [ ] Clears localStorage state
- [ ] Browser refresh protection (beforeunload)
  - [ ] Desktop: beforeunload event with warning dialog
  - [ ] Mobile: Prevent pull-to-refresh gesture
    - [ ] Add overscroll-behavior CSS
    - [ ] Add user-scalable=no to viewport
    - [ ] Test on iOS Safari and Android Chrome
  - [ ] Note: iOS Safari ignores beforeunload by design
- [ ] Network game considerations
  - [ ] Save connection info for reconnection
  - [ ] Coordinate with server state (Phase 2.2)
  - [ ] Handle opponent disconnect gracefully

**Files to modify**: `game.js` (add GameStateManager class), `index.html` (New Game button), `style.css`

**Future Enhancement**: Full state persistence for network games (coordinate with Phase 2.2 reconnection logic)

---

### 1.2 Replace Browser Alerts with Custom Modals ⭐ HIGH PRIORITY
**Why**: Browser alerts are jarring and break immersion
**Impact**: Major UX improvement

- [ ] Create GameOverModal component
  - [ ] Winner announcement with confetti animation
  - [ ] Game statistics (moves, duration, pieces placed)
  - [ ] "Play Again" button
  - [ ] "Back to Menu" button
- [ ] Different modals for winner vs loser in network mode
- [ ] Add celebratory sound to modal appearance
- [ ] Animate modal entrance (slide in + fade)

**Files to modify**: `index.html`, `style.css`, `game.js:558-561`

---

### 1.3 Add Exit/Back to Menu Button ⭐ HIGH PRIORITY
**Why**: Currently no way to exit without refreshing browser
**Impact**: Essential for good UX

- [ ] Add header bar to game screen
  - [ ] "Exit Game" button (top-right)
  - [ ] Game title/logo (top-left)
  - [ ] Connection status indicator (network mode only)
- [ ] Confirmation dialog before exiting active game
- [ ] In network mode: notify opponent of disconnect
- [ ] Graceful cleanup of game state and socket connections
- [ ] Return to menu screen (don't reload page)

**Files to modify**: `index.html`, `style.css`, `game.js:NetworkGame.backToMenu()`

---

### 1.4 Visual Move Indicators ⭐ MEDIUM-HIGH PRIORITY
**Why**: Makes game more accessible for new players
**Impact**: Better onboarding, clearer gameplay

- [ ] Highlight all valid king moves with subtle glow/border
- [ ] Highlight valid quadraphage placement squares
- [ ] Different visual style for "valid" vs "preview on hover"
- [ ] Only show when it's player's turn (network mode)
- [ ] Add toggle in settings to disable (for advanced players)
- [ ] Color-code by player (red/blue theme)

**Files to modify**: `style.css`, `game.js:updateUI()`, `game.js:onSquareHover()`

---

## Phase 2: Network Play Enhancements (Week 3-4)
**Goal**: Make multiplayer more flexible and reliable

### 2.1 Private Room Codes ⭐ HIGH PRIORITY
**Why**: Essential for playing with specific friends
**Impact**: Major feature for social play

- [ ] Add "Create Private Room" button on menu
- [ ] Generate unique 6-character room codes (e.g., "ABC123")
- [ ] Add "Join Room" option with code input field
- [ ] Display shareable room code during game
- [ ] Copy-to-clipboard button for room code
- [ ] Keep random matchmaking as default option
- [ ] Server: Handle room creation and joining logic
- [ ] Server: Room cleanup after inactivity (30min timeout)

**Files to modify**: `index.html`, `style.css`, `game.js`, `server.js`

---

### 2.2 Connection Status & Reconnection ⭐ MEDIUM PRIORITY
**Why**: Network issues happen, especially on local networks
**Impact**: Better reliability for Pi hosting

- [ ] Add connection status indicator (🟢 connected / 🔴 disconnected)
- [ ] Show "Connecting...", "Reconnecting..." states
- [ ] Implement auto-reconnect on connection loss
- [ ] Server: Save game state for reconnection (5min window)
- [ ] Handle reconnection gracefully (rejoin same game)
- [ ] Timeout handling (30s max reconnect attempt)
- [ ] Toast notification for connection events

**Files to modify**: `game.js:NetworkGame`, `server.js`, `style.css`

---

### 2.3 Improved Waiting Room ⭐ LOW PRIORITY
**Why**: Better experience while waiting for opponent
**Impact**: Small polish improvement

- [ ] Add "Cancel Search" button during matchmaking
- [ ] Animated spinner/loading indicator
- [ ] Fun tip carousel while waiting
  - "Tip: Keep your king mobile!"
  - "Strategy: Control the center of the board"
  - "Fact: You have 30 quadraphages to use wisely"
- [ ] Show estimated wait time (if data available)
- [ ] Optional: Practice vs simple AI while waiting

**Files to modify**: `index.html`, `style.css`, `game.js:NetworkGame`

---

## Phase 3: Polish & Features (Week 5-6)
**Goal**: Add nice-to-have features and polish

### 3.1 Move History Panel ⭐ MEDIUM PRIORITY
**Why**: Helps players review strategy and learn
**Impact**: Good for competitive/learning play

- [ ] Create collapsible move history sidebar
- [ ] Format: "Red: E5→F5, place F6"
- [ ] Show last 10 moves (scrollable for more)
- [ ] Highlight current turn in history
- [ ] Export move history as text/JSON
- [ ] Optional: Notation system (chess-like)
- [ ] For local games only: Undo last move button

**Files to modify**: `index.html`, `style.css`, `game.js`

---

### 3.2 Better Mobile Experience ⭐ MEDIUM PRIORITY
**Why**: Game should work well on phones/tablets
**Impact**: Broader accessibility

- [x] Increase square label font size for mobile
- [x] Larger touch targets (min 44x44px Apple guidelines)
- [x] Test on real devices (iOS Safari, Android Chrome)
- [x] Optimize emoji sizes for small screens
- [x] Landscape orientation optimization (fixed size, scrollable board)
- [x] Portrait orientation optimization (responsive sizing)
- [x] Sticky turn indicator when scrolling
- [ ] Prevent zoom on double-tap (user-scalable=no)
- [ ] Bottom sheet for controls on mobile
- [ ] Haptic feedback on piece placement (if supported)

**Files modified**: `style.css`
**Status**: Core mobile experience complete, advanced features pending

---

### 3.3 Smooth Animations ⭐ LOW PRIORITY
**Why**: Makes the game feel more polished
**Impact**: Nice visual upgrade

- [ ] Animate king moves (slide from old to new position)
- [ ] Fade-in effect for quadraphage placement
- [ ] Subtle bounce animation on piece placement
- [ ] Smooth transition for turn changes
- [ ] Configurable animation speed (fast/normal/slow)
- [ ] Option to disable animations (accessibility setting)
- [ ] Optimize firework animation (use CSS transforms, not position updates)

**Files to modify**: `style.css`, `game.js`

---

### 3.4 Additional Features
**Priority varies - implement based on interest**

- [ ] **Single-player AI opponent** (MEDIUM)
  - Minimax algorithm with alpha-beta pruning
  - Difficulty levels: Easy, Medium, Hard
  - AI "thinking" indicator
  - AI move delay (feels more human)

- [ ] **Game Statistics** (LOW)
  - Track wins/losses per session
  - Store in localStorage
  - Win rate percentage
  - Fastest win, longest game
  - Most quadraphages used

- [ ] **Timer/Time Controls** (LOW)
  - Optional move timer (1min, 3min, 5min)
  - Visual countdown
  - Sound alert at 10s remaining
  - Auto-forfeit on timeout
  - Fischer clock (increment time)

- [ ] **Dark Mode** (LOW)
  - Toggle in settings
  - Save preference to localStorage
  - Adjust colors for readability
  - Separate board themes

- [ ] **Player Profiles** (FUTURE)
  - Usernames for network games
  - Simple avatar system
  - Stats tracking across games

- [ ] **Spectator Mode** (FUTURE)
  - Watch ongoing network games
  - View-only mode
  - Useful for tournaments

---

## Phase 4: Infrastructure & Deployment (Ongoing)
**Goal**: Better hosting, monitoring, and maintenance

### 4.1 Raspberry Pi Production Setup ⭐ HIGH PRIORITY
**Why**: Ensure reliable production hosting with proper process management
**Impact**: Reliability and auto-recovery

- [x] Set up PM2 process manager
  - [x] Auto-restart on crash
  - [x] Start on Pi boot
  - [x] Log management (rotation)
  - [x] CPU/memory monitoring
- [x] Create deployment script (deploy.sh)
- [x] Create PM2 configuration (ecosystem.config.js)
- [x] Create deployment documentation (DEPLOYMENT.md)
- [ ] Environment configuration (.env file)
  - [ ] Custom port
  - [ ] Production/development mode
  - [ ] Log level
- [ ] Basic monitoring dashboard
  - [ ] Active games count
  - [ ] Players online
  - [ ] Server uptime
  - [ ] Memory usage

**Files created**: `ecosystem.config.js`, `deploy.sh`, `DEPLOYMENT.md`
**Status**: PM2 setup complete, easy one-command deployments enabled

---

### 4.2 Code Quality & Testing ⭐ MEDIUM PRIORITY
**Why**: Prevent bugs, easier maintenance
**Impact**: Long-term code health

- [ ] Add TypeScript (gradual migration)
  - [ ] Start with server.js types
  - [ ] Add types to BaseGame class
  - [ ] Type all Socket.IO events
- [ ] Unit tests for game logic
  - [ ] Test king movement validation
  - [ ] Test win condition detection
  - [ ] Test quadraphage placement rules
- [ ] Integration tests for server
  - [ ] Test matchmaking
  - [ ] Test game flow (full game)
  - [ ] Test reconnection logic
- [ ] Add ESLint + Prettier
- [ ] Set up pre-commit hooks (husky)

**Files to create**: `tsconfig.json`, `jest.config.js`, `.eslintrc.js`

---

### 4.3 Performance Optimization ⭐ LOW PRIORITY
**Why**: Game runs well, but can be better
**Impact**: Smoother experience on slower devices

- [ ] Optimize `updateUI()` - avoid full board re-renders
- [ ] Use CSS transforms for firework animation (GPU acceleration)
- [ ] Debounce socket events
- [ ] Add rate limiting to prevent spam
- [ ] Server-side validation improvements
- [ ] Lazy load Socket.IO only for network mode
- [ ] Code splitting (if needed)

**Files to modify**: `game.js`, `server.js`, `style.css`

---

### 4.4 Security & Validation ⭐ MEDIUM PRIORITY
**Why**: Prevent cheating and malicious input
**Impact**: Fair gameplay

- [ ] Server-side move validation (already basic version)
- [ ] Rate limiting on move requests
- [ ] Input sanitization
- [ ] CORS configuration for production
- [ ] Session tokens for games
- [ ] Prevent multiple connections from same player
- [ ] Add basic anti-cheat (detect impossible moves)

**Files to modify**: `server.js`

---

## Quick Wins (Can do anytime)
These are small improvements that take <1 hour each:

- [ ] Add ESC key to close help modal
- [ ] Add favicon support for all sizes (PWA icons)
- [ ] Keyboard shortcuts hint (? key for help, ESC for close)
- [ ] Improve README with screenshots
- [ ] Add CONTRIBUTING.md for open source
- [ ] Add LICENSE file
- [ ] Create demo GIF for README
- [ ] Add "Share on Twitter" button after winning
- [ ] Add sound effect volume slider
- [ ] Add game version number in footer

---

## Release Schedule Suggestion

### v1.1 (Target: Week 2)
- Replace alerts with custom modals
- Add exit button
- Visual move indicators
- PM2 setup on Pi

### v1.2 (Target: Week 4)
- Private room codes
- Connection status & reconnection
- Move history panel

### v1.3 (Target: Week 6)
- Mobile optimizations
- Smooth animations
- AI opponent (single player)

### v2.0 (Target: Month 3)
- TypeScript migration
- Test coverage
- Player profiles
- Statistics tracking

---

## Current Branch Strategy

**Development Workflow:**
- `multiplayer-web` - Active development (current branch)
- `main` - Stable releases only
- `python-version` - Archived original Python version

**Release Process:**
1. Develop features on `multiplayer-web`
2. Test locally and on Pi
3. When stable, merge to `main`
4. Tag releases (v1.1, v1.2, etc.)

---

## Notes
- Prioritize items that improve first-time user experience
- Test all features in both local and network modes
- Maintain backwards compatibility with existing games
- Keep mobile-first approach for new features
- Consider accessibility (ARIA labels, keyboard navigation)
- Performance target: 60fps animations on mobile devices

---

**Last Updated**: 2024-12-22
**Current Version**: 1.0.0
**Next Milestone**: v1.1 - Better Game Over Experience
