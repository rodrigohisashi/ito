# ITO - Jogo de Cartas Digital

Versão digital do jogo de cartas cooperativo ITO para jogar com amigos pelo celular.

## Como Jogar

1. Um jogador cria uma sala e compartilha o código
2. Outros jogadores entram usando o código
3. Cada jogador recebe uma carta de 0 a 100
4. Sem revelar o número, deem dicas baseadas em um tema
5. Tentem organizar as cartas em ordem!

## Tecnologias

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express + Socket.io
- **Hospedagem:** Digital Ocean

## Desenvolvimento

```bash
# Instalar dependências
npm run install:all

# Rodar em desenvolvimento
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## Produção

```bash
# Build
npm run build

# Start
npm start
```

## Estrutura

```
ito-game/
├── server/          # Backend Socket.io
├── client/          # Frontend React
├── CLAUDE.md        # Contexto do projeto
└── PLAN.md          # Plano de implementação
```
