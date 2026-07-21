import ExportButton from '../ui/ExportButton';

interface VencimientosHeaderProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  onExport?: () => void;
}

export const VencimientosHeader = ({
  searchTerm = '',
  onSearchChange,
  selectedYear = '2025',
  onYearChange,
  selectedStatus = 'Todos',
  onStatusChange,
  onExport,
}: VencimientosHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl sm:text-display text-on-background font-bold">
          Control de Cuotas y Vencimientos
        </h2>
        <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
          Matriz de seguimiento de pagos por lote y período fiscal.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-3 sm:gap-md">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative w-full sm:w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar lote o cliente..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
          {/* Year Filter */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-xs text-outline">Año Fiscal</label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange && onYearChange(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-sm focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-xs text-outline">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-sm focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Solo Vencidos">Solo Vencidos</option>
              <option value="Al Día">Al Día</option>
            </select>
          </div>
        </div>

        {/* Botón reutilizable de exportación */}
        <ExportButton onClick={onExport} className="mt-auto" />
      </div>
    </div>
  );
};