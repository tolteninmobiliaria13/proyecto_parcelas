import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
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

function RowActionsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.right - 176 + window.scrollX,
            });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const updateCoords = () => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + window.scrollY,
                    left: rect.right - 176 + window.scrollX,
                });
            }
        };

        if (isOpen) {
            window.addEventListener("scroll", updateCoords, true);
            window.addEventListener("resize", updateCoords);
        }
        return () => {
            window.removeEventListener("scroll", updateCoords, true);
            window.removeEventListener("resize", updateCoords);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="text-on-surface-variant hover:text-primary transition-colors opacity-70 hover:opacity-100 cursor-pointer p-1 rounded-md hover:bg-surface-container flex items-center justify-center"
                aria-label="Opciones de lote"
            >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {isOpen && createPortal(
                <>
                    {/* Backdrop para cerrar al hacer clic fuera */}
                    <div
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[100]"
                    />

                    <div
                        style={{
                            position: "absolute",
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                        }}
                        className="w-44 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 z-[101] text-left font-body-md animate-fade-in"
                    >
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/parcelas");
                            }}
                            className="w-full px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                            <span>Ver más datos</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/vencimientos");
                            }}
                            className="w-full px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-medium border-t border-outline-variant/30"
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                            <span>Ver pagos</span>
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}

export function LotCard({ lot }: LotRowProps) {
    const isOverdue = lot.status === "overdue";
    const initials = getInitials(lot.owner);

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
                    <span className="text-on-surface-variant block text-[11px]">Saldo</span>
                    <span className="font-semibold text-on-surface text-sm">
                        $ {lot.balance.toLocaleString("es-CL", {
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
            </div>
        </div>
    );
}

export default function LotRow({ lot }: LotRowProps) {
    const isOverdue = lot.status === "overdue";
    const initials = getInitials(lot.owner);

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
            <td className="py-4 px-6 text-center whitespace-nowrap font-medium text-on-surface border-r border-outline-variant">
                $ {lot.balance.toLocaleString("es-CL", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                })}
            </td>
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