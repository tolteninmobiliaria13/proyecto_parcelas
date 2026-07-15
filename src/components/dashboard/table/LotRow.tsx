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

export default function LotRow({ lot }: LotRowProps) {
    const isOverdue = lot.status === "overdue";
    const initials = getInitials(lot.owner);

    return (
        <tr className={`hover:bg-surface-container/50 transition-colors group ${isOverdue ? "bg-error-container/5" : ""}`}>
            <td className="py-md px-lg font-medium text-primary">
                {lot.lot}
            </td>
            <td className="py-md px-lg">
                <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    <span>{lot.owner}</span>
                </div>
            </td>
            <td className="py-md px-lg text-right">
                {lot.downPayment.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).replace("CLP", "").trim()}
            </td>
            <td className="py-md px-lg text-on-surface-variant">
                {lot.lastPaymentDate || "-"}
            </td>
            <td className="py-md px-lg">
                {lot.paymentMethod ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-container-high text-xs font-medium text-on-surface border border-outline-variant/30">
                        {lot.paymentMethod}
                    </span>
                ) : (
                    "-"
                )}
            </td>
            <td className={`py-md px-lg ${isOverdue ? "text-error font-medium" : "text-on-surface-variant"}`}>
                {lot.nextDueDate}
            </td>
            <td className="py-md px-lg text-center">
                <LotStatus status={lot.status} />
            </td>
            <td className="py-md px-lg text-right">
                <button className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
            </td>
        </tr>
    );
}