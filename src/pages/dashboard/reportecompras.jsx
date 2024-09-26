import React from "react";
import * as XLSX from "xlsx";
import axios from "../../utils/axiosConfig";
import Swal from "sweetalert2";

export function ReporteCompras() {
  const generarReporte = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/compras");
      const compras = response.data;

      const datosReporte = compras.map((compra) => ({
        "Número de Recibo": compra.numero_recibo || "N/A",
        "Proveedor": compra.proveedorCompra?.nombre || "Desconocido",
        "Fecha de Compra": compra.fecha_compra.split("T")[0],
        "Fecha de Registro": compra.fecha_registro.split("T")[0],
        "Estado": compra.estado,
        "Total": parseFloat(compra.total).toFixed(2),
        "Anulación": compra.motivo_anulacion || "N/A",  // Incluyendo el campo de anulación
      }));

      const worksheet = XLSX.utils.json_to_sheet(datosReporte);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Compras");

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 20 }, // Número de Recibo
        { wch: 25 }, // Proveedor
        { wch: 15 }, // Fecha de Compra
        { wch: 15 }, // Fecha de Registro
        { wch: 10 }, // Estado
        { wch: 15 }, // Total
        { wch: 25 }, // Anulación
      ];

      worksheet['!cols'] = columnWidths; // Aplicar el ancho a las columnas

      // Formato de celda opcional
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let row = range.s.r; row <= range.e.r; ++row) {
        for (let col = range.s.c; col <= range.e.c; ++col) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue; // Salta si la celda está vacía
          worksheet[cellAddress].s = {
            fill: {
              fgColor: { rgb: "FFFFFF" }, // Color de fondo blanco
            },
            font: {
              name: "Arial",
              sz: 12,
              color: { rgb: "000000" }, // Color de texto negro
              bold: false,
              italic: false,
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
      }

      XLSX.writeFile(workbook, "reporte_compras.xlsx");

      Swal.fire({
        icon: "success",
        title: "Reporte generado correctamente",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      Swal.fire({
        icon: "error",
        title: "Error al generar el reporte",
        text: "Hubo un problema al generar el reporte de compras.",
      });
    }
  };

  React.useEffect(() => {
    generarReporte();
  }, []);

  return null;
}
