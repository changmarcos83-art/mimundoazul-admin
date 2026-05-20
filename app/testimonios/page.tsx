'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, X, Star, Loader2 } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { ImageUpload } from '@/components/ImageUpload';
import { api, extractError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import type { Testimonio } from '@/lib/types';

export default function TestimoniosPage() {
  const toast = useToast();
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [editando, setEditando] = useState<Testimonio | 'nuevo' | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get<Testimonio[]>('/admin/testimonios');
      setTestimonios(res.data);
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
    if (!confirm('¿Eliminar este testimonio?')) return;
    try {
      await api.delete(`/admin/testimonios/${id}`);
      toast.success('Testimonio eliminado');
      cargar();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <Shell title="Testimonios">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Reseñas que aparecen en la sección &quot;Lo que dicen los padres&quot;.
          </p>
          <button
            onClick={() => setEditando('nuevo')}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Nuevo testimonio
          </button>
        </div>

        {loading && <div className="text-slate-500 text-sm">Cargando…</div>}

        {!loading && testimonios.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-sm">
            Aún no hay testimonios. Agregá el primero con el botón de arriba.
          </div>
        )}

        {!loading && testimonios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonios.map((t) => (
              <div
                key={t.id}
                className={`bg-white border border-slate-200 rounded-xl p-5 ${
                  !t.activo ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {t.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatarUrl} alt={t.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 text-lg font-bold">
                        {t.nombre.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900">{t.nombre}</div>
                    {t.relacion && (
                      <div className="text-xs text-slate-500">{t.relacion}</div>
                    )}
                    <div className="text-amber-500 text-sm mt-0.5">
                      {'★'.repeat(t.estrellas)}
                      <span className="text-slate-300">{'★'.repeat(5 - t.estrellas)}</span>
                    </div>
                  </div>
                  {!t.activo && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                      INACTIVO
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 italic mt-3 line-clamp-3">
                  &ldquo;{t.mensaje}&rdquo;
                </p>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setEditando(t)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => eliminar(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editando && (
        <TestimonioModal
          testimonio={editando === 'nuevo' ? null : editando}
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

function TestimonioModal({
  testimonio,
  onClose,
  onSaved,
}: {
  testimonio: Testimonio | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: testimonio?.nombre ?? '',
    relacion: testimonio?.relacion ?? '',
    mensaje: testimonio?.mensaje ?? '',
    estrellas: testimonio?.estrellas ?? 5,
    avatarUrl: testimonio?.avatarUrl ?? '',
    orden: testimonio?.orden ?? 0,
    activo: testimonio?.activo ?? true,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        relacion: form.relacion || null,
        avatarUrl: form.avatarUrl || null,
        estrellas: Number(form.estrellas),
        orden: Number(form.orden),
      };
      if (testimonio) {
        await api.patch(`/admin/testimonios/${testimonio.id}`, payload);
        toast.success('Testimonio actualizado');
      } else {
        await api.post('/admin/testimonios', payload);
        toast.success('Testimonio creado');
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
      <form onSubmit={submit} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg">
            {testimonio ? 'Editar testimonio' : 'Nuevo testimonio'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ImageUpload
          value={form.avatarUrl}
          onChange={(url) => setForm({ ...form, avatarUrl: url })}
          label="Foto / avatar (opcional)"
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Nombre <span className="text-rose-500">*</span>
          </label>
          <input
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="María Gómez"
            className="input"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Relación (opcional)
          </label>
          <input
            value={form.relacion ?? ''}
            onChange={(e) => setForm({ ...form, relacion: e.target.value })}
            placeholder="Mamá de Lucas (4 años)"
            className="input"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Mensaje <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={form.mensaje}
            onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            placeholder="Los juegos transformaron la forma en que mi hijo aprende…"
            className="input resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Estrellas
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, estrellas: n })}
                  className="p-1"
                  aria-label={`${n} estrellas`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      n <= form.estrellas
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Orden</label>
            <input
              type="number"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
              className="input"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            className="h-4 w-4"
          />
          Activo (visible en el sitio)
        </label>

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
            {testimonio ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
