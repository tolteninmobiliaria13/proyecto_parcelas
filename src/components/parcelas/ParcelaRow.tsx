import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Parcela } from "../../types/parcela";
import ParcelaStatus from "./ParcelaStatus";

type ParcelaRowProps = {
    parcela: Parcela;
    onAssign: () => void;
    onEditParcela: () => void;
    onDeleteParcela: () => void;
};

type ParcelaActionsMenuProps = {
    parcela: Parcela;
    onAssign: () => void;
    onEditParcela: () => void;
    onDeleteParcela: () => void;
};

function ParcelaActionsMenu({
    parcela,
    onAssign,
    onEditParcela,
    onDeleteParcela,
}: ParcelaActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
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
                aria-label="Opciones de parcela"
            >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {isOpen && createPortal(
                <>
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
                        className="w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 z-[101] text-left font-body-md animate-fade-in"
                    >
                        {(parcela.status === "inactive" || parcela.owner === "Sin Asignar") && (
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onAssign();
                                }}
                                className="w-full px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                            >
                                <span className="material-symbols-outlined text-[18px] text-primary">person_add</span>
                                <span>Asignar Dueño</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onEditParcela();
                            }}
                            className={`w-full px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-medium ${
                                parcela.status === "inactive" || parcela.owner === "Sin Asignar" ? "border-t border-outline-variant/30" : ""
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                            <span>Editar Parcela</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onDeleteParcela();
                            }}
                            className="w-full px-3 py-2 text-error hover:bg-error/10 transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-medium border-t border-outline-variant/30"
                        >
                            <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                            <span>Eliminar Parcela</span>
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}

export function ParcelaCard({
    parcela,
    onAssign,
    onEditParcela,
    onDeleteParcela,
}: ParcelaRowProps) {
    return (
        <div className="p-4 bg-surface-container-lowest flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-base">{parcela.id}</span>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                        {parcela.subdivision || "Sin Loteo"}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <ParcelaStatus status={parcela.estado} />
                    <ParcelaActionsMenu
                        parcela={parcela}
                        onAssign={onAssign}
                        onEditParcela={onEditParcela}
                        onDeleteParcela={onDeleteParcela}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-surface-container-low/60 p-2.5 rounded-lg border border-outline-variant/30">
                <span className="text-on-surface-variant">Precio Venta</span>
                <span className="font-semibold text-on-surface text-sm">$ {parcela.precioVenta.toLocaleString("es-CL")}</span>
            </div>
        </div>
    );
}

export default function ParcelaRow({
    parcela,
    onAssign,
    onEditParcela,
    onDeleteParcela,
}: ParcelaRowProps) {
    return (
        <tr className="hover:bg-surface-container/60 transition-colors group text-center">
            <td className="py-4 px-6 font-bold text-primary whitespace-nowrap text-center border-r border-outline-variant">
                {parcela.id}
            </td>
            <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap text-center border-r border-outline-variant font-medium">
                {parcela.subdivision || "Sin Loteo"}
            </td>
            <td className="py-4 px-6 text-on-surface whitespace-nowrap text-center border-r border-outline-variant font-semibold">
                $ {parcela.precioVenta.toLocaleString("es-CL")}
            </td>
            <td className="py-4 px-6 whitespace-nowrap text-center border-r border-outline-variant">
                <div className="flex items-center justify-center">
                    <ParcelaStatus status={parcela.estado} />
                </div>
            </td>
            <td className="py-4 px-6 text-center whitespace-nowrap">
                <div className="flex items-center justify-center">
                    <ParcelaActionsMenu
                        parcela={parcela}
                        onAssign={onAssign}
                        onEditParcela={onEditParcela}
                        onDeleteParcela={onDeleteParcela}
                    />
                </div>
            </td>
        </tr>
    );
}

