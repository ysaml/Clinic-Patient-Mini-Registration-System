import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/UseAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiClient.post('/auth/login', { username, password });
      login(res.data.token);
      navigate('/patients');
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}