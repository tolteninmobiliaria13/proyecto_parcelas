import { useState, useEffect, useRef } from "react";
import {
    getClientes,
    getParcelas,
    asignarPropietario,
    clearCache,
    type Cliente,
    type AsignarPropietarioPayload,
} from "../../services/api";
import type { Parcela } from "../../types/parcela";
import { sortParcelasByLote } from "../../utils/loteSort";
import NuevoClienteModal from "../clientes/NuevoClienteModal";

type CrearContratoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CrearContratoModal({
    isOpen,
    onClose,
    onSuccess,
}: CrearContratoModalProps) {
    const [parcelasDisponibles, setParcelasDisponibles] = useState<Parcela[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [selectedLoteId, setSelectedLoteId] = useState<string>("");
    const [selectedClienteId, setSelectedClienteId] = useState<string>("");
    const [clientSearchQuery, setClientSearchQuery] = useState("");
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
    const clientDropdownRef = useRef<HTMLDivElement>(null);

    // Financial conditions
    const [modalidad, setModalidad] = useState<"credito" | "contado">("credito");
    const [fechaPago, setFechaPago] = useState("");
    const [pieInicial, setPieInicial] = useState<number | string>(0);
    const [totalCuotas, setTotalCuotas] = useState<number | string>(24);
    const [montoCuota, setMontoCuota] = useState<number | string>(0);
    const [cuotasPagadas, setCuotasPagadas] = useState<number | string>(0);

    const loadInitialData = async (preselectClienteId?: string) => {
        setLoadingData(true);
        setError(null);
        try {
            clearCache("clientes");
            const [parcelasRes, clientesRes] = await Promise.all([
                getParcelas(1, 1000),
                getClientes(),
            ]);

            // Filtrar únicamente parcelas con estado disponible o reservada
            const disponibles = (parcelasRes.items || []).filter(
                (p) => p.estado === "disponible" || p.estado === "reservada"
            );
            const sorted = sortParcelasByLote(disponibles);
            setParcelasDisponibles(sorted);

            if (sorted.length > 0 && !selectedLoteId) {
                setSelectedLoteId(sorted[0].id);
                const pBase = sorted[0].precioVenta || 0;
                const pie = Math.round(pBase * 0.1);
                setPieInicial(pie);
                setMontoCuota(Math.round((pBase - pie) / 24));
            }

            setClientes(clientesRes);
            if (preselectClienteId) {
                setSelectedClienteId(preselectClienteId);
            }
        } catch (err: any) {
            console.error("Error al cargar datos para contrato:", err);
            setError("No se pudieron cargar los lotes disponibles o la lista de clientes.");
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const todayIso = new Date().toISOString().split("T")[0];
            setFechaPago(todayIso);
            setSelectedClienteId("");
            setClientSearchQuery("");
            setIsClientDropdownOpen(false);
            setModalidad("credito");
            setTotalCuotas(24);
            setCuotasPagadas(0);
            loadInitialData();
        }
    }, [isOpen]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                clientDropdownRef.current &&
                !clientDropdownRef.current.contains(event.target as Node)
            ) {
                setIsClientDropdownOpen(false);
            }
        };

        if (isClientDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isClientDropdownOpen]);

    const handleParcelaChange = (loteId: string) => {
        setSelectedLoteId(loteId);
        const selected = parcelasDisponibles.find((p) => p.id === loteId);
        if (selected) {
            const pBase = selected.precioVenta || 0;
            if (modalidad === "contado") {
                setPieInicial(pBase);
                setMontoCuota(pBase);
            } else {
                const pie = Math.round(pBase * 0.1);
                setPieInicial(pie);
                const cCount = Number(totalCuotas) || 24;
                setMontoCuota(Math.round((pBase - pie) / cCount));
            }
        }
    };

    const handleModalidadChange = (newModalidad: "credito" | "contado") => {
        setModalidad(newModalidad);
        const selected = parcelasDisponibles.find((p) => p.id === selectedLoteId);
        const pBase = selected?.precioVenta || 0;

        if (newModalidad === "contado") {
            setTotalCuotas(1);
            setMontoCuota(pBase);
            setPieInicial(pBase);
            setCuotasPagadas(1);
        } else {
            setTotalCuotas(24);
            setCuotasPagadas(0);
            const pie = Math.round(pBase * 0.1);
            setPieInicial(pie);
            setMontoCuota(Math.round((pBase - pie) / 24));
        }
    };

    const handleNewClientSuccess = async () => {
        setIsNewClientModalOpen(false);
        clearCache("clientes");
        try {
            const updatedClientes = await getClientes();
            setClientes(updatedClientes);
            if (updatedClientes.length > 0) {
                // Seleccionar el último cliente registrado
                const nuevo = updatedClientes[updatedClientes.length - 1];
                setSelectedClienteId(nuevo.id);
                setClientSearchQuery("");
            }
        } catch (e) {
            console.error("Error al refrescar clientes tras crear uno nuevo:", e);
        }
    };

    const filteredClientes = clientes.filter((c) => {
        const q = clientSearchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            (c.nombre_completo && c.nombre_completo.toLowerCase().includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q)) ||
            (c.telefono && c.telefono.toLowerCase().includes(q))
        );
    });

    const selectedCliente = clientes.find((c) => c.id === selectedClienteId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoteId) {
            setError("Debes seleccionar una parcela.");
            return;
        }

        if (!selectedClienteId) {
            setError("Debes seleccionar un cliente titular.");
            return;
        }

        if (!fechaPago) {
            setError("Debes seleccionar una fecha de pago.");
            return;
        }

        setLoadingSubmit(true);
        setError(null);

        try {
            const payload: AsignarPropietarioPayload = {
                cliente_id: selectedClienteId,
                fecha_pago: fechaPago,
                pie_inicial: Number(pieInicial) || 0,
                total_cuotas: modalidad === "contado" ? 1 : Number(totalCuotas) || 1,
                monto_cuota: Number(montoCuota) || 0,
                cuotas_pagadas: modalidad === "contado" ? 1 : Number(cuotasPagadas) || 0,
                tipo_pago: modalidad,
            };

            await asignarPropietario(selectedLoteId, payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error al crear contrato:", err);
            setError(err.response?.data?.detail || err.response?.data?.message || "Ocurrió un error al crear el contrato.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-md animate-fade-in"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-md w-full overflow-hidden p-6 flex flex-col gap-4 animate-scale-up max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
                        <div>
                            <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[22px]">description</span>
                                Nuevo Contrato
                            </h3>
                            <p className="text-[12px] text-on-surface-variant mt-0.5">
                                Genera un contrato de venta para una parcela disponible o reservada.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                            aria-label="Cerrar modal"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form Continuo y Ameno */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 overflow-y-auto pr-1">
                        {/* Parcela */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-on-surface">
                                Parcela (Disponible o Reservada) *
                            </label>
                            {loadingData ? (
                                <div className="h-9 bg-outline-variant/20 rounded-lg animate-pulse"></div>
                            ) : parcelasDisponibles.length === 0 ? (
                                <div className="p-3 rounded-lg bg-error/10 text-error text-xs">
                                    No hay parcelas disponibles o reservadas en este momento.
                                </div>
                            ) : (
                                <select
                                    value={selectedLoteId}
                                    onChange={(e) => handleParcelaChange(e.target.value)}
                                    disabled={loadingSubmit}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-xs sm:text-sm outline-none shadow-xs cursor-pointer font-medium"
                                    required
                                >
                                    {parcelasDisponibles.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.estado === "disponible" ? "🟢" : "🟡"} {p.id}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Cliente con Búsqueda de Texto */}
                        <div className="flex flex-col gap-1 relative" ref={clientDropdownRef}>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-on-surface">
                                    Cliente Titular *
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsNewClientModalOpen(true)}
                                    className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-0.5"
                                >
                                    <span className="material-symbols-outlined text-[14px]">add</span>
                                    <span>Nuevo cliente</span>
                                </button>
                            </div>

                            {/* Selector / Input de Búsqueda */}
                            <div className="relative">
                                <div
                                    onClick={() => setIsClientDropdownOpen(true)}
                                    className="flex items-center justify-between px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary w-full text-xs sm:text-sm shadow-xs cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">
                                            search
                                        </span>
                                        <input
                                            type="text"
                                            placeholder={selectedCliente ? selectedCliente.nombre_completo : "Buscar cliente por nombre o contacto..."}
                                            value={clientSearchQuery}
                                            onChange={(e) => {
                                                setClientSearchQuery(e.target.value);
                                                setIsClientDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsClientDropdownOpen(true)}
                                            className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant font-medium"
                                        />
                                    </div>
                                    {selectedCliente && !clientSearchQuery && (
                                        <span className="text-[11px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded shrink-0">
                                            Seleccionado
                                        </span>
                                    )}
                                </div>

                                {/* Desplegable de Resultados */}
                                {isClientDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-outline-variant/30">
                                        {filteredClientes.length === 0 ? (
                                            <div className="p-3 text-center text-xs text-on-surface-variant">
                                                <p>No se encontraron clientes coincidentes.</p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsClientDropdownOpen(false);
                                                        setIsNewClientModalOpen(true);
                                                    }}
                                                    className="mt-1 text-primary font-semibold hover:underline"
                                                >
                                                    + Crear este nuevo cliente
                                                </button>
                                            </div>
                                        ) : (
                                            filteredClientes.map((c) => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => {
                                                        setSelectedClienteId(c.id);
                                                        setClientSearchQuery("");
                                                        setIsClientDropdownOpen(false);
                                                    }}
                                                    className={`p-2.5 hover:bg-surface-container-low cursor-pointer transition-colors text-left flex flex-col ${
                                                        c.id === selectedClienteId ? "bg-primary/5 font-semibold text-primary" : "text-on-surface"
                                                    }`}
                                                >
                                                    <span className="text-xs sm:text-sm font-medium">{c.nombre_completo}</span>
                                                    <span className="text-[11px] text-on-surface-variant">
                                                        {c.email || c.telefono || "Sin información de contacto"}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modalidad de Venta */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-on-surface">
                                Modalidad de Venta *
                            </label>
                            <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/40">
                                <button
                                    type="button"
                                    onClick={() => handleModalidadChange("credito")}
                                    disabled={loadingSubmit}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        modalidad === "credito" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface-variant"
                                    }`}
                                >
                                    Con Cuotas (Crédito)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleModalidadChange("contado")}
                                    disabled={loadingSubmit}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        modalidad === "contado" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface-variant"
                                    }`}
                                >
                                    Al Contado
                                </button>
                            </div>
                        </div>

                        {/* Fecha de Pago */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-on-surface">
                                {modalidad === "contado" ? "Fecha de Pago *" : "Fecha Asignada de Pago *"}
                            </label>
                            <input
                                type="date"
                                value={fechaPago}
                                onChange={(e) => setFechaPago(e.target.value)}
                                disabled={loadingSubmit}
                                className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-xs sm:text-sm outline-none cursor-pointer"
                                required
                            />
                        </div>

                        {/* Abono / Pie */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-on-surface">
                                {modalidad === "contado" ? "Monto Total al Contado (CLP) *" : "Abono / Pie Inicial (CLP) *"}
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={pieInicial}
                                onChange={(e) => setPieInicial(e.target.value)}
                                disabled={loadingSubmit}
                                className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-xs sm:text-sm outline-none font-mono"
                                required
                            />
                        </div>

                        {modalidad === "credito" && (
                            <>
                                {/* Total de Cuotas */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-on-surface">
                                        Cantidad de Cuotas *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={totalCuotas}
                                        onChange={(e) => setTotalCuotas(e.target.value)}
                                        disabled={loadingSubmit}
                                        className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-xs sm:text-sm outline-none font-mono"
                                        required
                                    />
                                </div>

                                {/* Cuotas Pagadas */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-on-surface">
                                        Cuotas Pagadas al momento *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={totalCuotas}
                                        value={cuotasPagadas}
                                        onChange={(e) => setCuotasPagadas(e.target.value)}
                                        disabled={loadingSubmit}
                                        className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-xs sm:text-sm outline-none font-mono"
                                        required
                                    />
                                </div>

                                {/* Monto de Cuota */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-on-surface">
                                        Valor Cuota Estimada (CLP) *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={montoCuota}
                                        onChange={(e) => setMontoCuota(e.target.value)}
                                        disabled={loadingSubmit}
                                        className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-xs sm:text-sm outline-none font-mono"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/60 mt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loadingSubmit}
                                className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loadingSubmit || parcelasDisponibles.length === 0 || !selectedClienteId}
                                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {loadingSubmit ? (
                                    <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                        <span>Crear Contrato</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de Nuevo Cliente */}
            {isNewClientModalOpen && (
                <NuevoClienteModal
                    isOpen={isNewClientModalOpen}
                    cliente={null}
                    onClose={() => setIsNewClientModalOpen(false)}
                    onSuccess={handleNewClientSuccess}
                />
            )}
        </>
    );
}
