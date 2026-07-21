import type { Lot } from "../../../types/lots";
import LotStatus from "./LotStatus";

type LotRowProps = {
    lot: Lot;
};

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export function LotCard({ lot }: LotRowProps) {
    const isOverdue = lot.status === "overdue";
    const initials = getInitials(lot.owner);

    return (
        <div className={`p-4 flex flex-col gap-3 transition-colors ${isOverdue ? "bg-error-container/10" : "bg-surface-container-lowest"}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary text-base">{lot.lot}</span>
                </div>
                <LotStatus status={lot.status} />
            </div>

            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant text-xs font-bold shrink-0">
                    {initials}
                </div>
                <span className="font-medium text-on-surface text-sm">{lot.owner}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/30">
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Monto Pagado</span>
                    <span className="font-semibold text-on-surface text-sm">
                        {lot.downPayment.toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }).replace("CLP", "").trim()}
                    </span>
                </div>
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Método</span>
                    <span className="font-medium text-on-surface">
                        {lot.paymentMethod || "-"}
                    </span>
                </div>
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Último Pago</span>
                    <span className="text-on-surface">{lot.lastPaymentDate || "-"}</span>
                </div>
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Próx. Vencimiento</span>
                    <span className={isOverdue ? "text-error font-semibold" : "text-on-surface"}>
                        {lot.nextDueDate}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function LotRow({ lot }: LotRowProps) {
    const isOverdue = lot.status === "overdue";
    const initials = getInitials(lot.owner);

    return (
        <tr className={`hover:bg-surface-container/50 transition-colors group ${isOverdue ? "bg-error-container/5" : ""}`}>
            <td className="py-md px-lg font-medium text-primary whitespace-nowrap">
                {lot.lot}
            </td>
            <td className="py-md px-lg whitespace-nowrap">
                <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    <span>{lot.owner}</span>
                </div>
            </td>
            <td className="py-md px-lg text-right whitespace-nowrap">
                {lot.downPayment.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).replace("CLP", "").trim()}
            </td>
            <td className="py-md px-lg text-on-surface-variant whitespace-nowrap">
                {lot.lastPaymentDate || "-"}
            </td>
            <td className="py-md px-lg whitespace-nowrap">
                {lot.paymentMethod ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-container-high text-xs font-medium text-on-surface border border-outline-variant/30">
                        {lot.paymentMethod}
                    </span>
                ) : (
                    "-"
                )}
            </td>
            <td className={`py-md px-lg whitespace-nowrap ${isOverdue ? "text-error font-medium" : "text-on-surface-variant"}`}>
                {lot.nextDueDate}
            </td>
            <td className="py-md px-lg text-center whitespace-nowrap">
                <LotStatus status={lot.status} />
            </td>
            <td className="py-md px-lg text-right whitespace-nowrap">
                <button className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
            </td>
        </tr>
    );
}