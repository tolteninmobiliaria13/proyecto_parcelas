import type { MenuItem } from "../types/menu";

export const menuItems: MenuItem[] = [
    {
        title: "Resumen",
        path: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "Parcelas y Dueños",
        path: "/parcelas",
        icon: "location_on",
    },
    {
        title: "Clientes",
        path: "/clientes",
        icon: "group",
    },
    {
        title: "Vencimientos",
        path: "/vencimientos",
        icon: "event_busy",
    }
];