// App routes (relative to baseURL). Single source of truth — never hardcode a
// path in a page object or spec. Next.js App Router routes from app/(dashboard).
export enum Routes {
  LOGIN = "/login",

  CALENDARIO = "/calendario",

  EVENTOS = "/eventos",
  EVENTOS_NUEVO = "/eventos/nuevo",

  CLIENTES = "/clientes",
  CLIENTES_NUEVO = "/clientes/nuevo",

  SERVICIOS = "/servicios",
  SERVICIOS_NUEVO = "/servicios/nuevo",

  TIPOS_EVENTO = "/tipos-evento",
  TIPOS_EVENTO_NUEVO = "/tipos-evento/nuevo",

  PRESTADORES = "/prestadores",
  PRESTADORES_NUEVO = "/prestadores/nuevo",

  PERSONAL = "/personal",
  PERSONAL_NUEVO = "/personal/nuevo",

  PROVEEDORES = "/proveedores",
  PROVEEDORES_NUEVO = "/proveedores/nuevo",

  FINANZAS = "/finanzas",
  FINANZAS_CUENTAS_NUEVA = "/finanzas/cuentas/nueva",
  MOVIMIENTOS = "/finanzas/movimientos",
  MOVIMIENTOS_NUEVO = "/finanzas/movimientos/nuevo",

  PAGOS_PRESTADORES = "/pagos/prestadores",
  PAGOS_PERSONAL = "/pagos/personal",
  PAGOS_PROVEEDORES = "/pagos/proveedores",

  REPORTES = "/reportes",
}
