import { useEffect, useMemo, useState } from 'react';
import { Bell, LogOut, MapPin, ShoppingCart, Utensils } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyCart = [];

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(emptyCart);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reservationForm, setReservationForm] = useState({
    customerName: user?.name || '',
    contactNumber: user?.phone || '',
    date: new Date().toISOString().slice(0, 10),
    time: '19:00',
    numberOfGuests: 2,
    specialRequests: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [categoryResponse, menuResponse, reservationResponse, orderResponse] = await Promise.all([
      api.get('/menu/categories'),
      api.get('/menu'),
      api.get('/reservations'),
      api.get('/orders'),
    ]);

    setCategories(categoryResponse.data);
    setMenuItems(menuResponse.data);
    setReservations(reservationResponse.data.filter((reservation) => reservation.customer?._id === user?.id || reservation.customer?.email === user?.email));
    setOrders(orderResponse.data.filter((order) => order.customer?._id === user?.id || order.customer?.email === user?.email));
  }

  const visibleItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return menuItems;
    }

    return menuItems.filter((item) => item.category?._id === selectedCategory || item.category?.name === selectedCategory);
  }, [menuItems, selectedCategory]);

  function addToCart(item) {
    setCart((currentCart) => {
      const existing = currentCart.find((entry) => entry.menuItemId === item._id);
      if (existing) {
        return currentCart.map((entry) =>
          entry.menuItemId === item._id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }

      return [...currentCart, { menuItemId: item._id, quantity: 1, specialInstructions: '' }];
    });
  }

  function updateCartQuantity(menuItemId, change) {
    setCart((currentCart) =>
      currentCart
        .map((entry) =>
          entry.menuItemId === menuItemId
            ? { ...entry, quantity: Math.max(0, entry.quantity + change) }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  }

  const subtotal = cart.reduce((sum, entry) => {
    const item = menuItems.find((menuItem) => menuItem._id === entry.menuItemId);
    return sum + (item ? item.price * entry.quantity : 0);
  }, 0);

  async function handleReservation() {
    await api.post('/reservations', {
      ...reservationForm,
      customerId: user?.id,
    });
    await fetchData();
    setReservationForm({
      customerName: user?.name || '',
      contactNumber: user?.phone || '',
      date: new Date().toISOString().slice(0, 10),
      time: '19:00',
      numberOfGuests: 2,
      specialRequests: '',
    });
  }

  async function handleOrder() {
    if (!cart.length) return;
    await api.post('/orders', {
      customerId: user?.id,
      items: cart,
      tableId: null,
      notes: 'Customer order',
    });
    setCart(emptyCart);
    await fetchData();
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-500">Customer dashboard</p>
            <h1 className="text-2xl font-bold text-stone-900">Welcome, {user?.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full bg-stone-900 p-2 text-white" aria-label="Notifications"><Bell size={16} /></button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white shadow-lg shadow-orange-200">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-100">Smart reservation</p>
            <h2 className="mt-2 text-3xl font-bold">Plan your perfect evening</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <input value={reservationForm.date} onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })} type="date" className="rounded-xl border-0 bg-white/20 px-3 py-3 text-white placeholder:text-orange-100 outline-none" />
              <input value={reservationForm.time} onChange={(e) => setReservationForm({ ...reservationForm, time: e.target.value })} type="time" className="rounded-xl border-0 bg-white/20 px-3 py-3 text-white outline-none" />
              <input value={reservationForm.numberOfGuests} onChange={(e) => setReservationForm({ ...reservationForm, numberOfGuests: Number(e.target.value) })} type="number" min={1} max={12} className="rounded-xl border-0 bg-white/20 px-3 py-3 text-white outline-none" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={reservationForm.customerName} onChange={(e) => setReservationForm({ ...reservationForm, customerName: e.target.value })} placeholder="Customer name" className="rounded-xl border-0 bg-white/20 px-3 py-3 text-white placeholder:text-orange-100 outline-none" />
              <input value={reservationForm.contactNumber} onChange={(e) => setReservationForm({ ...reservationForm, contactNumber: e.target.value })} placeholder="Contact number" className="rounded-xl border-0 bg-white/20 px-3 py-3 text-white placeholder:text-orange-100 outline-none" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <input value={reservationForm.specialRequests} onChange={(e) => setReservationForm({ ...reservationForm, specialRequests: e.target.value })} placeholder="Special requests" className="w-full rounded-xl border-0 bg-white/20 px-3 py-3 text-white placeholder:text-orange-100 outline-none" />
              <button onClick={handleReservation} className="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white">Book table</button>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-900">Restaurant menu</h3>
              <div className="flex gap-2 overflow-x-auto">
                <button onClick={() => setSelectedCategory('all')} className={`rounded-full px-3 py-2 text-sm ${selectedCategory === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}>All</button>
                {categories.map((category) => (
                  <button key={category._id} onClick={() => setSelectedCategory(category._id)} className={`rounded-full px-3 py-2 text-sm ${selectedCategory === category._id ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {visibleItems.map((item) => (
                <div key={item._id} className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                  <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-stone-900">{item.name}</h4>
                        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">{item.category?.name}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{item.available ? 'Available' : 'Sold out'}</span>
                    </div>
                    <p className="text-sm text-stone-600">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-stone-900">NPR {item.price}</p>
                        <p className="text-xs text-stone-500">Prep: {item.prepTime} mins</p>
                      </div>
                      <button onClick={() => addToCart(item)} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white">Add to order</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-900">Your cart</h3>
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">{cart.length} items</span>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Your cart is empty.</div>
            ) : (
              <div className="space-y-3">
                {cart.map((entry) => {
                  const item = menuItems.find((menuItem) => menuItem._id === entry.menuItemId);
                  if (!item) return null;
                  return (
                    <div key={entry.menuItemId} className="flex items-center gap-3 rounded-2xl bg-stone-100 p-3">
                      <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-stone-800">{item.name}</p>
                        <p className="text-sm text-stone-500">NPR {item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateCartQuantity(entry.menuItemId, -1)} className="h-8 w-8 rounded-full bg-white text-lg">-</button>
                        <span>{entry.quantity}</span>
                        <button onClick={() => updateCartQuantity(entry.menuItemId, 1)} className="h-8 w-8 rounded-full bg-white text-lg">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 border-t border-stone-200 pt-4">
              <div className="mb-2 flex items-center justify-between text-sm text-stone-600"><span>Subtotal</span><span>NPR {subtotal}</span></div>
              <div className="mb-2 flex items-center justify-between text-sm text-stone-600"><span>GST</span><span>NPR {subtotal * 0.08}</span></div>
              <div className="flex items-center justify-between text-lg font-bold text-stone-900"><span>Total</span><span>NPR {subtotal + subtotal * 0.08}</span></div>
              <button onClick={handleOrder} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white"><ShoppingCart size={18} /> Place order</button>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-bold text-stone-900">My reservations</h3><span className="rounded-full bg-stone-200 px-2 py-1 text-xs font-medium text-stone-700">{reservations.length}</span></div>
            <div className="space-y-3">
              {reservations.slice(0, 3).map((reservation) => (
                <div key={reservation._id} className="rounded-2xl bg-stone-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900">{reservation.customerName}</p>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">{reservation.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{reservation.date} at {reservation.time}</p>
                  <p className="text-sm text-stone-600">{reservation.numberOfGuests} guests</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-bold text-stone-900">Order history</h3><Utensils className="text-orange-500" size={18} /></div>
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div key={order._id} className="rounded-2xl bg-stone-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900">{order.orderNumber}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{order.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">NPR {order.total}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
