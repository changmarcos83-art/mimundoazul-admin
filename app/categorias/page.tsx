'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { api, extractError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import type { Categoria } from '@/lib/types';

export default function CategoriasPage() {
  const toast = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editando, setEditando] = useState<Categoria | 'nuevo' | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get<Categoria[]>('/admin/categorias');
      setCategorias(res.data);
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
    if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;
    try {
      await api.delete(`/admin/categorias/${id}`);
      toast.success('Categoría eliminada');
      cargar();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <Shell title="Categorías">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Agrupa productos. Ejemplo: Montessori, STEM, Arte.
          </p>
          <button
            onClick={() => setEditando('nuevo')}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Nueva categoría
          </button>
        </div>

        {loading && <div className="text-slate-500 text-sm">Cargando…</div>}

        {!loading && categorias.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Categoría</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">
                    Slug
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">
                    Orden
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Estado</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{c.icono}</span>
                        <span className="font-bold text-slate-900">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{c.orden}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          c.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {c.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditando(c)}
                          className="p-2 rounded-lg hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => eliminar(c.id)}
                          className="p-2 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editando && (
        <CategoriaModal
          categoria={editando === 'nuevo' ? null : editando}
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

function CategoriaModal({
  categoria,
  onClose,
  onSaved,
}: {
  categoria: Categoria | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: categoria?.nombre ?? '',
    slug: categoria?.slug ?? '',
    icono: categoria?.icono ?? '',
    descripcion: categoria?.descripcion ?? '',
    orden: categoria?.orden ?? 0,
    activo: categoria?.activo ?? true,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, orden: Number(form.orden) };
      if (categoria) {
        await api.patch(`/admin/categorias/${categoria.id}`, payload);
        toast.success('Categoría actualizada');
      } else {
        await api.post('/admin/categorias', payload);
        toast.success('Categoría creada');
      }
      onSaved();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  // Auto-generar slug a partir del nombre si está vacío
  const onNombreChange = (v: string) => {
    setForm((f) => ({
      ...f,
      nombre: v,
      slug: categoria || f.slug !== ''
        ? f.slug
        : v
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg">
            {categoria ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nombre <span className="text-rose-500">*</span>
            </label>
            <input
              required
              value={form.nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className="input"
              placeholder="ej: Montessori"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Slug (URL)
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input"
                placeholder="montessori"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ícono (emoji)
              </label>
              <input
                value={form.icono ?? ''}
                onChange={(e) => setForm({ ...form, icono: e.target.value })}
                className="input"
                placeholder="🧩"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={form.descripcion ?? ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="input resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Activa
            </label>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">Orden:</label>
              <input
                type="number"
                value={form.orden}
                onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                className="input w-20"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
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
            {categoria ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
