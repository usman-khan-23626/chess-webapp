import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import Game from './Game';
import Home from './Home';
import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });

  // Listener for auth changes (manual or from other tabs)
  useEffect(() => {
    const handleAuthChange = () => {
      const saved = localStorage.getItem('user');
      setUser(saved && saved !== "undefined" ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game/:gameId" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;




