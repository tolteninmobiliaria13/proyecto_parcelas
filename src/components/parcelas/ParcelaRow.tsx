import type { Parcela } from "../../types/parcela";
import ParcelaStatus from "./ParcelaStatus";

type ParcelaRowProps = {
    parcela: Parcela;
};

function getInitials(name: string) {
    if (name === "Sin Asignar") return "ND";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function getAvatarClasses(name: string, status: string) {
    if (name === "Sin Asignar") {
        return "bg-surface-variant text-on-surface-variant";
    }
    if (status === "overdue") {
        return "bg-tertiary-container text-on-tertiary-container";
    }
    return "bg-secondary-container text-on-secondary-container";
}

export function ParcelaCard({ parcela }: ParcelaRowProps) {
    const initials = getInitials(parcela.owner);
    const avatarClasses = getAvatarClasses(parcela.owner, parcela.status);

    return (
        <div className="p-4 bg-surface-container-lowest flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-primary text-base">{parcela.id}</span>
                <ParcelaStatus status={parcela.status} />
            </div>

            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${avatarClasses} flex items-center justify-center font-bold text-xs shrink-0`}>
                    {initials}
                </div>
                <span className="font-medium text-on-surface text-sm">{parcela.owner}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/30">
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Superficie</span>
                    <span className="font-medium text-on-surface">{parcela.surface.toLocaleString("es-CL")} m²</span>
                </div>
                <div>
                    <span className="text-on-surface-variant block text-[11px]">Escritura</span>
                    <span className="font-medium text-on-surface">{parcela.escritura}</span>
                </div>
            </div>

            <div className="flex justify-end pt-1">
                <button className="w-full px-4 py-2 border border-primary text-primary rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors cursor-pointer text-center">
                    Ver Detalles
                </button>
            </div>
        </div>
    );
}

export default function ParcelaRow({ parcela }: ParcelaRowProps) {
    const initials = getInitials(parcela.owner);
    const avatarClasses = getAvatarClasses(parcela.owner, parcela.status);

    return (
        <tr className="hover:bg-primary-fixed/30 transition-colors group">
            <td className="py-4 px-6 font-medium text-primary whitespace-nowrap">
                {parcela.id}
            </td>
            <td className="py-4 px-6 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarClasses} flex items-center justify-center font-bold text-xs shrink-0`}>
                        {initials}
                    </div>
                    <span>{parcela.owner}</span>
                </div>
            </td>
            <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap">
                {parcela.surface.toLocaleString("es-CL")}
            </td>
            <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap">
                {parcela.escritura}
            </td>
            <td className="py-4 px-6 whitespace-nowrap">
                <ParcelaStatus status={parcela.status} />
            </td>
            <td className="py-4 px-6 text-right whitespace-nowrap">
                <button className="px-4 py-1.5 border border-primary-container text-primary-container rounded-md hover:bg-primary-container/10 transition-colors font-data-tabular cursor-pointer">
                    Ver Detalles
                </button>
            </td>
        </tr>
    );
}
