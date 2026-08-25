import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import type { Parcela } from "../../types/parcela";
import ParcelaStatus from "../parcelas/ParcelaStatus";

type ContratoRowProps = {
    parcela: Parcela;
    onEditOwner: () => void;
    onEditContrato: () => void;
};

function getInitials(name: string) {
    if (name === "Sin Asignar") return "ND";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function getAvatarClasses(name: string, status: string) {
    if (name === "Sin Asignar") {
        return "bg-surface-variant text-on-surface-variant";
    }
    if (status === "overdue") {
        return "bg-tertiary-container text-on-tertiary-container";
    }
    return "bg-secondary-container text-on-secondary-container";
}

type ContratoActionsMenuProps = {
    parcela: Parcela;
    onEditOwner: () => void;
    onEditContrato: () => void;
};

function ContratoActionsMenu({
    parcela,
    onEditOwner,
    onEditContrato,
}: ContratoActionsMenuProps) {
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
                aria-label="Opciones de contrato"
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
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate(`/pagos?lote=${encodeURIComponent(parcela.id)}`);
                            }}
                            className="w-full px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                            <span>Ver pagos</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onEditOwner();
                            }}
                            className="w-full px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-medium border-t border-outline-variant/30"
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                            <span>Cambiar Propietario</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onEditContrato();
                            }}
                            className="w-full px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-medium border-t border-outline-variant/30"
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary">description</span>
                            <span>Editar Contrato</span>
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}

export function ContratoCard({
    parcela,
    onEditOwner,
    onEditContrato,
}: ContratoRowProps) {
    const initials = getInitials(parcela.owner);
    const avatarClasses = getAvatarClasses(parcela.owner, parcela.status);

    const isContado = parcela.tipo_pago === "contado" || (parcela.total_cuotas || 0) <= 1;

    return (
        <div className="p-4 bg-surface-container-lowest flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-base">{parcela.id}</span>
                    <span className="text-xs text-on-surface-variant font-mono bg-surface-container px-2 py-0.5 rounded">
                        ROL: {parcela.escritura || "S/N"}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <ParcelaStatus status={parcela.status} />
                    <ContratoActionsMenu
                        parcela={parcela}
                        onEditOwner={onEditOwner}
                        onEditContrato={onEditContrato}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${avatarClasses} flex items-center justify-center font-bold text-xs shrink-0`}>
                    {initials}
                </div>
                <span className="font-medium text-on-surface text-sm">{parcela.owner}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low/60 p-2.5 rounded-lg border border-outline-variant/30">
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Cuotas</span>
                    <span className="font-semibold text-on-surface">
                        {isContado ? "Al Contado" : `${parcela.cuotas_pagadas || 0} / ${parcela.total_cuotas || 0}`}
                    </span>
                </div>
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Abono</span>
                    <span className="font-semibold text-emerald-600">$ {parcela.abono.toLocaleString("es-CL")}</span>
                </div>
            </div>
        </div>
    );
}

export default function ContratoRow({
    parcela,
    onEditOwner,
    onEditContrato,
}: ContratoRowProps) {
    const initials = getInitials(parcela.owner);
    const avatarClasses = getAvatarClasses(parcela.owner, parcela.status);
    const isContado = parcela.tipo_pago === "contado" || (parcela.total_cuotas || 0) <= 1;

    return (
        <tr className="hover:bg-surface-container/60 transition-colors group text-center">
            {/* Lote */}
            <td className="py-4 px-4 font-bold text-primary whitespace-nowrap text-center border-r border-outline-variant">
                {parcela.id}
            </td>
            {/* Propietario */}
            <td className="py-4 px-4 whitespace-nowrap text-center border-r border-outline-variant">
                <div className="flex items-center justify-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarClasses} flex items-center justify-center font-bold text-xs shrink-0`}>
                        {initials}
                    </div>
                    <span className="font-medium text-on-surface">{parcela.owner}</span>
                </div>
            </td>
            {/* Escritura / ROL */}
            <td className="py-4 px-4 text-on-surface-variant whitespace-nowrap text-center border-r border-outline-variant font-mono text-xs">
                {parcela.escritura || "-"}
            </td>
            {/* Cuotas */}
            <td className="py-4 px-4 whitespace-nowrap text-center border-r border-outline-variant font-medium text-xs">
                {isContado ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 rounded-full font-semibold">
                        Al Contado
                    </span>
                ) : (
                    <span className="px-2.5 py-1 bg-surface-container text-on-surface rounded-full font-mono font-semibold">
                        {parcela.cuotas_pagadas || 0} / {parcela.total_cuotas || 0}
                    </span>
                )}
            </td>
            {/* Abono */}
            <td className="py-4 px-4 text-emerald-600 whitespace-nowrap text-center border-r border-outline-variant font-semibold">
                $ {parcela.abono.toLocaleString("es-CL")}
            </td>
            {/* Estado */}
            <td className="py-4 px-4 whitespace-nowrap text-center border-r border-outline-variant">
                <div className="flex items-center justify-center">
                    <ParcelaStatus status={parcela.status} />
                </div>
            </td>
            {/* Acciones */}
            <td className="py-4 px-4 text-center whitespace-nowrap">
                <div className="flex items-center justify-center">
                    <ContratoActionsMenu
                        parcela={parcela}
                        onEditOwner={onEditOwner}
                        onEditContrato={onEditContrato}
                    />
                </div>
            </td>
        </tr>
    );
}
