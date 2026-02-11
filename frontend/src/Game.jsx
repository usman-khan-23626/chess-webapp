import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { io } from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// Initialize socket once outside to avoid multiple connections
const socket = io(API_BASE_URL, {

    withCredentials: true,
    autoConnect: false
});

function Game() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(new Chess());
    const [status, setStatus] = useState('waiting');
    const [playerColor, setPlayerColor] = useState(null);
    const [turn, setTurn] = useState('white');
    const [whitePlayer, setWhitePlayer] = useState(null);
    const [blackPlayer, setBlackPlayer] = useState(null);
    const [user, setUser] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);

    const updateGameState = useCallback((data) => {
        try {
            const newGame = new Chess(data.fen);
            setGame(newGame);
            setTurn(data.turn);
            setStatus(data.status);
            if (data.whitePlayer) setWhitePlayer(data.whitePlayer);
            if (data.blackPlayer) setBlackPlayer(data.blackPlayer);

            if (data.status === 'checkmate' || data.status === 'draw') {
                setGameOver(true);
                setWinner(data.winner);
            }
        } catch (e) {
            console.error("Error updating game state:", e);
        }
    }, []);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(storedUser);

        socket.connect();
        socket.emit('join_game', gameId);

        socket.on('game_state', updateGameState);
        socket.on('game_start', (data) => {
            setWhitePlayer(data.whitePlayer);
            setBlackPlayer(data.blackPlayer);
            setStatus('active');
        });

        socket.on('move_made', (data) => {
            updateGameState(data);
        });

        socket.on('error', (data) => {
            alert(data.message);
        });

        // Fetch initial game details to determine color
        const fetchGameDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/game/${gameId}`, {
                    withCredentials: true
                });

                const gameData = response.data.game;
                console.log("Game loaded:", gameData);
                console.log("Current user from localStorage:", storedUser);

                // Fully sync state from backend
                const loadedGame = new Chess(gameData.fen);
                setGame(loadedGame);
                setTurn(gameData.currentTurn);
                setStatus(gameData.status);
                setWhitePlayer(gameData.whitePlayer);
                setBlackPlayer(gameData.blackPlayer);

                // Determine if game is over
                if (gameData.status === 'checkmate' || gameData.status === 'draw') {
                    setGameOver(true);
                    setWinner(gameData.winner);
                }

                // Robust color assignment
                const userId = String(storedUser._id);
                // Handle cases where player object might be populated or just an ID string
                const whiteId = String(gameData.whitePlayer?._id || gameData.whitePlayer);
                const blackId = String(gameData.blackPlayer?._id || gameData.blackPlayer);

                console.log("Color Identification Log:", {
                    userId,
                    whiteId,
                    blackId,
                    matchWhite: whiteId === userId,
                    matchBlack: blackId === userId
                });

                if (whiteId === userId) {
                    console.log("Assigned: White");
                    setPlayerColor('white');
                } else if (blackId === userId) {
                    console.log("Assigned: Black");
                    setPlayerColor('black');
                } else {
                    console.warn("Spectator mode: User ID not found in players", { userId, whiteId, blackId });
                    setPlayerColor(null);
                }
            } catch (error) {
                console.error("Failed to fetch game details:", error);
            }
        };

        fetchGameDetails();

        return () => {
            socket.off('game_state');
            socket.off('game_start');
            socket.off('move_made');
            socket.off('error');
            socket.disconnect();
        };
    }, [gameId, navigate, updateGameState]);

    function onDrop(sourceSquare, targetSquare) {
        console.log("OnDrop triggered:", { sourceSquare, targetSquare, turn, playerColor, gameOver });
        if (gameOver) return false;

        // Block moves if it's not the player's turn or if color isn't assigned yet
        if (!playerColor || turn !== playerColor) {
            console.warn("Move blocked: Not your turn or color not assigned", { turn, playerColor });
            return false;
        }

        try {
            const move = {
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            };

            const gameCopy = new Chess(game.fen());
            const result = gameCopy.move(move);

            if (result) {
                console.log("Local move valid, emitting to server...");
                // Optimistic update: update the board locally before server confirms
                setGame(gameCopy);

                socket.emit('move', {
                    gameId,
                    from: sourceSquare,
                    to: targetSquare,
                    promotion: 'q',
                    userId: user._id
                });
                return true;
            } else {
                console.warn("Local move invalid according to chess.js");
            }
        } catch (e) {
            console.error("Error during onDrop move execution:", e);
            return false;
        }
        return false;
    }


    return (
        <div className="auth-container" style={{ overflow: 'hidden' }}>
            {/* Background floating pieces */}
            <div className="chess-piece">♔</div>
            <div className="chess-piece">♕</div>
            <div className="chess-piece">♖</div>
            <div className="chess-piece" style={{ top: '30%', right: '10%' }}>♗</div>
            <div className="chess-piece" style={{ bottom: '10%', right: '40%' }}>♘</div>

            <div className="auth-card" style={{ maxWidth: '900px', display: 'flex', gap: '2rem', padding: '2rem' }}>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Opponent Info */}
                    <div className="player-panel" style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        opacity: turn === (playerColor === 'white' ? 'black' : 'white') ? 1 : 0.6
                    }}>
                        <div style={{ fontSize: '2rem' }}>{playerColor === 'white' ? '👤' : '👤'}</div>
                        <div>
                            <p style={{ fontWeight: 'bold' }}>
                                {playerColor === 'white' ? (blackPlayer?.name || 'Waiting for opponent...') : whitePlayer?.name}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Rating: {playerColor === 'white' ? (blackPlayer?.rating || '????') : whitePlayer?.rating}
                            </p>
                        </div>
                        {turn === (playerColor === 'white' ? 'black' : 'white') &&
                            <div className="spinner" style={{ marginLeft: 'auto', width: '15px', height: '15px' }}></div>
                        }
                    </div>

                    {/* Chess Board */}
                    <div style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
                        <Chessboard
                            position={game.fen()}
                            onPieceDrop={onDrop}
                            boardOrientation={playerColor === 'black' ? 'black' : 'white'}
                            customDarkSquareStyle={{ backgroundColor: '#151b3d' }}
                            customLightSquareStyle={{ backgroundColor: '#1e293b' }}
                        />

                        {gameOver && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(10, 14, 39, 0.8)',
                                backdropFilter: 'blur(5px)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                zIndex: 10
                            }}>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {winner === 'draw' ? "It's a Draw!" : `${winner === 'white' ? 'White' : 'Black'} Wins!`}
                                </h2>
                                <button onClick={() => navigate('/')} className="btn" style={{ minWidth: '150px' }}>
                                    Back to Lobby
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Self Info */}
                    <div className="player-panel" style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        opacity: turn === playerColor ? 1 : 0.6
                    }}>
                        <div style={{ fontSize: '2rem' }}>👤</div>
                        <div>
                            <p style={{ fontWeight: 'bold' }}>{user?.name} (You)</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating: {user?.rating || 1000}</p>
                        </div>
                        {turn === playerColor &&
                            <div className="spinner" style={{ marginLeft: 'auto', width: '15px', height: '15px', borderTopColor: 'var(--accent-primary)' }}></div>
                        }
                    </div>
                </div>

                {/* Sidebar Info */}
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="auth-header" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                        <h2 className="auth-title" style={{ fontSize: '1.5rem' }}>Match Details</h2>
                        <p className="auth-subtitle">Real-time Online Selection</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status</p>
                            <p style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{status}</p>
                        </div>
                        <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Turn</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{turn === 'white' ? 'White' : 'Black'} to move</p>
                        </div>
                        <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Game ID</p>
                            <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{gameId}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button onClick={() => navigate('/')} className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
                            Leave Game
                        </button>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            Game is automatically saved and synced across all players.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;

