import type { Parcela } from "../types/parcela";

export const parcelas: Parcela[] = [
    {
        id: "P-1001",
        owner: "Carlos Mendoza",
        escritura: "123456789",
        precioVenta: 10000000,
        abono: 2000000,
        saldo: 8000000,
        status: "current",
    },
    {
        id: "P-1002",
        owner: "Laura Rodríguez",
        escritura: "123456789",
        precioVenta: 10000000,
        abono: 2000000,
        saldo: 8000000,
        status: "overdue",
    },
    {
        id: "P-1003",
        owner: "Javier Gómez",
        escritura: "123456789",
        precioVenta: 10000000,
        abono: 2000000,
        saldo: 8000000,
        status: "current",
    },
    {
        id: "P-1004",
        owner: "Ana Fernández",
        escritura: "123456789",
        precioVenta: 10000000,
        abono: 2000000,
        saldo: 8000000,
        status: "current",
    },
    {
        id: "P-1005",
        owner: "Sin Asignar",
        escritura: "123456789",
        precioVenta: 10000000,
        abono: 2000000,
        saldo: 8000000,
        status: "inactive",
    },
];
