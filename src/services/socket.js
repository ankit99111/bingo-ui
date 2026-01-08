import io from 'socket.io-client';

const SOCKET_URL = `wss://e55e52a1-e95c-4ded-ad62-992a653e94c6-dev.e1-us-east-azure.choreoapis.dev/default/bingo-api/v1.0`;

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    extraHeaders: {
        "ngrok-skip-browser-warning": "true"
    }
});

export const GameService = {
    // Promisify socket emits for cleaner usage in components
    createRoom: (hostName, boardSize) => {
        return new Promise((resolve, reject) => {
            socket.emit('create_room', { hostName, boardSize }, (response) => {
                if (response.error) reject(response.error);
                else resolve(response);
            });
        });
    },

    joinRoom: (roomId, playerName) => {
        return new Promise((resolve, reject) => {
            socket.emit('join_room', { roomId, playerName }, (response) => {
                if (response.error) reject(response.error);
                else resolve(response);
            });
        });
    },

    rejoinRoom: (roomId, playerId) => {
        return new Promise((resolve, reject) => {
            socket.emit('rejoin_room', { roomId, playerId }, (response) => {
                if (response.error) reject(response.error);
                else resolve(response);
            });
        });
    },

    startGame: (roomId) => {
        socket.emit('start_game', { roomId });
    },

    submitNumber: (roomId, playerId, number) => {
        socket.emit('submit_number', { roomId, playerId, number });
    },

    sendMessage: (roomId, playerId, text) => {
        socket.emit('send_message', { roomId, playerId, text });
    },
    kickPlayer: (roomId, playerId) => {
        socket.emit('kick_player', { roomId, playerId });
    },

    drawNumber: (roomId) => {
        socket.emit('draw_number', { roomId });
    },

    updateBoard: (roomId, playerId, board) => {
        socket.emit('update_board', { roomId, playerId, board });
    },

    declareWin: (roomId, playerId) => {
        socket.emit('declare_win', { roomId, playerId });
    },
    restartGame: (roomId) => {
        socket.emit('restart_game', { roomId });
    }
};

