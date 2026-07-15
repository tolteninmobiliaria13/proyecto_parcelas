import type { MenuItem } from "../types/menu";

export const menuItems: MenuItem[] = [
    {
        title: "Escritorio",
        path: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "Parcelas y Dueños",
        path: "/parcelas",
        icon: "location_on",
    },
    {
        title: "Registro de Pagos",
        path: "/pagos",
        icon: "receipt_long",
    },
    {
        title: "Vencimientos",
        path: "/vencimientos",
        icon: "event_busy",
    },
    {
        title: "Configuración",
        path: "/configuracion",
        icon: "settings",
    },
];