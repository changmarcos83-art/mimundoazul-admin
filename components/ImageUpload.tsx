'use client';

import { useState, useRef } from 'react';
import { api, extractError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Upload, Loader2, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

/**
 * Sube una imagen al backend y devuelve la URL final.
 * Muestra preview de la imagen actual.
 */
export function ImageUpload({ value, onChange, label = 'Imagen' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onFile = async (file: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post<{ url: string }>('/admin/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
      toast.success('Imagen subida');
    } catch (err) {
      toast.error(extractError(err, 'No se pudo subir la imagen'));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold text-slate-700 block">{label}</label>
      )}
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs shrink-0">
            Sin foto
          </div>
        )}
        <div className="flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {loading ? 'Subiendo…' : 'Subir imagen'}
          </button>
          <p className="text-xs text-slate-500 mt-1.5">PNG, JPG o WEBP. Máx 5 MB.</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
