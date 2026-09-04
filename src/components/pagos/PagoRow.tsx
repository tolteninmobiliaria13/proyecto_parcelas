import { useEffect, useRef } from 'react';
import type { LotPaymentMatrix, MonthlyPayment } from '../../types/payment';

interface PagoRowProps {
  row: LotPaymentMatrix;
  onCellClick?: (lot: LotPaymentMatrix, payment: MonthlyPayment) => void;
  isHighlighted?: boolean;
}

export const PagoRow = ({ row, onCellClick, isHighlighted = false }: PagoRowProps) => {
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (isHighlighted && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const progressPercent = Math.round((row.paidMonths / row.totalMonths) * 100);

  return (
    <tr
      ref={rowRef}
      className={`transition-colors group cursor-pointer ${
        isHighlighted
          ? 'bg-primary/10 ring-2 ring-primary/50'
          : 'hover:bg-surface-container/60'
      }`}
    >
      {/* Sticky Lot / Client Column */}
      <td
        className={`p-2 sm:p-md sticky left-0 z-10 border-r border-outline-variant min-w-[130px] max-w-[130px] sm:min-w-[200px] sm:max-w-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${
          isHighlighted
            ? 'bg-primary/15'
            : 'bg-surface-container-lowest group-hover:bg-surface-container/60'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold text-primary text-xs sm:text-[14px]">{row.lotNumber}</span>
          {row.project && (
            <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium truncate max-w-[50px] sm:max-w-none" title={row.project}>
              {row.project}
            </span>
          )}
        </div>
        <div className="text-[10px] sm:text-[11px] text-on-surface-variant truncate max-w-[115px] sm:max-w-[180px] mt-0.5" title={row.clientName}>
          {row.clientName}
        </div>
      </td>

      {/* Summary / Progress Column */}
      <td className="p-1.5 sm:p-md text-center border-r border-outline-variant bg-surface-container-lowest/50 w-[75px] sm:w-[110px] min-w-[75px] sm:min-w-[110px]">
        <div className="flex flex-col items-center gap-1">
          <span className="px-1.5 sm:px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[9px] sm:text-[10px] font-bold">
            {row.paidMonths} / {row.totalMonths}
          </span>
          <div className="w-10 sm:w-16 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </td>

      {/* Monthly Payment Cells */}
      {row.payments.map((payment, index) => {
        const isPaid = payment.status === 'paid';
        const isOverdue = payment.status === 'overdue';
        const isNone = payment.status === 'none';

        if (isNone) {
          return (
            <td
              key={index}
              className="p-xs border-r border-outline-variant text-center bg-surface-container-low/20 cursor-default"
            >
              <div className="flex flex-col items-center justify-center p-1 min-h-[46px]">
                <span className="text-outline/40 text-[12px] font-medium">-</span>
              </div>
            </td>
          );
        }

        return (
          <td
            key={index}
            onClick={() => onCellClick && onCellClick(row, payment)}
            className="p-xs border-r border-outline-variant text-center transition-all hover:bg-surface-container"
          >
            <div className="flex flex-col items-center justify-center p-1 min-h-[46px]">
              {payment.dueDate && (
                <span className="text-[9px] text-outline block mb-0.5 opacity-80">
                  {payment.dueDate}
                </span>
              )}

              {isPaid && (
                <div className="w-full py-1 px-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span className="font-bold text-[10px]">{formatAmount(payment.amount)}</span>
                </div>
              )}

              {isOverdue && (
                <div className="w-full py-1 px-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-md flex items-center justify-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span className="font-bold text-[10px]">{formatAmount(payment.amount)}</span>
                </div>
              )}

              {!isPaid && !isOverdue && (
                <div className="w-full py-1 px-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-md flex items-center justify-center">
                  <span className="font-medium text-[10px]">{formatAmount(payment.amount)}</span>
                </div>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
};
