import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext(null);

const SOCKET_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

// Gera ou recupera um ID único persistente para o player
function getOrCreatePlayerId() {
  let playerId = localStorage.getItem('ito-player-id');
  if (!playerId) {
    playerId = 'player_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('ito-player-id', playerId);
  }
  return playerId;
}

export function GameProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('ito-player-name') || '';
  });
  const [room, setRoom] = useState(null);
  const [votingState, setVotingState] = useState(null);
  const [drawingState, setDrawingState] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  // ID persistente do player (sobrevive a reconexões)
  const playerId = useRef(getOrCreatePlayerId());

  // Use ref to track current room code for reconnection scenarios
  const currentRoomCode = useRef(localStorage.getItem('ito-current-room') || null);

  // Connect to socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);
      setConnected(true);
      // Reconexão agora é manual via botão na Home
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Erro de conexão com o servidor');
    });

    // Room events
    newSocket.on('player-joined', (data) => {
      console.log('Player joined:', data);
      setRoom(data.room);
    });

    newSocket.on('player-left', (data) => {
      console.log('Player left:', data);
      setRoom(data.room);
    });

    newSocket.on('player-disconnected', (data) => {
      console.log('Player disconnected:', data);
      // Atualiza o estado atual (room, voting ou game)
      if (data.room) {
        setRoom((prev) => prev ? data.room : prev);
      }
    });

    newSocket.on('player-reconnected', (data) => {
      console.log('Player reconnected:', data);
      // Atualiza o estado atual
      if (data.room) {
        setRoom((prev) => prev ? data.room : prev);
      }
    });

    // Voting events - after number draw animation
    newSocket.on('voting-started', (data) => {
      console.log('Voting started:', data);
      currentRoomCode.current = data.code;
      setVotingState(data);
      setDrawingState(null); // Clear drawing state, animation is done
      setRoom(null);
      setGameState(null);
    });

    newSocket.on('vote-update', (data) => {
      console.log('Vote update:', data);
      setVotingState(data);
    });

    // Number draw event - first phase, show animation
    newSocket.on('draw-number', (data) => {
      console.log('Draw number:', data);
      currentRoomCode.current = data.code || currentRoomCode.current;
      setDrawingState(data);
      setRoom(null);
      setGameState(null);
      // Don't clear votingState yet, it will be set after animation
    });

    // Game events
    newSocket.on('game-started', (data) => {
      console.log('Game started:', data);
      currentRoomCode.current = data.code;
      setGameState(data);
      setRoom(null);
      setVotingState(null);
      setDrawingState(null);
    });

    newSocket.on('card-revealed', (data) => {
      console.log('Card revealed:', data);
      setGameState(data.gameState);
    });

    newSocket.on('all-revealed', (data) => {
      console.log('All cards revealed:', data);
      setGameState((prev) => {
        if (!prev) return prev;
        return { ...prev, orderedCards: data.orderedCards, status: 'reveal' };
      });
    });

    newSocket.on('all-cards-revealed', (data) => {
      console.log('All cards revealed by host:', data);
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...data.gameState,
          orderedCards: data.orderedCards,
          allRevealed: true,
        };
      });
    });

    newSocket.on('game-reset', (data) => {
      console.log('Game reset:', data);
      currentRoomCode.current = data.code;
      setRoom(data);
      setGameState(null);
      setVotingState(null);
      setDrawingState(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Save player name to localStorage
  useEffect(() => {
    if (playerName) {
      localStorage.setItem('ito-player-name', playerName);
    }
  }, [playerName]);

  // Create room
  const createRoom = useCallback((name) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);
      setPlayerName(name);

      socket.emit('create-room', { playerName: name, playerId: playerId.current }, (response) => {
        console.log('Create room response:', response);
        if (response.success) {
          currentRoomCode.current = response.room.code;
          localStorage.setItem('ito-current-room', response.room.code);
          setRoom(response.room);
          setGameState(null);
          setVotingState(null);
          setDrawingState(null);
          resolve(response.room);
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Join room
  const joinRoom = useCallback((code, name) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);
      setPlayerName(name);

      socket.emit('join-room', { code: code.toUpperCase(), playerName: name, playerId: playerId.current }, (response) => {
        console.log('Join room response:', response);
        if (response.success) {
          currentRoomCode.current = response.room.code;
          localStorage.setItem('ito-current-room', response.room.code);
          setRoom(response.room);
          setGameState(null);
          setVotingState(null);
          setDrawingState(null);
          resolve(response.room);
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Start game (now starts voting)
  const startGame = useCallback((code) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('start-game', code, (response) => {
        console.log('Start game response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Vote for theme
  const voteTheme = useCallback((code, themeId) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('vote-theme', { code, themeId }, (response) => {
        console.log('Vote theme response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Skip voting
  const skipVoting = useCallback((code) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('skip-voting', code, (response) => {
        console.log('Skip voting response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Force start game (admin only) - start regardless of votes
  const forceStartGame = useCallback((code, themeId = null) => {
    console.log('GameContext.forceStartGame called:', { code, themeId, socketConnected: socket?.connected });
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        console.error('Socket not connected!');
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      console.log('Emitting force-start-game event...');
      socket.emit('force-start-game', { code, themeId }, (response) => {
        console.log('Force start game response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Change theme number (admin only)
  const changeThemeNumber = useCallback((code, newNumber = null) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('change-theme-number', { code, newNumber }, (response) => {
        console.log('Change theme number response:', response);
        if (response.success) {
          resolve(response.drawnNumber);
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Draw animation complete - triggers voting phase
  const drawAnimationComplete = useCallback((code) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('draw-animation-complete', code, (response) => {
        console.log('Draw animation complete response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Draw complete (legacy - for after voting)
  const drawComplete = useCallback((code) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('draw-complete', code, (response) => {
        console.log('Draw complete response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Reveal card
  const revealCard = useCallback((code) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('reveal-card', code, (response) => {
        console.log('Reveal card response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Reveal all cards (host only)
  const revealAllCards = useCallback((code) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('reveal-all-cards', code, (response) => {
        console.log('Reveal all cards response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Reset game
  const resetGame = useCallback((code) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);

      socket.emit('reset-game', code, (response) => {
        console.log('Reset game response:', response);
        if (response.success) {
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Reconnect to room (manual reconnection from Home page)
  const reconnectToRoom = useCallback((code, name) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Não conectado ao servidor'));
        return;
      }

      setError(null);
      setPlayerName(name);

      socket.emit('rejoin-room', {
        code: code.toUpperCase(),
        playerName: name,
        playerId: playerId.current,
      }, (response) => {
        console.log('Reconnect response:', response);
        if (response.success) {
          currentRoomCode.current = code;
          localStorage.setItem('ito-current-room', code);

          // Restaura o estado baseado no que o servidor retornou
          if (response.state === 'lobby') {
            setRoom(response.room);
            setGameState(null);
            setVotingState(null);
            setDrawingState(null);
          } else if (response.state === 'voting') {
            setVotingState(response.votingState);
            setRoom(null);
            setGameState(null);
            setDrawingState(null);
          } else if (response.state === 'playing') {
            setGameState(response.gameState);
            setRoom(null);
            setVotingState(null);
            setDrawingState(null);
          }

          resolve(response);
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Leave/reset state
  const leaveRoom = useCallback(() => {
    currentRoomCode.current = null;
    localStorage.removeItem('ito-current-room');
    setRoom(null);
    setGameState(null);
    setVotingState(null);
    setDrawingState(null);
    setError(null);
  }, []);

  const value = {
    socket,
    connected,
    isReconnecting,
    playerName,
    setPlayerName,
    room,
    votingState,
    drawingState,
    gameState,
    error,
    clearError,
    createRoom,
    joinRoom,
    startGame,
    voteTheme,
    skipVoting,
    forceStartGame,
    changeThemeNumber,
    drawAnimationComplete,
    drawComplete,
    revealCard,
    revealAllCards,
    resetGame,
    leaveRoom,
    reconnectToRoom,
    currentRoomCode: currentRoomCode.current,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
