import DashboardLayout from "../../components/layout/DashboardLayout";

export default function ConfiguracionPage() {
    return (
        <DashboardLayout>
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface">Configuración</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    Configuración del sistema y preferencias de administración.
                </p>
            </section>
        </DashboardLayout>
    );
}
