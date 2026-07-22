import axios from 'axios';
import type { DashboardStat } from '../data/dashboard';
import type { Lot } from '../types/lots';
import type { Parcela } from '../types/parcela';
import type { LotPaymentMatrix, MonthlyPayment } from '../types/payment';

// Cliente Axios centralizado
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Memory cache for API responses to guarantee instant screen transitions (0ms delay)
const memoryCache: { [key: string]: any } = {};

export const clearCache = (prefix?: string) => {
    if (!prefix) {
        Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
    } else {
        Object.keys(memoryCache).forEach(key => {
            if (key.startsWith(prefix)) {
                delete memoryCache[key];
            }
        });
    }
};

// Helper para dar formato de moneda Chilena (CLP)
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(val);
};

/**
 * Obtiene las estadísticas generales del Dashboard y las transforma
 * al formato esperado por el componente SummaryCardsGrid.
 */
export const getDashboardStats = async (): Promise<DashboardStat[]> => {
    const cacheKey = 'dashboard_stats';
    if (memoryCache[cacheKey]) {
        return memoryCache[cacheKey];
    }
    const response = await apiClient.get('/dashboard/stats');
    const data = response.data;

    const stats = [
        {
            title: "Total por pagar",
            value: formatCurrency(data.total_por_pagar),
            description: "Suma total de los pagos pendientes de cobro.",
            icon: "account_balance",
            iconColorClass: "text-secondary",
            descClass: "text-error font-medium",
        },
        {
            title: "Total Pagado mes",
            value: formatCurrency(data.total_pagado_mes),
            description: "Suma total de los pagos realizados este mes.",
            icon: "account_balance_wallet",
            iconColorClass: "text-secondary",
            descClass: "text-primary font-medium",
        },
        {
            title: "Lotes con Deuda",
            value: String(data.lotes_con_deuda),
            description: "Deuda de uno o más meses",
            icon: "warning",
            borderColor: "border-error-container",
            iconColorClass: "text-error",
            descClass: "text-error font-medium",
        },
        {
            title: "Proximos Vencimientos",
            value: String(data.proximos_vencimientos),
            description: "Vencen dentro del mes",
            icon: "event",
            iconColorClass: "text-secondary",
            descClass: "text-error font-medium",
        },
    ];
    memoryCache[cacheKey] = stats;
    return stats;
};

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
}

/**
 * Obtiene el listado de lotes/contratos con deuda para el panel principal.
 */
export const getDashboardLots = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Lot>> => {
    const response = await apiClient.get<PaginatedResponse<Lot>>(`/dashboard/lots?page=${page}&limit=${limit}`);
    return response.data;
};

/**
 * Obtiene la lista de parcelas registradas.
 */
export const getParcelas = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Parcela>> => {
    const response = await apiClient.get<PaginatedResponse<Parcela>>(`/parcelas/?page=${page}&limit=${limit}`);
    return response.data;
};

/**
 * Obtiene la matriz de pagos/vencimientos para un año determinado.
 */
export const getVencimientos = async (year: number): Promise<LotPaymentMatrix[]> => {
    const cacheKey = `vencimientos_${year}`;
    if (memoryCache[cacheKey]) {
        return memoryCache[cacheKey];
    }
    const response = await apiClient.get<any[]>(`/vencimientos/?year=${year}`);
    const mapped = response.data.map((item) => ({
        ...item,
        payments: item.payments.map((p: any) => {
            let status: 'paid' | 'overdue' | 'pending' | 'none' = 'pending';
            if (p.status === 'pagado') {
                status = 'paid';
            } else if (p.status === 'vencido') {
                status = 'overdue';
            } else if (p.status === 'pendiente') {
                status = 'pending';
            } else if (p.status === 'none') {
                status = 'none';
            }
            return {
                ...p,
                status,
            };
        }),
    }));
    memoryCache[cacheKey] = mapped;
    return mapped;
};

/**
 * Crea una nueva parcela en el backend.
 */
export const crearParcela = async (data: {
    numero_lote: string;
    numero_rol?: string | null;
    subdivision: string;
    superficie_m2?: number | null;
    precio_base: number;
    estado?: string;
}): Promise<Parcela> => {
    const response = await apiClient.post<Parcela>('/parcelas/', data);
    clearCache('parcelas');
    clearCache('dashboard');
    clearCache('vencimientos');
    clearCache('contrato_detalle');
    return response.data;
};

export interface Cliente {
    id: string;
    nombre_completo: string;
    email?: string | null;
    telefono?: string | null;
}

export interface AsignarPropietarioPayload {
    cliente_id?: string | null;
    cliente_nombre?: string | null;
    cliente_email?: string | null;
    cliente_telefono?: string | null;
    fecha_pago: string; // "YYYY-MM-DD"
    pie_inicial: number;
    total_cuotas: number;
    monto_cuota: number;
    cuotas_pagadas?: number;
}

/**
 * Obtiene el listado de todos los clientes.
 */
export const getClientes = async (): Promise<Cliente[]> => {
    const cacheKey = 'clientes';
    if (memoryCache[cacheKey]) {
        return memoryCache[cacheKey];
    }
    const response = await apiClient.get<Cliente[]>('/parcelas/clientes');
    memoryCache[cacheKey] = response.data;
    return response.data;
};

/**
 * Asigna un propietario a una parcela (crea contrato y cuotas).
 */
export const asignarPropietario = async (
    loteId: string,
    data: AsignarPropietarioPayload
): Promise<Parcela> => {
    const response = await apiClient.post<Parcela>(`/parcelas/${loteId}/asignar`, data);
    clearCache('parcelas');
    clearCache('dashboard');
    clearCache('vencimientos');
    clearCache('contrato_detalle');
    return response.data;
};

/**
 * Actualiza los datos de una cuota de pago (vencimiento, monto, estado, etc.)
 */
export const actualizarPago = async (
    pagoId: string,
    data: {
        monto_cobrar?: number;
        fecha_vencimiento?: string; // "YYYY-MM-DD"
        fecha_pago_real?: string | null; // "YYYY-MM-DD"
        estado?: string;
    }
): Promise<MonthlyPayment> => {
    const response = await apiClient.put<MonthlyPayment>(`/vencimientos/pagos/${pagoId}`, data);
    clearCache('parcelas');
    clearCache('dashboard');
    clearCache('vencimientos');
    clearCache('contrato_detalle');
    return response.data;
};

/**
 * Actualiza los datos de una parcela.
 */
export const updateParcela = async (
    loteId: string,
    data: {
        numero_lote: string;
        numero_rol?: string | null;
        subdivision: string;
        superficie_m2?: number | null;
        precio_base: number;
        estado?: string;
    }
): Promise<Parcela> => {
    const response = await apiClient.put<Parcela>(`/parcelas/${loteId}`, data);
    clearCache('parcelas');
    clearCache('dashboard');
    clearCache('vencimientos');
    clearCache('contrato_detalle');
    return response.data;
};

/**
 * Elimina una parcela de la base de datos.
 */
export const deleteParcela = async (loteId: string): Promise<void> => {
    await apiClient.delete(`/parcelas/${loteId}`);
    clearCache('parcelas');
    clearCache('dashboard');
    clearCache('vencimientos');
    clearCache('contrato_detalle');
};

/**
 * Crea un nuevo cliente en el sistema.
 */
export const createCliente = async (data: {
    nombre_completo: string;
    email?: string | null;
    telefono?: string | null;
}): Promise<Cliente> => {
    const response = await apiClient.post<Cliente>('/parcelas/clientes/crear', data);
    clearCache('clientes');
    return response.data;
};

/**
 * Actualiza la información de un cliente.
 */
export const updateCliente = async (
    clienteId: string,
    data: {
        nombre_completo: string;
        email?: string | null;
        telefono?: string | null;
    }
): Promise<Cliente> => {
    const response = await apiClient.put<Cliente>(`/parcelas/clientes/${clienteId}`, data);
    clearCache('clientes');
    clearCache('parcelas');
    clearCache('dashboard');
    clearCache('vencimientos');
    clearCache('contrato_detalle');
    return response.data;
};

/**
 * Elimina un cliente.
 */
export const deleteCliente = async (clienteId: string): Promise<void> => {
    await apiClient.delete(`/parcelas/clientes/${clienteId}`);
    clearCache('clientes');
    clearCache('parcelas');
    clearCache('dashboard');
    clearCache('vencimientos');
    clearCache('contrato_detalle');
};

/**
 * Actualiza el contrato y plan de cuotas de una parcela.
 */
export const updateContrato = async (
    loteId: string,
    data: AsignarPropietarioPayload
): Promise<Parcela> => {
    const response = await apiClient.put<Parcela>(`/parcelas/${loteId}/contrato`, data);
    clearCache('parcelas');
    clearCache('dashboard');
    clearCache('vencimientos');
    clearCache('contrato_detalle');
    return response.data;
};

export interface ContratoDetalle {
    cliente_id: string;
    cliente_nombre: string;
    fecha_pago: string;
    pie_inicial: number;
    total_cuotas: number;
    monto_cuota: number;
    cuotas_pagadas: number;
}

/**
 * Obtiene el detalle del contrato activo de una parcela.
 */
export const getContratoDetalle = async (loteId: string): Promise<ContratoDetalle> => {
    const cacheKey = `contrato_detalle_${loteId}`;
    if (memoryCache[cacheKey]) {
        return memoryCache[cacheKey];
    }
    const response = await apiClient.get<ContratoDetalle>(`/parcelas/${loteId}/contrato`);
    memoryCache[cacheKey] = response.data;
    return response.data;
};

export interface ReporteItem {
    numero_lote: string;
    propietario: string;
    estado: string;
    saldo_fmt: string;
    proximo_vencimiento: string;
    ultimo_pago: string;
}

export interface ReporteData {
    proyecto_nombre: string;
    periodo: string;
    fecha_emision: string;
    resumen_ejecutivo: {
        facturacion_periodo_fmt: string;
        cobranza_efectiva_fmt: string;
        recuperacion_mora_fmt: string;
        cobranza_corriente_fmt: string;
        cuentas_por_cobrar_fmt: string;
    };
    estado_cobranza: {
        estado: string;
        lotes: number;
        monto_fmt: string;
    }[];
    total_estado_cobranza: {
        lotes: number;
        monto_fmt: string;
    };
    detalles: ReporteItem[];
}

/**
 * Obtiene los datos del reporte de pagos del mes presente desde la API REST.
 */
export const getReporteData = async (): Promise<ReporteData> => {
    const response = await apiClient.get<ReporteData>('/vencimientos/reporte-data');
    return response.data;
};

export default apiClient;



