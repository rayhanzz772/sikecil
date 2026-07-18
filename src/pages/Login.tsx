import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User, Role } from '../context/AuthContext';
import api from '../services/api';
import { Baby, Lock, User as UserIcon, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.data && response.data.data) {
        const userData = response.data.data;
        let roleStr = '';
        if (typeof userData.role === 'string') {
          roleStr = userData.role;
        } else if (userData.role) {
          roleStr = userData.role.code || userData.role.name || JSON.stringify(userData.role);
        }

        const rawRole = roleStr.toLowerCase();
        let normalizedRole: Role = 'nakes';
        if (rawRole.includes('admin')) normalizedRole = 'admin';
        else if (rawRole.includes('ortu') || rawRole.includes('orang tua')) normalizedRole = 'ortu';

        const user: User = { ...userData, role: normalizedRole };
        login(user);

        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'ortu') navigate('/ortu/dashboard');
        else navigate('/nakes/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-500 rounded-xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-sky-500/30">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">SiKecil</h1>
          <p className="text-slate-400 text-xs mt-0.5">Sistem Cerdas Pantau Tumbuh Kembang</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-medium mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">&copy; {new Date().getFullYear()} SiKecil</p>
      </div>
    </div>
  );
};
