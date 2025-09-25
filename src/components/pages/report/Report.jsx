import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import "./Report.css";
import GymExpenses from "./gymExpenses/GymExpenses";
import { TextField, MenuItem, Button } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

const Report = () => {
  const [totalDebt, setTotalDebt] = useState(0);
  const [newClientsCount, setNewClientsCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeByConcept, setIncomeByConcept] = useState({});
  const [totalGastos, setTotalGastos] = useState(0);
  const [expensesData, setExpensesData] = useState([]);

  // Estado para el mes seleccionado
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  // Generar opciones de meses (últimos 12 meses)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const monthName = date.toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      });

      options.push({
        value: `${year}-${month}`,
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  const isDateInSelectedMonth = (date, selectedDate) => {
    if (!date) return false;

    const [selectedYear, selectedMonth] = selectedDate.split("-").map(Number);
    const dateObj = date.toDate ? date.toDate() : new Date(date);

    return (
      dateObj.getFullYear() === selectedYear &&
      dateObj.getMonth() + 1 === selectedMonth
    );
  };

  // Función para obtener el nombre del mes actual
  const getSelectedMonthName = () => {
    const [year, month] = selectedDate.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener clientes y calcular deuda y nuevos del mes seleccionado
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        let debtSum = 0;
        let newClients = 0;

        clientsSnapshot.forEach((doc) => {
          const data = doc.data();

          // Calcular deuda actual (esto se mantiene para mostrar deuda total)
          if (data.debt) debtSum += Number(data.debt);

          // Contar nuevos clientes del mes seleccionado
          const creationTime = doc._document?.createTime?.timestamp;
          if (
            creationTime &&
            isDateInSelectedMonth(creationTime, selectedDate)
          ) {
            newClients += 1;
          }
        });

        setTotalDebt(debtSum);
        setNewClientsCount(newClients);

        // 🔥 FUNCIÓN CORREGIDA: Obtener pagos de TODAS las colecciones
        let ingresos = 0;
        const conceptos = {};

        // Función helper para procesar pagos de cualquier colección
        const procesarPagos = (snapshot, coleccionNombre) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            const paymentDate = data.createdAt || data.fecha;

            // Filtrar pagos del mes seleccionado
            if (
              isDateInSelectedMonth(paymentDate, selectedDate) &&
              data.type !== "debt" &&
              !isNaN(parseFloat(data.monto))
            ) {
              const monto = parseFloat(data.monto);
              ingresos += monto;

              const concepto = data.concepto || "Otro";
              conceptos[concepto] = (conceptos[concepto] || 0) + monto;
            }
          });
        };

        // Cargar pagos de TODAS las colecciones
        const [paymentsSnap, patientPaymentsSnap, quiropraxiaPaymentsSnap] =
          await Promise.all([
            getDocs(collection(db, "payments")), // Pagos de gimnasio
            getDocs(collection(db, "patientPayments")), // Pagos de kinesio
            getDocs(collection(db, "quiropraxiaPayments")), // Pagos de quiropraxia
          ]);

        // Procesar pagos de cada colección
        procesarPagos(paymentsSnap, "payments");
        procesarPagos(patientPaymentsSnap, "patientPayments");
        procesarPagos(quiropraxiaPaymentsSnap, "quiropraxiaPayments");

        setTotalIncome(ingresos);
        setIncomeByConcept(conceptos);

        console.log(`📊 Reporte del mes ${getSelectedMonthName()}:`);
        console.log(`💰 Ingresos totales: $${ingresos.toLocaleString()}`);
        console.log(`📝 Conceptos:`, conceptos);
      } catch (error) {
        console.error("Error al obtener reportes:", error);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  // Función para imprimir el reporte
  const printReport = () => {
    const monthName = getSelectedMonthName();

    // Crear el contenido HTML para imprimir
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte Mensual - ${monthName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .section { 
              margin-bottom: 30px; 
            }
            .section h3 { 
              background-color: #f0f0f0; 
              padding: 10px; 
              margin-bottom: 10px;
              border-left: 4px solid #007bff;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 15px; 
              margin-bottom: 20px; 
            }
            .summary-card { 
              border: 1px solid #ddd; 
              padding: 15px; 
              text-align: center;
              border-radius: 5px;
            }
            .summary-card h4 { 
              margin: 0 0 10px 0; 
              color: #666;
            }
            .summary-card p { 
              margin: 0; 
              font-size: 18px; 
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .total-row { 
              background-color: #f0f8ff; 
              font-weight: bold; 
            }
            .positive { color: green; }
            .negative { color: red; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte Mensual</h1>
            <h2>${monthName}</h2>
            <p>Fecha de generación: ${new Date().toLocaleDateString(
              "es-AR"
            )}</p>
            <p><em>Incluye ingresos de Gimnasio, Kinesio y Quiropraxia</em></p>
          </div>

          <div class="section">
            <h3>Resumen General</h3>
            <div class="summary-grid">
              <div class="summary-card">
                <h4>Ingresos Totales</h4>
                <p>$${totalIncome.toLocaleString("es-AR")}</p>
              </div>
              <div class="summary-card">
                <h4>Nuevos Alumnos</h4>
                <p>${newClientsCount}</p>
              </div>
              <div class="summary-card">
                <h4>Gastos Totales</h4>
                <p>$${totalGastos.toLocaleString("es-AR")}</p>
              </div>
              <div class="summary-card">
                <h4>Balance</h4>
                <p class="${
                  totalIncome - totalGastos >= 0 ? "positive" : "negative"
                }">
                  $${(totalIncome - totalGastos).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Detalle de Ingresos</h3>
            <table>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(incomeByConcept)
                  .map(
                    ([concept, amount]) => `
                  <tr>
                    <td>${concept}</td>
                    <td>$${amount.toLocaleString("es-AR")}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td><strong>Total</strong></td>
                  <td><strong>$${totalIncome.toLocaleString(
                    "es-AR"
                  )}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>Detalle de Gastos</h3>
            <table>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Método de Pago</th>
                </tr>
              </thead>
              <tbody>
                ${expensesData
                  .map((expense) => {
                    const paymentMethod =
                      expense.paymentMethod === "efectivo"
                        ? "Efectivo"
                        : expense.paymentMethod === "tarjeta"
                        ? "Tarjeta"
                        : "Transferencia";
                    return `
                    <tr>
                      <td>${expense.concept}</td>
                      <td>$${parseFloat(expense.amount).toLocaleString(
                        "es-AR"
                      )}</td>
                      <td>${paymentMethod}</td>
                    </tr>
                  `;
                  })
                  .join("")}
                <tr class="total-row">
                  <td><strong>Total Gastos</strong></td>
                  <td><strong>$${totalGastos.toLocaleString(
                    "es-AR"
                  )}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    // Abrir ventana de impresión
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="report-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 className="report-title">Reportes</h1>
          <p className="report-description">
            Visualiza estadísticas mensuales de todas las áreas
          </p>
        </div>

        {/* Botón de impresión */}
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={printReport}
          style={{ minWidth: "140px" }}
        >
          Imprimir
        </Button>
      </div>

      {/* Selector de mes */}
      <div style={{ marginBottom: "20px" }}>
        <TextField
          select
          label="Mes"
          value={selectedDate}
          onChange={handleDateChange}
          style={{ minWidth: "200px" }}
        >
          {monthOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className="report-grid">
        <div className="report-card">
          <h3>Ingresos Totales</h3>
          <p>${totalIncome.toLocaleString("es-AR")}</p>
          <small style={{ color: "#666" }}>
            Gimnasio + Kinesio + Quiropraxia
          </small>
        </div>
        <div className="report-card">
          <h3>Nuevos Alumnos</h3>
          <p>{newClientsCount}</p>
        </div>
        <div className="report-card">
          <h3>Deuda Total</h3>
          <p>${totalDebt.toLocaleString("es-AR")}</p>
        </div>
        <div className="report-card">
          <h3>Balance</h3>
          <p style={{ color: totalIncome - totalGastos < 0 ? "red" : "green" }}>
            ${(totalIncome - totalGastos).toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      <div className="report-detail">
        <h2>Detalle de Ingresos</h2>
        <p className="detail-subtitle">
          Desglose de ingresos por concepto (todas las áreas)
        </p>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(incomeByConcept).map(([concept, amount]) => (
                <tr key={concept}>
                  <td>{concept}</td>
                  <td>${amount.toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <table className="report-table">
          <tfoot>
            <tr className="report-total-row">
              <td>
                <strong>Total</strong>
              </td>
              <td>
                <strong>${totalIncome.toLocaleString("es-AR")}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <GymExpenses
        onGastosChange={setTotalGastos}
        selectedDate={selectedDate}
        onExpensesDataChange={setExpensesData}
      />
    </div>
  );
};

export default Report;
