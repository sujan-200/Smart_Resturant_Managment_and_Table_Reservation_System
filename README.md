# Smart Restaurant Management and Table Reservation System

A full-stack MERN restaurant management platform with role-based dashboards for customers, administrators, waiters, and kitchen staff. The project includes table reservations, menu ordering, billing logic, order tracking, and real-time updates through Socket.IO.

## Features

- Role-based authentication with JWT and optional Supabase Auth integration
- Customer reservation and ordering flow
- Admin analytics and management dashboard
- Restaurant table status management
- Waiter order and service panel
- Kitchen display system with order lifecycle updates
- MongoDB-backed storage with in-memory fallback for local testing
- Socket.IO live updates for orders and reservations
- Modern responsive UI with React + Tailwind CSS

## Tech Stack

Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React
- Axios

Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT
- bcryptjs

## Project Structure

```text
project/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md
├── .gitignore
└── package.json (optional root wrapper)
```

## Setup

1. Install backend dependencies

```bash
cd backend
npm install
```

2. Install frontend dependencies

```bash
cd frontend
npm install
```

3. Configure environment variables

Backend copy:

```bash
cp backend/.env.example backend/.env
```

Frontend copy:

```bash
cp frontend/.env.example frontend/.env
```

Example backend values:

```env
PORT=5000
JWT_SECRET=restaurant-secret
MONGODB_URI=
```

Example frontend values:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present, the frontend uses Supabase Auth for sign in/sign up. If they are absent, the app falls back to the built-in JWT login flow.

If MONGODB_URI is empty, the app will use an in-memory MongoDB instance for local development.

### Supabase profile table and role sync

Run the SQL from [supabase-schema.sql](./supabase-schema.sql) in your Supabase SQL editor. This creates the `profiles` table and a trigger that syncs every new auth user into the profile record, including role-based access control metadata.

Example SQL snippet:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Restaurant user',
  email text not null unique,
  phone text default '',
  role text not null default 'customer' check (role in ('customer', 'admin', 'waiter', 'kitchen')),
  avatar text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

The frontend reads the profile row to resolve each user role, so admin/waiter/kitchen access stays synchronized with Supabase Auth metadata.

## Run the app

Start backend:

```bash
cd backend
npm start
```

Start frontend:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Then open:

- Frontend: http://localhost:5173/
- Backend Health: http://localhost:5000/api/health

## Demo accounts

The application seeds default users automatically:

- Admin: admin@restaurant.com / Admin@123
- Waiter: waiter@restaurant.com / Waiter@123
- Kitchen: kitchen@restaurant.com / Kitchen@123
- Customer: customer@restaurant.com / Customer@123

## Notes

- The app uses MongoDB Memory Server when no MongoDB URI is configured.
- Real-time notifications are emitted through Socket.IO for reservations and order updates.
- The menu, reservation, table and order flows are persisted to MongoDB and can be extended further for production deployment.
