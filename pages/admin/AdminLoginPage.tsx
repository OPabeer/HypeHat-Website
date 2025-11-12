import React, { useState } from 'react';
import { useAuth } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = adminLogin(password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-textPrimary">
      <div className="w-full max-w-sm p-8 space-y-6 bg-surface rounded-lg shadow-lg border border-white/10">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-textSecondary">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button type="submit" className="w-full px-4 py-2 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
