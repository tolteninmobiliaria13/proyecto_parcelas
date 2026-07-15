type ParcelaStatusProps = {
    status: "current" | "overdue" | "inactive";
};

export default function ParcelaStatus({ status }: ParcelaStatusProps) {
    if (status === "current") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-medium border border-outline-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Al Día
            </span>
        );
    }

    if (status === "overdue") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error text-xs font-medium border border-error-container">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Vencido
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant text-xs font-medium border border-outline-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            Inactiva
        </span>
    );
}
