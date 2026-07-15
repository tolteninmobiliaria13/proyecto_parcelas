type LotStatusProps = {
    status: "current" | "overdue";
};

export default function LotStatus({ status }: LotStatusProps) {
    const isCurrent = status === "current";

    if (isCurrent) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed font-label-md text-label-md border border-primary-fixed-dim">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Al Día
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md border border-error/20">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Vencido
        </span>
    );
}