import { useEffect, useState } from 'react';
import { BarChart3, LogOut, Store, Users, UtensilsCrossed } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [tables, setTables] = useState([]);
  const [users, setUsers] = useState([]);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [overviewResponse, tablesResponse, usersResponse, menuResponse] = await Promise.all([
      api.get('/dashboard/overview'),
      api.get('/tables'),
      api.get('/users'),
      api.get('/menu'),
    ]);

    setOverview(overviewResponse.data);
    setTables(tablesResponse.data);
    setUsers(usersResponse.data);
    setMenu(menuResponse.data);
  }

  const stats = [
    { label: 'Reservations', value: overview?.stats?.totalReservations ?? 0, icon: Store },
    { label: 'Customers', value: overview?.stats?.totalCustomers ?? 0, icon: Users },
    { label: 'Orders', value: overview?.stats?.totalOrders ?? 0, icon: UtensilsCrossed },
    { label: 'Revenue', value: `NPR ${overview?.stats?.dailyRevenue ?? 0}`, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-500">Admin dashboard</p>
            <h1 className="text-2xl font-bold text-stone-900">Restaurant control center</h1>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400">
            <LogOut size={16} /> {user?.name}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">{label}</p>
                <div className="rounded-xl bg-orange-100 p-2 text-orange-600"><Icon size={18} /></div>
              </div>
              <p className="mt-5 text-3xl font-black text-stone-900">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-bold text-stone-900">Sales analytics</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview?.salesTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="_id" stroke="#78716c" />
                  <YAxis stroke="#78716c" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-bold text-stone-900">Table status</h2>
            <div className="mt-4 space-y-3">
              {tables.map((table) => (
                <div key={table._id} className="flex items-center justify-between rounded-2xl bg-stone-100 p-3">
                  <div>
                    <p className="font-semibold text-stone-900">Table {table.tableNumber}</p>
                    <p className="text-sm text-stone-500">Capacity: {table.capacity}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${table.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {table.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-bold text-stone-900">Recent reservations</h2>
            <div className="mt-4 space-y-3">
              {overview?.recentReservations?.slice(0, 5).map((reservation) => (
                <div key={reservation._id} className="rounded-2xl bg-stone-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900">{reservation.customerName}</p>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">{reservation.status}</span>
                  </div>
                  <p className="text-sm text-stone-600">{reservation.date} • {reservation.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-bold text-stone-900">Staff accounts</h2>
            <div className="mt-4 space-y-3">
              {users.slice(0, 5).map((staff) => (
                <div key={staff._id} className="flex items-center justify-between rounded-2xl bg-stone-100 p-3">
                  <div>
                    <p className="font-semibold text-stone-900">{staff.name}</p>
                    <p className="text-sm text-stone-500">{staff.role}</p>
                  </div>
                  <span className="text-sm text-stone-600">{staff.email}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-5">
          <h2 className="text-xl font-bold text-stone-900">Menu overview</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {menu.map((item) => (
              <div key={item._id} className="rounded-2xl bg-stone-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-900">{item.name}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{item.available ? 'Active' : 'Off'}</span>
                </div>
                <p className="mt-2 text-sm text-stone-600">{item.category?.name}</p>
                <p className="mt-1 text-lg font-bold text-stone-900">NPR {item.price}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
