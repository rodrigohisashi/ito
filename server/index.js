const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const roomManager = require('./roomManager');
const gameLogic = require('./gameLogic');
const { getRandomThemes, getThemeById, getRandomThemeNumber, getThemesAroundNumber } = require('./themes');

const app = express();

// Track active countdown timers per room
const countdownTimers = new Map();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';
// Force restart v2

// CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: isDev ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : true,
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Serve static files in production
if (!isDev) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', rooms: roomManager.getAllRooms().length });
});

// Helper function to start game from voting
function startGameFromVoting(code) {
  const room = roomManager.getRoom(code);
  if (!room || room.status !== 'voting') return;

  // Clear any countdown timer
  if (countdownTimers.has(code)) {
    clearTimeout(countdownTimers.get(code));
    countdownTimers.delete(code);
  }
  roomManager.setMajorityCountdown(code, null);

  // Determine winner
  const winningTheme = roomManager.getVoteWinner(code);
  room.selectedTheme = winningTheme;

  console.log(`Game starting in room ${code}. Winner: ${winningTheme.title} (#${winningTheme.id})`);

  // Deal cards and start game
  gameLogic.dealCards(room.players);
  roomManager.updateRoomStatus(code, 'playing');

  // Send game state to each player
  room.players.forEach((player) => {
    io.to(player.id).emit('game-started', gameLogic.getPlayerGameState(room, player.id));
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new room
  socket.on('create-room', (data, callback) => {
    try {
      const { playerName, playerId } = data;
      const room = roomManager.createRoom(socket.id, playerName, playerId);
      socket.join(room.code);
      console.log(`Room created: ${room.code} by ${playerName} (${playerId})`);
      callback({ success: true, room: gameLogic.getPublicRoomState(room, socket.id) });
    } catch (error) {
      console.error('Error creating room:', error);
      callback({ success: false, error: 'Erro ao criar sala' });
    }
  });

  // Join existing room
  socket.on('join-room', (data, callback) => {
    try {
      const { code, playerName, playerId } = data;
      const result = roomManager.joinRoom(code, socket.id, playerName, playerId);

      if (result.error) {
        callback({ success: false, error: result.error });
        return;
      }

      socket.join(result.room.code);
      console.log(`${playerName} joined room ${result.room.code}`);

      // Notify other players (send to each player with their own perspective)
      result.room.players.forEach((player) => {
        if (player.id !== socket.id) {
          io.to(player.id).emit('player-joined', {
            player: { id: socket.id, name: playerName },
            room: gameLogic.getPublicRoomState(result.room, player.id),
          });
        }
      });

      callback({ success: true, room: gameLogic.getPublicRoomState(result.room, socket.id) });
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, error: 'Erro ao entrar na sala' });
    }
  });

  // Rejoin room (reconnection)
  socket.on('rejoin-room', (data, callback) => {
    try {
      const { code, playerName, playerId } = data;
      console.log(`Tentativa de reconexão: ${playerName} (${playerId}) na sala ${code}`);

      const result = roomManager.reconnectPlayer(code, socket.id, playerId, playerName);

      if (result.error) {
        console.log(`Falha na reconexão: ${result.error}`);
        callback({ success: false, error: result.error });
        return;
      }

      socket.join(result.room.code);
      console.log(`${playerName} reconectou na sala ${code}`);

      // Notifica outros jogadores que o player voltou
      result.room.players.forEach((player) => {
        if (player.id !== socket.id && !player.disconnected) {
          // Se foi re-adicionado no lobby, envia player-joined
          const eventName = result.rejoined ? 'player-joined' : 'player-reconnected';
          io.to(player.id).emit(eventName, {
            player: { id: socket.id, name: result.player.name },
            room: gameLogic.getPublicRoomState(result.room, player.id),
          });
        }
      });

      // Retorna o estado apropriado baseado no status da sala
      const room = result.room;
      if (room.status === 'lobby') {
        callback({
          success: true,
          state: 'lobby',
          room: gameLogic.getPublicRoomState(room, socket.id),
        });
      } else if (room.status === 'voting') {
        callback({
          success: true,
          state: 'voting',
          votingState: {
            ...gameLogic.getVotingState(room, socket.id),
            drawnNumber: room.drawnNumber,
          },
        });
      } else if (room.status === 'playing' || room.status === 'reveal') {
        callback({
          success: true,
          state: 'playing',
          gameState: gameLogic.getPlayerGameState(room, socket.id),
        });
      } else {
        callback({
          success: true,
          state: room.status,
          room: gameLogic.getPublicRoomState(room, socket.id),
        });
      }
    } catch (error) {
      console.error('Error rejoining room:', error);
      callback({ success: false, error: 'Erro ao reconectar' });
    }
  });

  // Kick player from room (host only)
  socket.on('kick-player', (data, callback) => {
    try {
      const { code, targetPlayerId } = data;
      const result = roomManager.kickPlayer(code, socket.id, targetPlayerId);

      if (result.error) {
        callback({ success: false, error: result.error });
        return;
      }

      console.log(`${result.kickedPlayer.name} foi removido da sala ${code}`);

      // Notify the kicked player
      io.to(result.kickedPlayer.id).emit('kicked-from-room', {
        message: 'Você foi removido da sala pelo host',
      });

      // Make kicked player leave the socket room
      const kickedSocket = io.sockets.sockets.get(result.kickedPlayer.id);
      if (kickedSocket) {
        kickedSocket.leave(code);
      }

      // Notify remaining players
      result.room.players.forEach((player) => {
        io.to(player.id).emit('player-left', {
          player: { id: result.kickedPlayer.id, name: result.kickedPlayer.name },
          room: gameLogic.getPublicRoomState(result.room, player.id),
        });
      });

      callback({ success: true, room: gameLogic.getPublicRoomState(result.room, socket.id) });
    } catch (error) {
      console.error('Error kicking player:', error);
      callback({ success: false, error: 'Erro ao remover jogador' });
    }
  });

  // Start game (host only) - First draws a theme number
  socket.on('start-game', (code, callback) => {
    try {
      const room = roomManager.getRoom(code);

      if (!room) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      if (room.host !== socket.id) {
        callback({ success: false, error: 'Apenas o host pode iniciar o jogo' });
        return;
      }

      if (room.players.length < 2) {
        callback({ success: false, error: 'Mínimo de 2 jogadores' });
        return;
      }

      // Generate random theme number (1-100)
      const drawnNumber = getRandomThemeNumber();
      roomManager.setDrawnNumber(code, drawnNumber);

      console.log(`Theme number drawn in room ${code}: ${drawnNumber}`);

      // Send draw animation to all players
      room.players.forEach((player) => {
        io.to(player.id).emit('draw-number', {
          code: room.code,
          drawnNumber,
          phase: 'drawing', // First phase: show animation
        });
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error starting game:', error);
      callback({ success: false, error: 'Erro ao iniciar jogo' });
    }
  });

  // After number draw animation completes - start voting
  socket.on('draw-animation-complete', (code, callback) => {
    try {
      const room = roomManager.getRoom(code);

      if (!room) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      // Only host triggers voting start
      if (room.host !== socket.id) {
        callback({ success: true }); // Non-host just acknowledges
        return;
      }

      // Get themes around the drawn number (e.g., 62 → themes 60-64)
      const themes = getThemesAroundNumber(room.drawnNumber, 2);
      roomManager.setVotingThemes(code, themes);

      console.log(`Voting started in room ${code} with themes around ${room.drawnNumber}:`, themes.map(t => t.id));

      // Send voting state to all players
      room.players.forEach((player) => {
        io.to(player.id).emit('voting-started', {
          ...gameLogic.getVotingState(room, player.id),
          drawnNumber: room.drawnNumber,
        });
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error starting voting:', error);
      callback({ success: false, error: 'Erro ao iniciar votação' });
    }
  });

  // Admin changes theme number (redraw or pick specific)
  socket.on('change-theme-number', (data, callback) => {
    try {
      const { code, newNumber } = data;
      const room = roomManager.getRoom(code);

      if (!room) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      if (room.host !== socket.id) {
        callback({ success: false, error: 'Apenas o admin pode mudar o tema' });
        return;
      }

      // Validate number
      const themeNumber = newNumber || getRandomThemeNumber();
      if (themeNumber < 1 || themeNumber > 100) {
        callback({ success: false, error: 'Número deve ser entre 1 e 100' });
        return;
      }

      // Update room with new number
      roomManager.setDrawnNumber(code, themeNumber);

      // Get new themes around this number
      const themes = getThemesAroundNumber(themeNumber, 2);
      roomManager.setVotingThemes(code, themes);

      // Clear any existing votes and countdown
      room.votes = {};
      if (countdownTimers.has(code)) {
        clearTimeout(countdownTimers.get(code));
        countdownTimers.delete(code);
      }
      roomManager.setMajorityCountdown(code, null);

      console.log(`Admin changed theme number in room ${code} to ${themeNumber}. Themes:`, themes.map(t => t.id));

      // Send updated voting state to all players
      room.players.forEach((player) => {
        io.to(player.id).emit('voting-started', {
          ...gameLogic.getVotingState(room, player.id),
          drawnNumber: themeNumber,
        });
      });

      callback({ success: true, drawnNumber: themeNumber });
    } catch (error) {
      console.error('Error changing theme:', error);
      callback({ success: false, error: 'Erro ao mudar tema' });
    }
  });

  // Vote for theme
  socket.on('vote-theme', (data, callback) => {
    try {
      const { code, themeId } = data;
      const result = roomManager.addVote(code, socket.id, themeId);

      if (!result) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      const { room, allVoted, majorityVoted, totalVotes, totalConnected } = result;
      console.log(`${socket.id} voted for theme ${themeId} in room ${code} (${totalVotes}/${totalConnected})`);

      // If all voted, start game immediately
      if (allVoted) {
        console.log(`All players voted in room ${code}, starting game immediately`);
        startGameFromVoting(code);
        callback({ success: true });
        return;
      }

      // If majority voted and no countdown yet, start 30-second countdown
      if (majorityVoted && !room.majorityCountdownEnd) {
        const countdownEnd = Date.now() + 30 * 1000;
        roomManager.setMajorityCountdown(code, countdownEnd);
        console.log(`Majority voted in room ${code}, starting 30s countdown`);

        // Set timeout to start game after countdown
        const timer = setTimeout(() => {
          console.log(`Countdown ended in room ${code}, starting game`);
          countdownTimers.delete(code);
          startGameFromVoting(code);
        }, 30 * 1000);

        countdownTimers.set(code, timer);
      }

      // Notify all players of the vote (include countdown info)
      const countdownRemaining = roomManager.getCountdownRemaining(code);
      room.players.forEach((player) => {
        io.to(player.id).emit('vote-update', {
          ...gameLogic.getVotingState(room, player.id),
          drawnNumber: room.drawnNumber,
          countdownSeconds: countdownRemaining,
        });
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error voting:', error);
      callback({ success: false, error: 'Erro ao votar' });
    }
  });

  // Skip voting (host only) - Pick random theme and start game
  socket.on('skip-voting', (code, callback) => {
    try {
      const room = roomManager.getRoom(code);

      if (!room) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      if (room.host !== socket.id) {
        callback({ success: false, error: 'Apenas o host pode pular' });
        return;
      }

      // Clear any countdown
      if (countdownTimers.has(code)) {
        clearTimeout(countdownTimers.get(code));
        countdownTimers.delete(code);
      }
      roomManager.setMajorityCountdown(code, null);

      // Pick random theme from the options
      const randomTheme = room.votingThemes[Math.floor(Math.random() * room.votingThemes.length)];
      room.selectedTheme = randomTheme;

      console.log(`Voting skipped in room ${code}. Random theme: ${randomTheme.title} (#${randomTheme.id})`);

      // Deal cards and start game
      gameLogic.dealCards(room.players);
      roomManager.updateRoomStatus(code, 'playing');

      console.log(`Game started in room ${code} with theme: ${randomTheme.title}`);

      // Send game state to each player
      room.players.forEach((player) => {
        io.to(player.id).emit('game-started', gameLogic.getPlayerGameState(room, player.id));
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error skipping voting:', error);
      callback({ success: false, error: 'Erro ao pular votação' });
    }
  });

  // Force start game (host only) - Start with most voted theme or random
  socket.on('force-start-game', (data, callback) => {
    console.log('Force start game received:', data, 'from socket:', socket.id);
    try {
      const { code, themeId } = data;
      const room = roomManager.getRoom(code);

      console.log('Room found:', !!room, 'Host:', room?.host, 'Socket:', socket.id);

      if (!room) {
        console.log('Room not found');
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      if (room.host !== socket.id) {
        console.log('Not host! room.host:', room.host, 'socket.id:', socket.id);
        callback({ success: false, error: 'Apenas o admin pode iniciar' });
        return;
      }

      // Clear any countdown
      if (countdownTimers.has(code)) {
        clearTimeout(countdownTimers.get(code));
        countdownTimers.delete(code);
      }
      roomManager.setMajorityCountdown(code, null);

      // Get theme - either specified, most voted, or random
      let selectedTheme;
      if (themeId) {
        selectedTheme = room.votingThemes.find(t => t.id === themeId);
      }

      if (!selectedTheme) {
        // Try to get most voted theme
        const winningTheme = roomManager.getVoteWinner(code);
        if (winningTheme) {
          selectedTheme = winningTheme;
        } else {
          // Random if no votes
          selectedTheme = room.votingThemes[Math.floor(Math.random() * room.votingThemes.length)];
        }
      }

      room.selectedTheme = selectedTheme;

      console.log(`Admin force started game in room ${code}. Theme: ${selectedTheme.title} (#${selectedTheme.id})`);

      // Deal cards and start game
      gameLogic.dealCards(room.players);
      roomManager.updateRoomStatus(code, 'playing');

      // Send game state to each player
      room.players.forEach((player) => {
        io.to(player.id).emit('game-started', gameLogic.getPlayerGameState(room, player.id));
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error force starting game:', error);
      callback({ success: false, error: 'Erro ao iniciar jogo' });
    }
  });

  // Number draw complete - Start actual game
  socket.on('draw-complete', (code, callback) => {
    try {
      const room = roomManager.getRoom(code);

      if (!room) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      // Only host triggers the game start
      if (room.host !== socket.id) {
        callback({ success: true }); // Non-host just acknowledges
        return;
      }

      // Deal cards and update status
      gameLogic.dealCards(room.players);
      roomManager.updateRoomStatus(code, 'playing');

      console.log(`Game started in room ${code} with theme: ${room.selectedTheme?.title}`);

      // Send game state to each player (they only see their own card)
      room.players.forEach((player) => {
        io.to(player.id).emit('game-started', gameLogic.getPlayerGameState(room, player.id));
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error completing draw:', error);
      callback({ success: false, error: 'Erro ao iniciar jogo' });
    }
  });

  // Reveal card
  socket.on('reveal-card', (code, callback) => {
    try {
      const room = roomManager.getRoom(code);

      if (!room) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      const player = gameLogic.revealCard(room.players, socket.id);

      if (!player) {
        callback({ success: false, error: 'Jogador não encontrado' });
        return;
      }

      console.log(`${player.name} revealed card ${player.card} in room ${code}`);

      // Notify all players about the reveal
      room.players.forEach((p) => {
        io.to(p.id).emit('card-revealed', {
          player: { id: player.id, name: player.name, card: player.card },
          gameState: gameLogic.getPlayerGameState(room, p.id),
        });
      });

      // Check if all cards are revealed
      if (gameLogic.allCardsRevealed(room.players)) {
        const orderedCards = gameLogic.getCardsInOrder(room.players);
        roomManager.updateRoomStatus(code, 'reveal');
        io.to(code).emit('all-revealed', { orderedCards });
      }

      callback({ success: true });
    } catch (error) {
      console.error('Error revealing card:', error);
      callback({ success: false, error: 'Erro ao revelar carta' });
    }
  });

  // Reveal all cards (host only)
  socket.on('reveal-all-cards', (code, callback) => {
    try {
      const room = roomManager.getRoom(code);

      if (!room) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      if (room.host !== socket.id) {
        callback({ success: false, error: 'Apenas o host pode revelar todas as cartas' });
        return;
      }

      // Reveal all cards
      room.players.forEach((player) => {
        player.revealed = true;
      });

      const orderedCards = gameLogic.getCardsInOrder(room.players);

      console.log(`Host revealed all cards in room ${code}`);

      // Send updated game state to all players
      room.players.forEach((p) => {
        io.to(p.id).emit('all-cards-revealed', {
          gameState: gameLogic.getPlayerGameState(room, p.id),
          orderedCards,
        });
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error revealing all cards:', error);
      callback({ success: false, error: 'Erro ao revelar cartas' });
    }
  });

  // Reset game (new round)
  socket.on('reset-game', (code, callback) => {
    try {
      const room = roomManager.getRoom(code);

      if (!room) {
        callback({ success: false, error: 'Sala não encontrada' });
        return;
      }

      if (room.host !== socket.id) {
        callback({ success: false, error: 'Apenas o host pode reiniciar' });
        return;
      }

      roomManager.resetRoom(code);
      console.log(`Game reset in room ${code}`);

      // Notify all players
      room.players.forEach((player) => {
        io.to(player.id).emit('game-reset', gameLogic.getPublicRoomState(room, player.id));
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error resetting game:', error);
      callback({ success: false, error: 'Erro ao reiniciar jogo' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    // Marca como desconectado ao invés de remover (permite reconexão por 30 min)
    const result = roomManager.markPlayerDisconnected(socket.id);

    if (result && !result.deleted && result.playerDisconnected) {
      // Notifica outros jogadores que este player desconectou (mas ainda é "ghost")
      result.room.players.forEach((player) => {
        if (!player.disconnected && player.id !== socket.id) {
          io.to(player.id).emit('player-disconnected', {
            player: { id: socket.id, name: result.playerDisconnected.name },
            newHost: result.newHost,
            room: gameLogic.getPublicRoomState(result.room, player.id),
          });
        }
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`
  🎴 ITO Server running!

  Local:    http://localhost:${PORT}
  Mode:     ${isDev ? 'Development' : 'Production'}
  `);
});
