import type { DashboardStat } from "../../../data/dashboard";

type SummaryCardProps = {
    stat: DashboardStat;
};

export default function SummaryCard({ stat }: SummaryCardProps) {
    const {
        title,
        value,
        description,
        icon,
        trend,
        borderColor = "border-outline-variant",
        iconColorClass = "text-primary",
        blurBgClass = "bg-primary-fixed/30 group-hover:bg-primary-fixed/50",
        descClass = "text-on-surface-variant/70 text-xs",
    } = stat;

    return (
        <div className={`bg-surface-container-lowest border ${borderColor} rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl transition-colors ${blurBgClass}`}></div>
            <div className="flex justify-between items-start mb-sm relative">
                <p className={`font-label-md text-label-md uppercase tracking-wide ${stat.borderColor ? 'text-error' : 'text-on-surface-variant'}`}>
                    {title}
                </p>
                <span 
                    className={`material-symbols-outlined text-[24px] ${iconColorClass}`}
                    style={icon === "warning" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                    {icon}
                </span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mt-sm relative">
                {value}
            </h3>
            
            {trend ? (
                <div className="flex items-center gap-xs mt-1 relative">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                        {trend.isPositive ? "trending_up" : "trending_down"}
                    </span>
                    <p className="font-label-md text-label-md text-primary">
                        {trend.value}
                    </p>
                </div>
            ) : (
                <p className={`font-body-md text-body-md mt-1 relative ${descClass}`}>
                    {description}
                </p>
            )}
        </div>
    );
}
