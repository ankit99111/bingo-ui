import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useGameSync } from '../hooks/useGameSync';
import { GameService } from '../services/socket';
import { getCompletedLines } from '../utils/bingo';

const Result = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const currentUserId = sessionStorage.getItem('current_user_id');
    const { room, player } = useGameSync(roomId, currentUserId);

    useEffect(() => {
        if (room && room.status === 'WON') {
            // Fire confetti
            const end = Date.now() + 3000;
            const colors = ['#00e0ff', '#ff007a', '#ffffff'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [room?.status]);

    useEffect(() => {
        if (room && room.status === 'WAITING') {
            navigate(`/lobby/${roomId}`);
        }
    }, [room?.status, roomId, navigate]);

    if (!room) return <div className="container">Loading Result...</div>;

    const winner = room.players.find(p => p.name === room.winner);
    const isWinner = room.winner === player?.name;
    const isHost = room.host === player?.name;

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', textAlign: 'center' }}>
            <div className="animate-pop" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '5rem', fontWeight: '900', textShadow: '0 0 30px var(--primary-color)' }}>
                    GAME OVER
                </h1>
                <h2 style={{ fontSize: '2rem', color: isWinner ? 'gold' : '#fff', marginTop: '20px' }}>
                    {isWinner ? '🎉 YOU WON! 🎉' : `🏆 Winner: ${room.winner}`}
                </h2>
            </div>

            <div className="card" style={{ width: '100%', maxWidth: '500px', marginBottom: '40px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                    Game Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Total Rounds</span>
                        <span style={{ fontWeight: 'bold' }}>{room.drawnNumbers.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#aaa' }}>Winning Player</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>{room.winner}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {isHost && (
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => GameService.restartGame(roomId)}>
                            Play Again
                        </button>
                    )}
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/')}>
                        Exit to Menu
                    </button>
                </div>
            </div>

            <h3 style={{ marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px', color: '#666' }}>Final Boards</h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                width: '100%',
                padding: '0 20px'
            }}>
                {room.players.map(p => {
                    const completedLines = p.board ? getCompletedLines(p.board) : [];
                    const size = room.boardSize || 5;

                    return (
                        <div key={p.id} className="card" style={{ padding: '15px', border: p.name === room.winner ? '2px solid gold' : '1px solid transparent' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ color: p.name === room.winner ? 'gold' : 'white', marginBottom: '2px' }}>
                                        {p.name} {p.name === room.winner && '👑'}
                                    </h4>
                                </div>
                                {p.id === player.id && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>(You)</span>}
                            </div>

                            {p.board ? (
                                <div className="bingo-container" style={{
                                    gap: '4px',
                                    gridTemplateColumns: `repeat(${size}, 1fr)`,
                                    position: 'relative'
                                }}>
                                    {/* Lines Overlay */}
                                    <svg
                                        style={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                            pointerEvents: 'none', zIndex: 10, overflow: 'visible'
                                        }}
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                    >
                                        {completedLines.map((line, idx) => {
                                            const totalRows = size + 1; // 1 header + board rows
                                            const rowHeight = 100 / totalRows;
                                            const colWidth = 100 / size;

                                            if (line.type === 'row') {
                                                const y = (line.index + 1) * rowHeight + (rowHeight / 2);
                                                return <line key={idx} x1="2" y1={y} x2="98" y2={y} stroke="#ff4444" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px #ff0000)' }} />;
                                            }
                                            if (line.type === 'col') {
                                                const x = line.index * colWidth + (colWidth / 2);
                                                const yStart = rowHeight + (rowHeight / 2);
                                                const yEnd = 100 - (rowHeight / 2);
                                                return <line key={idx} x1={x} y1={yStart} x2={x} y2={yEnd} stroke="#ff4444" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px #ff0000)' }} />;
                                            }
                                            if (line.type === 'diag1') {
                                                const xStart = colWidth / 2;
                                                const xEnd = 100 - (colWidth / 2);
                                                const yStart = rowHeight + (rowHeight / 2);
                                                const yEnd = 100 - (rowHeight / 2);
                                                return <line key={idx} x1={xStart} y1={yStart} x2={xEnd} y2={yEnd} stroke="#ff4444" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px #ff0000)' }} />;
                                            }
                                            if (line.type === 'diag2') {
                                                const xStart = 100 - (colWidth / 2);
                                                const xEnd = colWidth / 2;
                                                const yStart = rowHeight + (rowHeight / 2);
                                                const yEnd = 100 - (rowHeight / 2);
                                                return <line key={idx} x1={xStart} y1={yStart} x2={xEnd} y2={yEnd} stroke="#ff4444" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px #ff0000)' }} />;
                                            }
                                            return null;
                                        })}
                                    </svg>

                                    {(size === 7 ? ['B', 'I', 'N', 'G', 'O', '!', '!'] : ['B', 'I', 'N', 'G', 'O']).map((l, i) => (
                                        <div key={i} className="bingo-header" style={{ fontSize: '1rem', paddingBottom: '2px' }}>{l}</div>
                                    ))}
                                    {p.board.map((row, r) =>
                                        row.map((cell, c) => (
                                            <div
                                                key={`${r}-${c}`}
                                                className={`bingo-cell ${cell.marked ? 'marked' : ''} ${cell.value === 'FREE' ? 'free' : ''}`}
                                                style={{
                                                    fontSize: size === 7 ? '0.6rem' : '0.8rem',
                                                    cursor: 'default',
                                                    opacity: cell.marked ? 1 : 0.4
                                                }}
                                            >
                                                {cell.value}
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No Board</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Result;
