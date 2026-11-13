import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import WaiterDashboard from './WaiterDashboard';
import KitchenDashboard from './KitchenDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'waiter':
      return <WaiterDashboard />;
    case 'kitchen':
      return <KitchenDashboard />;
    case 'customer':
    default:
      return <CustomerDashboard />;
  }
}
