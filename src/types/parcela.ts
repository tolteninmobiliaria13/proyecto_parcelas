export interface Parcela {
    id: string;
    owner: string;
    surface: number;
    escritura: string;
    status: "current" | "overdue" | "inactive";
}
