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

export default function ParcelaRow({ parcela }: ParcelaRowProps) {
    const initials = getInitials(parcela.owner);
    const avatarClasses = getAvatarClasses(parcela.owner, parcela.status);

    return (
        <tr className="hover:bg-primary-fixed/30 transition-colors group">
            <td className="py-4 px-6 font-medium text-primary">
                {parcela.id}
            </td>
            <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarClasses} flex items-center justify-center font-bold text-xs shrink-0`}>
                        {initials}
                    </div>
                    <span>{parcela.owner}</span>
                </div>
            </td>
            <td className="py-4 px-6 text-on-surface-variant">
                {parcela.surface.toLocaleString("es-CL")}
            </td>
            <td className="py-4 px-6 text-on-surface-variant">
                {parcela.escritura}
            </td>
            <td className="py-4 px-6">
                <ParcelaStatus status={parcela.status} />
            </td>
            <td className="py-4 px-6 text-right">
                <button className="px-4 py-1.5 border border-primary-container text-primary-container rounded-md hover:bg-primary-container/10 transition-colors font-data-tabular cursor-pointer">
                    Ver Detalles
                </button>
            </td>
        </tr>
    );
}
