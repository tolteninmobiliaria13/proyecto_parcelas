type ParcelaStatusProps = {
    status?: "disponible" | "reservada" | "vendida" | string;
};

export default function ParcelaStatus({ status }: ParcelaStatusProps) {
    if (!status) return null;
    if (status === "disponible") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Disponible
            </span>
        );
    }

    if (status === "reservada") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Reservada
            </span>
        );
    }

    if (status === "vendida") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Vendida
            </span>
        );
    }

    // Fallbacks just in case
    if (status === "current") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Al Día
            </span>
        );
    }

    if (status === "overdue") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error text-xs font-semibold border border-error-container">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Vencido
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant text-xs font-medium border border-outline-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            {status}
        </span>
    );
}
