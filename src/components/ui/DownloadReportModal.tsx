import { useState } from "react";
import { getReporteData } from "../../services/api";
import { downloadReportDocx } from "../../utils/reportGenerator";
import { downloadReportCuotas } from "../../utils/cuotasReportGenerator";

type DownloadReportModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const MESES = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
];

const ANIOS = [2024, 2025, 2026, 2027];

export default function DownloadReportModal({
    isOpen,
    onClose,
}: DownloadReportModalProps) {
    const today = new Date();
    const [reportType, setReportType] = useState<"estado_cuenta" | "estado_cuenta_cuotas" | "cuotas_parcelas">("estado_cuenta");
    const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDownload = async () => {
        setLoading(true);
        setError(null);
        try {
            if (reportType === "estado_cuenta") {
                const data = await getReporteData(selectedMonth, selectedYear);
                downloadReportDocx(data);
            } else if (reportType === "estado_cuenta_cuotas") {
                const data = await getReporteData(selectedMonth, selectedYear, "credito");
                downloadReportDocx(data, "ESTADO DE CUENTA - SOLO CUOTAS", "Estado_Cuenta_Solo_Cuotas");
            } else {
                const data = await getReporteData(selectedMonth, selectedYear);
                downloadReportCuotas(data);
            }
            onClose();
        } catch (err) {
            console.error("Error al descargar el reporte:", err);
            setError("Ocurrió un error al obtener los datos del reporte.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-[24px]">file_download</span>
                        <h3 className="font-headline-md text-base font-bold text-on-surface">
                            Descargar Reporte
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Report Type Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-on-surface-variant">
                        Tipo de Reporte *
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        <button
                            type="button"
                            onClick={() => setReportType("estado_cuenta")}
                            disabled={loading}
                            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                reportType === "estado_cuenta"
                                    ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                                    : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">description</span>
                                <span className="text-xs">Estado de Cuenta</span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-normal">
                                Resumen ejecutivo y cobranzas del mes (Todos los contratos)
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setReportType("estado_cuenta_cuotas")}
                            disabled={loading}
                            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                reportType === "estado_cuenta_cuotas"
                                    ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                                    : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">payments</span>
                                <span className="text-xs">Estado de Cuenta (Solo Cuotas)</span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-normal">
                                Excluye pagos al contado y filtra solo ventas a crédito
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setReportType("cuotas_parcelas")}
                            disabled={loading}
                            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                reportType === "cuotas_parcelas"
                                    ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                                    : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">table_view</span>
                                <span className="text-xs">Cuotas Parcelas</span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-normal">
                                Listado completo de cuotas por lote
                            </span>
                        </button>
                    </div>
                </div>

                {/* Period Selectors */}
                <div className="flex flex-col gap-3 p-3 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant">
                            Mes del Reporte *
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            disabled={loading}
                            className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                        >
                            {MESES.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant">
                            Año *
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            disabled={loading}
                            className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                        >
                            {ANIOS.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/30">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={loading}
                        className="px-5 py-2 text-xs font-semibold bg-primary text-on-primary rounded-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {loading ? "hourglass_empty" : "download"}
                        </span>
                        <span>{loading ? "Generando..." : "Descargar PDF"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
