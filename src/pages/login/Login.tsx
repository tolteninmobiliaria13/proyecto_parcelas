export default function Login() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-100">
            <section className="flex flex-col items-center justify-center w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-3xl font-bold text-center">
                    Sistema de Parcelas
                </h1>

                <p className="mb-8 text-gray-500 text-center">
                    Inicia sesión con tu cuenta de Google.
                </p>

                <button className="w-full rounded-lg bg-slate-900 py-3 font-medium text-white transition hover:bg-slate-800">
                    Continuar con Google
                </button>
            </section>
        </main>
    )
}