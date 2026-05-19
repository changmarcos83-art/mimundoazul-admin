'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, X, Star, Loader2 } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { ImageUpload } from '@/components/ImageUpload';
import { api, extractError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import type { Producto, Categoria } from '@/lib/types';

export default function ProductosPage() {
  const toast = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editando, setEditando] = useState<Producto | 'nuevo' | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        api.get<Producto[]>('/admin/productos'),
        api.get<Categoria[]>('/admin/categorias'),
      ]);
      setProductos(p.data);
      setCategorias(c.data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/admin/productos/${id}`);
      toast.success('Producto eliminado');
      cargar();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <Shell title="Productos">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Gestiona el catálogo del sitio.</p>
          <button
            onClick={() => setEditando('nuevo')}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Nuevo producto
          </button>
        </div>

        {loading && <div className="text-slate-500 text-sm">Cargando…</div>}

        {!loading && productos.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-sm">
            No hay productos. Agrega el primero con el botón de arriba.
          </div>
        )}

        {!loading && productos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productos.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col ${
                  !p.activo ? 'opacity-60' : ''
                }`}
              >
                <div className="aspect-square bg-slate-100 relative">
                  {p.imagenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagenUrl}
                      alt={p.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Sin foto
                    </div>
                  )}
                  {p.destacado && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded flex items-center gap-1">
                      <Star className="h-3 w-3" /> Destacado
                    </span>
                  )}
                  {!p.activo && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                      Inactivo
                    </span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <div className="text-xs text-slate-500">{p.sku}</div>
                  <div className="font-bold text-slate-900 line-clamp-2 mt-0.5">
                    {p.nombre}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    {p.precioPromo ? (
                      <>
                        <span className="text-lg font-extrabold text-emerald-700">
                          ${Number(p.precioPromo).toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ${Number(p.precio).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-extrabold text-slate-900">
                        ${Number(p.precio).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Stock: {p.stock} · {p.categoria?.nombre ?? 'Sin categoría'}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setEditando(p)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => eliminar(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editando && (
        <ProductoModal
          producto={editando === 'nuevo' ? null : editando}
          categorias={categorias}
          onClose={() => setEditando(null)}
          onSaved={() => {
            setEditando(null);
            cargar();
          }}
        />
      )}
    </Shell>
  );
}

function ProductoModal({
  producto,
  categorias,
  onClose,
  onSaved,
}: {
  producto: Producto | null;
  categorias: Categoria[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    sku: producto?.sku ?? '',
    descripcion: producto?.descripcion ?? '',
    precio: producto?.precio ?? '',
    precioPromo: producto?.precioPromo ?? '',
    imagenUrl: producto?.imagenUrl ?? '',
    stock: producto?.stock ?? 0,
    edadMin: producto?.edadMin ?? '',
    edadMax: producto?.edadMax ?? '',
    destacado: producto?.destacado ?? false,
    activo: producto?.activo ?? true,
    categoriaId: producto?.categoriaId ?? '',
    orden: producto?.orden ?? 0,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        precio: Number(form.precio),
        precioPromo: form.precioPromo === '' ? undefined : Number(form.precioPromo),
        edadMin: form.edadMin === '' ? undefined : Number(form.edadMin),
        edadMax: form.edadMax === '' ? undefined : Number(form.edadMax),
        categoriaId: form.categoriaId === '' ? undefined : Number(form.categoriaId),
        stock: Number(form.stock),
        orden: Number(form.orden),
      };
      if (producto) {
        await api.patch(`/admin/productos/${producto.id}`, payload);
        toast.success('Producto actualizado');
      } else {
        await api.post('/admin/productos', payload);
        toast.success('Producto creado');
      }
      onSaved();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        <header className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-extrabold text-lg">
            {producto ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5 space-y-4 overflow-y-auto">
          <ImageUpload
            value={form.imagenUrl}
            onChange={(url) => setForm({ ...form, imagenUrl: url })}
            label="Foto del producto"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre" required>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="SKU (código)" required>
              <input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input"
              />
            </Field>
          </div>

          <Field label="Descripción">
            <textarea
              rows={3}
              value={form.descripcion ?? ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="input resize-none"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Precio normal" required>
              <input
                required
                type="number"
                step="0.01"
                value={form.precio as string}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Precio promo (opcional)">
              <input
                type="number"
                step="0.01"
                value={form.precioPromo as string}
                onChange={(e) => setForm({ ...form, precioPromo: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Categoría">
              <select
                value={form.categoriaId as number | string}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                className="input"
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Edad mín.">
              <input
                type="number"
                value={form.edadMin as string}
                onChange={(e) => setForm({ ...form, edadMin: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Edad máx.">
              <input
                type="number"
                value={form.edadMax as string}
                onChange={(e) => setForm({ ...form, edadMax: e.target.value })}
                className="input"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="h-4 w-4"
              />
              Activo (visible en el sitio)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                className="h-4 w-4"
              />
              Destacado
            </label>
            <Field label="Orden">
              <input
                type="number"
                value={form.orden}
                onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                className="input w-24"
              />
            </Field>
          </div>
        </div>

        <footer className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex justify-end gap-2 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {producto ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 block mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}
