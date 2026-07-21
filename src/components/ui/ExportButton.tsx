import type { ButtonHTMLAttributes } from "react";

interface ExportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    icon?: string;
    className?: string;
    cardVariant?: boolean;
}

export default function ExportButton({
    label = "Exportar Reporte",
    icon = "download",
    className = "",
    cardVariant = false,
    onClick,
    ...props
}: ExportButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(e);
        } else {
            alert("Exportando reporte...");
        }
    };

    if (cardVariant) {
        return (
            <button
                onClick={handleClick}
                className={`bg-primary text-on-primary hover:bg-primary/95 border border-primary rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center group active:scale-[0.98] ${className}`}
                {...props}
            >
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px] text-on-primary">{icon}</span>
                </div>
                <span className="font-headline-md text-xs sm:text-sm font-semibold leading-tight">{label}</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`h-[38px] px-4 bg-primary text-on-primary rounded-lg font-label-md text-xs sm:text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap active:scale-[0.98] ${className}`}
            {...props}
        >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            <span>{label}</span>
        </button>
    );
}
