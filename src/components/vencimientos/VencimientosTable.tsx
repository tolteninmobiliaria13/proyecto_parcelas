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
      <div className="p-md bg-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-outline-variant gap-sm">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Detalle de Pagos por Lote ({selectedYear})
          </h3>
          <p className="text-[12px] text-on-surface-variant">
            Haz clic en una celda para ver el detalle de la cuota o registrar pago.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-[12px] font-medium text-on-surface">Pagado</span>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-[12px] font-medium text-on-surface">Vencido</span>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400"></div>
            <span className="text-[12px] font-medium text-on-surface">Pendiente</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="matrix-container overflow-x-auto relative">
        <table className="w-full border-collapse text-left min-w-[1250px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="p-md font-label-md text-label-md text-on-surface-variant sticky left-0 z-10 bg-surface-container-low border-r border-outline-variant min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                Lote / Cliente
              </th>
              <th className="p-md font-label-md text-label-md text-on-surface-variant text-center border-r border-outline-variant w-[110px]">
                Resumen
              </th>
              {months.map((mes) => (
                <th
                  key={mes}
                  className="p-sm text-center border-r border-outline-variant min-w-[90px]"
                >
                  <div className="font-label-md text-on-surface">{mes}</div>
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
      <div className="p-md bg-surface-container-low border-t border-outline-variant flex items-center justify-between text-[12px] text-on-surface-variant">
        <span>
          Mostrando {data.length} lotes cargados
        </span>
        <div className="flex gap-sm">
          <button
            disabled
            className="px-md py-1 border border-outline-variant rounded-lg text-[12px] hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Anterior
          </button>
          <button className="px-md py-1 bg-primary text-on-primary rounded-lg text-[12px] font-bold">
            1
          </button>
          <button className="px-md py-1 border border-outline-variant rounded-lg text-[12px] hover:bg-surface-container transition-colors">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};