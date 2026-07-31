// @ts-ignore
import html2pdf from 'html2pdf.js';
import type { ReporteData } from "../services/api";

export const downloadReportCuotas = (data: ReporteData) => {
    // 1. Cuotas del mes pagadas dentro del período
    const cuotasMesPagadas = data.detalles.filter(d => d.estado_cuota_mes === 'PAGADO_CORRIENTE');
    
    // 2. Cuotas del mes pagadas anticipadamente en meses/años anteriores
    const cuotasMesAnticipadas = data.detalles.filter(d => d.estado_cuota_mes === 'PAGADO_ANTICIPADO');
    
    // 3. Cuotas del mes que quedaron impagas o vencidas en este mes (ej. pagadas después o aún pendientes)
    const cuotasMesImpagasVencidas = data.detalles.filter(d => d.estado_cuota_mes === 'VENCIDO_O_IMPAGO_EN_MES');

    // 4. Cobros de mora (pagos atrasados de meses anteriores recibidos este mes)
    const pagosAtrasadosMes = data.resumen_ejecutivo.desglose_pagos_atrasados || [];

    // 5. Cobros de cuotas futuras (pagos adelantados recibidos este mes)
    const pagosAdelantadosMes = data.resumen_ejecutivo.desglose_pagos_adelantados || [];

    const renderTable = (
        titulo: string, 
        colorHeader: string, 
        rowsHtml: string, 
        count: number,
        headers: { text: string; width: string; align?: string }[]
    ) => {
        if (count === 0) return '';
        return `
            <div style="margin-bottom: 24px; page-break-inside: avoid; break-inside: avoid;">
                <h3 style="color: ${colorHeader}; font-weight: bold; font-size: 14px; margin-bottom: 8px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${titulo} (${count})
                </h3>
                <table style="width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px; box-sizing: border-box;">
                    <thead>
                        <tr style="background-color: #f8fafc;">
                            ${headers.map(h => `
                                <th style="border: 1px solid #cbd5e1; padding: 6px 10px; width: ${h.width}; text-align: ${h.align || 'left'}; box-sizing: border-box;">
                                    ${h.text}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    };

    // Bloque 1: Cuotas del mes pagadas en el mes
    const htmlCuotasMesPagadas = renderTable(
        `Cuotas de ${data.periodo} Pagadas al Día`,
        "#16a34a",
        cuotasMesPagadas.map(item => `
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; box-sizing: border-box;">
                    <span style="font-weight: bold; color: #1e293b;">${item.propietario}</span>
                    <span style="color: #64748b; font-size: 10px; margin-left: 6px;">(Lote ${item.numero_lote})</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; box-sizing: border-box;">
                    ${item.fecha_pago_cuota_mes || '-'}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; font-weight: bold; color: #16a34a; box-sizing: border-box;">
                    ${item.monto_cuota_mes_fmt || item.monto_cuota_fmt}
                </td>
            </tr>
        `).join(''),
        cuotasMesPagadas.length,
        [
            { text: "Propietario / Lote", width: "50%" },
            { text: "Fecha Pago Real", width: "25%", align: "center" },
            { text: "Monto Cuota", width: "25%", align: "right" }
        ]
    );

    // Bloque 2: Cuotas del mes pagadas por adelantado en meses anteriores
    const htmlCuotasMesAnticipadas = renderTable(
        `Cuotas de ${data.periodo} Pagadas con Anticipación (en meses anteriores)`,
        "#0284c7",
        cuotasMesAnticipadas.map(item => `
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; box-sizing: border-box;">
                    <span style="font-weight: bold; color: #1e293b;">${item.propietario}</span>
                    <span style="color: #64748b; font-size: 10px; margin-left: 6px;">(Lote ${item.numero_lote})</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; box-sizing: border-box; color: #0284c7; font-weight: bold;">
                    Pagado el ${item.fecha_pago_cuota_mes || '-'}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; font-weight: bold; color: #0284c7; box-sizing: border-box;">
                    ${item.monto_cuota_mes_fmt || item.monto_cuota_fmt}
                </td>
            </tr>
        `).join(''),
        cuotasMesAnticipadas.length,
        [
            { text: "Propietario / Lote", width: "50%" },
            { text: "Fecha Pago Anticipado", width: "25%", align: "center" },
            { text: "Monto Cuota", width: "25%", align: "right" }
        ]
    );

    // Bloque 3: Cuotas del mes impagas o vencidas en este mes
    const htmlCuotasMesImpagas = renderTable(
        `Cuotas de ${data.periodo} Impagas / Vencidas en el Mes`,
        "#ea580c",
        cuotasMesImpagasVencidas.map(item => {
            const fuePagadoDespues = item.fecha_pago_cuota_mes && item.fecha_pago_cuota_mes !== '-';
            const estadoTexto = fuePagadoDespues 
                ? `Pagado el ${item.fecha_pago_cuota_mes}` 
                : (item.estado === 'En mora' ? 'En Mora' : 'Pendiente / Impago');
            const estadoColor = fuePagadoDespues ? '#2563eb' : '#dc2626';

            return `
                <tr>
                    <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; box-sizing: border-box;">
                        <span style="font-weight: bold; color: #1e293b;">${item.propietario}</span>
                        <span style="color: #64748b; font-size: 10px; margin-left: 6px;">(Lote ${item.numero_lote})</span>
                    </td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; box-sizing: border-box; font-weight: bold; color: ${estadoColor};">
                        ${estadoTexto}
                    </td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; font-weight: bold; color: #ea580c; box-sizing: border-box;">
                        ${item.monto_cuota_mes_fmt || item.monto_cuota_fmt}
                    </td>
                </tr>
            `;
        }).join(''),
        cuotasMesImpagasVencidas.length,
        [
            { text: "Propietario / Lote", width: "50%" },
            { text: "Estado / Fecha Pago Posterior", width: "25%", align: "center" },
            { text: "Monto Cuota", width: "25%", align: "right" }
        ]
    );

    // Bloque 4: Cobros Atrasados de meses anteriores realizados en este mes
    const htmlPagosAtrasadosMes = renderTable(
        `Cobros de Cuotas Atrasadas Realizados en ${data.periodo} (Recuperación de Mora)`,
        "#7c3aed",
        pagosAtrasadosMes.map(item => `
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; box-sizing: border-box;">
                    <span style="font-weight: bold; color: #1e293b;">${item.cliente}</span>
                    <span style="color: #64748b; font-size: 10px; margin-left: 6px;">(Lote ${item.lote})</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; box-sizing: border-box;">
                    ${item.vencimiento}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; box-sizing: border-box; font-weight: bold; color: #7c3aed;">
                    ${item.fecha_pago}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; font-weight: bold; color: #7c3aed; box-sizing: border-box;">
                    ${item.monto_fmt}
                </td>
            </tr>
        `).join(''),
        pagosAtrasadosMes.length,
        [
            { text: "Propietario / Lote", width: "40%" },
            { text: "Vencimiento Original", width: "20%", align: "center" },
            { text: "Fecha Pago Real", width: "20%", align: "center" },
            { text: "Monto Cobrado", width: "20%", align: "right" }
        ]
    );

    // Bloque 5: Cobros de cuotas futuras realizados en este mes
    const htmlPagosAdelantadosMes = renderTable(
        `Cobros de Cuotas Adelantadas Realizados en ${data.periodo}`,
        "#059669",
        pagosAdelantadosMes.map(item => `
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; box-sizing: border-box;">
                    <span style="font-weight: bold; color: #1e293b;">${item.cliente}</span>
                    <span style="color: #64748b; font-size: 10px; margin-left: 6px;">(Lote ${item.lote})</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; box-sizing: border-box;">
                    ${item.vencimiento}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; box-sizing: border-box; font-weight: bold; color: #059669;">
                    ${item.fecha_pago}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; font-weight: bold; color: #059669; box-sizing: border-box;">
                    ${item.monto_fmt}
                </td>
            </tr>
        `).join(''),
        pagosAdelantadosMes.length,
        [
            { text: "Propietario / Lote", width: "40%" },
            { text: "Vencimiento Futuro", width: "20%", align: "center" },
            { text: "Fecha Pago Real", width: "20%", align: "center" },
            { text: "Monto Cobrado", width: "20%", align: "right" }
        ]
    );

    const htmlContent = `
        <div id="pdf-container-cuotas" style="padding: 30px; background-color: white; font-family: serif; color: black; box-sizing: border-box;">
            <!-- Título Central -->
            <h1 style="text-align: center; color: #2f5597; font-weight: bold; font-size: 20px; margin-bottom: 24px;">REPORTE DE CUOTAS Y PARCELAS</h1>

            <!-- Información de Encabezado -->
            <div style="margin-bottom: 24px; line-height: 1.6; font-size: 13px;">
                <p style="margin: 0;"><span style="font-weight: bold;">Período:</span> ${data.periodo}</p>
                <p style="margin: 0;"><span style="font-weight: bold;">Fecha de emisión:</span> ${data.fecha_emision}</p>
            </div>

            <!-- Secciones por Condición de Cuota en el Mes -->
            ${htmlCuotasMesPagadas}
            ${htmlCuotasMesAnticipadas}
            ${htmlCuotasMesImpagas}
            ${htmlPagosAtrasadosMes}
            ${htmlPagosAdelantadosMes}
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `Reporte_Cuotas_Parcelas_${data.periodo.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt as any).from(htmlContent).save();
};
