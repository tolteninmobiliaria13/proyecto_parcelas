import DashboardLayout from "../../components/layout/DashboardLayout";
import SummaryCardsGrid from "../../components/dashboard/cards/summaryCardsGrid";
import LotsTable from "../../components/dashboard/table/LotsTable";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-lg">
                {/* Header de Pagina Unificado */}
                <div>
                    <h2 className="font-display text-2xl sm:text-display text-on-background font-bold">
                        Panel Resumen
                    </h2>
                    <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
                        Visión general del estado de loteos, recaudación y cuotas.
                    </p>
                </div>

                <SummaryCardsGrid />
                <LotsTable />
            </div>
        </DashboardLayout>
    );
}