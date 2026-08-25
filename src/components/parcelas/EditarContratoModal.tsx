import { useState, useEffect } from "react";
import { getContratoDetalle, updateContrato } from "../../services/api";
import type { AsignarPropietarioPayload } from "../../services/api";
import type { Parcela } from "../../types/parcela";

type EditarContratoModalProps = {
    isOpen: boolean;
    parcela: Parcela | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function EditarContratoModal({
    isOpen,
    parcela,
    onClose,
    onSuccess,
}: EditarContratoModalProps) {
    const [clienteId, setClienteId] = useState("");
    const [clienteNombre, setClienteNombre] = useState("");

    const [fechaPago, setFechaPago] = useState(
        new Date().toISOString().substring(0, 10)
    );
    const [modalidad, setModalidad] = useState<"credito" | "contado">("credito");
    const [pieInicial, setPieInicial] = useState("");
    const [totalCuotas, setTotalCuotas] = useState("12");
    const [montoCuota, setMontoCuota] = useState("");
    const [cuotasPagadas, setCuotasPagadas] = useState("0");

    const [loadingData, setLoadingData] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleModalidadChange = (newModalidad: "credito" | "contado") => {
        setModalidad(newModalidad);
        if (newModalidad === "contado" && parcela) {
            setPieInicial("0");
            setTotalCuotas("1");
            setMontoCuota(String(parcela.precioVenta));
            setCuotasPagadas("1");
        } else if (newModalidad === "credito") {
            setPieInicial("");
            setTotalCuotas("12");
            setMontoCuota("");
            setCuotasPagadas("0");
        }
    };

    useEffect(() => {
        if (isOpen && parcela) {
            setLoadingData(true);
            setError(null);
            getContratoDetalle(parcela.id)
                .then((detail) => {
                    setClienteId(detail.cliente_id);
                    setClienteNombre(detail.cliente_nombre);
                    setFechaPago(detail.fecha_pago);
                    setPieInicial(String(detail.pie_inicial));
                    setTotalCuotas(String(detail.total_cuotas));
                    setMontoCuota(String(detail.monto_cuota));
                    setCuotasPagadas(String(detail.cuotas_pagadas));
                    if (detail.tipo_pago) {
                        setModalidad(detail.tipo_pago);
                    } else if (detail.total_cuotas <= 1) {
                        setModalidad("contado");
                    } else {
                        setModalidad("credito");
                    }
                })
                .catch((err) => {
                    console.error("Error al obtener detalle del contrato:", err);
                    setError("No se pudo cargar el detalle del contrato para este lote.");
                })
                .finally(() => {
                    setLoadingData(false);
                });
        }
    }, [isOpen, parcela?.id]);

    if (!isOpen || !parcela) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSubmit(true);
        setError(null);

        if (!fechaPago) {
            setError("La fecha asignada de pago es obligatoria.");
            setLoadingSubmit(false);
            return;
        }
        if (Number(pieInicial) < 0) {
            setError("El pie inicial no puede ser negativo.");
            setLoadingSubmit(false);
            return;
        }
        if (modalidad === "credito") {
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
        }

        const payload: AsignarPropietarioPayload = {
            cliente_id: clienteId || undefined,
            fecha_pago: fechaPago,
            pie_inicial: Number(pieInicial) || 0,
            total_cuotas: Number(totalCuotas),
            monto_cuota: Number(montoCuota),
            cuotas_pagadas: Number(cuotasPagadas),
            tipo_pago: modalidad,
        };

        try {
            await updateContrato(parcela.id, payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error al actualizar contrato:", err);
            let errMsg = "Ocurrió un error al guardar las condiciones del contrato.";
            if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            } else if (err.response?.data?.detail) {
                const details = err.response.data.detail;
                if (typeof details === "string") {
                    errMsg = details;
                } else if (Array.isArray(details)) {
                    errMsg = details.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join(', ');
                }
            }
            setError(errMsg);
        } finally {
            setLoadingSubmit(false);
        }
    };

    const numPie = Number(pieInicial) || 0;
    const numCuotas = Number(totalCuotas) || 1;
    const numMonto = Number(montoCuota) || 0;
    const numPagadas = Number(cuotasPagadas) || 0;
    const totalContrato = numPie + (numCuotas * numMonto);
    const abonoCalculado = numPie + (numPagadas * numMonto);
    const saldoCalculado = (numCuotas - numPagadas) * numMonto;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-md animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-lg w-full overflow-hidden p-5 sm:p-6 flex flex-col gap-4 animate-scale-up max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[22px]">description</span>
                        </div>
                        <div>
                            <h3 className="font-headline-md text-base text-on-surface font-bold">
                                Editar Contrato de Venta
                            </h3>
                            <p className="text-[12px] text-on-surface-variant">
                                Lote: <span className="font-semibold text-primary">{parcela.id}</span>
                                {clienteNombre && ` — Titular: ${clienteNombre}`}
                            </p>
                        </div>
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

                {loadingData ? (
                    <div className="py-8 text-center text-xs text-on-surface-variant">
                        Cargando condiciones del contrato...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Selector Modalidad */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-on-surface">Modalidad de Venta</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleModalidadChange("credito")}
                                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                        modalidad === "credito"
                                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                                            : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                                    Crédito Directo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleModalidadChange("contado")}
                                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                        modalidad === "contado"
                                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                                            : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                    Al Contado
                                </button>
                            </div>
                        </div>

                        {/* Condiciones Financieras */}
                        <div className="flex flex-col gap-3 p-3.5 bg-surface-container-low/50 rounded-lg border border-outline-variant/30 text-xs">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-on-surface">
                                    Fecha Asignada de Pago (Día de vencimiento) *
                                </label>
                                <input
                                    type="date"
                                    value={fechaPago}
                                    onChange={(e) => setFechaPago(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-on-surface">
                                    Pie Inicial (CLP)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={pieInicial}
                                    onChange={(e) => setPieInicial(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-on-surface">
                                    {modalidad === "contado" ? "Pago Único" : "Total Cuotas *"}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    disabled={modalidad === "contado"}
                                    value={totalCuotas}
                                    onChange={(e) => setTotalCuotas(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:opacity-60 font-mono"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-on-surface">
                                    {modalidad === "contado" ? "Monto Total Venta (CLP)" : "Monto por Cuota (CLP) *"}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    value={montoCuota}
                                    onChange={(e) => setMontoCuota(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-on-surface">
                                    Cuotas ya Pagadas
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={totalCuotas}
                                    value={cuotasPagadas}
                                    onChange={(e) => setCuotasPagadas(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono"
                                />
                            </div>
                        </div>

                        {/* Resumen Calculado */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40 text-center">
                            <div>
                                <span className="text-[10px] text-on-surface-variant block uppercase font-medium">Total Contrato</span>
                                <span className="text-xs font-bold text-on-surface font-mono">
                                    $ {totalContrato.toLocaleString("es-CL")}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-on-surface-variant block uppercase font-medium">Abono Total</span>
                                <span className="text-xs font-bold text-primary font-mono">
                                    $ {abonoCalculado.toLocaleString("es-CL")}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-on-surface-variant block uppercase font-medium">Saldo Pendiente</span>
                                <span className="text-xs font-bold text-error font-mono">
                                    $ {saldoCalculado.toLocaleString("es-CL")}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/60">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loadingSubmit}
                                className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loadingSubmit || loadingData}
                                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                            >
                                {loadingSubmit ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[16px]">save</span>
                                        <span>Guardar Cambios de Contrato</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
