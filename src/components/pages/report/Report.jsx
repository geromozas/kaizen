// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";
// import "./Report.css";

// const Report = () => {
//   const [totalDebt, setTotalDebt] = useState(0);
//   const [newClientsCount, setNewClientsCount] = useState(0);
//   const [totalIncome, setTotalIncome] = useState(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Clientes: deuda y nuevos alumnos
//         const clientsSnapshot = await getDocs(collection(db, "clients"));
//         let debtSum = 0;
//         let newClients = 0;

//         clientsSnapshot.forEach((doc) => {
//           const data = doc.data();

//           // Deuda total
//           if (data.debt) {
//             debtSum += Number(data.debt);
//           }

//           // Nuevos alumnos (este mes)
//           const creationTime = doc._document?.createTime?.timestamp?.toDate?.();
//           if (creationTime) {
//             const now = new Date();
//             const createdAt = new Date(creationTime);
//             const isSameMonth =
//               createdAt.getMonth() === now.getMonth() &&
//               createdAt.getFullYear() === now.getFullYear();

//             if (isSameMonth) {
//               newClients += 1;
//             }
//           }
//         });

//         setTotalDebt(debtSum);
//         setNewClientsCount(newClients);

//         // Pagos: ingresos reales
//         const pagosSnapshot = await getDocs(collection(db, "payments"));
//         let ingresos = 0;

//         pagosSnapshot.forEach((doc) => {
//           const data = doc.data();
//           if (data.type !== "debt" && !isNaN(parseFloat(data.monto))) {
//             ingresos += parseFloat(data.monto);
//           }
//         });

//         setTotalIncome(ingresos);
//       } catch (error) {
//         console.error("Error al obtener reportes:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="report-container">
//       <h1 className="report-title">Reportes</h1>
//       <p className="report-description">Visualiza estadísticas mensuales</p>

//       <div className="report-grid">
//         <div className="report-card">
//           <h3>Ingresos Totales</h3>
//           <p>${totalIncome.toLocaleString("es-AR")}</p>
//         </div>
//         <div className="report-card">
//           <h3>Nuevos Alumnos</h3>
//           <p>{newClientsCount}</p>
//         </div>
//         <div className="report-card">
//           <h3>Deuda Total</h3>
//           <p>${totalDebt.toLocaleString("es-AR")}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Report;
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import "./Report.css";
import GymExpenses from "./gymExpenses/GymExpenses";

const Report = () => {
  const [totalDebt, setTotalDebt] = useState(0);
  const [newClientsCount, setNewClientsCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeByConcept, setIncomeByConcept] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        let debtSum = 0;
        let newClients = 0;

        clientsSnapshot.forEach((doc) => {
          const data = doc.data();

          // Deuda
          if (data.debt) {
            debtSum += Number(data.debt);
          }

          // Nuevos alumnos este mes
          const creationTime = doc._document?.createTime?.timestamp?.toDate?.();
          if (creationTime) {
            const now = new Date();
            const createdAt = new Date(creationTime);
            const isSameMonth =
              createdAt.getMonth() === now.getMonth() &&
              createdAt.getFullYear() === now.getFullYear();

            if (isSameMonth) newClients += 1;
          }
        });

        setTotalDebt(debtSum);
        setNewClientsCount(newClients);

        // Pagos
        const pagosSnapshot = await getDocs(collection(db, "payments"));
        let ingresos = 0;
        const conceptos = {};

        pagosSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type !== "debt" && !isNaN(parseFloat(data.monto))) {
            ingresos += parseFloat(data.monto);

            const concepto = data.concepto || "Otro";
            conceptos[concepto] =
              (conceptos[concepto] || 0) + parseFloat(data.monto);
          }
        });

        setTotalIncome(ingresos);
        setIncomeByConcept(conceptos);
      } catch (error) {
        console.error("Error al obtener reportes:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="report-container">
      <h1 className="report-title">Reportes</h1>
      <p className="report-description">Visualiza estadísticas mensuales</p>

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
      <GymExpenses />
    </div>
  );
};

export default Report;
