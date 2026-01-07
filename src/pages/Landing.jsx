import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameService } from '../services/socket';

const Landing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState('menu'); // 'menu', 'create', 'join'
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [boardSize, setBoardSize] = useState(5);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const joinCode = params.get('join');
        if (joinCode) {
            setRoomCode(joinCode);
            setView('join');
        }
    }, [location]);

    const handleCreate = async () => {
        if (!name) return setError('Please enter your name');
        setLoading(true);
        try {
            const { roomId } = await GameService.createRoom(name, boardSize);
            const { player } = await GameService.joinRoom(roomId, name);

            sessionStorage.setItem('current_user_id', player.id);
            navigate(`/lobby/${roomId}`);
        } catch (e) {
            setError('Failed to create room: ' + e);
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!name || !roomCode) return setError('Please fill all fields');
        setLoading(true);
        try {
            const { player } = await GameService.joinRoom(roomCode.toUpperCase(), name);
            sessionStorage.setItem('current_user_id', player.id);
            navigate(`/lobby/${roomCode.toUpperCase()}`);
        } catch (e) {
            setError(e);
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px', background: 'linear-gradient(to right, #00e0ff, #ff007a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                BINGO
            </h1>

            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                {view === 'menu' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="btn btn-primary" onClick={() => setView('create')}>Create New Room</button>
                        <button className="btn btn-secondary" onClick={() => setView('join')}>Join Existing Room</button>
                    </div>
                )}

                {view === 'create' && (
                    <div className="animate-pop">
                        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create Room</h2>
                        {error && <p style={{ color: '#ff4444', marginBottom: '15px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '4px' }}>{error}</p>}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Your Nickname</label>
                            <input
                                placeholder="e.g. BingoKing"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Board Size</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className={`btn ${boardSize === 5 ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setBoardSize(5)}
                                    style={{ flex: 1, padding: '10px' }}
                                    disabled={loading}
                                >
                                    5 x 5
                                </button>
                                <button
                                    className={`btn ${boardSize === 7 ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setBoardSize(7)}
                                    style={{ flex: 1, padding: '10px' }}
                                    disabled={loading}
                                >
                                    7 x 7
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={loading} style={{ width: '100%' }}>
                                {loading ? 'Creating...' : '🚀 Create Room'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setView('menu')} disabled={loading} style={{ width: '100%' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {view === 'join' && (
                    <div className="animate-pop">
                        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Join Room</h2>
                        {error && <p style={{ color: '#ff4444', marginBottom: '15px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '4px' }}>{error}</p>}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Room Code</label>
                                <input
                                    placeholder="e.g. ABCD"
                                    value={roomCode}
                                    onChange={e => setRoomCode(e.target.value)}
                                    maxLength={4}
                                    disabled={loading}
                                    style={{ textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', fontSize: '1.2rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Your Nickname</label>
                                <input
                                    placeholder="e.g. BingoQueen"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="btn btn-primary" onClick={handleJoin} disabled={loading} style={{ width: '100%' }}>
                                {loading ? 'Joining...' : '🎮 Join Game'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setView('menu')} disabled={loading} style={{ width: '100%' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}            </div>
        </div>
    );
};

export default Landing;
