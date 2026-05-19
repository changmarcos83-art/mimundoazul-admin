'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Package,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const items = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/categorias', label: 'Categorías', icon: Tag },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export function Shell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebar = (
    <>
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="font-extrabold text-lg">Mi Mundo Azul</div>
          <div className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">
            Admin
          </div>
        </div>
        <button
          onClick={() => setDrawerOpen(false)}
          className="lg:hidden p-1.5 hover:bg-white/10 rounded"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="px-3 py-2">
          <div className="text-xs text-white/50">Sesión</div>
          <div className="text-sm font-semibold truncate">{admin?.email}</div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col shrink-0">
        {sidebar}
      </aside>

      {/* Sidebar drawer móvil */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-200 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <h1 className="text-base sm:text-xl font-extrabold text-slate-900">{title}</h1>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
