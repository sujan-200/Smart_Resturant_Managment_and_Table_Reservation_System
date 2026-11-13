import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleOptions = [
  { value: 'customer', label: 'Customer' },
  { value: 'waiter', label: 'Waiter' },
  { value: 'kitchen', label: 'Kitchen Staff' },
  { value: 'admin', label: 'Admin' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(form);
      if (result?.user?.role) {
        navigate('/dashboard');
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-6 py-12 text-stone-100">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white">C</div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-sm text-stone-300">Join the restaurant management platform.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-200">Full name</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-200">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-white outline-none focus:border-orange-400"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-200">Phone</label>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-white outline-none focus:border-orange-400"
                placeholder="9800000000"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-200">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="Create a strong password"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-200">Role</label>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-white outline-none focus:border-orange-400"
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-300">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-orange-300">Log in</Link>
        </p>
      </div>
    </div>
  );
}
