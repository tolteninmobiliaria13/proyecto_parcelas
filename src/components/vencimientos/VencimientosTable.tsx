import { useState, useEffect } from 'react';
import type { LotPaymentMatrix, MonthlyPayment } from '../../types/payment';
import { monthsList } from '../../data/vencimientos';
import { VencimientosRow } from './VencimientosRow';
import { sortParcelasByLote } from '../../utils/loteSort';

const ITEMS_PER_PAGE = 10;

interface VencimientosTableProps {
  data: LotPaymentMatrix[];
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  onCellClick?: (lot: LotPaymentMatrix, payment: MonthlyPayment) => void;
  loading?: boolean;
  error?: string | null;
  targetLote?: string;
}

function VencimientosRowSkeleton({ monthsCount }: { monthsCount: number }) {
  return (
    <tr className="animate-pulse">
      <td className="p-md sticky left-0 z-10 bg-surface-container-lowest border-r border-outline-variant">
        <div className="h-4 bg-outline-variant/30 rounded w-12 mb-2"></div>
        <div className="h-3 bg-outline-variant/30 rounded w-24"></div>
      </td>
      <td className="p-md border-r border-outline-variant bg-surface-container-lowest/50 text-center">
        <div className="h-4 bg-outline-variant/30 rounded-full w-8 mx-auto mb-1"></div>
        <div className="h-1.5 bg-outline-variant/30 rounded w-16 mx-auto"></div>
      </td>
      {Array(monthsCount).fill(null).map((_, i) => (
        <td key={i} className="p-xs border-r border-outline-variant text-center">
          <div className="h-10 bg-outline-variant/20 rounded w-16 mx-auto"></div>
        </td>
      ))}
    </tr>
  );
}

export const VencimientosTable = ({
  data,
  selectedYear = String(new Date().getFullYear()),
  onCellClick,
  loading = false,
  error = null,
  targetLote = '',
}: VencimientosTableProps) => {
  const [page, setPage] = useState(1);
  const months = monthsList;
  const sortedData = sortParcelasByLote(data);

  useEffect(() => {
    if (targetLote && sortedData.length > 0) {
      const index = sortedData.findIndex(
        (item) => item.lotNumber?.trim().toLowerCase() === targetLote.trim().toLowerCase()
      );
      if (index !== -1) {
        const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;
        setPage(targetPage);
        return;
      }
    }
    setPage(1);
  }, [data, selectedYear, targetLote]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = sortedData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Subheader & Legend */}
      <div className="p-4 sm:p-lg bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-outline-variant gap-3">
        <div>
          <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">
            Detalle de Pagos por Lote ({selectedYear})
          </h3>
          <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
            Haz clic en una celda para ver el detalle de la cuota o registrar pago.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-md">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] sm:text-[12px] font-medium text-on-surface">Pagado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span className="text-[11px] sm:text-[12px] font-medium text-on-surface">Vencido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400"></div>
            <span className="text-[11px] sm:text-[12px] font-medium text-on-surface">Pendiente</span>
          </div>
        </div>
      </div>

      {/* Indicador de scroll para móvil */}
      <div className="block lg:hidden px-4 py-1.5 bg-primary-fixed/20 text-primary text-[11px] font-medium flex items-center justify-between border-b border-outline-variant/30">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">swipe_left</span>
          Desliza lateralmente para navegar por los meses
        </span>
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </div>

      {/* Table Container */}
      <div className="matrix-container overflow-x-auto relative">
        <table className="w-full border-collapse text-left min-w-[1150px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="p-2 sm:p-md font-label-md text-label-md text-on-surface-variant sticky left-0 z-20 bg-surface-container-low border-r border-outline-variant min-w-[130px] max-w-[130px] sm:min-w-[200px] sm:max-w-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                Lote / Cliente
              </th>
              <th className="p-1.5 sm:p-md font-label-md text-label-md text-on-surface-variant text-center border-r border-outline-variant w-[75px] sm:w-[110px] min-w-[75px] sm:min-w-[110px]">
                Resumen
              </th>
              {months.map((mes) => (
                <th
                  key={mes}
                  className="p-1.5 sm:p-sm text-center border-r border-outline-variant min-w-[85px] sm:min-w-[90px]"
                >
                  <div className="font-label-md text-on-surface text-xs sm:text-sm">{mes}</div>
                  <div className="text-[10px] text-outline font-normal">
                    {selectedYear}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-data-tabular text-data-tabular divide-y divide-outline-variant">
            {loading ? (
              Array(3).fill(null).map((_, i) => (
                <VencimientosRowSkeleton key={i} monthsCount={months.length} />
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={months.length + 2}
                  className="p-xl text-center text-error font-medium"
                >
                  {error}
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={months.length + 2}
                  className="p-xl text-center text-on-surface-variant"
                >
                  No hay lotes para mostrar.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <VencimientosRow
                  key={row.id}
                  row={row}
                  onCellClick={onCellClick}
                  isHighlighted={Boolean(
                    targetLote &&
                    row.lotNumber?.trim().toLowerCase() === targetLote.trim().toLowerCase()
                  )}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:p-md bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-on-surface-variant">
        <span>
          {sortedData.length === 0
            ? "0 parcelas"
            : `Mostrando ${(page - 1) * ITEMS_PER_PAGE + 1} a ${Math.min(page * ITEMS_PER_PAGE, sortedData.length)} de ${sortedData.length} parcelas — Año ${selectedYear}`}
        </span>

        {/* Arrow Navigation */}
        {sortedData.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Página anterior"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-3 py-1 rounded-md bg-primary-container text-on-primary-container text-xs font-medium font-data-tabular">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Página siguiente"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};