# Arquitetura do ITO Game

## 1. Visão Geral - O Caminho de uma Requisição

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           USUÁRIO ACESSA ito.hisashi.com.br                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  1. DNS (Hostinger)                                                          │
│     ┌─────────────────────────────────────────────────────────┐              │
│     │  ito.hisashi.com.br  →  159.89.152.188                  │              │
│     └─────────────────────────────────────────────────────────┘              │
│     Traduz o nome amigável para o IP do servidor                             │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  2. SERVIDOR (Digital Ocean Droplet - 159.89.152.188)                        │
│     ┌────────────────────────────────────────────────────────────────────┐   │
│     │  UFW Firewall                                                      │   │
│     │  ├── Porta 22 (SSH) ✓                                              │   │
│     │  ├── Porta 80 (HTTP) ✓                                             │   │
│     │  ├── Porta 443 (HTTPS) ✓                                           │   │
│     │  └── Porta 3001 ✗ (bloqueada externamente)                         │   │
│     └────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  3. NGINX (Porta 80/443)                                                     │
│     ┌────────────────────────────────────────────────────────────────────┐   │
│     │  • Recebe requisições HTTPS                                        │   │
│     │  • Gerencia certificado SSL (Let's Encrypt)                        │   │
│     │  • Rate limiting (10 req/s por IP)                                 │   │
│     │  • Proxy reverso → localhost:3001                                  │   │
│     │  • Suporte WebSocket (upgrade de conexão)                          │   │
│     └────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  4. NODE.JS + EXPRESS + SOCKET.IO (Porta 3001 - gerenciado pelo PM2)         │
│     ┌────────────────────────────────────────────────────────────────────┐   │
│     │                                                                    │   │
│     │   server/index.js                                                  │   │
│     │   ┌──────────────────────────────────────────────────────────┐     │   │
│     │   │  const app = express();                                  │     │   │
│     │   │  const server = http.createServer(app);                  │     │   │
│     │   │  const io = new Server(server);                          │     │   │
│     │   │                                                          │     │   │
│     │   │  // Serve arquivos estáticos (frontend compilado)        │     │   │
│     │   │  app.use(express.static('client/dist'));                 │     │   │
│     │   │                                                          │     │   │
│     │   │  // WebSocket handlers                                   │     │   │
│     │   │  io.on('connection', (socket) => { ... });               │     │   │
│     │   │                                                          │     │   │
│     │   │  server.listen(3001);                                    │     │   │
│     │   └──────────────────────────────────────────────────────────┘     │   │
│     │                                                                    │   │
│     └────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Arquivos no Servidor

```
/var/www/ito/
│
├── client/                     # FRONTEND (React)
│   ├── src/                    # Código fonte (não usado em produção)
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   │
│   ├── dist/                   # ⭐ COMPILADO (usado em produção)
│   │   ├── index.html          # Página única do React
│   │   └── assets/
│   │       ├── index-a1b2c3.js   # React + código bundled
│   │       └── index-x7y8z9.css  # Estilos bundled
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # BACKEND (Node.js)
│   ├── index.js                # ⭐ Ponto de entrada (PM2 roda isso)
│   ├── roomManager.js          # Gerencia salas
│   ├── gameLogic.js            # Lógica do jogo
│   └── themes.js               # Temas das cartas
│
├── package.json                # Scripts e dependências
└── node_modules/
```

---

## 3. O que cada tecnologia faz

| TECNOLOGIA | FUNÇÃO |
|------------|--------|
| DNS | Traduz ito.hisashi.com.br → 159.89.152.188 |
| UFW | Firewall - bloqueia portas não autorizadas |
| Nginx | Recebe HTTPS, SSL, rate limit, repassa pro Node |
| PM2 | Mantém Node.js rodando 24/7, reinicia se crashar |
| Node.js | Runtime JavaScript no servidor |
| Express | Framework web - serve arquivos, rotas HTTP |
| Socket.io | Comunicação real-time (WebSocket) entre jogadores |
| React | Interface do usuário (roda no browser, não no servidor) |
| Vite | Bundler - compila React para arquivos estáticos |

---

## 4. Fluxo: Usuário abre o jogo

```
BROWSER                           SERVIDOR
   │                                  │
   │  GET https://ito.hisashi.com.br  │
   │ ────────────────────────────────►│
   │                                  │  Nginx recebe
   │                                  │  → proxy para :3001
   │                                  │  → Express serve client/dist/index.html
   │         index.html               │
   │ ◄────────────────────────────────│
   │                                  │
   │  GET /assets/index-a1b2c3.js     │
   │ ────────────────────────────────►│
   │         (arquivo JS)             │
   │ ◄────────────────────────────────│
   │                                  │
   │  React inicia no browser         │
   │  ┌─────────────────────────┐     │
   │  │ Renderiza a página Home │     │
   │  │ Conecta ao Socket.io    │     │
   │  └─────────────────────────┘     │
   │                                  │
   │  WebSocket: connect              │
   │ ════════════════════════════════►│  Socket.io aceita conexão
   │                                  │
   │  (conexão bidirecional aberta)   │
   │ ◄══════════════════════════════► │
```

---

## 5. Fluxo: Criar sala e jogar

```
JOGADOR 1 (Host)                 SERVIDOR                    JOGADOR 2
     │                              │                             │
     │  emit: 'create-room'         │                             │
     │  { name: 'João' }            │                             │
     │ ════════════════════════════►│                             │
     │                              │  roomManager.createRoom()   │
     │                              │  Gera código: 'A1B2'        │
     │   callback: { code: 'A1B2' } │                             │
     │ ◄════════════════════════════│                             │
     │                              │                             │
     │  (João compartilha código)   │                             │
     │                              │                             │
     │                              │      emit: 'join-room'      │
     │                              │      { code: 'A1B2',        │
     │                              │        name: 'Maria' }      │
     │                              │ ◄════════════════════════════
     │                              │                             │
     │                              │  roomManager.joinRoom()     │
     │                              │  Adiciona Maria na sala     │
     │                              │                             │
     │  emit: 'room-updated'        │   emit: 'room-updated'      │
     │  { players: [João, Maria] }  │   { players: [João, Maria] }│
     │ ◄════════════════════════════│ ════════════════════════════►
     │                              │                             │
     │  emit: 'start-game'          │                             │
     │ ════════════════════════════►│                             │
     │                              │  gameLogic.dealCards()      │
     │                              │  João: 42, Maria: 78        │
     │                              │                             │
     │  emit: 'game-started'        │   emit: 'game-started'      │
     │  { yourCard: 42,             │   { yourCard: 78,           │
     │    players: [...] }          │     players: [...] }        │
     │ ◄════════════════════════════│ ════════════════════════════►
```

---

## 6. HTTP vs WebSocket

```
HTTP (requisição-resposta):
┌────────┐                      ┌────────┐
│ Client │  ── GET /page ──►    │ Server │
│        │  ◄── response ───    │        │
│        │                      │        │
│        │  ── GET /data ──►    │        │
│        │  ◄── response ───    │        │
└────────┘                      └────────┘
  • Cada requisição abre e fecha conexão
  • Cliente sempre inicia
  • Bom para: páginas, APIs REST


WebSocket (conexão persistente):
┌────────┐                      ┌────────┐
│ Client │ ═══════════════════  │ Server │
│        │  ◄─── mensagem ────  │        │
│        │  ──── mensagem ───►  │        │
│        │  ◄─── mensagem ────  │        │
│        │  ◄─── mensagem ────  │        │
│        │  ──── mensagem ───►  │        │
└────────┘ ═══════════════════  └────────┘
  • Conexão fica aberta
  • Ambos podem enviar a qualquer momento
  • Bom para: jogos, chat, real-time
```

---

## 7. Onde cada código roda

```
┌─────────────────────────────────────┐     ┌─────────────────────────────────┐
│         BROWSER (Cliente)           │     │       SERVIDOR (Node.js)        │
│                                     │     │                                 │
│  client/src/                        │     │  server/                        │
│  ├── pages/Home.jsx                 │     │  ├── index.js                   │
│  ├── pages/Room.jsx                 │     │  ├── roomManager.js             │
│  ├── pages/Game.jsx                 │     │  ├── gameLogic.js               │
│  ├── context/GameContext.jsx        │     │  └── themes.js                  │
│  └── components/*.jsx               │     │                                 │
│                                     │     │  • Gerencia salas               │
│  • Renderiza UI                     │     │  • Distribui cartas             │
│  • Animações                        │     │  • Valida ações                 │
│  • Envia eventos Socket.io          │     │  • Broadcast para jogadores     │
│  • Recebe atualizações              │     │  • Armazena estado (memória)    │
│                                     │     │                                 │
│  JavaScript roda no browser         │     │  JavaScript roda no Node.js     │
│  do usuário                         │     │  no servidor                    │
└─────────────────────────────────────┘     └─────────────────────────────────┘
              │                                          │
              │          Socket.io (WebSocket)           │
              └──────────────════════════════────────────┘
```

---

## 8. Deploy - O que acontece

```bash
./deploy.sh "nova feature"
```

```
LOCAL                              GITHUB                         SERVIDOR
  │                                   │                               │
  │  git push origin main             │                               │
  │ ─────────────────────────────────►│                               │
  │                                   │                               │
  │                                   │                               │
  │  ssh root@159.89.152.188          │                               │
  │ ──────────────────────────────────────────────────────────────────►
  │                                   │                               │
  │                                   │       git pull                │
  │                                   │ ◄─────────────────────────────│
  │                                   │                               │
  │                                   │       npm run build           │
  │                                   │       (compila React)         │
  │                                   │                               │
  │                                   │       pm2 restart ito         │
  │                                   │       (reinicia Node.js)      │
  │                                   │                               │
```
