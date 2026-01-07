import { useState, useEffect } from 'react';
import { socket, GameService } from '../services/socket';

export const useGameSync = (roomId, currentUserId) => {
    const [room, setRoom] = useState(null);
    const [player, setPlayer] = useState(null);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        // Connection handlers
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        // Game handlers
        const onRoomUpdate = (updatedRoom) => {
            setRoom(updatedRoom);
            if (currentUserId) {
                const p = updatedRoom.players.find(p => p.id === currentUserId);
                if (p) setPlayer(p);
            }
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('room_updated', onRoomUpdate);

        // Initial Sync (Try to rejoin if we have IDs but no state)
        if (isConnected && roomId && currentUserId && !room) {
            GameService.rejoinRoom(roomId, currentUserId)
                .then(data => {
                    setRoom(data.room);
                    setPlayer(data.player);
                })
                .catch(err => console.log("Rejoin failed or new session:", err));
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('room_updated', onRoomUpdate);
        };
    }, [roomId, currentUserId, isConnected, room]);

    return { room, player, isConnected };
};
