import { useGame } from '../context/GameContext';

// Re-export the game context hook for convenience
export function useSocket() {
  const { socket, connected } = useGame();
  return { socket, connected };
}

export default useSocket;
