import type { LotPaymentMatrix, MonthlyPayment } from '../../types/payment';
import { monthsList } from '../../data/vencimientos';
import { VencimientosRow } from './VencimientosRow';

interface VencimientosTableProps {
  data: LotPaymentMatrix[];
  selectedYear?: string;
  onCellClick?: (lot: LotPaymentMatrix, payment: MonthlyPayment) => void;
}

export const VencimientosTable = ({
  data,
  selectedYear = '2025',
  onCellClick,
}: VencimientosTableProps) => {
  const months = monthsList;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Subheader & Legend */}
      <div className="p-4 sm:p-md bg-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-outline-variant gap-3">
        <div>
          <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface">
            Detalle de Pagos por Lote ({selectedYear})
          </h3>
          <p className="text-[11px] sm:text-[12px] text-on-surface-variant">
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
              <th className="p-3 sm:p-md font-label-md text-label-md text-on-surface-variant sticky left-0 z-20 bg-surface-container-low border-r border-outline-variant min-w-[180px] sm:min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                Lote / Cliente
              </th>
              <th className="p-3 sm:p-md font-label-md text-label-md text-on-surface-variant text-center border-r border-outline-variant w-[100px] sm:w-[110px]">
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
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={months.length + 2}
                  className="p-xl text-center text-on-surface-variant"
                >
                  No hay lotes para mostrar.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <VencimientosRow
                  key={row.id}
                  row={row}
                  onCellClick={onCellClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:p-md bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-on-surface-variant">
        <span>
          Mostrando {data.length} lotes cargados
        </span>
        <div className="flex gap-sm">
          <button
            disabled
            className="px-md py-1 border border-outline-variant rounded-lg text-[12px] hover:bg-surface-container transition-colors disabled:opacity-50 cursor-not-allowed"
          >
            Anterior
          </button>
          <button className="px-md py-1 bg-primary text-on-primary rounded-lg text-[12px] font-bold cursor-pointer">
            1
          </button>
          <button className="px-md py-1 border border-outline-variant rounded-lg text-[12px] hover:bg-surface-container transition-colors cursor-pointer">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};