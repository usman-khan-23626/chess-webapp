import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';


function Home() {
    const [availableGames, setAvailableGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined") {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchAvailableGames();
            } catch (e) {
                console.error("Error parsing user from localStorage:", e);
                localStorage.removeItem('user');
            }
        }
    }, []);


    const fetchAvailableGames = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/game/available`, {
                withCredentials: true
            });

            setAvailableGames(response.data.games);
        } catch (error) {
            console.error("Failed to fetch games:", error);
        }
    };

    const handleCreateGame = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/game/create`, {}, {
                withCredentials: true
            });

            if (response.data.success) {
                navigate(`/game/${response.data.gameId}`);
            }
        } catch (error) {
            alert("Failed to create game");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async (gameId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/game/join/${gameId}`, {}, {
                withCredentials: true
            });

            if (response.data.success) {
                navigate(`/game/${gameId}`);
            }
        } catch (error) {
            alert("Failed to join game");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event('authChange'));
        setUser(null);
        navigate('/login');
    };


    return (
        <div className="auth-container">
            <div className="chess-piece">♔</div>
            <div className="chess-piece">♕</div>
            <div className="chess-piece">♖</div>
            <div className="chess-piece" style={{ top: '30%', right: '10%', animationDelay: '2s' }}>♗</div>
            <div className="chess-piece" style={{ bottom: '10%', right: '40%', animationDelay: '7s' }}>♘</div>

            <div className="auth-card" style={{ maxWidth: user ? '700px' : '600px', textAlign: 'center' }}>
                <div className="auth-header">
                    <div className="auth-logo" style={{ fontSize: '4rem' }}>♚</div>
                    <h1 className="auth-title">Chess Master</h1>
                    <p className="auth-subtitle">
                        {user ? `Welcome back, ${user.name}!` : "Experience the game of kings in real-time."}
                    </p>
                </div>

                {user ? (
                    <div className="lobby-content">
                        <button onClick={handleCreateGame} className="btn" disabled={loading} style={{ width: '100%', marginBottom: '2rem', fontSize: '1.1rem' }}>
                            {loading ? 'Creating...' : 'Create New Match'}
                        </button>

                        <div className="games-section" style={{ textAlign: 'left' }}>
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>Available Matches</h2>
                            {availableGames.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No games available. Start one!</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {availableGames.map(game => (
                                        <div key={game._id} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-sm)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <div>
                                                <p style={{ fontWeight: 'bold' }}>{game.whitePlayer?.name}'s Room</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating: {game.whitePlayer?.rating || 1000}</p>
                                            </div>
                                            <button onClick={() => handleJoinGame(game._id)} className="btn" style={{ padding: '0.5rem 1rem', marginTop: 0 }}>
                                                Join
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <button onClick={handleLogout} className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)' }}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <button onClick={() => navigate('/signup')} className="btn" style={{ fontSize: '1.2rem', padding: '1.25rem' }}>
                            Get Started - Play Online
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                            <button onClick={() => navigate('/login')} className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                                Already have an account? Sign In
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fast Moves</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌍</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Global Play</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏆</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating System</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
