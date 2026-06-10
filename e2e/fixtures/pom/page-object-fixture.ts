import { test as base } from "@playwright/test";
import { LoginPage } from "../../pages/auth/login.page";
import { SidebarComponent } from "../../pages/components/sidebar.component";
import { ClientesListPage } from "../../pages/clientes/clientes-list.page";
import { ClienteFormPage } from "../../pages/clientes/cliente-form.page";
import { ServiciosListPage } from "../../pages/servicios/servicios-list.page";
import { ServicioFormPage } from "../../pages/servicios/servicio-form.page";
import { TiposEventoListPage } from "../../pages/tipos-evento/tipos-evento-list.page";
import { TipoEventoFormPage } from "../../pages/tipos-evento/tipo-evento-form.page";
import { PersonalListPage } from "../../pages/personal/personal-list.page";
import { EmpleadoFormPage } from "../../pages/personal/empleado-form.page";
import { PrestadoresListPage } from "../../pages/prestadores/prestadores-list.page";
import { PrestadorFormPage } from "../../pages/prestadores/prestador-form.page";
import { ProveedoresListPage } from "../../pages/proveedores/proveedores-list.page";
import { ProveedorFormPage } from "../../pages/proveedores/proveedor-form.page";
import { InsumosListPage } from "../../pages/insumos/insumos-list.page";
import { InsumoFormPage } from "../../pages/insumos/insumo-form.page";
import { ComprasListPage } from "../../pages/compras/compras-list.page";
import { CompraFormPage } from "../../pages/compras/compra-form.page";
import { EventoFormPage } from "../../pages/eventos/evento-form.page";
import { EventoEditPage } from "../../pages/eventos/evento-edit.page";
import { EventoDetailPage } from "../../pages/eventos/evento-detail.page";
import { CuentasListPage } from "../../pages/finanzas/cuentas-list.page";
import { CuentaFormPage } from "../../pages/finanzas/cuenta-form.page";
import { MovimientosListPage } from "../../pages/movimientos/movimientos-list.page";
import { MovimientoFormPage } from "../../pages/movimientos/movimiento-form.page";
import { PagoPrestadoresPage } from "../../pages/pagos/pago-prestadores.page";
import { PagoPersonalPage } from "../../pages/pagos/pago-personal.page";
import { PagoProveedoresPage } from "../../pages/pagos/pago-proveedores.page";
import { CalendarioPage } from "../../pages/calendario/calendario.page";
import { ReportesPage } from "../../pages/reportes/reportes.page";

// Register every page object here (and ONLY here). Tests consume them via DI —
// never `new SomePage(page)` inside a spec.
export type PageObjectFixtures = {
  loginPage: LoginPage;
  sidebar: SidebarComponent;
  clientesListPage: ClientesListPage;
  clienteFormPage: ClienteFormPage;
  serviciosListPage: ServiciosListPage;
  servicioFormPage: ServicioFormPage;
  tiposEventoListPage: TiposEventoListPage;
  tipoEventoFormPage: TipoEventoFormPage;
  personalListPage: PersonalListPage;
  empleadoFormPage: EmpleadoFormPage;
  prestadoresListPage: PrestadoresListPage;
  prestadorFormPage: PrestadorFormPage;
  proveedoresListPage: ProveedoresListPage;
  proveedorFormPage: ProveedorFormPage;
  insumosListPage: InsumosListPage;
  insumoFormPage: InsumoFormPage;
  comprasListPage: ComprasListPage;
  compraFormPage: CompraFormPage;
  eventoFormPage: EventoFormPage;
  eventoEditPage: EventoEditPage;
  eventoDetailPage: EventoDetailPage;
  cuentasListPage: CuentasListPage;
  cuentaFormPage: CuentaFormPage;
  movimientosListPage: MovimientosListPage;
  movimientoFormPage: MovimientoFormPage;
  pagoPrestadoresPage: PagoPrestadoresPage;
  pagoPersonalPage: PagoPersonalPage;
  pagoProveedoresPage: PagoProveedoresPage;
  calendarioPage: CalendarioPage;
  reportesPage: ReportesPage;
};

export const test = base.extend<PageObjectFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  sidebar: async ({ page }, use) => {
    await use(new SidebarComponent(page));
  },
  clientesListPage: async ({ page }, use) => {
    await use(new ClientesListPage(page));
  },
  clienteFormPage: async ({ page }, use) => {
    await use(new ClienteFormPage(page));
  },
  serviciosListPage: async ({ page }, use) => {
    await use(new ServiciosListPage(page));
  },
  servicioFormPage: async ({ page }, use) => {
    await use(new ServicioFormPage(page));
  },
  tiposEventoListPage: async ({ page }, use) => {
    await use(new TiposEventoListPage(page));
  },
  tipoEventoFormPage: async ({ page }, use) => {
    await use(new TipoEventoFormPage(page));
  },
  personalListPage: async ({ page }, use) => {
    await use(new PersonalListPage(page));
  },
  empleadoFormPage: async ({ page }, use) => {
    await use(new EmpleadoFormPage(page));
  },
  prestadoresListPage: async ({ page }, use) => {
    await use(new PrestadoresListPage(page));
  },
  prestadorFormPage: async ({ page }, use) => {
    await use(new PrestadorFormPage(page));
  },
  proveedoresListPage: async ({ page }, use) => {
    await use(new ProveedoresListPage(page));
  },
  proveedorFormPage: async ({ page }, use) => {
    await use(new ProveedorFormPage(page));
  },
  insumosListPage: async ({ page }, use) => {
    await use(new InsumosListPage(page));
  },
  insumoFormPage: async ({ page }, use) => {
    await use(new InsumoFormPage(page));
  },
  comprasListPage: async ({ page }, use) => {
    await use(new ComprasListPage(page));
  },
  compraFormPage: async ({ page }, use) => {
    await use(new CompraFormPage(page));
  },
  eventoFormPage: async ({ page }, use) => {
    await use(new EventoFormPage(page));
  },
  eventoEditPage: async ({ page }, use) => {
    await use(new EventoEditPage(page));
  },
  eventoDetailPage: async ({ page }, use) => {
    await use(new EventoDetailPage(page));
  },
  cuentasListPage: async ({ page }, use) => {
    await use(new CuentasListPage(page));
  },
  cuentaFormPage: async ({ page }, use) => {
    await use(new CuentaFormPage(page));
  },
  movimientosListPage: async ({ page }, use) => {
    await use(new MovimientosListPage(page));
  },
  movimientoFormPage: async ({ page }, use) => {
    await use(new MovimientoFormPage(page));
  },
  pagoPrestadoresPage: async ({ page }, use) => {
    await use(new PagoPrestadoresPage(page));
  },
  pagoPersonalPage: async ({ page }, use) => {
    await use(new PagoPersonalPage(page));
  },
  pagoProveedoresPage: async ({ page }, use) => {
    await use(new PagoProveedoresPage(page));
  },
  calendarioPage: async ({ page }, use) => {
    await use(new CalendarioPage(page));
  },
  reportesPage: async ({ page }, use) => {
    await use(new ReportesPage(page));
  },
});
