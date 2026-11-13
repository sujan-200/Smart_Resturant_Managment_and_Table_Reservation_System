import { useEffect, useState } from 'react';
import { CheckCheck, LogOut, TimerReset } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const orderStatusOptions = ['order received', 'accepted', 'preparing', 'ready for pickup', 'picked up', 'served'];

export default function KitchenDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const response = await api.get('/orders');
    setOrders(response.data);
  }

  async function updateStatus(orderId, status) {
    await api.patch(`/orders/${orderId}/status`, { status });
    await loadOrders();
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-white/10 bg-stone-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-400">Kitchen display</p>
            <h1 className="text-2xl font-bold text-white">Production board</h1>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-stone-200 hover:border-orange-300">
            <LogOut size={16} /> {user?.name}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <div key={order._id} className="rounded-3xl border border-white/10 bg-stone-900 p-5 shadow-lg shadow-orange-500/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Order {order.orderNumber}</p>
                  <p className="mt-2 text-xl font-bold text-white">Table {order.table?.tableNumber || 'Pickup'}</p>
                </div>
                <span className="rounded-full bg-orange-500/15 px-2 py-1 text-xs font-semibold text-orange-200">{order.status}</span>
              </div>

              <div className="mt-4 space-y-2">
                {order.items?.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                    <span>{item.menuItem?.name}</span>
                    <span className="font-semibold text-orange-200">x{item.quantity}</span>
                  </div>
                )) || <p className="text-stone-400">No items recorded.</p>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {orderStatusOptions.map((status) => (
                  <button key={status} onClick={() => updateStatus(order._id, status)} className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${order.status === status ? 'bg-orange-500 text-white' : 'bg-white/5 text-stone-200'}`}>
                    {status}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-stone-300">
                <span className="inline-flex items-center gap-2"><TimerReset size={14} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <button onClick={() => updateStatus(order._id, 'served')} className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 font-semibold text-stone-950"><CheckCheck size={14} /> Complete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
