export interface Parcela {
    id: string;
    owner: string;
    surface: number;
    escritura: string;
    precioVenta: number;
    abono: number;
    saldo: number;
    status: "current" | "overdue" | "inactive";
}
