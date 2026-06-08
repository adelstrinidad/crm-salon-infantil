// Event-state badge labels (Spanish UI). Mirror prisma EventState / the app's
// status-badge labels. Used in assertions instead of hardcoded strings.
export enum EventStateLabel {
  RESERVADO = "Reservado",
  SENADO = "Señado",
  PAGADO = "Pagado",
  CERRADO = "Cerrado",
  SUSPENDIDO = "Suspendido",
  PRESUPUESTADO = "Presupuestado",
}

// Financial-movement type labels (MOVEMENT_TYPE_LABELS in the app).
export enum MovementTypeLabel {
  INGRESO = "Ingreso",
  EGRESO = "Egreso",
  TRANSFERENCIA = "Transferencia",
  ARQUEO = "Arqueo",
  INVERSION = "Inversión",
  RETIRO = "Retiro",
}
