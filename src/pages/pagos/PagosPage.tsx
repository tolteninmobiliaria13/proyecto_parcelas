import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getVencimientos, actualizarPago } from '../../services/api';
import { PagosHeader } from '../../components/pagos/PagosHeader';
import { PagosTable } from '../../components/pagos/PagosTable';
import type { LotPaymentMatrix, MonthlyPayment } from '../../types/payment';

export const PagosPage = () => {
    const [searchParams] = useSearchParams();
    const targetLote = searchParams.get('lote') || '';
    const urlYear = searchParams.get('year');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(urlYear || String(new Date().getFullYear()));
    const [selectedStatus, setSelectedStatus] = useState('Todos');

    useEffect(() => {
        if (urlYear && urlYear !== selectedYear) {
            setSelectedYear(urlYear);
        }
    }, [urlYear]);
    const [selectedCell, setSelectedCell] = useState<{
        lot: LotPaymentMatrix;
        payment: MonthlyPayment;
    } | null>(null);

    // Edit states for individual payments
    const [editAmount, setEditAmount] = useState(0);
    const [editDueDate, setEditDueDate] = useState("");
    const [editPaidDate, setEditPaidDate] = useState("");
    const [editStatus, setEditStatus] = useState<string>("pending");
    const [loadingSavePayment, setLoadingSavePayment] = useState(false);

    const [matrixData, setMatrixData] = useState<LotPaymentMatrix[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getVencimientos(Number(selectedYear))
            .then((data) => {
                setMatrixData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener matriz de pagos:", err);
                setError("No se pudieron cargar los pagos.");
                setLoading(false);
            });
    }, [selectedYear]);

    // Sync selectedCell details to edit form states
    useEffect(() => {
        if (selectedCell) {
            setEditAmount(selectedCell.payment.amount);
            const toISO = (dateStr?: string) => {
                if (!dateStr) return "";
                const parts = dateStr.split("/");
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                return dateStr;
            };
            setEditDueDate(toISO(selectedCell.payment.dueDate));
            setEditPaidDate(toISO(selectedCell.payment.paidDate));
            setEditStatus(selectedCell.payment.status);
        } else {
            setEditAmount(0);
            setEditDueDate("");
            setEditPaidDate("");
            setEditStatus("pending");
        }
    }, [selectedCell]);

    const handleSavePayment = async () => {
        if (!selectedCell) return;
        setLoadingSavePayment(true);
        try {
            const STATUS_MAP: Record<string, string> = {
                paid: 'pagado',
                overdue: 'vencido',
                pending: 'pendiente',
                pagado: 'pagado',
                vencido: 'vencido',
                pendiente: 'pendiente',
            };
            await actualizarPago(selectedCell.payment.id || '', {
                monto_cobrar: editAmount,
                fecha_vencimiento: editDueDate || undefined,
                fecha_pago_real: editStatus === "paid" || editStatus === "pagado" ? (editPaidDate || editDueDate || undefined) : null,
                estado: STATUS_MAP[editStatus] || editStatus,
            });
            const data = await getVencimientos(Number(selectedYear));
            setMatrixData(data);
            setSelectedCell(null);
        } catch (err: any) {
            console.error("Error al guardar cuota:", err);
            alert(err.response?.data?.message || "Ocurrió un error al guardar los cambios de la cuota.");
        } finally {
            setLoadingSavePayment(false);
        }
    };

    // Client-side filtering across the data
    const filteredData = useMemo(() => {
        return matrixData.filter((row) => {
            // Text Search filter
            const matchesSearch =
                row.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (row.project && row.project.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter (based on presence of payments status in that row)
            let matchesStatus = true;
            if (selectedStatus === 'Solo Vencidos') {
                matchesStatus = row.overdueMonths > 0;
            } else if (selectedStatus === 'Al Día') {
                matchesStatus = row.overdueMonths === 0;
            }

            return matchesSearch && matchesStatus;
        });
    }, [matrixData, searchTerm, selectedStatus]);

    const handleCellClick = (lot: LotPaymentMatrix, payment: MonthlyPayment) => {
        setSelectedCell({ lot, payment });
    };

    return (
        <DashboardLayout>
            <div className="space-y-lg max-w-[1400px] mx-auto">
                {/* Header Controls */}
                <PagosHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                />

                {/* Main Interactive Matrix Table */}
                <PagosTable
                    data={filteredData}
                    selectedYear={selectedYear}
                    onCellClick={handleCellClick}
                    loading={loading}
                    error={error}
                    targetLote={targetLote}
                />
            </div>

            {/* Modal Detalle / Edición de Cuota */}
            {selectedCell && (
                <div
                    onClick={() => setSelectedCell(null)}
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-md animate-fade-in"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-sm w-full overflow-hidden p-5 flex flex-col gap-4 animate-scale-up"
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
                            <div>
                                <h3 className="font-headline-md text-base text-on-surface font-bold">
                                    Detalle de Cuota - {selectedCell.payment.month} {selectedYear}
                                </h3>
                                <p className="text-xs text-on-surface-variant">
                                    {selectedCell.lot.lotNumber} — {selectedCell.lot.clientName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCell(null)}
                                className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {/* Modal Form */}
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface">Monto a Cobrar (CLP) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(Number(e.target.value))}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-xs sm:text-sm outline-none font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface">Fecha de Vencimiento</label>
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-xs sm:text-sm outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-on-surface">Estado de la Cuota *</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-xs sm:text-sm outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                                >
                                    <option value="pagado">Pagado (Al día)</option>
                                    <option value="vencido">Vencido (En mora)</option>
                                    <option value="pendiente">Pendiente (Por vencer)</option>
                                </select>
                            </div>

                            {(editStatus === "pagado" || editStatus === "paid") && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-on-surface">Fecha de Pago Real</label>
                                    <input
                                        type="date"
                                        value={editPaidDate}
                                        onChange={(e) => setEditPaidDate(e.target.value)}
                                        className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-xs sm:text-sm outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/60">
                            <button
                                type="button"
                                onClick={() => setSelectedCell(null)}
                                disabled={loadingSavePayment}
                                className="px-3.5 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePayment}
                                disabled={loadingSavePayment}
                                className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                                {loadingSavePayment ? (
                                    <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[16px]">save</span>
                                        <span>Guardar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default PagosPage;
