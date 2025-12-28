// Room storage (in-memory)
const rooms = new Map();

// Tempo para remover player desconectado (30 minutos)
const DISCONNECT_TIMEOUT = 30 * 60 * 1000;

// Generate random 4-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Make sure code doesn't already exist
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Create a new room
function createRoom(hostSocketId, hostName, hostPlayerId) {
  const code = generateRoomCode();
  const room = {
    code,
    host: hostSocketId,
    hostPlayerId: hostPlayerId, // ID persistente do host
    players: [
      {
        id: hostSocketId,
        playerId: hostPlayerId, // ID persistente (sobrevive reconexão)
        name: hostName,
        card: null,
        revealed: false,
        disconnected: false,
        disconnectedAt: null,
      },
    ],
    status: 'lobby', // lobby | voting | drawing | playing | reveal
    // Voting state
    votingThemes: null, // 3 themes to vote on
    votes: {}, // { playerId: themeId }
    selectedTheme: null, // winning theme after voting
    drawnNumber: null, // the number drawn for animation
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

// Join existing room
function joinRoom(code, socketId, playerName, playerId) {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { error: 'Sala não encontrada' };
  }
  if (room.status !== 'lobby') {
    return { error: 'Jogo já começou' };
  }
  if (room.players.length >= 20) {
    return { error: 'Sala cheia (máximo 20 jogadores)' };
  }

  // Verifica nome duplicado (case-insensitive, ignorando players com mesmo playerId)
  const normalizedName = playerName.trim().toLowerCase();
  const existingPlayer = room.players.find(
    (p) => p.name.toLowerCase() === normalizedName && p.playerId !== playerId
  );
  if (existingPlayer) {
    return { error: 'Nome já está em uso nesta sala' };
  }

  // Se já existe player com mesmo playerId, atualiza ao invés de adicionar
  const existingByPlayerId = room.players.find((p) => p.playerId === playerId);
  if (existingByPlayerId) {
    existingByPlayerId.id = socketId;
    existingByPlayerId.name = playerName;
    existingByPlayerId.disconnected = false;
    existingByPlayerId.disconnectedAt = null;
    return { room };
  }

  room.players.push({
    id: socketId,
    playerId: playerId,
    name: playerName,
    card: null,
    revealed: false,
    disconnected: false,
    disconnectedAt: null,
  });

  return { room };
}

// Kick player from room (host only)
function kickPlayer(code, hostSocketId, targetPlayerId) {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { error: 'Sala não encontrada' };
  }
  if (room.host !== hostSocketId) {
    return { error: 'Apenas o host pode remover jogadores' };
  }
  if (room.status !== 'lobby') {
    return { error: 'Não é possível remover durante o jogo' };
  }

  const targetPlayer = room.players.find((p) => p.playerId === targetPlayerId);
  if (!targetPlayer) {
    return { error: 'Jogador não encontrado' };
  }
  if (targetPlayer.id === hostSocketId) {
    return { error: 'Você não pode remover a si mesmo' };
  }

  // Remove the player
  const kickedPlayer = { ...targetPlayer };
  room.players = room.players.filter((p) => p.playerId !== targetPlayerId);

  return { room, kickedPlayer };
}

// Get room by code
function getRoom(code) {
  return rooms.get(code.toUpperCase());
}

// Get room by player socket id
function getRoomByPlayerId(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.id === socketId)) {
      return room;
    }
  }
  return null;
}

// Marca player como desconectado (não remove imediatamente - mantém como "ghost")
function markPlayerDisconnected(socketId) {
  const room = getRoomByPlayerId(socketId);
  if (!room) return null;

  const player = room.players.find((p) => p.id === socketId);
  if (!player) return null;

  // Marca como desconectado (tanto no lobby quanto no jogo)
  player.disconnected = true;
  player.disconnectedAt = Date.now();

  console.log(`Player ${player.name} marcado como desconectado na sala ${room.code} (status: ${room.status})`);

  // Verifica se todos os players estão desconectados
  const allDisconnected = room.players.every((p) => p.disconnected);
  if (allDisconnected) {
    // Se todos desconectaram, agenda remoção da sala
    console.log(`Todos os players desconectados na sala ${room.code}, agendando remoção`);
    setTimeout(() => {
      const currentRoom = rooms.get(room.code);
      if (currentRoom && currentRoom.players.every((p) => p.disconnected)) {
        console.log(`Removendo sala ${room.code} por inatividade total`);
        rooms.delete(room.code);
      }
    }, DISCONNECT_TIMEOUT);
  }

  // Agenda remoção do player após timeout
  setTimeout(() => {
    cleanupDisconnectedPlayer(room.code, player.playerId);
  }, DISCONNECT_TIMEOUT);

  // Se host desconectou, passa para outro player conectado
  if (room.host === socketId) {
    const connectedPlayer = room.players.find((p) => !p.disconnected);
    if (connectedPlayer) {
      room.host = connectedPlayer.id;
      room.hostPlayerId = connectedPlayer.playerId;
    }
    // Se não há ninguém conectado, mantém o host original (ele pode reconectar)
  }

  return { room, deleted: false, newHost: room.host, playerDisconnected: player };
}

// Remove player desconectado após timeout
function cleanupDisconnectedPlayer(code, playerId) {
  const room = rooms.get(code);
  if (!room) return;

  const player = room.players.find((p) => p.playerId === playerId);
  if (!player || !player.disconnected) return;

  // Se ainda está desconectado após o timeout, remove de vez
  console.log(`Removendo player ${player.name} da sala ${code} por timeout`);
  room.players = room.players.filter((p) => p.playerId !== playerId);

  // Remove voto se existir
  if (room.votes[player.id]) {
    delete room.votes[player.id];
  }

  // Se sala ficou vazia, deleta
  if (room.players.length === 0) {
    rooms.delete(code);
  }
}

// Remove player from room (legacy - usado para saída voluntária)
function removePlayer(socketId) {
  const room = getRoomByPlayerId(socketId);
  if (!room) return null;

  room.players = room.players.filter((p) => p.id !== socketId);

  // Remove vote if player voted
  if (room.votes[socketId]) {
    delete room.votes[socketId];
  }

  // If room is empty, delete it
  if (room.players.length === 0) {
    rooms.delete(room.code);
    return { room, deleted: true };
  }

  // If host left, assign new host
  if (room.host === socketId && room.players.length > 0) {
    room.host = room.players[0].id;
    room.hostPlayerId = room.players[0].playerId;
  }

  return { room, deleted: false, newHost: room.host };
}

// Encontra sala por playerId persistente
function getRoomByPersistentPlayerId(playerId) {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.playerId === playerId)) {
      return room;
    }
  }
  return null;
}

// Reconecta um player (atualiza socket ID)
function reconnectPlayer(code, newSocketId, playerId, playerName) {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { error: 'Sala não encontrada' };
  }

  let player = room.players.find((p) => p.playerId === playerId);

  // Se player não existe na sala (foi removido no lobby), re-adiciona
  if (!player) {
    // Só permite re-adicionar se está no lobby
    if (room.status !== 'lobby') {
      return { error: 'Jogador não encontrado nesta sala' };
    }

    // Verifica se o nome já está em uso por outro player
    const nameInUse = room.players.find((p) => p.name === playerName && p.playerId !== playerId);
    if (nameInUse) {
      return { error: 'Nome já está em uso nesta sala' };
    }

    // Re-adiciona o player
    player = {
      id: newSocketId,
      playerId: playerId,
      name: playerName,
      card: null,
      revealed: false,
      disconnected: false,
      disconnectedAt: null,
    };
    room.players.push(player);
    console.log(`Player ${playerName} re-adicionado na sala ${code}`);

    return { room, player, rejoined: true };
  }

  // Atualiza socket ID e marca como conectado
  const oldSocketId = player.id;
  player.id = newSocketId;
  player.disconnected = false;
  player.disconnectedAt = null;

  console.log(`Player ${player.name} reconectado na sala ${code} (${oldSocketId} -> ${newSocketId})`);

  // Se era o host original, restaura como host
  if (room.hostPlayerId === playerId) {
    room.host = newSocketId;
  }

  // Atualiza votos se existirem (troca socket ID antigo pelo novo)
  if (room.votes[oldSocketId]) {
    room.votes[newSocketId] = room.votes[oldSocketId];
    delete room.votes[oldSocketId];
  }

  return { room, player };
}

// Update room status
function updateRoomStatus(code, status) {
  const room = rooms.get(code);
  if (room) {
    room.status = status;
  }
  return room;
}

// Set voting themes
function setVotingThemes(code, themes) {
  const room = rooms.get(code);
  if (room) {
    room.votingThemes = themes;
    room.votes = {};
    room.status = 'voting';
  }
  return room;
}

// Add vote
function addVote(code, playerId, themeId) {
  const room = rooms.get(code);
  if (!room) return null;

  room.votes[playerId] = themeId;

  // Count connected players only (not disconnected)
  const connectedPlayers = room.players.filter((p) => !p.disconnected);
  const totalConnected = connectedPlayers.length;
  const totalVotes = Object.keys(room.votes).length;

  // Check if all players voted
  const allVoted = connectedPlayers.every((p) => room.votes[p.id] !== undefined);

  // Check if majority voted (more than 50%)
  const majorityVoted = totalVotes > totalConnected / 2;

  return { room, allVoted, majorityVoted, totalVotes, totalConnected };
}

// Start or cancel majority countdown
function setMajorityCountdown(code, countdownEnd) {
  const room = rooms.get(code);
  if (room) {
    room.majorityCountdownEnd = countdownEnd;
  }
  return room;
}

// Get countdown remaining
function getCountdownRemaining(code) {
  const room = rooms.get(code);
  if (!room || !room.majorityCountdownEnd) return null;
  const remaining = Math.max(0, Math.ceil((room.majorityCountdownEnd - Date.now()) / 1000));
  return remaining;
}

// Get vote winner
function getVoteWinner(code) {
  const room = rooms.get(code);
  if (!room || !room.votingThemes) return null;

  // Count votes
  const voteCounts = {};
  room.votingThemes.forEach((theme) => {
    voteCounts[theme.id] = 0;
  });

  Object.values(room.votes).forEach((themeId) => {
    if (voteCounts[themeId] !== undefined) {
      voteCounts[themeId]++;
    }
  });

  // Find winner (most votes, or random if tie)
  let maxVotes = 0;
  let winners = [];

  room.votingThemes.forEach((theme) => {
    if (voteCounts[theme.id] > maxVotes) {
      maxVotes = voteCounts[theme.id];
      winners = [theme];
    } else if (voteCounts[theme.id] === maxVotes) {
      winners.push(theme);
    }
  });

  // Random pick if tie
  const winner = winners[Math.floor(Math.random() * winners.length)];
  room.selectedTheme = winner;

  return winner;
}

// Set drawn number
function setDrawnNumber(code, number) {
  const room = rooms.get(code);
  if (room) {
    room.drawnNumber = number;
    room.status = 'drawing';
  }
  return room;
}

// Reset room for new game
function resetRoom(code) {
  const room = rooms.get(code);
  if (room) {
    room.status = 'lobby';
    room.votingThemes = null;
    room.votes = {};
    room.selectedTheme = null;
    room.drawnNumber = null;
    room.players.forEach((p) => {
      p.card = null;
      p.revealed = false;
    });
  }
  return room;
}

// Get all rooms (for debugging)
function getAllRooms() {
  return Array.from(rooms.values());
}

module.exports = {
  createRoom,
  joinRoom,
  kickPlayer,
  getRoom,
  getRoomByPlayerId,
  getRoomByPersistentPlayerId,
  removePlayer,
  markPlayerDisconnected,
  reconnectPlayer,
  updateRoomStatus,
  setVotingThemes,
  addVote,
  getVoteWinner,
  setMajorityCountdown,
  getCountdownRemaining,
  setDrawnNumber,
  resetRoom,
  getAllRooms,
};
