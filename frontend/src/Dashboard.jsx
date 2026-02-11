import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';


function Dashboard() {
    const [availableGames, setAvailableGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAvailableGames();
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
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="chess-piece">♔</div>
            <div className="chess-piece">♕</div>
            <div className="chess-piece">♖</div>

            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <div className="auth-header">
                    <div className="auth-logo">♚</div>
                    <h1 className="auth-title">Chess Dashboard</h1>
                    <p className="auth-subtitle">Welcome back, Grandmaster!</p>
                </div>

                <div className="dashboard-content">
                    <button onClick={handleCreateGame} className="btn" disabled={loading} style={{ width: '100%', marginBottom: '2rem' }}>
                        {loading ? 'Creating...' : 'Create New Game'}
                    </button>

                    <div className="games-section">
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Available Matches</h2>
                        {availableGames.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No games available. Create one!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {availableGames.map(game => (
                                    <div key={game._id} style={{
                                        background: 'var(--bg-secondary)',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: 'bold' }}>{game.whitePlayer?.name}'s Game</p>
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

                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'center' }}>
                        <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--error-color)', color: 'var(--error-color)' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

