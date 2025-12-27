# ITO Game - Implementation Plan

## Project Summary

**Nome:** ITO Digital
**Descrição:** Versão digital do jogo de cartas ITO para jogar com amigos pelo celular
**Idioma:** Português (Brasil)
**Hosting:** Digital Ocean ($4/mês)

---

## Phase 1: Project Setup

### 1.1 Initialize Project Structure
- [ ] Create root `package.json` with workspaces
- [ ] Setup server folder with Express + Socket.io
- [ ] Setup client folder with Vite + React
- [ ] Configure Tailwind CSS
- [ ] Install Framer Motion

### 1.2 Development Environment
- [ ] Configure Vite proxy for Socket.io
- [ ] Setup concurrent dev scripts
- [ ] Add ESLint + Prettier (optional)

---

## Phase 2: Backend Development

### 2.1 Express Server Setup
- [ ] Create Express app
- [ ] Configure CORS
- [ ] Setup Socket.io integration
- [ ] Serve static files (production)

### 2.2 Room Manager
- [ ] Generate unique 4-digit room codes
- [ ] Store rooms in memory (Map)
- [ ] Room structure:
  ```javascript
  {
    code: "A1B2",
    host: "socket-id",
    players: [
      { id: "socket-id", name: "João", card: null }
    ],
    status: "lobby" | "playing" | "reveal",
    createdAt: Date
  }
  ```
- [ ] Auto-delete empty rooms after timeout

### 2.3 Game Logic
- [ ] Generate random cards (0-100) for each player
- [ ] Ensure no duplicate cards in same room
- [ ] Handle card reveal sequence
- [ ] Reset game for new round

### 2.4 Socket Events
- [ ] `connection` - Track connected clients
- [ ] `create-room` - Host creates room
- [ ] `join-room` - Player joins with code + name
- [ ] `leave-room` - Player disconnects
- [ ] `start-game` - Host begins game
- [ ] `reveal-card` - Player shows their card
- [ ] `reset-game` - New round same room
- [ ] `disconnect` - Cleanup

---

## Phase 3: Frontend Development

### 3.1 Base Setup
- [ ] Configure React Router
- [ ] Create GameContext for global state
- [ ] Create useSocket custom hook
- [ ] Setup Tailwind with custom theme

### 3.2 Pages

#### Home Page (`/`)
- [ ] App logo/title
- [ ] "Criar Sala" button → creates room
- [ ] "Entrar na Sala" → shows code input
- [ ] Name input field
- [ ] Mobile-optimized layout

#### Lobby Page (`/sala/:code`)
- [ ] Display room code (big, copyable)
- [ ] Share button (Web Share API)
- [ ] Player list with avatars
- [ ] "Começar Jogo" button (host only)
- [ ] "Sair" button
- [ ] Waiting animation

#### Game Page (`/jogo/:code`)
- [ ] Your card (big, centered)
- [ ] Card flip animation on reveal
- [ ] Player status list (revealed/hidden)
- [ ] "Revelar Minha Carta" button
- [ ] Final reveal sequence
- [ ] "Jogar Novamente" button (host)

### 3.3 Components

#### Card Component
- [ ] Front face (number)
- [ ] Back face (ITO logo/pattern)
- [ ] Flip animation (Framer Motion)
- [ ] Glassmorphism effect
- [ ] Scale animation on tap
- [ ] Responsive sizing

#### PlayerList Component
- [ ] Player name
- [ ] Status indicator (ready, revealed)
- [ ] Host crown icon
- [ ] Animated entry/exit

#### Button Component
- [ ] Primary variant (gradient)
- [ ] Secondary variant (outline)
- [ ] Loading state
- [ ] Disabled state
- [ ] Touch feedback (scale)

#### RoomCode Component
- [ ] Large readable code
- [ ] Copy to clipboard
- [ ] Share button

---

## Phase 4: Styling & Polish

### 4.1 Theme
- [ ] Dark background (#0f0f1a or similar)
- [ ] Primary gradient (purple → blue)
- [ ] Accent color for highlights
- [ ] Card background (glassmorphism)

### 4.2 Animations
- [ ] Page transitions (fade/slide)
- [ ] Card flip (3D transform)
- [ ] Card entrance (spring animation)
- [ ] Button press feedback
- [ ] Player join notification
- [ ] Confetti on game end (optional)

### 4.3 Mobile UX
- [ ] Touch-friendly buttons (min 48px)
- [ ] Safe area padding (notch)
- [ ] Prevent zoom on input focus
- [ ] Landscape support
- [ ] Pull-to-refresh disabled

### 4.4 PWA Setup
- [ ] manifest.json
- [ ] Service worker (basic caching)
- [ ] App icons (192, 512)
- [ ] Splash screen
- [ ] "Add to Home Screen" prompt

---

## Phase 5: Testing & Polish

### 5.1 Testing
- [ ] Test with 2-8 players
- [ ] Test reconnection handling
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test slow network conditions

### 5.2 Edge Cases
- [ ] Host disconnects → assign new host
- [ ] Player disconnects mid-game
- [ ] Room full (max 8 players)
- [ ] Invalid room code
- [ ] Duplicate player names

### 5.3 Final Polish
- [ ] Loading states everywhere
- [ ] Error messages (toast)
- [ ] Empty states
- [ ] Sound effects (optional)
- [ ] Haptic feedback (optional)

---

## Phase 6: Deployment

### 6.1 Digital Ocean Setup
- [ ] Create Droplet ($4 basic)
- [ ] Configure SSH access
- [ ] Install Node.js 20
- [ ] Install PM2 globally
- [ ] Configure firewall (ufw)

### 6.2 Deploy Application
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Build frontend
- [ ] Start with PM2
- [ ] Configure PM2 startup

### 6.3 Domain & SSL (Optional)
- [ ] Point domain to Droplet IP
- [ ] Install Certbot
- [ ] Configure nginx reverse proxy
- [ ] Enable HTTPS

---

## Technical Details

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#0f0f1a",
        primary: "#8b5cf6",
        secondary: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

### Card Animation (Framer Motion)
```jsx
<motion.div
  initial={{ rotateY: 180 }}
  animate={{ rotateY: isRevealed ? 0 : 180 }}
  transition={{ duration: 0.6, ease: "easeInOut" }}
  style={{ transformStyle: "preserve-3d" }}
>
  {/* Card faces */}
</motion.div>
```

### Socket Hook
```javascript
// useSocket.js
const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);
    return () => s.disconnect();
  }, []);

  return socket;
};
```

---

## File Checklist

### Server
- [ ] `server/index.js`
- [ ] `server/roomManager.js`
- [ ] `server/gameLogic.js`
- [ ] `server/package.json`

### Client
- [ ] `client/src/App.jsx`
- [ ] `client/src/main.jsx`
- [ ] `client/src/index.css`
- [ ] `client/src/pages/Home.jsx`
- [ ] `client/src/pages/Lobby.jsx`
- [ ] `client/src/pages/Game.jsx`
- [ ] `client/src/components/Card.jsx`
- [ ] `client/src/components/Button.jsx`
- [ ] `client/src/components/PlayerList.jsx`
- [ ] `client/src/components/RoomCode.jsx`
- [ ] `client/src/hooks/useSocket.js`
- [ ] `client/src/context/GameContext.jsx`
- [ ] `client/tailwind.config.js`
- [ ] `client/vite.config.js`
- [ ] `client/package.json`
- [ ] `client/index.html`

### Root
- [ ] `package.json`
- [ ] `README.md`
- [ ] `.gitignore`

---

## Estimated Effort

| Phase | Complexity |
|-------|------------|
| 1. Setup | Simple |
| 2. Backend | Medium |
| 3. Frontend | Medium |
| 4. Styling | Medium |
| 5. Testing | Simple |
| 6. Deploy | Simple |

---

## Next Steps

1. Start with Phase 1 - Project Setup
2. Build backend first (can test with Postman/wscat)
3. Build frontend pages one by one
4. Polish and animate
5. Test with real friends
6. Deploy!
