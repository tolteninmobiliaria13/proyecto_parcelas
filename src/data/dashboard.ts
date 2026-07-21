export interface DashboardStat {
    title: string;
    value: string;
    description: string;
    icon: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    borderColor?: string;
    iconColorClass?: string;
    descClass?: string;
}

export const dashboardStats: DashboardStat[] = [
    {
        title: "Total por pagar",
        value: "$2.500.000",
        description: "Suma total de los pagos pendientes de cobro.",
        icon: "account_balance",
        iconColorClass: "text-secondary",
        descClass: "text-error font-medium",
    },
    {
        title: "Total Pagado mes",
        value: "$12.500.000",
        description: "Suma total de los pagos realizados este mes.",
        icon: "account_balance_wallet",
        iconColorClass: "text-secondary",
        descClass: "text-primary font-medium",
    },
    {
        title: "Lotes con Deuda",
        value: "12",
        description: "Deuda de uno o más meses",
        icon: "warning",
        borderColor: "border-error-container",
        iconColorClass: "text-error",
        descClass: "text-error font-medium",
    },
    {
        title: "Proximos Vencimientos",
        value: "25",
        description: "Vencen dentro del mes",
        icon: "event",
        iconColorClass: "text-secondary",
        descClass: "text-error font-medium",
    },
];
