import DashboardLayout from "../../components/layout/DashboardLayout";

export default function VencimientosPage() {
    return (
        <DashboardLayout>
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface">Vencimientos</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    Módulo de gestión de vencimientos y alertas en construcción.
                </p>
            </section>
        </DashboardLayout>
    );
}
