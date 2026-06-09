// Reusable Spanish UI strings asserted across specs. The app's UI is Spanish
// (identifiers stay English). Add a string here once it is referenced in 2+
// places; one-test-only strings may stay inline.
export enum Messages {
  // Auth
  LOGIN_TITLE = "Salón Infantil",
  LOGIN_SUBMIT = "Ingresar",

  // Global autosave indicator (event edit page)
  SAVED = "Guardado",
  AUTOSAVE_HINT = "Se guarda automáticamente",

  // Event / staff flow
  STAFF_HOURS_MISSING = "Falta registro de empleados",
  STAFF_COST = "Costo personal",
  PAYMENT_PENDING = "Pendiente",
  PAYMENT_PAID = "Pagado",
  PAYMENT_DELETED = "Eliminado",
  STAFF_NEEDS_HOURS = "Registrá las horas",
  STAFF_PAYMENT_LABEL = "Pago personal —",
  COBRO_DEFAULT_LABEL = "Cobro —",

  // Generic
  SAVE_GENERIC = "Guardar cambios",
}

// Nav item labels (SidebarNav). Used by the sidebar component object.
export enum NavLabel {
  CALENDARIO = "Calendario",
  EVENTOS = "Eventos",
  CLIENTES = "Clientes",
  SERVICIOS = "Servicios",
  TIPOS_EVENTO = "Tipos de evento",
  PRESTADORES = "Prestadores",
  PERSONAL = "Personal",
  PROVEEDORES = "Proveedores",
  CUENTAS = "Cuentas",
  MOVIMIENTOS = "Movimientos",
  PAGO_PRESTADORES = "Pago prestadores",
  PAGO_PERSONAL = "Pago personal",
  PAGO_PROVEEDORES = "Pago proveedores",
  REPORTES = "Reportes",
}
