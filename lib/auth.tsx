'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, tokenStore } from './api';
import type { Admin } from './types';

interface AuthCtx {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  admin: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Al cargar la app, intentamos recuperar la sesión desde el token guardado
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<Admin>('/auth/me')
      .then((res) => setAdmin(res.data))
      .catch(() => {
        tokenStore.clear();
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Si no hay admin y no estamos en /login, redirigimos
  useEffect(() => {
    if (!loading && !admin && pathname !== '/login') {
      router.replace('/login');
    }
  }, [loading, admin, pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; admin: Admin }>('/auth/login', {
      email,
      password,
    });
    tokenStore.set(res.data.token);
    setAdmin(res.data.admin);
    router.replace('/');
  };

  const logout = () => {
    tokenStore.clear();
    setAdmin(null);
    router.replace('/login');
  };

  return <Ctx.Provider value={{ admin, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
