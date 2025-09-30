// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   IconButton,
//   TextField,
//   MenuItem,
//   Select,
//   Box,
//   Modal,
//   Typography,
//   Chip,
//   FormControl,
//   InputLabel,
//   Alert,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import SettingsIcon from "@mui/icons-material/Settings";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import PaymentIcon from "@mui/icons-material/Payment";
// import { db } from "../../../firebaseConfig";
// import {
//   deleteDoc,
//   doc,
//   collection,
//   getDocs,
//   addDoc,
//   query,
//   where,
//   updateDoc,
// } from "firebase/firestore";
// import { useState, useEffect } from "react"; // Cambiado de useState solo a useState + useEffect
// import { PatientForm } from "./PatientsForm";
// import { useActivities } from "../activities/useActivities";
// import { ActivityPricesManager } from "../activities/ActivityPricesManager";
// import { Timestamp } from "firebase/firestore";
// import Swal from "sweetalert2";
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 500,
//   bgcolor: "background.paper",
//   border: "2px solid #000",
//   borderRadius: 5,
//   boxShadow: 24,
//   p: 4,
// };

// const daysOfWeek = [
//   { key: "sunday", label: "Domingo", value: 0 },
//   { key: "monday", label: "Lunes", value: 1 },
//   { key: "tuesday", label: "Martes", value: 2 },
//   { key: "wednesday", label: "Miércoles", value: 3 },
//   { key: "thursday", label: "Jueves", value: 4 },
//   { key: "friday", label: "Viernes", value: 5 },
//   { key: "saturday", label: "Sábado", value: 6 },
// ];

// const PatientsList = ({ patients = [], setIsChange }) => {
//   const [openForm, setOpenForm] = useState(false);
//   const [openProfile, setOpenProfile] = useState(false);
//   const [openPricesManager, setOpenPricesManager] = useState(false);
//   const [openPaymentModal, setOpenPaymentModal] = useState(false);
//   const [patientSelected, setPatientSelected] = useState(null);
//   const [actividadFilter, setActividadFilter] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [patientSchedules, setPatientSchedules] = useState([]);
//   const [loadingSchedules, setLoadingSchedules] = useState(false);
//   const [avisoSaldo, setAvisoSaldo] = useState("");

//   // Estado para el formulario de pago
//   const [nuevoPago, setNuevoPago] = useState({
//     concepto: "",
//     metodo: "",
//     monto: "",
//     fecha: new Date().toLocaleDateString("es-AR"),
//     hora: new Date().toLocaleTimeString("es-AR", {
//       hour12: false,
//       hour: "2-digit",
//       minute: "2-digit",
//     }),
//   });

//   const { activities = [], reloadActivities } = useActivities();

//   const handleCloseForm = () => setOpenForm(false);
//   const handleCloseProfile = () => {
//     setOpenProfile(false);
//     setPatientSchedules([]);
//   };
//   const handleClosePricesManager = () => setOpenPricesManager(false);
//   const handleClosePaymentModal = () => {
//     setOpenPaymentModal(false);
//     setPatientSelected(null);
//     setNuevoPago({
//       concepto: "",
//       metodo: "",
//       monto: "",
//       fecha: new Date().toLocaleDateString("es-AR"),
//       hora: new Date().toLocaleTimeString("es-AR", {
//         hour12: false,
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     });
//     setAvisoSaldo("");
//   };

//   const handleOpenForm = (patient) => {
//     setPatientSelected(patient);
//     setOpenForm(true);
//   };

//   const handleOpenPaymentModal = (patient) => {
//     setPatientSelected(patient);

//     // Generar aviso según el estado actual del paciente
//     let aviso = "";
//     if (patient.saldoFavor > 0) {
//       aviso = `⚠️ Esta persona tiene un saldo a favor de $${patient.saldoFavor.toLocaleString(
//         "es-AR"
//       )}`;
//     } else if (patient.debt > 0) {
//       aviso = `💰 Deuda actual: $${patient.debt.toLocaleString("es-AR")}`;
//     } else {
//       aviso = "✅ La persona está al día";
//     }
//     setAvisoSaldo(aviso);

//     // 🔥 MODIFICACIÓN: Precargar concepto con la actividad del paciente
//     const conceptoPrecargado = patient.actividad
//       ? `${patient.actividad}`
//       : "Pago de sesión";

//     setNuevoPago({
//       concepto: conceptoPrecargado, // ✅ Concepto precargado
//       metodo: "",
//       monto: "",
//       fecha: new Date().toLocaleDateString("es-AR"),
//       hora: new Date().toLocaleTimeString("es-AR", {
//         hour12: false,
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     });

//     setOpenPaymentModal(true);
//   };

//   const handleOpenProfile = async (patient) => {
//     setPatientSelected(patient);
//     setLoadingSchedules(true);

//     try {
//       // Obtener los horarios donde aparece este paciente
//       const schedulesRef = collection(db, "schedules");
//       const schedulesSnap = await getDocs(schedulesRef);

//       const patientSchedulesList = [];

//       schedulesSnap.docs.forEach((doc) => {
//         const scheduleData = doc.data();
//         const patientInSchedule = scheduleData.clients?.find(
//           (c) => c.id === patient.id
//         );

//         if (patientInSchedule) {
//           patientSchedulesList.push({
//             id: doc.id,
//             date: scheduleData.date,
//             hour: scheduleData.hour,
//             attended: patientInSchedule.attended || false,
//           });
//         }
//       });

//       // Ordenar por fecha y hora
//       patientSchedulesList.sort((a, b) => {
//         if (a.date === b.date) {
//           return a.hour.localeCompare(b.hour);
//         }
//         return a.date.localeCompare(b.date);
//       });

//       setPatientSchedules(patientSchedulesList);
//     } catch (error) {
//       console.error("Error al cargar horarios del paciente:", error);
//     } finally {
//       setLoadingSchedules(false);
//     }

//     setOpenProfile(true);
//   };

//   const handleOpenPricesManager = () => {
//     setOpenPricesManager(true);
//   };

//   const handleActivityUpdate = () => {
//     reloadActivities();
//     setIsChange(true);
//   };

//   // Generar aviso dinámico según el monto ingresado - CORREGIDO
//   useEffect(() => {
//     if (patientSelected && nuevoPago.monto) {
//       const monto = parseInt(nuevoPago.monto);
//       if (isNaN(monto) || monto <= 0) return;

//       let avisoDetallado = "";
//       const saldoFavorActual = patientSelected.saldoFavor || 0;
//       const deudaActual = patientSelected.debt || 0;

//       if (saldoFavorActual > 0) {
//         const nuevoSaldoFavor = saldoFavorActual + monto;
//         avisoDetallado = `💚 Saldo a favor actual: $${saldoFavorActual.toLocaleString(
//           "es-AR"
//         )} → Nuevo saldo: $${nuevoSaldoFavor.toLocaleString("es-AR")}`;
//       } else if (deudaActual > 0) {
//         if (monto > deudaActual) {
//           const saldoFavor = monto - deudaActual;
//           avisoDetallado = `🎉 El pago de $${monto.toLocaleString(
//             "es-AR"
//           )} cubre la deuda de $${deudaActual.toLocaleString(
//             "es-AR"
//           )} y genera un saldo a favor de $${saldoFavor.toLocaleString(
//             "es-AR"
//           )}`;
//         } else if (monto === deudaActual) {
//           avisoDetallado = `✅ El pago de $${monto.toLocaleString(
//             "es-AR"
//           )} cubre exactamente la deuda. La persona quedará al día.`;
//         } else {
//           const deudaRestante = deudaActual - monto;
//           avisoDetallado = `⚠️ Pago parcial: $${monto.toLocaleString(
//             "es-AR"
//           )} de $${deudaActual.toLocaleString(
//             "es-AR"
//           )}. Deuda restante: $${deudaRestante.toLocaleString("es-AR")}`;
//         }
//       } else {
//         avisoDetallado = `💚 La persona está al día. Este pago de $${monto.toLocaleString(
//           "es-AR"
//         )} generará un saldo a favor.`;
//       }

//       setAvisoSaldo(avisoDetallado);
//     }
//   }, [nuevoPago.monto, patientSelected]);

//   const handleRegistrarPago = async () => {
//     if (!patientSelected || !nuevoPago.monto || !nuevoPago.metodo) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "⚠️ Complete todos los campos obligatorios.",
//       });
//       return;
//     }

//     const montoPagado = parseInt(nuevoPago.monto);

//     // Obtener el mes en formato YYYY-MM desde la fecha ingresada
//     const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
//     const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;
//     const fechaPago = new Date(anio, mes - 1, dia);

//     const pagoFinal = {
//       fecha: nuevoPago.fecha,
//       hora: nuevoPago.hora,
//       concepto: nuevoPago.concepto || "Pago de sesión",
//       metodo: nuevoPago.metodo,
//       monto: montoPagado,
//       mes: mesPago,
//       createdAt: Timestamp.fromDate(fechaPago),
//       paciente: {
//         name: patientSelected.name,
//         lastName: patientSelected.lastName, // ✅ Agregar apellido
//         dni: patientSelected.dni || "Sin DNI",
//         id: patientSelected.id,
//       },
//     };

//     // Calcular nuevo estado y montos
//     const deudaActual = patientSelected.debt || 0;
//     const saldoFavorActual = patientSelected.saldoFavor || 0;

//     let nuevaDeuda = 0;
//     let nuevoSaldoFavor = 0;
//     let nuevoEstado = "Al día";

//     if (saldoFavorActual > 0) {
//       // Si ya tiene saldo a favor, se suma al saldo
//       nuevoSaldoFavor = saldoFavorActual + montoPagado;
//       nuevoEstado = "Al día";
//     } else if (deudaActual > 0) {
//       // Si tiene deuda
//       if (montoPagado >= deudaActual) {
//         // Pago cubre o supera la deuda
//         nuevoSaldoFavor = montoPagado - deudaActual;
//         nuevaDeuda = 0;
//         nuevoEstado = "Al día";
//       } else {
//         // Pago parcial
//         nuevaDeuda = deudaActual - montoPagado;
//         nuevoSaldoFavor = 0;
//         nuevoEstado = "Deudor";
//       }
//     } else {
//       // Si está al día, genera saldo a favor
//       nuevoSaldoFavor = montoPagado;
//       nuevaDeuda = 0;
//       nuevoEstado = "Al día";
//     }

//     // Datos para actualizar el paciente
//     const updateData = {
//       ultimoPago: nuevoPago.fecha,
//       debt: nuevaDeuda,
//       saldoFavor: nuevoSaldoFavor,
//       estado: nuevoEstado,
//     };

//     try {
//       // Registrar el pago en la colección de pagos
//       await addDoc(collection(db, "patientPayments"), pagoFinal);

//       // Actualizar el paciente - SIEMPRE usar el ID directo
//       const patientRef = doc(db, "patients", patientSelected.id);

//       console.log("Actualizando paciente con ID:", patientSelected.id);
//       console.log("Datos a actualizar:", updateData);

//       await updateDoc(patientRef, updateData);
//       console.log("✅ Paciente actualizado exitosamente");

//       handleClosePaymentModal();
//       setIsChange(true); // Recargar la lista de pacientes

//       Swal.fire({
//         icon: "success",
//         title: "Pago registrado",
//         text: "El pago fue registrado exitosamente ✅",
//         timer: 2000,
//         showConfirmButton: false,
//       });
//     } catch (error) {
//       console.error("Error al registrar pago:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Hubo un error al registrar el pago",
//       });
//     }
//   };

//   const deletePatient = (id) => {
//     Swal.fire({
//       title: "¿Estás seguro?",
//       text: "Este paciente será eliminado permanentemente.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Sí, eliminar",
//       cancelButtonText: "Cancelar",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         deleteDoc(doc(db, "patients", id)).then(() => {
//           setIsChange(true);
//           Swal.fire("Eliminado", "El paciente ha sido borrado.", "success");
//         });
//       }
//     });
//   };

//   // Función para obtener el nombre del día de la semana
//   const getDayName = (dateString) => {
//     const date = new Date(dateString);
//     const dayValue = date.getDay();
//     return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
//   };

//   // Función para formatear fecha
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("es-ES", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   // Función para formatear la fecha de creación
//   const formatCreationDate = (creationDate) => {
//     if (!creationDate) return "Sin fecha";

//     try {
//       const date = new Date(creationDate);
//       return date.toLocaleDateString("es-ES", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//       });
//     } catch (error) {
//       return "Fecha inválida";
//     }
//   };

//   // Agrupar horarios por día de la semana para mostrar resumen
//   const getScheduleSummary = (schedules) => {
//     const summary = {};

//     schedules.forEach((schedule) => {
//       const date = new Date(schedule.date);
//       const dayValue = date.getDay();
//       const dayName = getDayName(schedule.date);

//       if (!summary[dayValue]) {
//         summary[dayValue] = {
//           day: dayName,
//           hours: new Set(),
//         };
//       }

//       summary[dayValue].hours.add(schedule.hour);
//     });

//     return Object.values(summary).map((item) => ({
//       day: item.day,
//       hours: Array.from(item.hours).sort(),
//     }));
//   };

//   const renderMetodo = (metodo) => {
//     switch (metodo?.toLowerCase()) {
//       case "efectivo":
//         return "💵 Efectivo";
//       case "transferencia":
//         return "✔ Transferencia";
//       case "tarjeta":
//         return "💳 Tarjeta";
//       default:
//         return metodo;
//     }
//   };

//   const filteredPatients = Array.isArray(patients)
//     ? patients.filter((patient) => {
//         const matchesActividad = actividadFilter
//           ? patient.actividad === actividadFilter
//           : true;
//         const matchesSearch = `${patient.name || ""} ${
//           patient.lastName || ""
//         } ${patient.dni || ""}`
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());
//         return matchesActividad && matchesSearch;
//       })
//     : [];

//   return (
//     <div style={{ marginTop: 30 }}>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 15,
//         }}
//       >
//         <div style={{ marginLeft: 10 }}>
//           <h2>Lista de pacientes</h2>
//           <p>Pacientes registrados</p>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <TextField
//             label="Buscar por nombre o DNI"
//             variant="outlined"
//             size="small"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Button
//             variant="outlined"
//             startIcon={<SettingsIcon />}
//             onClick={handleOpenPricesManager}
//           >
//             Gestionar Precios
//           </Button>
//           <Button variant="contained" onClick={() => handleOpenForm(null)}>
//             + Nuevo paciente
//           </Button>
//         </div>
//       </div>

//       <TableContainer component={Paper}>
//         <Table sx={{ minWidth: 650 }} aria-label="tabla de pacientes">
//           <TableHead>
//             <TableRow>
//               <TableCell style={{ fontWeight: "bold" }}>Nombre</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Apellido</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>DNI</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Celular</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>2do Celular</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Dirección</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Actividad</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Deuda</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>
//                 Fecha Registro
//               </TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Acciones</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredPatients.map((patient) => (
//               <TableRow key={patient.id}>
//                 <TableCell
//                   style={{
//                     color:
//                       patient.estado === "Deudor"
//                         ? "red"
//                         : patient.estado === "Inactivo"
//                         ? "goldenrod"
//                         : "green",
//                     fontWeight: "bold",
//                     cursor: "pointer",
//                   }}
//                   onClick={() => handleOpenProfile(patient)}
//                 >
//                   {patient.name}
//                 </TableCell>
//                 <TableCell
//                   style={{ cursor: "pointer" }}
//                   onClick={() => handleOpenProfile(patient)}
//                 >
//                   {patient.lastName}
//                 </TableCell>
//                 <TableCell>{patient.dni}</TableCell>
//                 <TableCell>{patient.phone}</TableCell>
//                 <TableCell>{patient.phoneHelp}</TableCell>
//                 <TableCell>{patient.address}</TableCell>
//                 <TableCell>{patient.actividad || "No asignada"}</TableCell>
//                 <TableCell
//                   style={{
//                     color:
//                       (patient.estado === "Inactivo" ? 0 : patient.debt || 0) >
//                       0
//                         ? "red"
//                         : "green",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   $
//                   {patient.estado === "Inactivo"
//                     ? 0
//                     : (patient.debt || 0).toLocaleString()}
//                 </TableCell>
//                 <TableCell
//                   style={{ color: "text.secondary", fontSize: "0.875rem" }}
//                 >
//                   {formatCreationDate(patient.fechaCreacion)}
//                 </TableCell>
//                 <TableCell>
//                   <IconButton
//                     onClick={() => handleOpenPaymentModal(patient)}
//                     color="primary"
//                     title="Registrar pago"
//                   >
//                     <PaymentIcon />
//                   </IconButton>
//                   <IconButton onClick={() => handleOpenForm(patient)}>
//                     <EditIcon />
//                   </IconButton>
//                   <IconButton onClick={() => deletePatient(patient.id)}>
//                     <DeleteIcon />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Modal de edición */}
//       <Modal open={openForm} onClose={handleCloseForm}>
//         <Box sx={{ ...style, width: 800, height: 750 }}>
//           <PatientForm
//             handleClose={handleCloseForm}
//             setIsChange={setIsChange}
//             patientSelected={patientSelected}
//             setPatientSelected={setPatientSelected}
//           />
//         </Box>
//       </Modal>

//       {/* Modal de registro de pago */}
//       <Modal open={openPaymentModal} onClose={handleClosePaymentModal}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 450,
//             bgcolor: "white",
//             borderRadius: 2,
//             boxShadow: 24,
//             p: 4,
//             maxHeight: "90vh",
//             overflowY: "auto",
//           }}
//         >
//           <h3>Registrar Pago</h3>
//           {patientSelected && (
//             <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
//               Paciente: {patientSelected.name} {patientSelected.lastName} (DNI:{" "}
//               {patientSelected.dni})
//             </Typography>
//           )}

//           {/* Mostrar aviso del estado actual de la persona */}
//           {avisoSaldo && (
//             <Box sx={{ mt: 2, mb: 2 }}>
//               <Alert
//                 severity={
//                   avisoSaldo.includes("saldo a favor") ||
//                   avisoSaldo.includes("cubre exactamente")
//                     ? "success"
//                     : avisoSaldo.includes("parcial")
//                     ? "warning"
//                     : "info"
//                 }
//                 sx={{ fontSize: "0.85rem" }}
//               >
//                 <Typography variant="body2">{avisoSaldo}</Typography>
//               </Alert>
//             </Box>
//           )}

//           <TextField
//             label="Concepto"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.concepto}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, concepto: e.target.value })
//             }
//             placeholder="Pago de sesión"
//           />

//           <TextField
//             label="Método de pago"
//             select
//             fullWidth
//             margin="dense"
//             value={nuevoPago.metodo}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, metodo: e.target.value })
//             }
//             required
//           >
//             <MenuItem value="efectivo">💵 Efectivo</MenuItem>
//             <MenuItem value="transferencia">✔ Transferencia</MenuItem>
//             <MenuItem value="tarjeta">💳 Tarjeta</MenuItem>
//           </TextField>

//           <TextField
//             label="Monto"
//             type="number"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.monto}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, monto: e.target.value })
//             }
//             required
//           />

//           <TextField
//             label="Fecha"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.fecha}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, fecha: e.target.value })
//             }
//             helperText="Formato: DD/MM/YYYY"
//           />

//           <TextField
//             label="Hora"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.hora}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, hora: e.target.value })
//             }
//             helperText="HH:MM"
//           />

//           <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
//             <Button
//               variant="outlined"
//               onClick={handleClosePaymentModal}
//               fullWidth
//             >
//               Cancelar
//             </Button>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleRegistrarPago}
//               fullWidth
//               disabled={!nuevoPago.monto || !nuevoPago.metodo}
//             >
//               Registrar Pago
//             </Button>
//           </Box>
//         </Box>
//       </Modal>

//       {/* Modal de perfil */}
//       <Modal open={openProfile} onClose={handleCloseProfile}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 600,
//             maxHeight: "90vh",
//             overflow: "auto",
//             bgcolor: "background.paper",
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2,
//           }}
//         >
//           {patientSelected && (
//             <>
//               <Typography
//                 variant="h5"
//                 gutterBottom
//                 sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}
//               >
//                 Perfil de {patientSelected.name} {patientSelected.lastName}
//               </Typography>

//               <Box
//                 sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}
//               >
//                 <Typography>
//                   <strong>DNI:</strong> {patientSelected.dni}
//                 </Typography>
//                 <Typography>
//                   <strong>Celular:</strong> {patientSelected.phone}
//                 </Typography>
//                 <Typography>
//                   <strong>2do Celular:</strong>{" "}
//                   {patientSelected.phoneHelp || "N/A"}
//                 </Typography>
//                 <Typography>
//                   <strong>Dirección:</strong> {patientSelected.address}
//                 </Typography>
//                 <Typography>
//                   <strong>Actividad:</strong>{" "}
//                   {patientSelected.actividad || "No asignada"}
//                 </Typography>
//                 <Typography>
//                   <strong>Estado:</strong> {patientSelected.estado}
//                 </Typography>
//                 <Typography
//                   color={patientSelected.debt > 0 ? "error" : "success.main"}
//                 >
//                   <strong>Deuda:</strong> $
//                   {(patientSelected.debt || 0).toLocaleString()}
//                 </Typography>
//                 {patientSelected.saldoFavor > 0 && (
//                   <Typography color="success.main">
//                     <strong>Saldo a favor:</strong> $
//                     {(patientSelected.saldoFavor || 0).toLocaleString()}
//                   </Typography>
//                 )}
//                 <Typography>
//                   <strong>Último pago:</strong>{" "}
//                   {patientSelected.ultimoPago || "Sin pagos"}
//                 </Typography>
//                 <Typography color="text.secondary">
//                   <strong>Fecha de registro:</strong>{" "}
//                   {formatCreationDate(patientSelected.fechaCreacion)}
//                 </Typography>
//               </Box>

//               {/* Sección de Horarios */}
//               <Box sx={{ mt: 3 }}>
//                 <Box
//                   sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
//                 >
//                   <AccessTimeIcon color="primary" />
//                   <Typography variant="h6" sx={{ fontWeight: "bold" }}>
//                     Horarios Programados
//                   </Typography>
//                 </Box>

//                 {loadingSchedules ? (
//                   <Typography>Cargando horarios...</Typography>
//                 ) : patientSchedules.length > 0 ? (
//                   <>
//                     {/* Resumen por día de la semana */}
//                     <Box sx={{ mb: 2 }}>
//                       <Typography
//                         variant="subtitle2"
//                         sx={{ mb: 1, color: "text.secondary" }}
//                       >
//                         Horarios habituales:
//                       </Typography>
//                       <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                         {getScheduleSummary(patientSchedules).map(
//                           (summary, index) => (
//                             <Chip
//                               key={index}
//                               label={`${summary.day}: ${summary.hours.join(
//                                 ", "
//                               )}`}
//                               variant="outlined"
//                               size="small"
//                               color="primary"
//                             />
//                           )
//                         )}
//                       </Box>
//                     </Box>

//                     {/* Lista detallada de horarios próximos */}
//                     <Typography
//                       variant="subtitle2"
//                       sx={{ mb: 1, color: "text.secondary" }}
//                     >
//                       Próximos horarios programados:
//                     </Typography>
//                     <Box sx={{ maxHeight: 200, overflow: "auto" }}>
//                       {patientSchedules
//                         .filter(
//                           (schedule) =>
//                             new Date(schedule.date) >=
//                             new Date().setHours(0, 0, 0, 0)
//                         )
//                         .slice(0, 10)
//                         .map((schedule, index) => (
//                           <Box
//                             key={index}
//                             sx={{
//                               display: "flex",
//                               justifyContent: "space-between",
//                               alignItems: "center",
//                               p: 1,
//                               mb: 1,
//                               bgcolor: schedule.attended
//                                 ? "success.light"
//                                 : "grey.100",
//                               borderRadius: 1,
//                               border: schedule.attended
//                                 ? "1px solid green"
//                                 : "1px solid #e0e0e0",
//                             }}
//                           >
//                             <Box>
//                               <Typography variant="body2">
//                                 <strong>{getDayName(schedule.date)}</strong>{" "}
//                                 {formatDate(schedule.date)}
//                               </Typography>
//                               <Typography
//                                 variant="body2"
//                                 color="text.secondary"
//                               >
//                                 Hora: {schedule.hour}
//                               </Typography>
//                             </Box>
//                             <Chip
//                               label={
//                                 schedule.attended ? "Asistió" : "Programado"
//                               }
//                               color={schedule.attended ? "success" : "default"}
//                               size="small"
//                             />
//                           </Box>
//                         ))}
//                     </Box>

//                     {/* Estadísticas de asistencia */}
//                     <Box
//                       sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
//                     >
//                       <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                         Estadísticas:
//                       </Typography>
//                       <Box sx={{ display: "flex", gap: 2 }}>
//                         <Typography variant="body2">
//                           <strong>Total horarios:</strong>{" "}
//                           {patientSchedules.length}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Asistencias:</strong>{" "}
//                           {patientSchedules.filter((s) => s.attended).length}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Asistencia:</strong>{" "}
//                           {patientSchedules.length > 0
//                             ? Math.round(
//                                 (patientSchedules.filter((s) => s.attended)
//                                   .length /
//                                   patientSchedules.length) *
//                                   100
//                               )
//                             : 0}
//                           %
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </>
//                 ) : (
//                   <Typography color="text.secondary">
//                     No tiene horarios programados
//                   </Typography>
//                 )}
//               </Box>
//             </>
//           )}
//         </Box>
//       </Modal>

//       {/* Modal de gestión de precios */}
//       <ActivityPricesManager
//         open={openPricesManager}
//         onClose={handleClosePricesManager}
//         onActivityUpdate={handleActivityUpdate}
//       />
//     </div>
//   );
// };

// export default PatientsList;
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Select,
  Box,
  Modal,
  Typography,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { db } from "../../../firebaseConfig";
import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { PatientForm } from "./PatientsForm";
import { useActivities } from "../activities/useActivities";
import { ActivityPricesManager } from "../activities/ActivityPricesManager";
import { Timestamp } from "firebase/firestore";
import Swal from "sweetalert2";
import ActivityStats from "../activities/ActivityStats";

// Estilos optimizados para modales más compactos
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 500,
  maxHeight: "85vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
  overflow: "auto",
};

const profileModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 450,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
  overflow: "auto",
};

const daysOfWeek = [
  { key: "sunday", label: "Dom", value: 0 },
  { key: "monday", label: "Lun", value: 1 },
  { key: "tuesday", label: "Mar", value: 2 },
  { key: "wednesday", label: "Mié", value: 3 },
  { key: "thursday", label: "Jue", value: 4 },
  { key: "friday", label: "Vie", value: 5 },
  { key: "saturday", label: "Sáb", value: 6 },
];

const PatientsList = ({ patients = [], setIsChange }) => {
  const [openForm, setOpenForm] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPricesManager, setOpenPricesManager] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [patientSelected, setPatientSelected] = useState(null);
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [patientSchedules, setPatientSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [avisoSaldo, setAvisoSaldo] = useState("");

  // Estado para el formulario de pago
  const [nuevoPago, setNuevoPago] = useState({
    concepto: "",
    metodo: "",
    monto: "",
    fecha: new Date().toLocaleDateString("es-AR"),
    hora: new Date().toLocaleTimeString("es-AR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  const { activities = [], reloadActivities } = useActivities();

  const handleCloseForm = () => setOpenForm(false);
  const handleCloseProfile = () => {
    setOpenProfile(false);
    setPatientSchedules([]);
  };
  const handleClosePricesManager = () => setOpenPricesManager(false);
  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setPatientSelected(null);
    setNuevoPago({
      concepto: "",
      metodo: "",
      monto: "",
      fecha: new Date().toLocaleDateString("es-AR"),
      hora: new Date().toLocaleTimeString("es-AR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setAvisoSaldo("");
  };

  const handleOpenForm = (patient) => {
    setPatientSelected(patient);
    setOpenForm(true);
  };

  const handleOpenPaymentModal = (patient) => {
    setPatientSelected(patient);

    // Generar aviso según el estado actual del paciente
    let aviso = "";
    if (patient.saldoFavor > 0) {
      aviso = `⚠️ Saldo a favor: $${patient.saldoFavor.toLocaleString(
        "es-AR"
      )}`;
    } else if (patient.debt > 0) {
      aviso = `💰 Deuda: $${patient.debt.toLocaleString("es-AR")}`;
    } else {
      aviso = "✅ Al día";
    }
    setAvisoSaldo(aviso);

    const conceptoPrecargado = patient.actividad
      ? `${patient.actividad}`
      : "Pago de sesión";

    setNuevoPago({
      concepto: conceptoPrecargado,
      metodo: "",
      monto: "",
      fecha: new Date().toLocaleDateString("es-AR"),
      hora: new Date().toLocaleTimeString("es-AR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setOpenPaymentModal(true);
  };

  const handleOpenProfile = async (patient) => {
    setPatientSelected(patient);
    setLoadingSchedules(true);

    try {
      const schedulesRef = collection(db, "schedules");
      const schedulesSnap = await getDocs(schedulesRef);

      const patientSchedulesList = [];

      schedulesSnap.docs.forEach((doc) => {
        const scheduleData = doc.data();
        const patientInSchedule = scheduleData.clients?.find(
          (c) => c.id === patient.id
        );

        if (patientInSchedule) {
          patientSchedulesList.push({
            id: doc.id,
            date: scheduleData.date,
            hour: scheduleData.hour,
            attended: patientInSchedule.attended || false,
          });
        }
      });

      patientSchedulesList.sort((a, b) => {
        if (a.date === b.date) {
          return a.hour.localeCompare(b.hour);
        }
        return a.date.localeCompare(b.date);
      });

      setPatientSchedules(patientSchedulesList);
    } catch (error) {
      console.error("Error al cargar horarios del paciente:", error);
    } finally {
      setLoadingSchedules(false);
    }

    setOpenProfile(true);
  };

  const handleOpenPricesManager = () => {
    setOpenPricesManager(true);
  };

  const handleActivityUpdate = () => {
    reloadActivities();
    setIsChange(true);
  };

  // Generar aviso dinámico según el monto ingresado
  useEffect(() => {
    if (patientSelected && nuevoPago.monto) {
      const monto = parseInt(nuevoPago.monto);
      if (isNaN(monto) || monto <= 0) return;

      let avisoDetallado = "";
      const saldoFavorActual = patientSelected.saldoFavor || 0;
      const deudaActual = patientSelected.debt || 0;

      if (saldoFavorActual > 0) {
        const nuevoSaldoFavor = saldoFavorActual + monto;
        avisoDetallado = `💚 Nuevo saldo: $${nuevoSaldoFavor.toLocaleString(
          "es-AR"
        )}`;
      } else if (deudaActual > 0) {
        if (monto > deudaActual) {
          const saldoFavor = monto - deudaActual;
          avisoDetallado = `🎉 Cubre deuda + $${saldoFavor.toLocaleString(
            "es-AR"
          )} a favor`;
        } else if (monto === deudaActual) {
          avisoDetallado = `✅ Cubre exactamente la deuda`;
        } else {
          const deudaRestante = deudaActual - monto;
          avisoDetallado = `⚠️ Restante: $${deudaRestante.toLocaleString(
            "es-AR"
          )}`;
        }
      } else {
        avisoDetallado = `💚 Generará saldo a favor de $${monto.toLocaleString(
          "es-AR"
        )}`;
      }

      setAvisoSaldo(avisoDetallado);
    }
  }, [nuevoPago.monto, patientSelected]);

  const handleRegistrarPago = async () => {
    if (!patientSelected || !nuevoPago.monto || !nuevoPago.metodo) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Complete todos los campos obligatorios.",
      });
      return;
    }

    const montoPagado = parseInt(nuevoPago.monto);
    const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
    const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;
    const fechaPago = new Date(anio, mes - 1, dia);

    const pagoFinal = {
      fecha: nuevoPago.fecha,
      hora: nuevoPago.hora,
      concepto: nuevoPago.concepto || "Pago de sesión",
      metodo: nuevoPago.metodo,
      monto: montoPagado,
      mes: mesPago,
      createdAt: Timestamp.fromDate(fechaPago),
      paciente: {
        name: patientSelected.name,
        lastName: patientSelected.lastName,
        dni: patientSelected.dni || "Sin DNI",
        id: patientSelected.id,
      },
    };

    const deudaActual = patientSelected.debt || 0;
    const saldoFavorActual = patientSelected.saldoFavor || 0;

    let nuevaDeuda = 0;
    let nuevoSaldoFavor = 0;
    let nuevoEstado = "Al día";

    if (saldoFavorActual > 0) {
      nuevoSaldoFavor = saldoFavorActual + montoPagado;
      nuevoEstado = "Al día";
    } else if (deudaActual > 0) {
      if (montoPagado >= deudaActual) {
        nuevoSaldoFavor = montoPagado - deudaActual;
        nuevaDeuda = 0;
        nuevoEstado = "Al día";
      } else {
        nuevaDeuda = deudaActual - montoPagado;
        nuevoSaldoFavor = 0;
        nuevoEstado = "Deudor";
      }
    } else {
      nuevoSaldoFavor = montoPagado;
      nuevaDeuda = 0;
      nuevoEstado = "Al día";
    }

    const updateData = {
      ultimoPago: nuevoPago.fecha,
      debt: nuevaDeuda,
      saldoFavor: nuevoSaldoFavor,
      estado: nuevoEstado,
    };

    try {
      await addDoc(collection(db, "patientPayments"), pagoFinal);
      const patientRef = doc(db, "patients", patientSelected.id);
      await updateDoc(patientRef, updateData);

      handleClosePaymentModal();
      setIsChange(true);

      Swal.fire({
        icon: "success",
        title: "Pago registrado",
        text: "El pago fue registrado exitosamente ✅",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al registrar pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al registrar el pago",
      });
    }
  };

  const deletePatient = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Este paciente será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDoc(doc(db, "patients", id)).then(() => {
          setIsChange(true);
          Swal.fire("Eliminado", "El paciente ha sido borrado.", "success");
        });
      }
    });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const dayValue = date.getDay();
    return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatCreationDate = (creationDate) => {
    if (!creationDate) return "Sin fecha";

    try {
      const date = new Date(creationDate);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getScheduleSummary = (schedules) => {
    const summary = {};

    schedules.forEach((schedule) => {
      const date = new Date(schedule.date);
      const dayValue = date.getDay();
      const dayName = getDayName(schedule.date);

      if (!summary[dayValue]) {
        summary[dayValue] = {
          day: dayName,
          hours: new Set(),
        };
      }

      summary[dayValue].hours.add(schedule.hour);
    });

    return Object.values(summary).map((item) => ({
      day: item.day,
      hours: Array.from(item.hours).sort(),
    }));
  };

  const filteredPatients = Array.isArray(patients)
    ? patients.filter((patient) => {
        const matchesActividad = actividadFilter
          ? patient.actividad === actividadFilter
          : true;
        const matchesSearch = `${patient.name || ""} ${
          patient.lastName || ""
        } ${patient.dni || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesActividad && matchesSearch;
      })
    : [];

  return (
    <div style={{ marginTop: 20 }}>
      {/* Header más compacto */}
      <ActivityStats
        clients={patients}
        title="Resumen de Pacientes"
        entityLabel="pacientes"
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ marginLeft: 10 }}>
          <h3 style={{ margin: 0 }}>Lista de pacientes</h3>
          <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "gray" }}>
            {filteredPatients.length} pacientes
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 150 }}
          />
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleOpenPricesManager}
            size="small"
          >
            Precios
          </Button>
          <Button
            variant="contained"
            onClick={() => handleOpenForm(null)}
            size="small"
          >
            + Paciente
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="tabla de pacientes"
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Nombre
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Apellido
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                DNI
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Celular
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Actividad
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Deuda
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell
                  sx={{
                    color:
                      patient.estado === "Deudor"
                        ? "red"
                        : patient.estado === "Inactivo"
                        ? "goldenrod"
                        : "green",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                  onClick={() => handleOpenProfile(patient)}
                >
                  {patient.name}
                </TableCell>
                <TableCell
                  sx={{ cursor: "pointer", fontSize: "0.875rem" }}
                  onClick={() => handleOpenProfile(patient)}
                >
                  {patient.lastName}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem" }}>
                  {patient.dni}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem" }}>
                  {patient.phone}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem" }}>
                  {patient.actividad || "No asignada"}
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      (patient.estado === "Inactivo" ? 0 : patient.debt || 0) >
                      0
                        ? "red"
                        : "green",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  $
                  {patient.estado === "Inactivo"
                    ? 0
                    : (patient.debt || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenPaymentModal(patient)}
                    color="primary"
                    title="Registrar pago"
                    size="small"
                  >
                    <PaymentIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenForm(patient)}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => deletePatient(patient.id)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de edición - más compacto */}
      <Modal open={openForm} onClose={handleCloseForm}>
        <Box
          sx={{ ...modalStyle, width: "90vw", maxWidth: 600, height: "85vh" }}
        >
          <PatientForm
            handleClose={handleCloseForm}
            setIsChange={setIsChange}
            patientSelected={patientSelected}
            setPatientSelected={setPatientSelected}
          />
        </Box>
      </Modal>

      {/* Modal de pago - optimizado */}
      <Modal open={openPaymentModal} onClose={handleClosePaymentModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 1, fontSize: "1.1rem" }}>
            Registrar Pago
          </Typography>
          {patientSelected && (
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              {patientSelected.name} {patientSelected.lastName} - DNI:{" "}
              {patientSelected.dni}
            </Typography>
          )}

          {avisoSaldo && (
            <Alert
              severity={
                avisoSaldo.includes("favor") ||
                avisoSaldo.includes("exactamente")
                  ? "success"
                  : avisoSaldo.includes("Restante")
                  ? "warning"
                  : "info"
              }
              sx={{ mb: 2, fontSize: "0.8rem" }}
            >
              {avisoSaldo}
            </Alert>
          )}

          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                label="Concepto"
                fullWidth
                size="small"
                value={nuevoPago.concepto}
                onChange={(e) =>
                  setNuevoPago({ ...nuevoPago, concepto: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Método"
                select
                fullWidth
                size="small"
                value={nuevoPago.metodo}
                onChange={(e) =>
                  setNuevoPago({ ...nuevoPago, metodo: e.target.value })
                }
                required
              >
                <MenuItem value="efectivo">💵 Efectivo</MenuItem>
                <MenuItem value="transferencia">✔ Transfer.</MenuItem>
                <MenuItem value="tarjeta">💳 Tarjeta</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Monto"
                type="number"
                fullWidth
                size="small"
                value={nuevoPago.monto}
                onChange={(e) =>
                  setNuevoPago({ ...nuevoPago, monto: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Fecha"
                fullWidth
                size="small"
                value={nuevoPago.fecha}
                onChange={(e) =>
                  setNuevoPago({ ...nuevoPago, fecha: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Hora"
                fullWidth
                size="small"
                value={nuevoPago.hora}
                onChange={(e) =>
                  setNuevoPago({ ...nuevoPago, hora: e.target.value })
                }
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleClosePaymentModal}
              fullWidth
              size="small"
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleRegistrarPago}
              fullWidth
              size="small"
              disabled={!nuevoPago.monto || !nuevoPago.metodo}
            >
              Registrar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de perfil - compacto con acordeones */}
      <Modal open={openProfile} onClose={handleCloseProfile}>
        <Box sx={profileModalStyle}>
          {patientSelected && (
            <>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  mb: 2,
                  fontSize: "1.1rem",
                }}
              >
                {patientSelected.name} {patientSelected.lastName}
              </Typography>

              {/* Información básica */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Información Personal
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>DNI:</strong> {patientSelected.dni}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Celular:</strong> {patientSelected.phone}
                      </Typography>
                    </Grid>
                    {patientSelected.phoneHelp && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>2do Celular:</strong>{" "}
                          {patientSelected.phoneHelp}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Dirección:</strong> {patientSelected.address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Actividad:</strong>{" "}
                        {patientSelected.actividad || "No asignada"}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Estado financiero */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountBalanceWalletIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Estado Financiero
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Estado:</strong> {patientSelected.estado}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="body2"
                        color={
                          patientSelected.debt > 0 ? "error" : "success.main"
                        }
                      >
                        <strong>Deuda:</strong> $
                        {(patientSelected.debt || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    {patientSelected.saldoFavor > 0 && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="success.main">
                          <strong>Saldo a favor:</strong> $
                          {(patientSelected.saldoFavor || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Último pago:</strong>{" "}
                        {patientSelected.ultimoPago || "Sin pagos"}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Horarios */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Horarios ({patientSchedules.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {loadingSchedules ? (
                    <Typography variant="body2">Cargando...</Typography>
                  ) : patientSchedules.length > 0 ? (
                    <>
                      {/* Resumen compacto */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, fontWeight: "bold" }}
                        >
                          Horarios habituales:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {getScheduleSummary(patientSchedules).map(
                            (summary, index) => (
                              <Chip
                                key={index}
                                label={`${summary.day}: ${summary.hours.join(
                                  ", "
                                )}`}
                                variant="outlined"
                                size="small"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            )
                          )}
                        </Box>
                      </Box>

                      {/* Próximos horarios - máximo 5 */}
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        Próximos:
                      </Typography>
                      <Box sx={{ maxHeight: 150, overflow: "auto" }}>
                        {patientSchedules
                          .filter(
                            (schedule) =>
                              new Date(schedule.date) >=
                              new Date().setHours(0, 0, 0, 0)
                          )
                          .slice(0, 5)
                          .map((schedule, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: 0.5,
                                mb: 0.5,
                                bgcolor: schedule.attended
                                  ? "success.light"
                                  : "grey.100",
                                borderRadius: 1,
                                fontSize: "0.75rem",
                              }}
                            >
                              <Box>
                                <Typography variant="caption">
                                  {getDayName(schedule.date)}{" "}
                                  {formatDate(schedule.date)} - {schedule.hour}
                                </Typography>
                              </Box>
                              <Chip
                                label={schedule.attended ? "✓" : "○"}
                                color={
                                  schedule.attended ? "success" : "default"
                                }
                                size="small"
                                sx={{ fontSize: "0.7rem", height: 18 }}
                              />
                            </Box>
                          ))}
                      </Box>

                      {/* Estadísticas compactas */}
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                        }}
                      >
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption">
                              <strong>Total:</strong> {patientSchedules.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption">
                              <strong>Asistió:</strong>{" "}
                              {
                                patientSchedules.filter((s) => s.attended)
                                  .length
                              }
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption">
                              <strong>%:</strong>{" "}
                              {patientSchedules.length > 0
                                ? Math.round(
                                    (patientSchedules.filter((s) => s.attended)
                                      .length /
                                      patientSchedules.length) *
                                      100
                                  )
                                : 0}
                              %
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin horarios programados
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </Box>
      </Modal>

      {/* Modal de gestión de precios */}
      <ActivityPricesManager
        open={openPricesManager}
        onClose={handleClosePricesManager}
        onActivityUpdate={handleActivityUpdate}
      />
    </div>
  );
};

export default PatientsList;
