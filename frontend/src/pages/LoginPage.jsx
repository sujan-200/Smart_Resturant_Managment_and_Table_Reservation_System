import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'admin@restaurant.com', password: 'Admin@123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(form);
      if (result?.user?.role) {
        navigate('/dashboard');
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-6 py-12 text-stone-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white">C</div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-300">Access your restaurant dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-200">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-white outline-none ring-0 transition focus:border-orange-400"
              placeholder="admin@restaurant.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-200">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-white outline-none ring-0 transition focus:border-orange-400"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-300">
          New here?{' '}
          <Link to="/register" className="font-semibold text-orange-300">Create account</Link>
        </p>

        <div className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-xs text-orange-100">
          Demo credentials: admin / waiter / kitchen / customer (password patterns shown in the seed data).
        </div>
      </div>
    </div>
  );
}
