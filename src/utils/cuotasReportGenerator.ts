// @ts-ignore
import html2pdf from 'html2pdf.js';
import type { ReporteData } from "../services/api";

export const downloadReportCuotas = (data: ReporteData) => {
    const pagados = data.detalles.filter(d => d.estado === 'Al día');
    const vencidos = data.detalles.filter(d => d.estado === 'Vencidos');
    const pendientes = data.detalles.filter(d => d.estado === 'Pendientes');
    const enMora = data.detalles.filter(d => d.estado === 'En mora');

    const renderSection = (titulo: string, color: string, items: typeof data.detalles) => {
        if (items.length === 0) return '';
        return `
            <div style="margin-bottom: 24px; page-break-inside: avoid; break-inside: avoid;">
                <h3 style="color: ${color}; font-weight: bold; font-size: 14px; margin-bottom: 8px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${titulo} (${items.length})
                </h3>
                <table style="width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 12px; box-sizing: border-box;">
                    <thead>
                        <tr style="background-color: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
                            <th style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 60%; text-align: left; box-sizing: border-box;">Propietario / Lote</th>
                            <th style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 40%; text-align: right; box-sizing: border-box;">Valor Cuota</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                        <tr style="page-break-inside: avoid; break-inside: avoid;">
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: left; box-sizing: border-box;">
                                <span style="font-weight: bold; color: #1e293b;">${item.propietario}</span>
                                <span style="color: #64748b; font-size: 11px; margin-left: 6px;">(Lote ${item.numero_lote})</span>
                            </td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; font-weight: bold; color: ${color}; box-sizing: border-box;">
                                ${item.monto_cuota_fmt || item.saldo_fmt}
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const htmlContent = `
        <div id="pdf-container-cuotas" style="padding: 30px; background-color: white; font-family: serif; color: black; box-sizing: border-box;">
            <!-- Título Central -->
            <h1 style="text-align: center; color: #2f5597; font-weight: bold; font-size: 20px; margin-bottom: 24px;">REPORTE DE CUOTAS Y PARCELAS</h1>

            <!-- Información de Encabezado -->
            <div style="margin-bottom: 24px; line-height: 1.6; font-size: 13px;">
                <p style="margin: 0;"><span style="font-weight: bold;">Período:</span> ${data.periodo}</p>
                <p style="margin: 0;"><span style="font-weight: bold;">Fecha de emisión:</span> ${data.fecha_emision}</p>
            </div>

            <!-- Secciones por Estado -->
            ${renderSection("Pagados / Al Día", "#16a34a", pagados)}
            ${renderSection("Pendientes (Vencen este mes)", "#0284c7", pendientes)}
            ${renderSection("Vencidos (Impagos este mes)", "#ea580c", vencidos)}
            ${renderSection("En Mora (Meses anteriores)", "#dc2626", enMora)}
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
