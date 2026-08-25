import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import type { Lot } from "../../../types/lots";
import LotStatus from "./LotStatus";

type LotRowProps = {
    lot: Lot;
    activeTab?: "morosos" | "pendientes";
};

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function RowActionsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const navigate = useNavigate();

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.right + window.scrollX - 160, // 160px width
            });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>

            {isOpen && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        ref={menuRef}
                        style={{ top: coords.top, left: coords.left }}
                        className="absolute z-50 w-40 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xl py-1 text-xs text-on-surface font-medium animate-fade-in"
                    >
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/vencimientos");
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                            Ir a Vencimientos
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}

export function LotCard({ lot, activeTab = "morosos" }: LotRowProps) {
    const isOverdue = lot.status === "overdue" || (lot.overdueCount ? lot.overdueCount > 0 : false);
    const initials = getInitials(lot.owner);

    const displayAmount = activeTab === "pendientes"
        ? lot.installmentValue
        : (activeTab === "morosos" ? (lot.overdueBalance ?? 0) : (isOverdue ? (lot.overdueBalance ?? lot.balance) : lot.balance));

    const amountLabel = activeTab === "pendientes"
        ? "Valor Cuota"
        : (activeTab === "morosos" || isOverdue ? "Deuda Vencida" : "Saldo");

    return (
        <div className={`p-4 flex flex-col gap-3 transition-colors ${isOverdue ? "bg-error-container/10" : "bg-surface-container-lowest"}`}>
            <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-primary text-base">{lot.lot}</span>
                <div className="flex items-center gap-1">
                    <LotStatus status={lot.status} />
                    <RowActionsMenu />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant text-xs font-bold shrink-0">
                    {initials}
                </div>
                <span className="font-medium text-on-surface text-sm">{lot.owner}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low/60 p-2.5 rounded-lg border border-outline-variant/30">
                <div>
                    <span className="text-on-surface-variant block text-[11px]">{amountLabel}</span>
                    <span className={`font-semibold text-sm ${isOverdue && activeTab === "morosos" ? "text-error" : "text-on-surface"}`}>
                        $ {displayAmount.toLocaleString("es-CL", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}
                    </span>
                </div>
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Próx. Vencimiento</span>
                    <span className={`text-sm ${isOverdue ? "text-error font-semibold" : "text-on-surface font-medium"}`}>
                        {lot.nextDueDate}
                    </span>
                </div>
                {activeTab === "morosos" && isOverdue && (
                    <div className="col-span-2 pt-1 border-t border-outline-variant/20 flex justify-between items-center">
                        <span className="text-on-surface-variant text-[11px]">Cuotas Atrasadas:</span>
                        <span className="font-semibold text-error text-xs">
                            {lot.overdueCount || 1} {(lot.overdueCount || 1) === 1 ? "cuota" : "cuotas"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LotRow({ lot, activeTab = "morosos" }: LotRowProps) {
    const isOverdue = lot.status === "overdue" || (lot.overdueCount ? lot.overdueCount > 0 : false);
    const initials = getInitials(lot.owner);

    const displayAmount = activeTab === "pendientes"
        ? lot.installmentValue
        : (activeTab === "morosos" ? (lot.overdueBalance ?? 0) : (isOverdue ? (lot.overdueBalance ?? lot.balance) : lot.balance));

    return (
        <tr className={`hover:bg-surface-container/60 transition-colors group text-center ${isOverdue ? "bg-error-container/5" : ""}`}>
            <td className="py-4 px-6 font-medium text-primary whitespace-nowrap text-center border-r border-outline-variant">
                {lot.lot}
            </td>
            <td className="py-4 px-6 whitespace-nowrap text-center border-r border-outline-variant">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    <span className="font-medium text-on-surface">{lot.owner}</span>
                </div>
            </td>
            <td className={`py-4 px-6 text-center whitespace-nowrap font-medium border-r border-outline-variant ${isOverdue && activeTab === "morosos" ? "text-error font-semibold" : "text-on-surface"}`}>
                $ {displayAmount.toLocaleString("es-CL", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                })}
            </td>
            {activeTab === "morosos" && (
                <td className="py-4 px-6 text-center whitespace-nowrap border-r border-outline-variant">
                    {lot.overdueCount && lot.overdueCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
                            {lot.overdueCount} {lot.overdueCount === 1 ? "cuota" : "cuotas"}
                        </span>
                    ) : (
                        <span className="text-on-surface-variant text-xs font-medium">Al día</span>
                    )}
                </td>
            )}
            <td className={`py-4 px-6 text-center whitespace-nowrap border-r border-outline-variant ${isOverdue ? "text-error font-semibold" : "text-on-surface-variant"}`}>
                {lot.nextDueDate}
            </td>
            <td className="py-4 px-6 text-center whitespace-nowrap border-r border-outline-variant">
                <div className="flex items-center justify-center">
                    <LotStatus status={lot.status} />
                </div>
            </td>
            <td className="py-4 px-6 text-center whitespace-nowrap">
                <div className="flex items-center justify-center">
                    <RowActionsMenu />
                </div>
            </td>
        </tr>
    );
}