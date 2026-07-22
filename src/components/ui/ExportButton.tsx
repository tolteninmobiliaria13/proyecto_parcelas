import type { ButtonHTMLAttributes } from "react";
import { useState } from "react";
import { getReporteData } from "../../services/api";
import { downloadReportDocx } from "../../utils/reportGenerator";

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
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(e);
            return;
        }

        try {
            setIsLoading(true);
            const data = await getReporteData();
            downloadReportDocx(data);
        } catch (error) {
            console.error("Error al generar el reporte:", error);
            alert("Hubo un error al generar el reporte.");
        } finally {
            setIsLoading(false);
        }
    };

    if (cardVariant) {
        return (
            <button
                onClick={handleClick}
                disabled={isLoading}
                className={`bg-primary text-on-primary hover:bg-primary/95 border border-primary rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                {...props}
            >
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px] text-on-primary">
                        {isLoading ? "hourglass_empty" : icon}
                    </span>
                </div>
                <span className="font-headline-md text-xs sm:text-sm font-semibold leading-tight">
                    {isLoading ? "Generando..." : label}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`h-[38px] px-4 bg-primary text-on-primary rounded-lg font-label-md text-xs sm:text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            <span className="material-symbols-outlined text-[18px]">
                {isLoading ? "hourglass_empty" : icon}
            </span>
            <span>{isLoading ? "Generando..." : label}</span>
        </button>
    );
}
