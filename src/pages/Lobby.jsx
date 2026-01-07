import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameSync } from '../hooks/useGameSync';
import { GameService } from '../services/socket';

const Lobby = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const currentUserId = sessionStorage.getItem('current_user_id');

    const { room, player } = useGameSync(roomId, currentUserId);

    useEffect(() => {
        if (room && room.status === 'PLAYING') {
            navigate(`/game/${roomId}`);
        }
    }, [room, roomId, navigate]);

    if (!room || !player) return <div className="container">Loading Lobby...</div>;

    const isHost = room.host === player.name;

    const handleStart = () => {
        GameService.startGame(roomId);
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            alert('Code copied!');
        } catch (err) {
            // Fallback for non-secure contexts (HTTP)
            const textArea = document.createElement("textarea");
            textArea.value = roomId;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('Code copied!');
            } catch (err2) {
                prompt("Copy this code manually:", roomId);
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Room Code</h2>
                <div
                    onClick={copyCode}
                    style={{
                        fontSize: '3rem',
                        fontWeight: '900',
                        margin: '10px 0',
                        cursor: 'pointer',
                        color: 'var(--primary-color)'
                    }}>
                    {roomId}
                    <span style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '10px', opacity: 0.5 }}>📋</span>
                </div>
                <div style={{ marginBottom: '20px', color: '#888', fontWeight: 'bold' }}>
                    MODE: {room.boardSize}x{room.boardSize} BINGO
                </div>

                <button
                    onClick={async () => {
                        const url = `${window.location.origin}/?join=${roomId}`;
                        try {
                            await navigator.clipboard.writeText(url);
                            alert('Link copied! Share it with friends.');
                        } catch (e) {
                            prompt("Copy this link:", url);
                        }
                    }}
                    className="btn btn-secondary"
                    style={{ marginBottom: '20px', fontSize: '0.8rem', padding: '8px 15px' }}
                >
                    🔗 Copy Invite Link
                </button>

                <div style={{ marginTop: '30px', textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                        Players ({room.players.length}/5)
                    </h3>
                    <ul style={{ listStyle: 'none' }}>
                        {room.players.map(p => (
                            <li key={p.id} style={{
                                padding: '10px',
                                background: p.id === player.id ? 'rgba(0, 224, 255, 0.1)' : 'transparent',
                                borderRadius: '8px',
                                marginBottom: '5px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {p.name[0].toUpperCase()}
                                </div>
                                {p.name} {p.name === room.host && '👑'} {p.id === player.id && '(You)'}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ marginTop: '40px' }}>
                    {isHost ? (
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleStart}>
                            START GAME
                        </button>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Waiting for host to start...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lobby;
