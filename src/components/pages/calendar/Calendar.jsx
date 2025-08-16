// import { useState, useEffect } from "react";
// import "./Calendar.css";
// import { Button, Checkbox, FormControlLabel } from "@mui/material";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   deleteDoc,
//   doc,
//   updateDoc,
//   writeBatch,
// } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";
// import NewScheduleModal from "../NewScheduleModal/NewScheduleModal";

// const availableHours = [
//   "07:00",
//   "08:00",
//   "09:00",
//   "10:00",
//   "11:00",
//   "12:00",
//   "13:00",
//   "14:00",
//   "15:00",
//   "16:00",
//   "17:00",
//   "18:00",
//   "19:00",
//   "20:00",
// ];

// const Calendar = () => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [modalOpen, setModalOpen] = useState(false);
//   const [schedules, setSchedules] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [editSchedule, setEditSchedule] = useState(null);
//   const [viewMode, setViewMode] = useState("day");

//   const getWeekDates = (date) => {
//     const start = new Date(date);
//     start.setDate(date.getDate() - start.getDay() + 1); // lunes
//     return Array.from({ length: 7 }).map((_, i) => {
//       const d = new Date(start);
//       d.setDate(start.getDate() + i);
//       return d;
//     });
//   };

//   const loadSchedules = async () => {
//     const q = query(collection(db, "schedules"));
//     const res = await getDocs(q);
//     const horarios = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     setSchedules(horarios);
//   };

//   const loadClients = async () => {
//     const snap = await getDocs(collection(db, "clients"));
//     const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     setClients(list);
//   };

//   useEffect(() => {
//     loadSchedules();
//     loadClients();
//   }, [selectedDate]);

//   const handlePreviousDay = () => {
//     setSelectedDate((prev) => {
//       const newDate = new Date(prev);
//       newDate.setDate(newDate.getDate() - 1);
//       return newDate;
//     });
//   };

//   const handleNextDay = () => {
//     setSelectedDate((prev) => {
//       const newDate = new Date(prev);
//       newDate.setDate(newDate.getDate() + 1);
//       return newDate;
//     });
//   };

//   const handleDelete = async (id) => {
//     const confirm = window.confirm("¿Estás seguro de eliminar este horario?");
//     if (!confirm) return;
//     await deleteDoc(doc(db, "schedules", id));
//     loadSchedules();
//   };

//   const handleDeleteBatch = async (batchId) => {
//     const schedulesInBatch = schedules.filter((s) => s.batchId === batchId);

//     const confirmMessage = `¿Estás seguro de eliminar toda la serie de horarios?\n\nSe eliminarán ${schedulesInBatch.length} horarios creados en conjunto.`;

//     if (!window.confirm(confirmMessage)) return;

//     try {
//       // Usar batch para eliminar múltiples documentos de manera eficiente
//       const batch = writeBatch(db);

//       schedulesInBatch.forEach((schedule) => {
//         const scheduleRef = doc(db, "schedules", schedule.id);
//         batch.delete(scheduleRef);
//       });

//       await batch.commit();

//       alert(`Se eliminaron ${schedulesInBatch.length} horarios exitosamente.`);
//       loadSchedules();
//     } catch (error) {
//       console.error("Error al eliminar la serie de horarios:", error);
//       alert("Error al eliminar la serie de horarios");
//     }
//   };

//   const handleEdit = (schedule) => {
//     setEditSchedule(schedule);
//     setModalOpen(true);
//   };

//   const handleAttendanceToggle = async (scheduleId, clientId) => {
//     const schedule = schedules.find((s) => s.id === scheduleId);
//     if (!schedule) return;

//     const updatedClients = schedule.clients.map((client) => {
//       if (client.id === clientId) {
//         return { ...client, attended: !client.attended };
//       }
//       return client;
//     });

//     await updateDoc(doc(db, "schedules", scheduleId), {
//       clients: updatedClients,
//     });

//     loadSchedules();
//   };

//   // Función para verificar si un horario pertenece a una serie
//   const isPartOfBatch = (schedule) => {
//     if (!schedule.batchId) return false;
//     const batchSchedules = schedules.filter(
//       (s) => s.batchId === schedule.batchId
//     );
//     return batchSchedules.length > 1;
//   };

//   // Función para obtener información de la serie
//   const getBatchInfo = (batchId) => {
//     const batchSchedules = schedules.filter((s) => s.batchId === batchId);
//     return {
//       total: batchSchedules.length,
//       schedules: batchSchedules,
//     };
//   };

//   const formattedDate = selectedDate.toLocaleDateString("es-ES", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });

//   const formattedDateNumeric = selectedDate.toLocaleDateString("es-ES");
//   const formattedDay = selectedDate.toLocaleDateString("es-ES", {
//     weekday: "long",
//   });

//   const weekDates = getWeekDates(selectedDate);

//   const getSchedulesByDayHour = (dateStr, hour) =>
//     schedules.filter((s) => s.date === dateStr && s.hour === hour);

//   const formatDate = (date) =>
//     date.toLocaleDateString("es-ES", {
//       day: "2-digit",
//       month: "2-digit",
//     });

//   return (
//     <div id="boxPatients">
//       <div className="firtsBoxPatients">
//         <div>
//           <h1>Calendario / Turnos</h1>
//           <p>Organiza los turnos y registra la asistencia por horario</p>
//         </div>
//       </div>

//       <div className="calendar-container">
//         <div style={{ padding: 10 }} className="secondBoxPatients">
//           <h2>Calendario</h2>
//           <p>Selecciona una fecha para ver o programar horarios</p>
//           <hr />
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               marginTop: 10,
//             }}
//           >
//             <Button onClick={handlePreviousDay} variant="contained">
//               ←
//             </Button>
//             <div
//               style={{
//                 border: "1px solid #ccc",
//                 padding: "5px 10px",
//                 borderRadius: 5,
//               }}
//             >
//               {formattedDate}
//             </div>
//             <Button onClick={handleNextDay} variant="contained">
//               →
//             </Button>
//           </div>

//           <div style={{ marginTop: 20 }}>
//             <h4>Resumen</h4>
//             <p>
//               <strong>Fecha: </strong>
//               {formattedDateNumeric}
//             </p>
//             <p>
//               <strong>Día: </strong>
//               {formattedDay}
//             </p>
//             <p>
//               <strong>Horarios programados: </strong>
//               {
//                 schedules.filter(
//                   (s) => s.date === selectedDate.toISOString().split("T")[0]
//                 ).length
//               }
//             </p>
//             <p>
//               <strong>Total alumnos: </strong>
//               {schedules
//                 .filter(
//                   (s) => s.date === selectedDate.toISOString().split("T")[0]
//                 )
//                 .reduce((acc, s) => acc + s.clients.length, 0)}
//             </p>
//           </div>
//         </div>

//         <div style={{ padding: 10 }} className="thirdBoxPatients">
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <h2>
//               {viewMode === "day"
//                 ? "Horarios del Día"
//                 : "Horarios de la Semana"}
//             </h2>
//             <Button variant="contained" onClick={() => setModalOpen(true)}>
//               + Nuevo Horario
//             </Button>
//           </div>

//           <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
//             <Button
//               variant={viewMode === "day" ? "contained" : "outlined"}
//               onClick={() => setViewMode("day")}
//             >
//               Día
//             </Button>
//             <Button
//               variant={viewMode === "week" ? "contained" : "outlined"}
//               onClick={() => setViewMode("week")}
//             >
//               Semana
//             </Button>
//           </div>

//           {viewMode === "day" ? (
//             <>
//               <p>
//                 {formattedDay} {formattedDateNumeric}
//               </p>
//               <hr />
//               {schedules.filter(
//                 (s) => s.date === selectedDate.toISOString().split("T")[0]
//               ).length === 0 ? (
//                 <p style={{ textAlign: "center", marginTop: 60 }}>
//                   No hay horarios programados para este día
//                 </p>
//               ) : (
//                 schedules
//                   .filter(
//                     (s) => s.date === selectedDate.toISOString().split("T")[0]
//                   )
//                   .map((schedule) => (
//                     <div
//                       key={schedule.id}
//                       style={{
//                         border: "1px solid #ccc",
//                         margin: "10px",
//                         padding: "10px",
//                       }}
//                     >
//                       <div
//                         style={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                           marginBottom: "10px",
//                         }}
//                       >
//                         <h4>{schedule.hour}</h4>
//                         {/* Mostrar indicador si pertenece a una serie */}
//                         {isPartOfBatch(schedule) && (
//                           <div
//                             style={{
//                               backgroundColor: "#e3f2fd",
//                               color: "#1976d2",
//                               padding: "2px 8px",
//                               borderRadius: "12px",
//                               fontSize: "12px",
//                               fontWeight: "bold",
//                             }}
//                           >
//                             Serie de {getBatchInfo(schedule.batchId).total}{" "}
//                             horarios
//                           </div>
//                         )}
//                       </div>

//                       <p>{schedule.clients.length} alumnos</p>
//                       <ul>
//                         {schedule.clients.map((clientObj) => {
//                           const alumno = clients.find(
//                             (c) => c.id === clientObj.id
//                           );
//                           return (
//                             <li
//                               key={clientObj.id}
//                               style={{ listStyle: "none" }}
//                             >
//                               <FormControlLabel
//                                 control={
//                                   <Checkbox
//                                     checked={clientObj.attended}
//                                     onChange={() =>
//                                       handleAttendanceToggle(
//                                         schedule.id,
//                                         clientObj.id
//                                       )
//                                     }
//                                   />
//                                 }
//                                 label={
//                                   typeof alumno?.name === "string" &&
//                                   typeof alumno?.lastName === "string"
//                                     ? `${alumno.name} ${alumno.lastName}`
//                                     : String(
//                                         clientObj?.id ?? "Alumno desconocido"
//                                       )
//                                 }
//                               />
//                             </li>
//                           );
//                         })}
//                       </ul>
//                       <div
//                         style={{
//                           display: "flex",
//                           gap: "5px",
//                           flexWrap: "wrap",
//                         }}
//                       >
//                         <Button
//                           onClick={() => handleEdit(schedule)}
//                           variant="outlined"
//                           size="small"
//                         >
//                           Editar
//                         </Button>
//                         <Button
//                           onClick={() => handleDelete(schedule.id)}
//                           variant="outlined"
//                           color="error"
//                           size="small"
//                         >
//                           Eliminar
//                         </Button>
//                         {/* Botón para eliminar toda la serie si pertenece a una */}
//                         {isPartOfBatch(schedule) && (
//                           <Button
//                             onClick={() => handleDeleteBatch(schedule.batchId)}
//                             variant="contained"
//                             color="error"
//                             size="small"
//                             style={{ marginLeft: "10px" }}
//                           >
//                             Eliminar Serie Completa
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   ))
//               )}
//             </>
//           ) : (
//             <>
//               <p>
//                 Semana del {formatDate(weekDates[0])} al{" "}
//                 {formatDate(weekDates[6])}
//               </p>
//               <table style={{ borderCollapse: "collapse", width: "100%" }}>
//                 <thead>
//                   <tr>
//                     <th style={{ border: "1px solid #ddd", padding: 8 }}>
//                       Hora
//                     </th>
//                     {weekDates.map((date, idx) => (
//                       <th
//                         key={idx}
//                         style={{ border: "1px solid #ddd", padding: 8 }}
//                       >
//                         {date.toLocaleDateString("es-ES", {
//                           weekday: "short",
//                           day: "2-digit",
//                           month: "2-digit",
//                         })}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {availableHours.map((hour) => (
//                     <tr key={hour}>
//                       <td style={{ border: "1px solid #ddd", padding: 8 }}>
//                         {hour}
//                       </td>
//                       {weekDates.map((date) => {
//                         const dateStr = date.toISOString().split("T")[0];
//                         const matches = getSchedulesByDayHour(dateStr, hour);
//                         const total = matches.reduce(
//                           (acc, s) => acc + s.clients.length,
//                           0
//                         );
//                         return (
//                           <td
//                             key={dateStr + hour}
//                             style={{
//                               border: "1px solid #ddd",
//                               padding: 8,
//                               textAlign: "center",
//                               color: total > 0 ? "green" : "#999",
//                             }}
//                           >
//                             {total > 0 ? `👥 ${total}` : ""}
//                           </td>
//                         );
//                       })}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </>
//           )}
//         </div>
//       </div>

//       <NewScheduleModal
//         open={modalOpen}
//         onClose={() => {
//           setModalOpen(false);
//           setEditSchedule(null);
//         }}
//         selectedDate={selectedDate}
//         refresh={loadSchedules}
//         editData={editSchedule}
//       />
//     </div>
//   );
// };

// export default Calendar;
import { useState, useEffect } from "react";
import "./Calendar.css";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import NewScheduleModal from "../NewScheduleModal/NewScheduleModal";

const availableHours = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [editSchedule, setEditSchedule] = useState(null);
  const [viewMode, setViewMode] = useState("day");
  // Agregamos estado para las diferentes colecciones de clientes
  const [kinesioClients, setKinesioClients] = useState([]);
  const [gimnasioClients, setGimnasioClients] = useState([]);
  const [quiropraxiaClients, setQuiropraxiaClients] = useState([]);

  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - start.getDay() + 1); // lunes
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const loadSchedules = async () => {
    const q = query(collection(db, "schedules"));
    const res = await getDocs(q);
    const horarios = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSchedules(horarios);
  };

  const loadClients = async () => {
    // Cargar clientes de gimnasio (mantenemos compatibilidad)
    const snap = await getDocs(collection(db, "clients"));
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setClients(list);
    setGimnasioClients(list);
  };

  // Nueva función para cargar todos los tipos de clientes
  const loadAllClients = async () => {
    try {
      // Cargar clientes de kinesio (colección "patients")
      const kinesioSnap = await getDocs(collection(db, "patients"));
      const kinesioList = kinesioSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        activityType: "kinesio",
      }));
      setKinesioClients(kinesioList);

      // Cargar clientes de gimnasio (colección "clients")
      const gimnasioSnap = await getDocs(collection(db, "clients"));
      const gimnasioList = gimnasioSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        activityType: "gimnasio",
      }));
      setClients(gimnasioList);
      setGimnasioClients(gimnasioList);

      // Cargar clientes de quiropraxia (colección "quiropraxia")
      const quiropraxiaSnap = await getDocs(collection(db, "quiropraxia"));
      const quiropraxiaList = quiropraxiaSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        activityType: "quiropraxia",
      }));
      setQuiropraxiaClients(quiropraxiaList);

      console.log("Clientes cargados:", {
        kinesio: kinesioList.length,
        gimnasio: gimnasioList.length,
        quiropraxia: quiropraxiaList.length,
      });
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  useEffect(() => {
    loadSchedules();
    loadAllClients();
  }, [selectedDate]);

  const handlePreviousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Estás seguro de eliminar este horario?");
    if (!confirm) return;
    await deleteDoc(doc(db, "schedules", id));
    loadSchedules();
  };

  const handleDeleteBatch = async (batchId) => {
    const schedulesInBatch = schedules.filter((s) => s.batchId === batchId);

    const confirmMessage = `¿Estás seguro de eliminar toda la serie de horarios?\n\nSe eliminarán ${schedulesInBatch.length} horarios creados en conjunto.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      // Usar batch para eliminar múltiples documentos de manera eficiente
      const batch = writeBatch(db);

      schedulesInBatch.forEach((schedule) => {
        const scheduleRef = doc(db, "schedules", schedule.id);
        batch.delete(scheduleRef);
      });

      await batch.commit();

      alert(`Se eliminaron ${schedulesInBatch.length} horarios exitosamente.`);
      loadSchedules();
    } catch (error) {
      console.error("Error al eliminar la serie de horarios:", error);
      alert("Error al eliminar la serie de horarios");
    }
  };

  const handleEdit = (schedule) => {
    setEditSchedule(schedule);
    setModalOpen(true);
  };

  const handleAttendanceToggle = async (scheduleId, clientId) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const updatedClients = schedule.clients.map((client) => {
      if (client.id === clientId) {
        return { ...client, attended: !client.attended };
      }
      return client;
    });

    await updateDoc(doc(db, "schedules", scheduleId), {
      clients: updatedClients,
    });

    loadSchedules();
  };

  // Función para verificar si un horario pertenece a una serie
  const isPartOfBatch = (schedule) => {
    if (!schedule.batchId) return false;
    const batchSchedules = schedules.filter(
      (s) => s.batchId === schedule.batchId
    );
    return batchSchedules.length > 1;
  };

  // Función para obtener información de la serie
  const getBatchInfo = (batchId) => {
    const batchSchedules = schedules.filter((s) => s.batchId === batchId);
    return {
      total: batchSchedules.length,
      schedules: batchSchedules,
    };
  };

  // Función para obtener el cliente correcto según el tipo de actividad
  const getClientInfo = (clientObj) => {
    const { id, activityType } = clientObj;

    // Si no hay activityType, buscar en gimnasio por compatibilidad
    if (!activityType) {
      return gimnasioClients.find((c) => c.id === id);
    }

    switch (activityType) {
      case "kinesio":
        return kinesioClients.find((c) => c.id === id);
      case "quiropraxia":
        return quiropraxiaClients.find((c) => c.id === id);
      case "gimnasio":
      default:
        return gimnasioClients.find((c) => c.id === id);
    }
  };

  // Función para obtener el color del badge según el tipo de actividad
  const getActivityColor = (activityType) => {
    switch (activityType) {
      case "kinesio":
        return { backgroundColor: "#e8f5e8", color: "#2e7d32" };
      case "quiropraxia":
        return { backgroundColor: "#fff3e0", color: "#f57c00" };
      case "gimnasio":
      default:
        return { backgroundColor: "#e3f2fd", color: "#1976d2" };
    }
  };

  // Función para obtener el nombre de la actividad
  const getActivityName = (activityType) => {
    switch (activityType) {
      case "kinesio":
        return "Kinesiología";
      case "quiropraxia":
        return "Quiropraxia";
      case "gimnasio":
      default:
        return "Gimnasio";
    }
  };

  const formattedDate = selectedDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedDateNumeric = selectedDate.toLocaleDateString("es-ES");
  const formattedDay = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
  });

  const weekDates = getWeekDates(selectedDate);

  const getSchedulesByDayHour = (dateStr, hour) =>
    schedules.filter((s) => s.date === dateStr && s.hour === hour);

  const formatDate = (date) =>
    date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <div id="boxPatients">
      <div className="firtsBoxPatients">
        <div>
          <h1>Calendario / Turnos</h1>
          <p>Organiza los turnos y registra la asistencia por horario</p>
        </div>
      </div>

      <div className="calendar-container">
        <div style={{ padding: 10 }} className="secondBoxPatients">
          <h2>Calendario</h2>
          <p>Selecciona una fecha para ver o programar horarios</p>
          <hr />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 10,
            }}
          >
            <Button onClick={handlePreviousDay} variant="contained">
              ←
            </Button>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "5px 10px",
                borderRadius: 5,
              }}
            >
              {formattedDate}
            </div>
            <Button onClick={handleNextDay} variant="contained">
              →
            </Button>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4>Resumen</h4>
            <p>
              <strong>Fecha: </strong>
              {formattedDateNumeric}
            </p>
            <p>
              <strong>Día: </strong>
              {formattedDay}
            </p>
            <p>
              <strong>Horarios programados: </strong>
              {
                schedules.filter(
                  (s) => s.date === selectedDate.toISOString().split("T")[0]
                ).length
              }
            </p>
            <p>
              <strong>Total alumnos: </strong>
              {schedules
                .filter(
                  (s) => s.date === selectedDate.toISOString().split("T")[0]
                )
                .reduce((acc, s) => acc + s.clients.length, 0)}
            </p>
          </div>
        </div>

        <div style={{ padding: 10 }} className="thirdBoxPatients">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>
              {viewMode === "day"
                ? "Horarios del Día"
                : "Horarios de la Semana"}
            </h2>
            <Button variant="contained" onClick={() => setModalOpen(true)}>
              + Nuevo Horario
            </Button>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <Button
              variant={viewMode === "day" ? "contained" : "outlined"}
              onClick={() => setViewMode("day")}
            >
              Día
            </Button>
            <Button
              variant={viewMode === "week" ? "contained" : "outlined"}
              onClick={() => setViewMode("week")}
            >
              Semana
            </Button>
          </div>

          {viewMode === "day" ? (
            <>
              <p>
                {formattedDay} {formattedDateNumeric}
              </p>
              <hr />
              {schedules.filter(
                (s) => s.date === selectedDate.toISOString().split("T")[0]
              ).length === 0 ? (
                <p style={{ textAlign: "center", marginTop: 60 }}>
                  No hay horarios programados para este día
                </p>
              ) : (
                schedules
                  .filter(
                    (s) => s.date === selectedDate.toISOString().split("T")[0]
                  )
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      style={{
                        border: "1px solid #ccc",
                        margin: "10px",
                        padding: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <h4>{schedule.hour}</h4>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          {/* Badge para tipo de actividad */}
                          {schedule.activityType && (
                            <div
                              style={{
                                ...getActivityColor(schedule.activityType),
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              {getActivityName(schedule.activityType)}
                            </div>
                          )}
                          {/* Mostrar indicador si pertenece a una serie */}
                          {isPartOfBatch(schedule) && (
                            <div
                              style={{
                                backgroundColor: "#f3e5f5",
                                color: "#7b1fa2",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              Serie de {getBatchInfo(schedule.batchId).total}{" "}
                              horarios
                            </div>
                          )}
                        </div>
                      </div>

                      <p>{schedule.clients.length} alumnos</p>
                      <ul>
                        {schedule.clients.map((clientObj) => {
                          const alumno = getClientInfo(clientObj);
                          return (
                            <li
                              key={clientObj.id}
                              style={{ listStyle: "none" }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={clientObj.attended}
                                    onChange={() =>
                                      handleAttendanceToggle(
                                        schedule.id,
                                        clientObj.id
                                      )
                                    }
                                  />
                                }
                                label={
                                  typeof alumno?.name === "string" &&
                                  typeof alumno?.lastName === "string"
                                    ? `${alumno.name} ${alumno.lastName}`
                                    : String(
                                        clientObj?.id ?? "Alumno desconocido"
                                      )
                                }
                              />
                            </li>
                          );
                        })}
                      </ul>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          onClick={() => handleEdit(schedule)}
                          variant="outlined"
                          size="small"
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(schedule.id)}
                          variant="outlined"
                          color="error"
                          size="small"
                        >
                          Eliminar
                        </Button>
                        {/* Botón para eliminar toda la serie si pertenece a una */}
                        {isPartOfBatch(schedule) && (
                          <Button
                            onClick={() => handleDeleteBatch(schedule.batchId)}
                            variant="contained"
                            color="error"
                            size="small"
                            style={{ marginLeft: "10px" }}
                          >
                            Eliminar Serie Completa
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </>
          ) : (
            <>
              <p>
                Semana del {formatDate(weekDates[0])} al{" "}
                {formatDate(weekDates[6])}
              </p>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: 8 }}>
                      Hora
                    </th>
                    {weekDates.map((date, idx) => (
                      <th
                        key={idx}
                        style={{ border: "1px solid #ddd", padding: 8 }}
                      >
                        {date.toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {availableHours.map((hour) => (
                    <tr key={hour}>
                      <td style={{ border: "1px solid #ddd", padding: 8 }}>
                        {hour}
                      </td>
                      {weekDates.map((date) => {
                        const dateStr = date.toISOString().split("T")[0];
                        const matches = getSchedulesByDayHour(dateStr, hour);
                        const total = matches.reduce(
                          (acc, s) => acc + s.clients.length,
                          0
                        );
                        return (
                          <td
                            key={dateStr + hour}
                            style={{
                              border: "1px solid #ddd",
                              padding: 8,
                              textAlign: "center",
                              color: total > 0 ? "green" : "#999",
                            }}
                          >
                            {total > 0 ? `👥 ${total}` : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      <NewScheduleModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditSchedule(null);
        }}
        selectedDate={selectedDate}
        refresh={loadSchedules}
        editData={editSchedule}
        kinesioClients={kinesioClients}
        gimnasioClients={gimnasioClients}
        quiropraxiaClients={quiropraxiaClients}
      />
    </div>
  );
};

export default Calendar;
