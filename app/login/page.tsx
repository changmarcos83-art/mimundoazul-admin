'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { extractError } from '@/lib/api';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error(extractError(err, 'No se pudo iniciar sesión'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel izquierdo: branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-white">
        <div className="text-xl font-extrabold tracking-tight">Mi Mundo Azul</div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">Panel de administración</h1>
          <p className="mt-4 text-white/70 max-w-md">
            Administra productos, categorías y configuración general del sitio.
          </p>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} Mi Mundo Azul</p>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex items-center justify-center p-6 bg-white">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-6 p-8 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Iniciar sesión</h2>
            <p className="text-sm text-slate-500 mt-1">Acceso solo para administradores.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none text-sm"
                placeholder="admin@mimundoazul.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Ingresando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
