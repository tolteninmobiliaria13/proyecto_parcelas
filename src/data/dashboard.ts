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
    blurBgClass?: string;
    descClass?: string;
}

export const dashboardStats: DashboardStat[] = [
    {
        title: "Total Parcelas",
        value: "150",
        description: "Gestión activa",
        icon: "landscape",
        iconColorClass: "text-primary",
        blurBgClass: "bg-primary-fixed/30 group-hover:bg-primary-fixed/50",
    },
    {
        title: "Pagos Recaudados Mes",
        value: "$2.500.000",
        description: "",
        icon: "account_balance_wallet",
        trend: {
            value: "+12% vs mes anterior",
            isPositive: true,
        },
        iconColorClass: "text-primary",
        blurBgClass: "bg-secondary-fixed/30 group-hover:bg-secondary-fixed/50",
    },
    {
        title: "Cuotas Vencidas Hoy",
        value: "12",
        description: "Requiere acción inmediata",
        icon: "warning",
        borderColor: "border-error-container",
        iconColorClass: "text-error",
        blurBgClass: "bg-error-container/40 group-hover:bg-error-container/60",
        descClass: "text-error font-medium",
    },
    {
        title: "Próximos Venc. (30 días)",
        value: "25",
        description: "Revisar programación",
        icon: "event",
        iconColorClass: "text-secondary",
        blurBgClass: "bg-surface-variant/50 group-hover:bg-surface-variant/80",
    },
];
