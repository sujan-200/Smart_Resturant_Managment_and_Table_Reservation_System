import { ArrowRight, ChefHat, Clock3, MapPin, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: UtensilsCrossed, title: 'Smart ordering', text: 'Live order tracking, kitchen updates and staff coordination.' },
  { icon: Clock3, title: 'Table booking', text: 'Reserve tables with real-time availability and guest-based matching.' },
  { icon: ShieldCheck, title: 'Role-based access', text: 'Secure dashboards for customers, administrators, waiters and kitchen staff.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">C</div>
          <div>
            <p className="text-lg font-semibold">Cinder & Cedar</p>
            <p className="text-xs text-stone-400">Restaurant operations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-orange-400 hover:text-orange-300">Login</Link>
          <Link to="/register" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400">Register</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:pt-16">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">Smart restaurant management</p>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-white md:text-6xl">From table booking to kitchen service, beautifully automated.</h1>
            <p className="mt-6 max-w-lg text-base text-stone-300 md:text-lg">Manage reservations, digital ordering, real-time kitchen updates, and billing from one polished restaurant platform built for modern hospitality.</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-400">Get started <ArrowRight size={18} /></Link>
              <Link to="/login" className="rounded-full border border-white/20 px-6 py-3 font-semibold text-stone-200 transition hover:border-orange-300 hover:text-orange-200">Demo login</Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-stone-300">
              <div className="flex items-center gap-2"><MapPin size={16} className="text-orange-400" /> Downtown Kathmandu</div>
              <div className="flex items-center gap-2"><ChefHat size={16} className="text-orange-400" /> 4.8 guest rating</div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-6 shadow-2xl shadow-orange-500/10">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5">
                <p className="text-sm text-orange-200">Reservations</p>
                <p className="mt-3 text-3xl font-bold text-white">128</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-stone-300">Orders</p>
                <p className="mt-3 text-3xl font-bold text-white">96</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-300">Kitchen queue</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">Live</span>
                </div>
                <div className="mt-4 space-y-3">
                  {['Order 204 • Table 5', 'Order 205 • Table 2', 'Order 206 • Table 8'].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-xl bg-stone-800/80 px-3 py-2 text-sm text-stone-200">
                      <span>{item}</span>
                      <span className="rounded bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-200">Preparing</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 inline-flex rounded-xl bg-orange-500/10 p-3 text-orange-300">
                <Icon size={22} />
              </div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-300">{text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
