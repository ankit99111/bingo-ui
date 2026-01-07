import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_PREFIX = 'bingo_room_';
const PLAYER_KEY_PREFIX = 'bingo_player_';

export const StorageManager = {
  // --- Room Management ---
  createRoom: (hostName) => {
    const roomId = uuidv4().slice(0, 4).toUpperCase(); // Short code
    const room = {
      id: roomId,
      host: hostName,
      players: [], // { id, name }
      status: 'WAITING', // WAITING, PLAYING, WON
      drawnNumbers: [],
      winner: null,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomId}`, JSON.stringify(room));
    return room;
  },

  getRoom: (roomId) => {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${roomId}`);
    return data ? JSON.parse(data) : null;
  },

  joinRoom: (roomId, playerName) => {
    const room = StorageManager.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'WAITING') throw new Error('Game already started');

    // Check if player already exists in this browser session ideally, 
    // but for simplicity, we create a new player ID each join.
    const playerId = uuidv4();
    const newPlayer = { id: playerId, name: playerName };
    
    room.players.push(newPlayer);
    room.lastUpdated = Date.now();
    
    // Save Room
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomId}`, JSON.stringify(room));
    
    // Save Player State (Board will be generated later)
    const playerState = {
      id: playerId,
      name: playerName,
      roomId: roomId,
      board: [], // Generated when game starts
    };
    localStorage.setItem(`${PLAYER_KEY_PREFIX}${playerId}`, JSON.stringify(playerState));

    return { room, player: playerState };
  },

  // --- Game Loop (Host Actions) ---
  startGame: (roomId) => {
    const room = StorageManager.getRoom(roomId);
    if (!room) return;
    
    room.status = 'PLAYING';
    room.lastUpdated = Date.now();
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomId}`, JSON.stringify(room));
  },

  drawNumber: (roomId) => {
    const room = StorageManager.getRoom(roomId);
    if (!room || room.status !== 'PLAYING') return;

    let nextNum;
    do {
      nextNum = Math.floor(Math.random() * 75) + 1;
    } while (room.drawnNumbers.includes(nextNum));

    room.drawnNumbers.push(nextNum);
    room.lastUpdated = Date.now();
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomId}`, JSON.stringify(room));
    
    return nextNum;
  },

  declareWinner: (roomId, playerName) => {
    const room = StorageManager.getRoom(roomId);
    if (!room) return;
    
    room.status = 'WON';
    room.winner = playerName;
    room.lastUpdated = Date.now();
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomId}`, JSON.stringify(room));
  },

  // --- Player Actions ---
  getPlayer: (playerId) => {
    const data = localStorage.getItem(`${PLAYER_KEY_PREFIX}${playerId}`);
    return data ? JSON.parse(data) : null;
  },

  updatePlayerBoard: (playerId, board) => {
    const player = StorageManager.getPlayer(playerId);
    if (player) {
      player.board = board;
      localStorage.setItem(`${PLAYER_KEY_PREFIX}${playerId}`, JSON.stringify(player));
    }
  }
};
