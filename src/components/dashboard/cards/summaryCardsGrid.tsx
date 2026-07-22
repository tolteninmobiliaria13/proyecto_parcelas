import { useState, useRef, useEffect } from "react";
import type { DashboardStat } from "../../../data/dashboard";
import { getDashboardStats } from "../../../services/api";
import SummaryCard from "./SummaryCard";
import ExportButton from "../../ui/ExportButton";

function SummaryCardSkeleton() {
    return (
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-lg shadow-sm animate-pulse relative overflow-hidden flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="h-4 bg-outline-variant/40 rounded w-28"></div>
                <div className="h-6 w-6 bg-outline-variant/40 rounded-full"></div>
            </div>
            <div className="h-8 bg-outline-variant/40 rounded w-32 mt-1"></div>
            <div className="h-4 bg-outline-variant/30 rounded w-full mt-1"></div>
        </div>
    );
}

export default function SummaryCardsGrid() {
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getDashboardStats()
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener estadísticas del dashboard:", err);
                setError("Error al cargar datos");
                setLoading(false);
            });
    }, []);

    const handleScroll = () => {
        if (scrollRef.current && stats.length > 0) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const cardWidth = clientWidth * 0.82;
            const index = Math.round(scrollLeft / cardWidth);
            setActiveIndex(Math.min(Math.max(index, 0), stats.length - 1));
        }
    };

    const scrollToIndex = (index: number) => {
        if (scrollRef.current) {
            const cardWidth = scrollRef.current.clientWidth * 0.82;
            scrollRef.current.scrollTo({
                left: index * cardWidth,
                behavior: "smooth",
            });
            setActiveIndex(index);
        }
    };

    if (error) {
        return (
            <div className="mb-6 sm:mb-xl p-lg border border-error/20 bg-error/5 text-error text-center rounded-xl font-body-md text-sm">
                No se pudieron cargar las estadísticas del panel. Intenta recargar la página.
            </div>
        );
    }

    // Array de 4 para renderizar los skeletons
    const skeletons = Array(4).fill(null);

    return (
        <div className="mb-6 sm:mb-xl">
            {/* Desktop View (>= lg): Misma fila con las tarjetas, mismo alto y menor ancho */}
            <div className="hidden lg:flex flex-row items-stretch gap-4">
                <div className="grid grid-cols-4 gap-4 flex-1">
                    {loading
                        ? skeletons.map((_, index) => <SummaryCardSkeleton key={index} />)
                        : stats.map((stat, index) => (
                              <SummaryCard key={index} stat={stat} />
                          ))}
                </div>

                {/* Botón de exportar independiente del mismo alto y menor ancho */}
                <ExportButton
                    cardVariant={true}
                    className="w-40 xl:w-44 shrink-0 self-stretch"
                />
            </div>

            {/* Mobile / Tablet View (< lg): Carrusel deslizable con puntos e botón inferior */}
            <div className="lg:hidden flex flex-col gap-3">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
                >
                    {loading
                        ? skeletons.map((_, index) => (
                              <div
                                  key={index}
                                  className="min-w-[82vw] sm:min-w-[280px] snap-center shrink-0"
                              >
                                  <SummaryCardSkeleton />
                              </div>
                          ))
                        : stats.map((stat, index) => (
                              <div
                                  key={index}
                                  className="min-w-[82vw] sm:min-w-[280px] snap-center shrink-0"
                              >
                                  <SummaryCard stat={stat} />
                              </div>
                          ))}
                </div>

                {/* Indicadores de posición del carrusel */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                    {(loading ? skeletons : stats).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToIndex(index)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                                activeIndex === index
                                    ? "w-6 bg-primary"
                                    : "w-2 bg-outline-variant/60 hover:bg-outline-variant"
                            }`}
                            aria-label={`Ir a tarjeta ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Botón de exportación debajo del carrusel en móvil */}
                <ExportButton className="w-full h-11 mt-1 text-sm font-semibold" />
            </div>
        </div>
    );
}

