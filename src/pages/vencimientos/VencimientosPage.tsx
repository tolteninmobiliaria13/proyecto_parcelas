import { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { matrixData } from '../../data/vencimientos';
import { VencimientosHeader } from '../../components/vencimientos/VencimientosHeader';
import { VencimientosTable } from '../../components/vencimientos/VencimientosTable';
import type { LotPaymentMatrix, MonthlyPayment } from '../../types/payment';

export const VencimientosPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('2025');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [selectedCell, setSelectedCell] = useState<{
        lot: LotPaymentMatrix;
        payment: MonthlyPayment;
    } | null>(null);

    // Filtered data
    const filteredData = useMemo(() => {
        return matrixData.filter((row) => {
            const matchesSearch =
                row.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.clientName.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesStatus = true;
            if (selectedStatus === 'Solo Vencidos') {
                matchesStatus = row.overdueMonths > 0;
            } else if (selectedStatus === 'Al Día') {
                matchesStatus = row.overdueMonths === 0;
            }

            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, selectedStatus]);

    // Overall Statistics
    const stats = useMemo(() => {
        let totalCollected = 0;
        let overdueCount = 0;
        let overdueAmount = 0;
        let totalPayments = 0;
        let paidPayments = 0;

        matrixData.forEach((row) => {
            row.payments.forEach((p) => {
                totalPayments++;
                if (p.status === 'paid') {
                    totalCollected += p.amount;
                    paidPayments++;
                } else if (p.status === 'overdue') {
                    overdueCount++;
                    overdueAmount += p.amount;
                }
            });
        });

        const complianceRate =
            totalPayments > 0
                ? Math.round((paidPayments / (paidPayments + overdueCount)) * 100)
                : 100;

        return {
            totalCollected,
            overdueCount,
            overdueAmount,
            complianceRate,
        };
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-lg">
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
                    onCellClick={(lot, payment) => setSelectedCell({ lot, payment })}
                />
            </div>

            {/* Payment Detail Modal */}
            {selectedCell && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-md animate-fade-in">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-md w-full p-lg flex flex-col gap-md">
                        <div className="flex items-start justify-between border-b border-outline-variant pb-md">
                            <div>
                                <span className="text-[11px] font-bold uppercase text-primary">
                                    {selectedCell.lot.project}
                                </span>
                                <h3 className="font-headline-md text-headline-md text-on-surface">
                                    {selectedCell.lot.lotNumber} - {selectedCell.payment.month} {selectedCell.payment.year}
                                </h3>
                                <p className="text-[12px] text-on-surface-variant">
                                    Cliente: {selectedCell.lot.clientName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCell(null)}
                                className="text-outline hover:text-on-surface p-1"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-sm py-xs">
                            <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                                <span className="text-[13px] text-on-surface-variant">Estado</span>
                                {selectedCell.payment.status === 'paid' && (
                                    <span className="px-md py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                                        Pagado
                                    </span>
                                )}
                                {selectedCell.payment.status === 'overdue' && (
                                    <span className="px-md py-0.5 rounded-full bg-rose-100 text-rose-800 text-[12px] font-bold">
                                        Vencido
                                    </span>
                                )}
                                {selectedCell.payment.status === 'pending' && (
                                    <span className="px-md py-0.5 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold">
                                        Pendiente
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                                <span className="text-[13px] text-on-surface-variant">Monto</span>
                                <span className="text-[14px] font-bold text-on-surface">
                                    {formatCurrency(selectedCell.payment.amount)}
                                </span>
                            </div>

                            {selectedCell.payment.dueDate && (
                                <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                                    <span className="text-[13px] text-on-surface-variant">Vencimiento</span>
                                    <span className="text-[13px] text-on-surface font-medium">
                                        {selectedCell.payment.dueDate}
                                    </span>
                                </div>
                            )}

                            {selectedCell.payment.paidDate && (
                                <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                                    <span className="text-[13px] text-on-surface-variant">Fecha de Pago</span>
                                    <span className="text-[13px] text-emerald-700 font-medium">
                                        {selectedCell.payment.paidDate}
                                    </span>
                                </div>
                            )}

                            {selectedCell.payment.receiptNumber && (
                                <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                                    <span className="text-[13px] text-on-surface-variant">N° Comprobante</span>
                                    <span className="text-[13px] font-mono text-on-surface">
                                        {selectedCell.payment.receiptNumber}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant">
                            <button
                                onClick={() => setSelectedCell(null)}
                                className="px-md py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container"
                            >
                                Cerrar
                            </button>
                            {selectedCell.payment.status !== 'paid' ? (
                                <button
                                    onClick={() => {
                                        alert(`Registrando pago para ${selectedCell.lot.lotNumber}...`);
                                        setSelectedCell(null);
                                    }}
                                    className="px-md py-sm bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary/90 flex items-center gap-xs"
                                >
                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                    Registrar Pago
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        alert(`Generando comprobante ${selectedCell.payment.receiptNumber}...`);
                                    }}
                                    className="px-md py-sm bg-emerald-600 text-white rounded-lg text-label-md hover:bg-emerald-700 flex items-center gap-xs"
                                >
                                    <span className="material-symbols-outlined text-[18px]">receipt</span>
                                    Ver Comprobante
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VencimientosPage;