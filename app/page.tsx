'use client';

import { useEffect, useState } from 'react';
import { Package, Tag, DollarSign, Eye, EyeOff } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Producto, Categoria } from '@/lib/types';

export default function HomePage() {
  const { admin, loading } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (!admin) return;
    Promise.all([
      api.get<Producto[]>('/admin/productos'),
      api.get<Categoria[]>('/admin/categorias'),
    ])
      .then(([p, c]) => {
        setProductos(p.data);
        setCategorias(c.data);
      })
      .catch(() => undefined);
  }, [admin]);

  if (loading || !admin) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-500 text-sm">
        Cargando…
      </div>
    );
  }

  const activos = productos.filter((p) => p.activo).length;
  const inactivos = productos.length - activos;
  const valorTotal = productos.reduce(
    (sum, p) => sum + Number(p.precio) * p.stock,
    0,
  );

  return (
    <Shell title="Dashboard">
      <div className="space-y-6">
        <p className="text-slate-600 text-sm">
          Hola <span className="font-bold">{admin.nombre}</span>, aquí tienes un resumen del catálogo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Productos" value={productos.length} tone="brand" />
          <StatCard icon={Eye} label="Activos" value={activos} tone="positive" />
          <StatCard icon={EyeOff} label="Inactivos" value={inactivos} tone="warning" />
          <StatCard icon={Tag} label="Categorías" value={categorias.length} tone="brand" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Valor del inventario
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-1">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              {valorTotal.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Suma de (precio × stock) de todos los productos
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Accesos rápidos
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <a href="/productos" className="px-3 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-800">
                📦 Gestionar productos
              </a>
              <a href="/configuracion" className="px-3 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-800">
                ⚙️ Editar configuración
              </a>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  tone: 'brand' | 'positive' | 'warning';
}) {
  const tones = {
    brand: 'bg-slate-100 text-slate-700',
    positive: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`p-3 rounded-lg ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
