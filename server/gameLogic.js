// Generate unique random cards for all players
function dealCards(players) {
  const usedNumbers = new Set();

  players.forEach((player) => {
    let card;
    do {
      card = Math.floor(Math.random() * 101); // 0 to 100
    } while (usedNumbers.has(card));

    usedNumbers.add(card);
    player.card = card;
    player.revealed = false;
  });

  return players;
}

// Check if all players have revealed their cards
function allCardsRevealed(players) {
  return players.every((p) => p.revealed);
}

// Reveal a player's card
function revealCard(players, socketId) {
  const player = players.find((p) => p.id === socketId);
  if (player) {
    player.revealed = true;
  }
  return player;
}

// Get cards in correct order (for final reveal)
function getCardsInOrder(players) {
  return [...players]
    .filter((p) => p.card !== null)
    .sort((a, b) => a.card - b.card)
    .map((p) => ({
      name: p.name,
      card: p.card,
    }));
}

// Get game state for a specific player (hides other players' cards)
function getPlayerGameState(room, socketId) {
  return {
    code: room.code,
    status: room.status,
    isHost: room.host === socketId,
    selectedTheme: room.selectedTheme,
    drawnNumber: room.drawnNumber,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      card: p.id === socketId || p.revealed ? p.card : null,
      revealed: p.revealed,
      isYou: p.id === socketId,
      disconnected: p.disconnected || false,
    })),
  };
}

// Get public room state (for lobby)
function getPublicRoomState(room, socketId) {
  return {
    code: room.code,
    status: room.status,
    isHost: room.host === socketId,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.id === room.host,
      isYou: p.id === socketId,
      disconnected: p.disconnected || false,
    })),
  };
}

// Get voting state
function getVotingState(room, socketId) {
  return {
    code: room.code,
    status: room.status,
    isHost: room.host === socketId,
    themes: room.votingThemes,
    votes: room.votes,
    hasVoted: !!room.votes[socketId],
    selectedTheme: room.selectedTheme,
    drawnNumber: room.drawnNumber,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.id === room.host,
      isYou: p.id === socketId,
      hasVoted: !!room.votes[p.id],
      disconnected: p.disconnected || false,
    })),
  };
}

module.exports = {
  dealCards,
  allCardsRevealed,
  revealCard,
  getCardsInOrder,
  getPlayerGameState,
  getPublicRoomState,
  getVotingState,
};
