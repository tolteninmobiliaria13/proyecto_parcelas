import { lots } from "../../../data/lots";
import LotRow, { LotCard } from "./LotRow";

export default function LotsTable() {
    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table Header */}
            <div className="flex justify-between items-center p-4 sm:p-lg border-b border-outline-variant bg-surface-bright">
                <div>
                    <h3 className="font-headline-md text-lg sm:text-headline-md text-on-surface">Registro Reciente de Pagos</h3>
                    <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
                        Últimos movimientos registrados en el sistema.
                    </p>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">
                        <tr>
                            <th className="py-sm px-lg font-semibold uppercase tracking-wider">Lote</th>
                            <th className="py-sm px-lg font-semibold uppercase tracking-wider">Comprador</th>
                            <th className="py-sm px-lg font-semibold uppercase tracking-wider text-right">Monto Pagado Total</th>
                            <th className="py-sm px-lg font-semibold uppercase tracking-wider">Último Pago</th>
                            <th className="py-sm px-lg font-semibold uppercase tracking-wider">Método de Pago</th>
                            <th className="py-sm px-lg font-semibold uppercase tracking-wider">Próximo Vencimiento</th>
                            <th className="py-sm px-lg font-semibold uppercase tracking-wider text-center">Estado</th>
                            <th className="py-sm px-lg"></th>
                        </tr>
                    </thead>
                    <tbody className="font-data-tabular text-data-tabular text-on-surface divide-y divide-outline-variant">
                        {lots.map((lot) => (
                            <LotRow key={lot.id} lot={lot} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-outline-variant">
                {lots.map((lot) => (
                    <LotCard key={lot.id} lot={lot} />
                ))}
            </div>

            {/* Table Footer / Pagination Minimalist */}
            <div className="p-4 sm:p-md border-t border-outline-variant bg-surface-bright flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm font-body-md text-on-surface-variant">
                <span>Mostrando 1 a {lots.length} de 150 registros</span>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-50 cursor-not-allowed" disabled>
                        Anterior
                    </button>
                    <button className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer">
                        Siguiente
                    </button>
                </div>
            </div>
        </section>
    );
}