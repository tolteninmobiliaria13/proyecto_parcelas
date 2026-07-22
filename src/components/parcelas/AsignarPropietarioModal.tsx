import { useState, useEffect } from "react";
import { getClientes, asignarPropietario, getContratoDetalle, updateContrato } from "../../services/api";
import type { Cliente, AsignarPropietarioPayload } from "../../services/api";
import type { Parcela } from "../../types/parcela";

type AsignarPropietarioModalProps = {
    isOpen: boolean;
    parcela: Parcela | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function AsignarPropietarioModal({
    isOpen,
    parcela,
    onClose,
    onSuccess,
}: AsignarPropietarioModalProps) {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [clienteMode, setClienteMode] = useState<"existing" | "new">("new");

    // Form states
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const [clienteNombre, setClienteNombre] = useState("");
    const [clienteEmail, setClienteEmail] = useState("");
    const [clienteTelefono, setClienteTelefono] = useState("");

    const [fechaFirma, setFechaFirma] = useState(
        new Date().toISOString().substring(0, 10) // "YYYY-MM-DD"
    );
    const [pieInicial, setPieInicial] = useState("");
    const [totalCuotas, setTotalCuotas] = useState("12");
    const [montoCuota, setMontoCuota] = useState("");
    const [cuotasPagadas, setCuotasPagadas] = useState("0");

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = parcela ? (parcela.status !== "inactive") : false;

    // Fetch clients on mount when modal opens
    useEffect(() => {
        if (isOpen) {
            setLoadingClientes(true);
            getClientes()
                .then((data) => {
                    setClientes(data);
                    if (!isEditMode) {
                        if (data.length > 0) {
                            setClienteMode("existing");
                            setSelectedClienteId(data[0].id);
                        } else {
                            setClienteMode("new");
                        }
                    }
                })
                .catch((err) => {
                    console.error("Error al obtener clientes:", err);
                })
                .finally(() => {
                    if (!isEditMode) setLoadingClientes(false);
                });
        }
    }, [isOpen, isEditMode]);

    // Fetch contract details in edit mode
    useEffect(() => {
        if (isOpen && parcela && isEditMode) {
            setLoadingClientes(true);
            setError(null);
            getContratoDetalle(parcela.id)
                .then((detail) => {
                    setClienteMode("existing");
                    setSelectedClienteId(detail.cliente_id);
                    setFechaFirma(detail.fecha_pago);
                    setPieInicial(String(detail.pie_inicial));
                    setTotalCuotas(String(detail.total_cuotas));
                    setMontoCuota(String(detail.monto_cuota));
                    setCuotasPagadas(String(detail.cuotas_pagadas));
                })
                .catch((err) => {
                    console.error("Error al obtener detalle del contrato:", err);
                    setError("No se pudo cargar el detalle del contrato para este lote.");
                })
                .finally(() => {
                    setLoadingClientes(false);
                });
        } else if (isOpen && !isEditMode) {
            // Reset fields for new contract
            setClienteNombre("");
            setClienteEmail("");
            setClienteTelefono("");
            setPieInicial("");
            setTotalCuotas("12");
            setCuotasPagadas("0");
            setFechaFirma(new Date().toISOString().substring(0, 10));
            setError(null);
        }
    }, [isOpen, parcela, isEditMode]);

    // Auto-calculate suggested installment amount (only for new assignment)
    useEffect(() => {
        if (parcela && !isEditMode) {
            const pie = Number(pieInicial) || 0;
            const cuotas = Number(totalCuotas) || 1;
            const suggestion = Math.max(0, Math.round((parcela.precioVenta - pie) / cuotas));
            setMontoCuota(String(suggestion));
        }
    }, [parcela, pieInicial, totalCuotas, isEditMode]);


    if (!isOpen || !parcela) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSubmit(true);
        setError(null);

        // Validation
        if (clienteMode === "new" && !clienteNombre.trim()) {
            setError("El nombre del nuevo cliente es obligatorio.");
            setLoadingSubmit(false);
            return;
        }
        if (clienteMode === "existing" && !selectedClienteId) {
            setError("Debes seleccionar un cliente existente.");
            setLoadingSubmit(false);
            return;
        }
        if (!fechaFirma) {
            setError("La fecha de firma del contrato es obligatoria.");
            setLoadingSubmit(false);
            return;
        }
        if (Number(pieInicial) < 0) {
            setError("El pie inicial no puede ser negativo.");
            setLoadingSubmit(false);
            return;
        }
        if (Number(totalCuotas) <= 0) {
            setError("La cantidad de cuotas debe ser mayor a 0.");
            setLoadingSubmit(false);
            return;
        }
        if (Number(montoCuota) <= 0) {
            setError("El monto de la cuota debe ser mayor a 0.");
            setLoadingSubmit(false);
            return;
        }
        if (Number(cuotasPagadas) < 0) {
            setError("Las cuotas pagadas no pueden ser negativas.");
            setLoadingSubmit(false);
            return;
        }
        if (Number(cuotasPagadas) > Number(totalCuotas)) {
            setError("Las cuotas pagadas no pueden superar la cantidad total de cuotas.");
            setLoadingSubmit(false);
            return;
        }

        const payload: AsignarPropietarioPayload = {
            fecha_pago: fechaFirma,
            pie_inicial: Number(pieInicial) || 0,
            total_cuotas: Number(totalCuotas),
            monto_cuota: Number(montoCuota),
            cuotas_pagadas: Number(cuotasPagadas),
        };

        if (clienteMode === "existing") {
            payload.cliente_id = selectedClienteId;
        } else {
            payload.cliente_nombre = clienteNombre.trim();
            payload.cliente_email = clienteEmail.trim() || null;
            payload.cliente_telefono = clienteTelefono.trim() || null;
        }

        try {
            if (isEditMode) {
                await updateContrato(parcela.id, payload);
            } else {
                await asignarPropietario(parcela.id, payload);
            }
            onSuccess();
            onClose();
            // Reset states
            setClienteNombre("");
            setClienteEmail("");
            setClienteTelefono("");
            setPieInicial("");
            setTotalCuotas("12");
            setCuotasPagadas("0");
        } catch (err: any) {
            console.error("Error al asignar propietario:", err);
            let errMsg = "Ocurrió un error al guardar el contrato. Por favor, intenta de nuevo.";
            if (err.response?.data?.detail) {
                const details = err.response.data.detail;
                if (Array.isArray(details)) {
                    errMsg = details.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join(', ');
                } else if (typeof details === 'string') {
                    errMsg = details;
                }
            } else if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            }
            setError(errMsg);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-md animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-lg w-full overflow-hidden p-6 flex flex-col gap-md animate-scale-up"
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
                    <div>
                        <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-bold">
                            {isEditMode ? "Editar Contrato / Dueño" : "Asignar Propietario"}
                        </h3>
                        <p className="text-[12px] text-on-surface-variant">
                            {isEditMode 
                                ? `Modifica las condiciones contractuales del lote: ${parcela.id}`
                                : `Asocia un contrato de venta al lote: ${parcela.id} (Valor Base: $ ${parcela.precioVenta.toLocaleString("es-CL")})`}
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
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                    {/* Modo de Cliente */}
                    {clientes.length > 0 && (
                        <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/40">
                            <button
                                type="button"
                                onClick={() => setClienteMode("existing")}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                    clienteMode === "existing"
                                        ? "bg-surface-container-lowest text-primary shadow-xs"
                                        : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                                Seleccionar Existente
                            </button>
                            <button
                                type="button"
                                onClick={() => setClienteMode("new")}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                    clienteMode === "new"
                                        ? "bg-surface-container-lowest text-primary shadow-xs"
                                        : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                                Crear Nuevo Cliente
                            </button>
                        </div>
                    )}

                    {/* Datos del Cliente */}
                    <div className="flex flex-col gap-3 p-3 bg-surface-container-low/40 border border-outline-variant/30 rounded-lg">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">
                            Información del Propietario
                        </span>
                        
                        {clienteMode === "existing" ? (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface-variant">
                                    Seleccionar Cliente *
                                </label>
                                {loadingClientes ? (
                                    <div className="h-9 animate-pulse bg-outline-variant/20 rounded-lg"></div>
                                ) : (
                                    <select
                                        value={selectedClienteId}
                                        onChange={(e) => setSelectedClienteId(e.target.value)}
                                        disabled={loadingSubmit}
                                        className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none animate-fade-in"
                                    >
                                        {clientes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre_completo}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                                <div className="flex flex-col gap-1 sm:col-span-2">
                                    <label className="text-xs font-semibold text-on-surface-variant">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan Pérez"
                                        value={clienteNombre}
                                        onChange={(e) => setClienteNombre(e.target.value)}
                                        disabled={loadingSubmit}
                                        className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-on-surface-variant">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="juan.perez@email.com"
                                        value={clienteEmail}
                                        onChange={(e) => setClienteEmail(e.target.value)}
                                        disabled={loadingSubmit}
                                        className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-on-surface-variant">
                                        Teléfono de Contacto
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+56 9 1234 5678"
                                        value={clienteTelefono}
                                        onChange={(e) => setClienteTelefono(e.target.value)}
                                        disabled={loadingSubmit}
                                        className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Datos del Contrato */}
                    <div className="flex flex-col gap-3 p-3 bg-surface-container-low/40 border border-outline-variant/30 rounded-lg">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">
                            Condiciones del Contrato de Venta
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Fecha de Firma */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface-variant">
                                    Fecha de Firma *
                                </label>
                                <input
                                    type="date"
                                    value={fechaFirma}
                                    onChange={(e) => setFechaFirma(e.target.value)}
                                    disabled={loadingSubmit}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none"
                                    required
                                />
                            </div>

                            {/* Pie Inicial */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface-variant">
                                    Pie Inicial (CLP) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Ej: 3000000"
                                    value={pieInicial}
                                    onChange={(e) => setPieInicial(e.target.value)}
                                    disabled={loadingSubmit}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                    required
                                />
                            </div>

                            {/* Total Cuotas */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface-variant">
                                    Cantidad de Cuotas *
                                </label>
                                <input
                                    type="number"
                                    value={totalCuotas}
                                    onChange={(e) => setTotalCuotas(e.target.value)}
                                    disabled={loadingSubmit}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                    required
                                />
                            </div>

                            {/* Cuotas Pagadas */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface-variant">
                                    Cuotas Pagadas al momento *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={totalCuotas}
                                    value={cuotasPagadas}
                                    onChange={(e) => setCuotasPagadas(e.target.value)}
                                    disabled={loadingSubmit}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                    required
                                />
                            </div>

                            {/* Valor Cuota */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface-variant">
                                    Valor Cuota Estimada (CLP) *
                                </label>
                                <input
                                    type="number"
                                    value={montoCuota}
                                    onChange={(e) => setMontoCuota(e.target.value)}
                                    disabled={loadingSubmit}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                    required
                                />
                            </div>
                        </div>

                        {/* Resumen Financiero */}
                        {(pieInicial || totalCuotas || montoCuota || cuotasPagadas) && (
                            <div className="mt-3 p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-xs flex flex-col gap-1.5 font-medium">
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Monto Total Contrato:</span>
                                    <span className="text-on-surface font-semibold">
                                        $ { (Number(pieInicial) + (Number(totalCuotas) * (Number(montoCuota) || 0))).toLocaleString("es-CL") }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Abonado (Pie + Pagos):</span>
                                    <span className="text-emerald-600 font-bold">
                                        $ { (Number(pieInicial) + (Number(cuotasPagadas) * (Number(montoCuota) || 0))).toLocaleString("es-CL") }
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-outline-variant/40 pt-1.5 font-bold">
                                    <span className="text-on-surface">Saldo Pendiente:</span>
                                    <span className="text-primary">
                                        $ { (Math.max(0, (Number(totalCuotas) - Number(cuotasPagadas)) * (Number(montoCuota) || 0))).toLocaleString("es-CL") }
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/60 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loadingSubmit}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loadingSubmit}
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loadingSubmit ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span>Asignando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                    <span>Confirmar Venta</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
