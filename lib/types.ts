// Tipos compartidos con la API

export interface Admin {
  id: number;
  email: string;
  nombre: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  icono?: string | null;
  descripcion?: string | null;
  orden: number;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  sku: string;
  descripcion?: string | null;
  precio: string;          // viene como string desde Prisma Decimal
  precioPromo?: string | null;
  imagenUrl?: string | null;
  stock: number;
  edadMin?: number | null;
  edadMax?: number | null;
  destacado: boolean;
  activo: boolean;
  orden: number;
  categoriaId?: number | null;
  categoria?: Categoria | null;
}

export interface ConfiguracionItem {
  clave: string;
  valor: string;
  descripcion?: string | null;
}
