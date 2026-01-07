import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useGameSync } from '../hooks/useGameSync';
import { GameService } from '../services/socket';
import { generateBingoBoard, checkWin, getCompletedLines } from '../utils/bingo';
import ConfirmModal from '../components/ConfirmModal';

const Game = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const currentUserId = sessionStorage.getItem('current_user_id');
    const { room, player } = useGameSync(roomId, currentUserId);
    const [lastDrawn, setLastDrawn] = useState(null);

    // Chat
    const [chatInput, setChatInput] = useState('');
    const chatBottomRef = useRef(null);
    const historyRef = useRef(null);

    // Turn Manual Input
    const [manualDrawNum, setManualDrawNum] = useState('');
    const [turnError, setTurnError] = useState('');
    const [showTurnNotification, setShowTurnNotification] = useState(false);

    // Modal State
    const [modal, setModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        isDangerous: false
    });
    const closeModal = () => setModal(prev => ({ ...prev, show: false }));


    // Initialize Board
    useEffect(() => {
        if (player && (!player.board || player.board.length === 0) && room?.boardSize) {
            const newBoard = generateBingoBoard(room.boardSize);
            GameService.updateBoard(roomId, player.id, newBoard);
        }
    }, [player, roomId, room?.boardSize]);

    // Game Events
    useEffect(() => {
        if (room && room.drawnNumbers.length > 0) {
            setLastDrawn(room.drawnNumbers[room.drawnNumbers.length - 1]);
        }
        if (room && room.status === 'WON') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    }, [room, roomId]);

    // Auto-scroll chat & history
    useEffect(() => {
        if (chatBottomRef.current) {
            chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [room?.messages]);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollLeft = historyRef.current.scrollWidth;
        }
    }, [room?.drawnNumbers]);

    // Turn Logic
    useEffect(() => {
        if (room && room.status === 'PLAYING') {
            const myIndex = room.players.findIndex(p => p.id === currentUserId);
            if (myIndex === room.currentTurnIndex) {
                setShowTurnNotification(true);
            } else {
                setShowTurnNotification(false);
                setManualDrawNum('');
                setTurnError('');
            }
        }
    }, [room?.currentTurnIndex, currentUserId]);

    // Navigation Redirects
    useEffect(() => {
        if (room && room.status === 'WAITING') {
            navigate(`/lobby/${roomId}`);
        }
    }, [room?.status, roomId, navigate]);

    if (!room || !player) return <div className="container">Loading...</div>;
    if (!player.board) return <div className="container">Setting up...</div>;

    const currentTurnPlayer = room.players[room.currentTurnIndex];
    const isMyTurn = currentTurnPlayer?.id === player.id;

    const handleManualSubmit = (e) => {
        e?.preventDefault();
        const num = parseInt(manualDrawNum);
        if (isNaN(num) || num < 1 || num > 75) {
            setTurnError('1-75'); return;
        }
        if (room.drawnNumbers.includes(num)) {
            setTurnError('Taken'); return;
        }
        GameService.submitNumber(roomId, player.id, num);
    };

    const toggleCell = (r, c) => {
        if (room.status === 'WON') return;
        const cell = player.board[r][c];
        const isCalled = cell.value !== 'FREE' && room.drawnNumbers.includes(cell.value);

        // Turn Action: If it's my turn and number is NOT called, I can pick it
        if (isMyTurn && !isCalled && cell.value !== 'FREE') {
            GameService.submitNumber(roomId, player.id, cell.value);
            return;
        }

        // Marking Logic: Can only mark called numbers
        if (cell.value !== 'FREE' && !isCalled) return;

        const newBoard = [...player.board];
        newBoard[r] = [...newBoard[r]];
        newBoard[r][c] = { ...cell, marked: !cell.marked };
        GameService.updateBoard(roomId, player.id, newBoard);
        if (checkWin(newBoard)) GameService.declareWin(roomId, player.id);
    };


    return (
        <div className="container game-layout">
            {/* Notif */}
            {showTurnNotification && (
                <div style={{
                    position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--primary-color)', color: '#000',
                    padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold',
                    zIndex: 999, boxShadow: '0 0 15px var(--primary-color)', cursor: 'pointer'
                }} onClick={() => setShowTurnNotification(false)}>
                    YOUR TURN! Click any number on your board to DRAW (or use box)
                </div>
            )}

            {/* Left: Draw Panel */}
            <div className="draw-panel card">
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>LAST BALL</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary-color)' }}>
                        {lastDrawn || '--'}
                    </div>
                </div>
                <hr style={{ borderColor: '#333', width: '100%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {isMyTurn ? (
                        <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>DRAW #</div>
                            <input
                                type="number" placeholder="1-75"
                                value={manualDrawNum} onChange={e => setManualDrawNum(e.target.value)}
                                style={{ textAlign: 'center', fontSize: '1.2rem' }} autoFocus
                            />
                            <button className="btn btn-primary" style={{ padding: '8px' }}>GO</button>
                            {turnError && <div style={{ color: '#f44', fontSize: '0.7rem' }}>{turnError}</div>}
                        </form>
                    ) : (
                        <div style={{ opacity: 0.5, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem' }}>Turn:</div>
                            <div style={{ fontWeight: 'bold' }}>{currentTurnPlayer?.name}</div>
                        </div>
                    )}
                </div>

                <hr style={{ borderColor: '#333', width: '100%', margin: '15px 0' }} />

                <div style={{ flex: 1, overflowY: 'auto', minHeight: '100px' }}>
                    <h6 style={{ color: '#888', marginBottom: '10px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                        Players ({room.players.length})
                    </h6>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {room.players.map(p => {
                            const lines = p.board ? getCompletedLines(p.board).length : 0;
                            const isHostUser = room.host === player.name;
                            const canKick = isHostUser && p.id !== player.id;

                            return (
                                <div key={p.id} style={{
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    background: p.id === player.id ? 'rgba(0, 224, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                    border: p.id === player.id ? '1px solid var(--primary-color)' : '1px solid transparent',
                                    fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: '6px', height: '6px', borderRadius: '50%',
                                            background: '#0f0',
                                            boxShadow: '0 0 5px #0f0'
                                        }} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                                                {p.name}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#888' }}>
                                                Lines: <span style={{ color: lines >= (room.boardSize - 1) ? 'orange' : 'white' }}>{lines}</span>/{room.boardSize}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        {p.id === player.id && <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>(You)</span>}
                                        {room.host === p.name && <span title="Host">👑</span>}
                                        {canKick && (
                                            <button
                                                title="Kick Player"
                                                onClick={() => {
                                                    setModal({
                                                        show: true,
                                                        title: 'Kick Player',
                                                        message: `Are you sure you want to kick ${p.name}?`,
                                                        isDangerous: true,
                                                        confirmText: 'Kick',
                                                        onConfirm: () => {
                                                            GameService.kickPlayer(roomId, p.id);
                                                            closeModal();
                                                        }
                                                    });
                                                }}
                                                style={{ background: 'transparent', color: '#ff4444', padding: '2px 5px', fontSize: '0.8rem' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Center: Board */}
            <div className="board-area">
                <div className="history-strip" ref={historyRef}>
                    {room.drawnNumbers.map((num, i) => (
                        <div key={i} className={`history-ball ${num === lastDrawn ? 'latest' : ''}`}>{num}</div>
                    ))}
                </div>

                {/* FLATTENED GRID STRUCTURE */}
                <div className="bingo-container card" style={{
                    padding: '5px',
                    '--board-size': room.boardSize || 5,
                    gridTemplateColumns: `repeat(${room.boardSize || 5}, 1fr)`
                }}>
                    {/* Header Row */}
                    {(room.boardSize === 7 ? ['B', 'I', 'N', 'G', 'O', '!', '!'] : ['B', 'I', 'N', 'G', 'O']).map((l, i) => (
                        <div key={i} className="bingo-header">{l}</div>
                    ))}

                    {/* Dynamic Grid Cells */}
                    {player.board.map((row, r) => (
                        row.map((cell, c) => {
                            const isCalled = cell.value !== 'FREE' && room.drawnNumbers.includes(cell.value);
                            return (
                                <div
                                    key={`${r}-${c}`}
                                    className={`bingo-cell ${cell.marked ? 'marked' : ''} ${cell.value === 'FREE' ? 'free' : ''} ${isCalled ? 'called' : ''}`}
                                    style={{
                                        opacity: (!isCalled && cell.value !== 'FREE') ? 0.5 : 1,
                                        fontSize: room.boardSize === 7 ? '0.7rem' : '0.9rem'
                                    }}
                                    onClick={() => toggleCell(r, c)}
                                >
                                    {cell.value}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Right: Chat */}
            <div className="game-chat card">
                <h5 style={{ marginBottom: '5px' }}>Chat</h5>
                <div className="chat-messages">
                    {room.messages && room.messages.map(msg => (
                        <div key={msg.id} className="chat-msg">
                            <b style={{ color: '#aaa', fontSize: '0.8em' }}>{msg.sender}: </b>
                            {msg.text}
                        </div>
                    ))}
                    <div ref={chatBottomRef} />
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;
                    GameService.sendMessage(roomId, player.id, chatInput);
                    setChatInput('');
                }} style={{ display: 'flex', gap: '5px' }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} style={{ marginBottom: 0 }} />
                    <button className="btn btn-secondary" style={{ padding: '0 10px' }}>&rarr;</button>
                </form>
            </div>


            {/* Win Overlay */}
            {room.status === 'WON' && (
                <div className="animate-pop" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                }}>
                    <h1 style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>BINGO!</h1>
                    <h2 style={{ color: 'white', marginBottom: '20px' }}>{room.winner} Wins!</h2>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '200px' }}>
                        {room.host === player.name && (
                            <button className="btn btn-primary" onClick={() => GameService.restartGame(roomId)}>
                                Play Again
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={() => navigate(`/result/${roomId}`)}>View Stats</button>
                        <button className="btn btn-secondary" onClick={() => navigate('/')}>Exit</button>
                    </div>
                </div>
            )}
            {/* Modal */}
            <ConfirmModal
                isOpen={modal.show}
                title={modal.title}
                message={modal.message}
                isDangerous={modal.isDangerous}
                confirmText={modal.confirmText}
                onConfirm={modal.onConfirm}
                onCancel={closeModal}
            />
        </div>
    );
};

export default Game;
