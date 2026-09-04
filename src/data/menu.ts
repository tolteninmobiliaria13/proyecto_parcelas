import type { MenuItem } from "../types/menu";

export const menuItems: MenuItem[] = [
    {
        title: "Resumen",
        path: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "Parcelas",
        path: "/parcelas",
        icon: "location_on",
    },
    {
        title: "Contratos",
        path: "/contratos",
        icon: "description",
    },
    {
        title: "Pagos",
        path: "/pagos",
        icon: "payments",
    },
    {
        title: "Clientes",
        path: "/clientes",
        icon: "group",
    },
    {
        title: "Papelera",
        path: "/papelera",
        icon: "delete_sweep",
    }
];