import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  LogOut,
  Plus,
  QrCode,
  Sparkles,
  UserCheck,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const orderStatusOptions = ['order received', 'accepted', 'preparing', 'ready for pickup', 'picked up', 'served'];
const emptyDraft = { tableId: '', menuItemId: '', quantity: 1, notes: '' };

export default function WaiterDashboard() {
  const { user, logout } = useAuth();
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [bill, setBill] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tables.length && !selectedTableId) {
      setSelectedTableId(tables[0]._id);
      setDraft((currentDraft) => ({ ...currentDraft, tableId: tables[0]._id }));
    }
  }, [tables, selectedTableId]);

  async function loadData() {
    try {
      const [tablesResponse, ordersResponse, reservationsResponse, menuResponse, notificationsResponse] = await Promise.all([
        api.get('/tables'),
        api.get('/orders'),
        api.get('/reservations'),
        api.get('/menu'),
        api.get('/notifications'),
      ]);

      setTables(tablesResponse.data || []);
      setOrders(ordersResponse.data || []);
      setReservations(reservationsResponse.data || []);
      setMenuItems(menuResponse.data || []);
      setNotifications(notificationsResponse.data || []);
    } catch (error) {
      console.error('Failed to load waiter dashboard data', error);
    }
  }

  const assignedTables = useMemo(
    () => tables.filter((table) => ['reserved', 'occupied', 'cleaning'].includes(table.status)),
    [tables]
  );

  const readyOrders = useMemo(
    () => orders.filter((order) => ['ready for pickup', 'picked up'].includes(order.status)),
    [orders]
  );

  const customerArrivalAlerts = useMemo(
    () => reservations.filter((reservation) => ['pending', 'confirmed'].includes(reservation.status)),
    [reservations]
  );

  const occupancyAlerts = useMemo(
    () => tables.filter((table) => ['reserved', 'occupied', 'cleaning'].includes(table.status)),
    [tables]
  );

  const selectedTable = tables.find((table) => table._id === selectedTableId) || tables[0] || null;
  const selectedReservation = reservations.find(
    (reservation) => reservation.table?._id === selectedTableId || reservation.table === selectedTableId
  );

  async function updateOrderStatus(orderId, status) {
    await api.patch(`/orders/${orderId}/status`, { status });
    await loadData();
  }

  async function updateTableStatus(tableId, status) {
    await api.patch(`/tables/${tableId}/status`, { status });
    await loadData();
  }

  async function markCustomerArrival(reservationId, tableId) {
    try {
      await api.patch(`/reservations/${reservationId}`, {
        status: 'checked-in',
      });
      await api.patch(`/tables/${tableId}/status`, { status: 'occupied' });
      await loadData();
    } catch (error) {
      console.error('Failed to mark customer arrival', error);
    }
  }

  async function createOrderForTable() {
    if (!selectedTableId || !draft.menuItemId) {
      return;
    }

    await api.post('/orders', {
      customerId: selectedReservation?.customer?._id || user.id,
      tableId: selectedTableId,
      notes: draft.notes || 'Created by waiter',
      items: [
        {
          menuItemId: draft.menuItemId,
          quantity: Number(draft.quantity || 1),
          specialInstructions: draft.notes || '',
        },
      ],
    });

    if (selectedTable && selectedTable.status !== 'occupied') {
      await updateTableStatus(selectedTableId, 'occupied');
    }

    setDraft(emptyDraft);
    await loadData();
  }

  function generateBillForTable() {
    const tableOrders = orders.filter(
      (order) => order.table?._id === selectedTableId || order.table === selectedTableId
    );

    const latestOrder = [...tableOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    if (!latestOrder) {
      setBill({ tableNumber: selectedTable?.tableNumber || 'N/A', total: 0, items: [] });
      return;
    }

    setBill({
      tableNumber: selectedTable?.tableNumber || 'N/A',
      total: latestOrder.total || 0,
      items: latestOrder.items || [],
      status: latestOrder.status,
    });
  }

  async function markNotificationRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      await loadData();
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  }

  const qrCodeValue = selectedTable ? `table-${selectedTable.tableNumber}` : 'restaurant-table';

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-500">Service dashboard</p>
            <h1 className="text-2xl font-bold text-stone-900">Waiter operations</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-2 text-xs font-semibold text-orange-700">
              <Bell size={14} /> {notifications.filter((item) => !item.read).length} alerts
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400">
              <LogOut size={16} /> {user?.name}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Assigned tables', value: assignedTables.length, icon: ClipboardList },
            { label: 'Occupancy alerts', value: occupancyAlerts.length, icon: Bell },
            { label: 'Customer arrivals', value: customerArrivalAlerts.length, icon: UserCheck },
            { label: 'Ready orders', value: readyOrders.length, icon: UtensilsCrossed },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">{label}</p>
                <div className="rounded-xl bg-orange-100 p-2 text-orange-600"><Icon size={18} /></div>
              </div>
              <p className="mt-5 text-3xl font-black text-stone-900">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Assigned tables</h2>
              <Sparkles className="text-orange-500" size={18} />
            </div>
            <div className="mt-4 space-y-3">
              {assignedTables.map((table) => (
                <button
                  key={table._id}
                  onClick={() => setSelectedTableId(table._id)}
                  className={`flex w-full items-center justify-between rounded-2xl p-3 text-left ${selectedTableId === table._id ? 'bg-orange-50 ring-2 ring-orange-200' : 'bg-stone-100'}`}
                >
                  <div>
                    <p className="font-semibold text-stone-900">Table {table.tableNumber}</p>
                    <p className="text-sm text-stone-500">Capacity: {table.capacity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${table.status === 'available' ? 'bg-emerald-100 text-emerald-700' : table.status === 'cleaning' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>
                      {table.status}
                    </span>
                    {table.status !== 'available' && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          updateTableStatus(table._id, table.status === 'cleaning' ? 'available' : 'cleaning');
                        }}
                        className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {table.status === 'cleaning' ? 'Available' : 'Clean'}
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-bold text-stone-900">Customer arrival & occupancy alerts</h2>
            <div className="mt-4 space-y-3">
              {customerArrivalAlerts.length === 0 && occupancyAlerts.length === 0 ? (
                <div className="rounded-2xl bg-stone-100 p-3 text-sm text-stone-500">No active alerts.</div>
              ) : null}

              {customerArrivalAlerts.map((reservation) => (
                <div key={reservation._id} className="rounded-2xl bg-orange-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">{reservation.customerName}</p>
                      <p className="text-sm text-stone-600">{reservation.date} • {reservation.time}</p>
                    </div>
                    <button
                      onClick={() => markCustomerArrival(reservation._id, reservation.table?._id || selectedTable?._id)}
                      className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Check in
                    </button>
                  </div>
                </div>
              ))}

              {occupancyAlerts.map((table) => (
                <div key={table._id} className="rounded-2xl bg-stone-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900">Table {table.tableNumber}</p>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">{table.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Create order for selected table</h2>
              <span className="rounded-full bg-stone-200 px-2 py-1 text-xs font-semibold text-stone-700">
                {selectedTable ? `Table ${selectedTable.tableNumber}` : 'Select table'}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={selectedTableId}
                onChange={(event) => setSelectedTableId(event.target.value)}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-stone-800 outline-none"
              >
                {tables.map((table) => (
                  <option key={table._id} value={table._id}>Table {table.tableNumber}</option>
                ))}
              </select>

              <select
                value={draft.menuItemId}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, menuItemId: event.target.value }))}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-stone-800 outline-none"
              >
                <option value="">Select menu item</option>
                {menuItems.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                value={draft.quantity}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, quantity: Number(event.target.value) || 1 }))}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-stone-800 outline-none"
                placeholder="Qty"
              />

              <input
                value={draft.notes}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, notes: event.target.value }))}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-stone-800 outline-none"
                placeholder="Special instructions"
              />
            </div>

            <button
              onClick={createOrderForTable}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 font-semibold text-white"
            >
              <Plus size={16} /> Send order to kitchen
            </button>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Table QR code</h2>
              <QrCode className="text-orange-500" size={18} />
            </div>
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-sm">
                <QrCode size={54} className="text-stone-900" />
              </div>
              <p className="mt-4 text-lg font-bold text-stone-900">{selectedTable ? `Table ${selectedTable.tableNumber}` : 'No table selected'}</p>
              <p className="mt-2 text-sm text-stone-500">QR ID: {qrCodeValue}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-bold text-stone-900">Live orders</h2>
            <div className="mt-4 space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-stone-900">{order.orderNumber}</p>
                      <p className="text-sm text-stone-600">Table {order.table?.tableNumber || 'Pickup'} • {order.items?.length || 0} items</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{order.status}</span>
                      <button onClick={() => updateOrderStatus(order._id, 'served')} className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">
                        <CheckCircle2 size={14} /> Mark served
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {orderStatusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order._id, status)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${order.status === status ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-700'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-900">Customer bill</h2>
                <DollarSign className="text-orange-500" size={18} />
              </div>

              {bill ? (
                <div className="space-y-3">
                  <p className="text-sm text-stone-600">Table {bill.tableNumber}</p>
                  <div className="space-y-2">
                    {bill.items.length === 0 ? (
                      <p className="text-sm text-stone-500">No items on the current bill.</p>
                    ) : (
                      bill.items.map((item) => (
                        <div key={item._id} className="flex items-center justify-between text-sm text-stone-700">
                          <span>{item.menuItem?.name || 'Menu item'} x{item.quantity}</span>
                          <span>NPR {item.unitPrice * item.quantity}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-stone-200 pt-3 text-lg font-bold text-stone-900">
                    Total: NPR {bill.total}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Select a table to generate the bill.</p>
              )}

              <button onClick={generateBillForTable} className="mt-4 w-full rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white">
                Generate bill
              </button>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-900">Service actions</h2>
                <UtensilsCrossed className="text-orange-500" size={18} />
              </div>
              <div className="space-y-3">
                <button onClick={() => updateTableStatus(selectedTableId, 'cleaning')} className="w-full rounded-xl bg-yellow-100 px-4 py-3 font-semibold text-yellow-700">
                  Mark table cleaning
                </button>
                <button onClick={() => updateTableStatus(selectedTableId, 'available')} className="w-full rounded-xl bg-emerald-100 px-4 py-3 font-semibold text-emerald-700">
                  Release table for next guest
                </button>
                <button onClick={() => updateOrderStatus(readyOrders[0]?._id, 'served')} disabled={!readyOrders[0]} className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  Complete ready order
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-bold text-stone-900">Food ready notifications</h2>
            <div className="mt-4 space-y-3">
              {readyOrders.length === 0 ? (
                <div className="rounded-2xl bg-stone-100 p-3 text-sm text-stone-500">No ready food notifications.</div>
              ) : (
                readyOrders.map((order) => (
                  <div key={order._id} className="rounded-2xl bg-orange-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-stone-900">{order.orderNumber}</p>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{order.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-600">Table {order.table?.tableNumber || 'Pickup'} is ready to serve.</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-bold text-stone-900">Waiter notifications</h2>
            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="rounded-2xl bg-stone-100 p-3 text-sm text-stone-500">No notifications yet.</div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification._id} className={`rounded-2xl p-3 ${notification.read ? 'bg-stone-100' : 'bg-orange-50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-stone-600">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationRead(notification._id)}
                          className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold text-white"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}