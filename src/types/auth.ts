export type UserRole = 'admin' | 'user';

export const ADMIN_EMAILS_PREDETERMINADOS = [
    "eduardo20032110@gmail.com",
    "tolteninmobiliaria@gmail.com",
    "tolteninmobiliaria13@gmail.com"
];

export interface CheckAuthResponse {
    is_authorized: boolean;
    email: string;
    rol?: UserRole | null;
    nombre?: string | null;
    message?: string | null;
}

export interface UsuarioPermitido {
    id: string;
    email: string;
    nombre?: string | null;
    rol: UserRole;
    activo: boolean;
    fecha_registro: string;
}

export interface UsuarioPermitidoInput {
    email: string;
    nombre?: string;
    rol: UserRole;
    activo: boolean;
}

export interface NotificationItem {
    id: string;
    tipo: 'usuario_pendiente' | 'cuota_vencimiento';
    titulo: string;
    descripcion: string;
    fecha: string;
    link?: string | null;
}

export interface NotificationsSummary {
    total_count: number;
    pending_users_count: number;
    due_today_count: number;
    items: NotificationItem[];
}
