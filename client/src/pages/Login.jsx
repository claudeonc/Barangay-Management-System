import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { CircleNotch } from '@phosphor-icons/react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', credentials);
      localStorage.setItem('bms_token', res.data.token);
      localStorage.setItem('bms_user', JSON.stringify(res.data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md border-4 border-foreground p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-background">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-center">
          BRIMS
        </h1>
        <p className="text-mutedForeground font-bold text-center mb-8 uppercase tracking-widest text-sm">
          Authorized Personnel Only
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="bg-foreground text-background font-bold p-3 text-center uppercase text-sm">{error}</div>}

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm uppercase tracking-wider">Username</label>
            <input
              required
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="border-2 border-foreground p-4 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-foreground/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm uppercase tracking-wider">Password</label>
            <input
              required
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="border-2 border-foreground p-4 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-foreground/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-foreground text-background py-4 font-black uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <CircleNotch className="animate-spin" size={24} weight="bold" />}
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
