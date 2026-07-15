export interface Parcela {
    id: string;
    owner: string;
    surface: number;
    status: "current" | "overdue" | "inactive";
}
