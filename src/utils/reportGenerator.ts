// @ts-ignore
import html2pdf from 'html2pdf.js';
import type { ReporteData } from "../services/api";

export const downloadReportDocx = (data: ReporteData) => {
    const tienePagosAtrasados = (data.resumen_ejecutivo.recuperacion_mora_val ?? 0) > 0 || (!!data.resumen_ejecutivo.recuperacion_mora_fmt && data.resumen_ejecutivo.recuperacion_mora_fmt !== '$ 0');
    const tienePagosAdelantados = (data.resumen_ejecutivo.pagos_adelantados_val ?? 0) > 0 || (!!data.resumen_ejecutivo.pagos_adelantados_fmt && data.resumen_ejecutivo.pagos_adelantados_fmt !== '$ 0');
    const tieneCuentasPorCobrar = !!data.resumen_ejecutivo.cuentas_por_cobrar_fmt && data.resumen_ejecutivo.cuentas_por_cobrar_fmt !== '$ 0';

    const filaPagosAtrasados = tienePagosAtrasados ? `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; box-sizing: border-box;">Pagos Atrasados</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; box-sizing: border-box;">${data.resumen_ejecutivo.recuperacion_mora_fmt}</td>
        </tr>
    ` : '';

    const filaPagosAdelantados = tienePagosAdelantados ? `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; box-sizing: border-box;">Pagos Adelantados</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; box-sizing: border-box;">${data.resumen_ejecutivo.pagos_adelantados_fmt}</td>
        </tr>
    ` : '';

    const filaCuentasPorCobrar = tieneCuentasPorCobrar ? `
        <tr style="color: #dc2626; font-weight: bold;">
            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; box-sizing: border-box;">Cuentas por cobrar</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; box-sizing: border-box;">${data.resumen_ejecutivo.cuentas_por_cobrar_fmt}</td>
        </tr>
    ` : '';

    // Generate the HTML content string for the PDF with INLINE STYLES to avoid html2canvas oklch crash
    const htmlContent = `
        <div id="pdf-container" style="padding: 30px; background-color: white; font-family: serif; color: black; box-sizing: border-box;">
            <!-- Título Central -->
            <h1 style="text-align: center; color: #2f5597; font-weight: bold; font-size: 20px; margin-bottom: 32px;">ESTADO DE CUENTA</h1>

            <!-- Información de Encabezado -->
            <div style="margin-bottom: 32px; line-height: 1.6;">
                <p style="margin: 0;"><span style="font-weight: bold;">Período:</span> ${data.periodo}</p>
                <p style="margin: 0;"><span style="font-weight: bold;">Fecha de emisión:</span> ${data.fecha_emision}</p>
            </div>

            <!-- Sección: Resumen Ejecutivo -->
            <div style="margin-bottom: 32px;">
                <h2 style="color: #2f5597; font-weight: bold; font-size: 18px; margin-bottom: 12px; margin-top: 0;">Resumen Ejecutivo</h2>
                
                <!-- Tabla 1: Total Esperado -->
                <table style="width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; box-sizing: border-box; margin-bottom: 16px;">
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 50%; background-color: #f8fafc; font-weight: bold; box-sizing: border-box;">Indicador</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 50%; background-color: #f8fafc; font-weight: bold; text-align: right; box-sizing: border-box;">Monto</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; font-weight: bold; box-sizing: border-box;">Total esperado ${data.periodo}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; font-weight: bold; box-sizing: border-box;">${data.resumen_ejecutivo.facturacion_periodo_fmt}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Tabla 2: Detalle de Cobranza y Cuentas -->
                <table style="width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; box-sizing: border-box;">
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 50%; background-color: #f8fafc; font-weight: bold; box-sizing: border-box;">Indicador</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 50%; background-color: #f8fafc; font-weight: bold; text-align: right; box-sizing: border-box;">Monto</td>
                        </tr>
                        ${filaPagosAtrasados}
                        ${filaPagosAdelantados}
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; box-sizing: border-box;">Cuotas ${data.periodo}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; box-sizing: border-box;">${data.resumen_ejecutivo.cobranza_corriente_fmt}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; font-weight: bold; box-sizing: border-box;">Total Recaudado</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; font-weight: bold; box-sizing: border-box;">${data.resumen_ejecutivo.cobranza_efectiva_fmt}</td>
                        </tr>
                        ${filaCuentasPorCobrar}
                    </tbody>
                </table>
            </div>

            <!-- Sección: Estado de Cobranza -->
            <div style="margin-bottom: 32px;">
                <h2 style="color: #2f5597; font-weight: bold; font-size: 18px; margin-bottom: 12px; margin-top: 0;">Estado de Cobranza</h2>
                <table style="width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; text-align: center; box-sizing: border-box;">
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 33.33%; background-color: #f8fafc; font-weight: bold; text-align: left; box-sizing: border-box;">Estado</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 33.33%; background-color: #f8fafc; font-weight: bold; box-sizing: border-box;">Lotes</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; width: 33.33%; background-color: #f8fafc; font-weight: bold; text-align: right; box-sizing: border-box;">Monto</td>
                        </tr>
                        ${data.estado_cobranza.filter(item => item.lotes > 0 && item.estado !== 'Al día').map(item => `
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: left; box-sizing: border-box;">${item.estado}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; box-sizing: border-box;">${item.lotes}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; box-sizing: border-box;">${item.monto_fmt}</td>
                        </tr>
                        `).join('')}
                        <tr style="font-weight: bold; background-color: #f8fafc;">
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: left; box-sizing: border-box;">Total Cuentas por Cobrar</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; box-sizing: border-box;">${data.estado_cobranza.filter(item => item.estado !== 'Al día').reduce((acc, item) => acc + item.lotes, 0)}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: right; box-sizing: border-box;">${data.resumen_ejecutivo.cuentas_por_cobrar_fmt}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const opt = {
        margin: 10, // mm
        filename: `Estado_Cuenta_${data.fecha_emision.replace(/-/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    // Al pasar el string de HTML directo, html2pdf creará su propio contenedor aislado,
    // evitando que html2canvas intente leer las variables CSS de Tailwind v4 ("oklch") 
    // del documento principal, lo que causaba el error de parseo.
    html2pdf().set(opt as any).from(htmlContent).save();
};
