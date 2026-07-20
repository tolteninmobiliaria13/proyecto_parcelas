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
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-lg">
      <div>
        <h2 className="font-display text-display text-primary mb-sm">
          Control de Cuotas y Vencimientos
        </h2>
        <p className="font-body-lg text-body-lg text-secondary">
          Matriz de seguimiento de pagos por lote y período fiscal.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-md">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar lote o cliente..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}

        {/* Year Filter */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-label-md text-outline">Año Fiscal</label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange && onYearChange(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md focus:ring-primary focus:outline-none cursor-pointer"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-label-md text-outline">Estado</label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md focus:ring-primary focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos</option>
            <option value="Solo Vencidos">Solo Vencidos</option>
            <option value="Al Día">Al Día</option>
          </select>
        </div>

        {/* Export CTA */}
        <button
          onClick={onExport || (() => alert('Exportando reporte de vencimientos...'))}
          className="h-[42px] mt-auto px-lg bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:brightness-110 transition-all flex items-center gap-sm cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">download</span> Exportar Reporte
        </button>
      </div>
    </div>
  );
};