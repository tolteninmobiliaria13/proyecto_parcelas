import DashboardLayout from "../../components/layout/DashboardLayout";

export default function PagosPage() {
    return (
        <DashboardLayout>
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-lg shadow-sm">
                <h2 className="font-headline-md text-lg sm:text-headline-md text-on-surface">Registro de Pagos</h2>
                <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-2">
                    Módulo de registro e histórico de pagos en construcción.
                </p>
            </section>
        </DashboardLayout>
    );
}
