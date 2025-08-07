import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import "./Report.css";
import GymExpenses from "./gymExpenses/GymExpenses";
import { TextField, MenuItem } from "@mui/material";

const Report = () => {
  const [totalDebt, setTotalDebt] = useState(0);
  const [newClientsCount, setNewClientsCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeByConcept, setIncomeByConcept] = useState({});
  const [totalGastos, setTotalGastos] = useState(0);

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

        // Obtener pagos e ingresos por concepto del mes seleccionado
        const pagosSnapshot = await getDocs(collection(db, "payments"));
        let ingresos = 0;
        const conceptos = {};

        pagosSnapshot.forEach((doc) => {
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

        setTotalIncome(ingresos);
        setIncomeByConcept(conceptos);
      } catch (error) {
        console.error("Error al obtener reportes:", error);
      }
    };

    fetchData();
  }, [selectedDate]); // Agregar selectedDate como dependencia

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div className="report-container">
      <h1 className="report-title">Reportes</h1>
      <p className="report-description">Visualiza estadísticas mensuales</p>

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
        <p className="detail-subtitle">Desglose de ingresos por concepto</p>

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
      />
    </div>
  );
};

export default Report;
