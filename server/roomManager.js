// Room storage (in-memory)
const rooms = new Map();

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
function createRoom(hostSocketId, hostName) {
  const code = generateRoomCode();
  const room = {
    code,
    host: hostSocketId,
    players: [
      {
        id: hostSocketId,
        name: hostName,
        card: null,
        revealed: false,
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
function joinRoom(code, socketId, playerName) {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { error: 'Sala não encontrada' };
  }
  if (room.status !== 'lobby') {
    return { error: 'Jogo já começou' };
  }
  if (room.players.length >= 8) {
    return { error: 'Sala cheia (máximo 8 jogadores)' };
  }
  if (room.players.some((p) => p.name === playerName)) {
    return { error: 'Nome já está em uso nesta sala' };
  }

  room.players.push({
    id: socketId,
    name: playerName,
    card: null,
    revealed: false,
  });

  return { room };
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

// Remove player from room
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
  }

  return { room, deleted: false, newHost: room.host };
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

  // Check if all players voted
  const allVoted = room.players.every((p) => room.votes[p.id] !== undefined);

  return { room, allVoted };
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
  getRoom,
  getRoomByPlayerId,
  removePlayer,
  updateRoomStatus,
  setVotingThemes,
  addVote,
  getVoteWinner,
  setDrawnNumber,
  resetRoom,
  getAllRooms,
};
