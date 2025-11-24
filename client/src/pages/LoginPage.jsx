import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { user, login, authLoading } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/tasks', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.identifier || !form.password) {
      setError('Please enter your username/email and password.');
      return;
    }

    try {
      await login(form);
      navigate('/tasks', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed. Check your credentials.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/70 border border-white/10 rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/50 mb-4">
            <Shield className="w-10 h-10 text-indigo-300" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">Sign in to Work Manager</h1>
          <p className="text-slate-400 text-sm max-w-sm">
            Use the credentials shared with you by the administrator. There is no self-serve signup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Username or Email
            </label>
            <input
              id="identifier"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              placeholder="e.g. satish or satish@company.com"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white shadow-xl transition ${
              authLoading ? 'bg-indigo-500/60 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;


