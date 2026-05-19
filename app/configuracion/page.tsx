'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { ImageUpload } from '@/components/ImageUpload';
import { api, extractError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import type { ConfiguracionItem } from '@/lib/types';

/**
 * Define cómo se muestra cada clave de configuración.
 * Las claves se agrupan en secciones para que el admin las edite con orden.
 */
const SECCIONES: { titulo: string; campos: { clave: string; etiqueta: string; tipo: 'text' | 'textarea' | 'imagen' | 'bool'; placeholder?: string; ayuda?: string }[] }[] = [
  {
    titulo: 'Contacto',
    campos: [
      { clave: 'whatsapp_numero', etiqueta: 'Número de WhatsApp', tipo: 'text', placeholder: '+593991234567', ayuda: 'Incluí código de país, sin espacios. Ej: +593991234567' },
      { clave: 'telefono', etiqueta: 'Teléfono visible', tipo: 'text', placeholder: '+593 99 123 4567', ayuda: 'Cómo aparece en el sitio (con espacios)' },
      { clave: 'email_contacto', etiqueta: 'Email de contacto', tipo: 'text', placeholder: 'info@mimundoazul.com' },
      { clave: 'direccion', etiqueta: 'Dirección', tipo: 'text', placeholder: 'Av. Principal 123, Quito' },
    ],
  },
  {
    titulo: 'Marca',
    campos: [
      { clave: 'nombre_marca', etiqueta: 'Nombre de la marca', tipo: 'text', placeholder: 'Mi Mundo Azul' },
      { clave: 'eslogan', etiqueta: 'Eslogan', tipo: 'text', placeholder: 'Crece jugando' },
      { clave: 'logo_url', etiqueta: 'Logo', tipo: 'imagen' },
    ],
  },
  {
    titulo: 'Portada (Hero)',
    campos: [
      { clave: 'hero_titulo', etiqueta: 'Título principal', tipo: 'text', placeholder: 'Bienvenidos a Mi Mundo Azul' },
      { clave: 'hero_subtitulo', etiqueta: 'Subtítulo', tipo: 'textarea', placeholder: 'Juegos que despiertan la imaginación' },
      { clave: 'hero_imagen_url', etiqueta: 'Imagen del hero', tipo: 'imagen' },
    ],
  },
  {
    titulo: 'Redes sociales',
    campos: [
      { clave: 'instagram_url', etiqueta: 'Instagram URL', tipo: 'text', placeholder: 'https://instagram.com/mimundoazul' },
      { clave: 'facebook_url', etiqueta: 'Facebook URL', tipo: 'text', placeholder: 'https://facebook.com/mimundoazul' },
      { clave: 'tiktok_url', etiqueta: 'TikTok URL (opcional)', tipo: 'text' },
    ],
  },
  {
    titulo: 'WhatsApp',
    campos: [
      { clave: 'wsp_mensaje_inicial', etiqueta: 'Mensaje inicial', tipo: 'textarea', placeholder: 'Hola! Quiero comprar:', ayuda: 'Texto que aparece al principio del mensaje al hacer click en "Comprar"' },
      { clave: 'wsp_mensaje_final', etiqueta: 'Mensaje final', tipo: 'textarea', placeholder: '¿Cómo coordinamos el pago y la entrega?' },
    ],
  },
  {
    titulo: 'Pasarela de pago (próximamente)',
    campos: [
      { clave: 'pasarela_pago_activa', etiqueta: '¿Activar pasarela de pago?', tipo: 'bool' },
      { clave: 'pasarela_pago_mensaje', etiqueta: 'Mensaje "próximamente"', tipo: 'text', placeholder: '💳 Próximamente: pago con tarjeta', ayuda: 'Se muestra mientras la pasarela esté desactivada' },
    ],
  },
];

export default function ConfiguracionPage() {
  const toast = useToast();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<ConfiguracionItem[]>('/admin/configuracion')
      .then((res) => {
        const map: Record<string, string> = {};
        res.data.forEach((c) => (map[c.clave] = c.valor));
        setValores(map);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValor = (clave: string, valor: string) => {
    setValores((prev) => ({ ...prev, [clave]: valor }));
  };

  const guardar = async () => {
    setSaving(true);
    try {
      await api.patch('/admin/configuracion', valores);
      toast.success('Configuración guardada');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Shell title="Configuración">
        <div className="text-slate-500 text-sm">Cargando…</div>
      </Shell>
    );
  }

  return (
    <Shell title="Configuración">
      <div className="space-y-6 max-w-3xl">
        <p className="text-sm text-slate-500">
          Edita aquí toda la información que se muestra en el sitio público.
        </p>

        {SECCIONES.map((sec) => (
          <div key={sec.titulo} className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide mb-4">
              {sec.titulo}
            </h3>
            <div className="space-y-4">
              {sec.campos.map((campo) => (
                <div key={campo.clave}>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {campo.etiqueta}
                  </label>
                  {campo.tipo === 'text' && (
                    <input
                      value={valores[campo.clave] ?? ''}
                      onChange={(e) => setValor(campo.clave, e.target.value)}
                      placeholder={campo.placeholder}
                      className="input"
                    />
                  )}
                  {campo.tipo === 'textarea' && (
                    <textarea
                      rows={2}
                      value={valores[campo.clave] ?? ''}
                      onChange={(e) => setValor(campo.clave, e.target.value)}
                      placeholder={campo.placeholder}
                      className="input resize-none"
                    />
                  )}
                  {campo.tipo === 'imagen' && (
                    <ImageUpload
                      value={valores[campo.clave] ?? ''}
                      onChange={(url) => setValor(campo.clave, url)}
                      label=""
                    />
                  )}
                  {campo.tipo === 'bool' && (
                    <label className="inline-flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        checked={valores[campo.clave] === 'true'}
                        onChange={(e) =>
                          setValor(campo.clave, e.target.checked ? 'true' : 'false')
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Activado</span>
                    </label>
                  )}
                  {campo.ayuda && (
                    <p className="text-xs text-slate-500 mt-1">{campo.ayuda}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent py-4">
          <button
            onClick={guardar}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60 shadow-lg"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </div>
    </Shell>
  );
}
