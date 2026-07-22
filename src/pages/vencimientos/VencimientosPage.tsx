import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getVencimientos, actualizarPago } from '../../services/api';
import { VencimientosHeader } from '../../components/vencimientos/VencimientosHeader';
import { VencimientosTable } from '../../components/vencimientos/VencimientosTable';
import type { LotPaymentMatrix, MonthlyPayment } from '../../types/payment';

export const VencimientosPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [selectedStatus, setSelectedStatus] = useState('Todos');
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
                console.error("Error al obtener matriz de vencimientos:", err);
                setError("No se pudieron cargar los vencimientos.");
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
                fecha_pago_real: editStatus === "paid" || editStatus === "pagado" ? (editPaidDate || new Date().toISOString().substring(0, 10)) : null,
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

    // Filtered data
    const filteredData = useMemo(() => {
        return matrixData.filter((row) => {
            const matchesSearch =
                (row.lotNumber && row.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (row.clientName && row.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

            let matchesStatus = true;
            if (selectedStatus === 'Solo Vencidos') {
                matchesStatus = row.overdueMonths > 0;
            } else if (selectedStatus === 'Al Día') {
                matchesStatus = row.overdueMonths === 0;
            }

            return matchesSearch && matchesStatus;
        });
    }, [matrixData, searchTerm, selectedStatus]);


    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-lg">
                {/* Header Component */}
                <VencimientosHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                />

                {/* Table Component */}
                <VencimientosTable
                    data={filteredData}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    onCellClick={(lot, payment) => setSelectedCell({ lot, payment })}
                    loading={loading}
                    error={error}
                />
            </div>

            {/* Payment Detail Modal */}
            {selectedCell && (
                <div 
                    onClick={() => setSelectedCell(null)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-md animate-fade-in"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-lg flex flex-col gap-md"
                    >
                        <div className="flex items-start justify-between border-b border-outline-variant pb-3">
                            <div>
                                <span className="text-[11px] font-bold uppercase text-primary">
                                    {selectedCell.lot.project}
                                </span>
                                <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface">
                                    {selectedCell.lot.lotNumber} - {selectedCell.payment.month} {selectedCell.payment.year}
                                </h3>
                                <p className="text-[12px] text-on-surface-variant">
                                    Cliente: {selectedCell.lot.clientName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCell(null)}
                                className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-sm py-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/40">
                                <span className="text-[13px] text-on-surface-variant font-medium">Estado</span>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    disabled={loadingSavePayment}
                                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none font-medium cursor-pointer"
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="paid">Pagado</option>
                                    <option value="overdue">Vencido</option>
                                </select>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/40">
                                <span className="text-[13px] text-on-surface-variant font-medium">Monto CLP</span>
                                <input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(Number(e.target.value))}
                                    disabled={loadingSavePayment}
                                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none w-28 text-right font-mono"
                                />
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/40">
                                <span className="text-[13px] text-on-surface-variant font-medium">Vencimiento</span>
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    disabled={loadingSavePayment}
                                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none font-mono cursor-pointer"
                                />
                            </div>

                            {editStatus === "paid" && (
                                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/40 animate-fade-in">
                                    <span className="text-[13px] text-on-surface-variant font-medium">Fecha de Pago</span>
                                    <input
                                        type="date"
                                        value={editPaidDate}
                                        onChange={(e) => setEditPaidDate(e.target.value)}
                                        disabled={loadingSavePayment}
                                        className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none font-mono cursor-pointer"
                                    />
                                </div>
                            )}

                            {selectedCell.payment.receiptNumber && editStatus === "paid" && (
                                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/40">
                                    <span className="text-[13px] text-on-surface-variant font-medium">N° Comprobante</span>
                                    <span className="text-[13px] font-mono text-on-surface font-semibold">
                                        {selectedCell.payment.receiptNumber}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-sm border-t border-outline-variant">
                            <button
                                type="button"
                                onClick={() => setSelectedCell(null)}
                                disabled={loadingSavePayment}
                                className="w-full sm:w-auto px-md py-2 border border-outline-variant rounded-lg text-xs sm:text-label-md hover:bg-surface-container transition-colors cursor-pointer text-center text-on-surface-variant font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePayment}
                                disabled={loadingSavePayment}
                                className="w-full sm:w-auto px-md py-2 bg-primary text-on-primary rounded-lg text-xs sm:text-label-md hover:bg-primary/90 flex items-center justify-center gap-xs cursor-pointer disabled:opacity-50 font-bold shadow-xs"
                            >
                                {loadingSavePayment ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        <span>Guardar Cambios</span>
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

export default VencimientosPage;