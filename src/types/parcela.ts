export interface Parcela {
    id: string;
    owner: string;
    escritura: string;
    precioVenta: number;
    abono: number;
    saldo: number;
    status: "current" | "overdue" | "inactive";
    subdivision?: string;
    estado?: string;
    total_cuotas?: number;
    cuotas_pagadas?: number;
    tipo_pago?: string;
}
