// import Table from "@mui/material/Table";
// import TableBody from "@mui/material/TableBody";
// import TableCell from "@mui/material/TableCell";
// import TableContainer from "@mui/material/TableContainer";
// import TableHead from "@mui/material/TableHead";
// import TableRow from "@mui/material/TableRow";
// import Paper from "@mui/material/Paper";
// import {
//   Button,
//   IconButton,
//   TextField,
//   MenuItem,
//   Select,
//   Typography,
//   Chip,
//   Box,
//   Modal,
//   Alert,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Grid,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import SettingsIcon from "@mui/icons-material/Settings";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import PaymentIcon from "@mui/icons-material/Payment";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import PersonIcon from "@mui/icons-material/Person";
// import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

// import {
//   deleteDoc,
//   doc,
//   collection,
//   getDocs,
//   query,
//   where,
//   addDoc,
//   updateDoc,
// } from "firebase/firestore";
// import { useState, useEffect } from "react";
// import { useActivities } from "../activities/useActivities";
// import { db } from "../../../firebaseConfig";
// import { ClientForm } from "./ClientForm";
// import { ActivityPricesManager } from "../activities/ActivityPricesManager";
// import { Timestamp } from "firebase/firestore";
// import Swal from "sweetalert2";
// import ActivityStats from "../activities/ActivityStats";

// // Estilos optimizados para modales más compactos
// const modalStyle = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: "90vw",
//   maxWidth: 500,
//   maxHeight: "85vh",
//   bgcolor: "background.paper",
//   borderRadius: 2,
//   boxShadow: 24,
//   p: 2,
//   overflow: "auto",
// };

// const profileModalStyle = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: "90vw",
//   maxWidth: 450,
//   maxHeight: "90vh",
//   bgcolor: "background.paper",
//   borderRadius: 2,
//   boxShadow: 24,
//   p: 2,
//   overflow: "auto",
// };

// const daysOfWeek = [
//   { key: "sunday", label: "Dom", value: 0 },
//   { key: "monday", label: "Lun", value: 1 },
//   { key: "tuesday", label: "Mar", value: 2 },
//   { key: "wednesday", label: "Mié", value: 3 },
//   { key: "thursday", label: "Jue", value: 4 },
//   { key: "friday", label: "Vie", value: 5 },
//   { key: "saturday", label: "Sáb", value: 6 },
// ];

// const ClientsList = ({ clients = [], setIsChange }) => {
//   const [openForm, setOpenForm] = useState(false);
//   const [openProfile, setOpenProfile] = useState(false);
//   const [openPricesManager, setOpenPricesManager] = useState(false);
//   const [openPaymentModal, setOpenPaymentModal] = useState(false);
//   const [clientSelected, setClientSelected] = useState(null);
//   const [actividadFilter, setActividadFilter] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [clientSchedules, setClientSchedules] = useState([]);
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
//     setClientSchedules([]);
//   };

//   const handleClosePricesManager = () => setOpenPricesManager(false);

//   const handleClosePaymentModal = () => {
//     setOpenPaymentModal(false);
//     setClientSelected(null);
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

//   const handleOpenForm = (client) => {
//     setClientSelected(client);
//     setOpenForm(true);
//   };

//   const handleOpenPaymentModal = (client) => {
//     setClientSelected(client);

//     // Generar aviso según el estado actual del cliente
//     let aviso = "";
//     if (client.saldoFavor > 0) {
//       aviso = `⚠️ Saldo a favor: $${client.saldoFavor.toLocaleString("es-AR")}`;
//     } else if (client.debt > 0) {
//       aviso = `💰 Deuda: $${client.debt.toLocaleString("es-AR")}`;
//     } else {
//       aviso = "✅ Al día";
//     }
//     setAvisoSaldo(aviso);

//     const conceptoPrecargado = client.actividad
//       ? `${client.actividad}`
//       : "Pago de clase";

//     setNuevoPago({
//       concepto: conceptoPrecargado,
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

//   const handleOpenProfile = async (client) => {
//     setClientSelected(client);
//     setLoadingSchedules(true);

//     try {
//       const schedulesRef = collection(db, "schedules");
//       const schedulesSnap = await getDocs(schedulesRef);

//       const clientSchedulesList = [];

//       schedulesSnap.docs.forEach((doc) => {
//         const scheduleData = doc.data();
//         const clientInSchedule = scheduleData.clients?.find(
//           (c) => c.id === client.id
//         );

//         if (clientInSchedule) {
//           clientSchedulesList.push({
//             id: doc.id,
//             date: scheduleData.date,
//             hour: scheduleData.hour,
//             attended: clientInSchedule.attended || false,
//           });
//         }
//       });

//       clientSchedulesList.sort((a, b) => {
//         if (a.date === b.date) {
//           return a.hour.localeCompare(b.hour);
//         }
//         return a.date.localeCompare(b.date);
//       });

//       setClientSchedules(clientSchedulesList);
//     } catch (error) {
//       console.error("Error al cargar horarios del cliente:", error);
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

//   // Generar aviso dinámico según el monto ingresado
//   useEffect(() => {
//     if (clientSelected && nuevoPago.monto) {
//       const monto = parseInt(nuevoPago.monto);
//       if (isNaN(monto) || monto <= 0) return;

//       let avisoDetallado = "";
//       const saldoFavorActual = clientSelected.saldoFavor || 0;
//       const deudaActual = clientSelected.debt || 0;

//       if (saldoFavorActual > 0) {
//         const nuevoSaldoFavor = saldoFavorActual + monto;
//         avisoDetallado = `💚 Nuevo saldo: $${nuevoSaldoFavor.toLocaleString(
//           "es-AR"
//         )}`;
//       } else if (deudaActual > 0) {
//         if (monto > deudaActual) {
//           const saldoFavor = monto - deudaActual;
//           avisoDetallado = `🎉 Cubre deuda + $${saldoFavor.toLocaleString(
//             "es-AR"
//           )} a favor`;
//         } else if (monto === deudaActual) {
//           avisoDetallado = `✅ Cubre exactamente la deuda`;
//         } else {
//           const deudaRestante = deudaActual - monto;
//           avisoDetallado = `⚠️ Restante: $${deudaRestante.toLocaleString(
//             "es-AR"
//           )}`;
//         }
//       } else {
//         avisoDetallado = `💚 Generará saldo a favor de $${monto.toLocaleString(
//           "es-AR"
//         )}`;
//       }

//       setAvisoSaldo(avisoDetallado);
//     }
//   }, [nuevoPago.monto, clientSelected]);

//   const handleRegistrarPago = async () => {
//     if (!clientSelected || !nuevoPago.monto || !nuevoPago.metodo) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Complete todos los campos obligatorios.",
//       });
//       return;
//     }

//     const montoPagado = parseInt(nuevoPago.monto);
//     const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
//     const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;
//     const fechaPago = new Date(anio, mes - 1, dia);

//     const pagoFinal = {
//       fecha: nuevoPago.fecha,
//       hora: nuevoPago.hora,
//       concepto: nuevoPago.concepto || "Pago de clase",
//       metodo: nuevoPago.metodo,
//       monto: montoPagado,
//       mes: mesPago,
//       createdAt: Timestamp.fromDate(fechaPago),
//       alumno: {
//         name: clientSelected.name,
//         lastName: clientSelected.lastName,
//         dni: clientSelected.dni || "Sin DNI",
//         id: clientSelected.id,
//       },
//     };

//     const deudaActual = clientSelected.debt || 0;
//     const saldoFavorActual = clientSelected.saldoFavor || 0;

//     let nuevaDeuda = 0;
//     let nuevoSaldoFavor = 0;
//     let nuevoEstado = "Al día";

//     if (saldoFavorActual > 0) {
//       nuevoSaldoFavor = saldoFavorActual + montoPagado;
//       nuevoEstado = "Al día";
//     } else if (deudaActual > 0) {
//       if (montoPagado >= deudaActual) {
//         nuevoSaldoFavor = montoPagado - deudaActual;
//         nuevaDeuda = 0;
//         nuevoEstado = "Al día";
//       } else {
//         nuevaDeuda = deudaActual - montoPagado;
//         nuevoSaldoFavor = 0;
//         nuevoEstado = "Deudor";
//       }
//     } else {
//       nuevoSaldoFavor = montoPagado;
//       nuevaDeuda = 0;
//       nuevoEstado = "Al día";
//     }

//     const updateData = {
//       ultimoPago: nuevoPago.fecha,
//       debt: nuevaDeuda,
//       saldoFavor: nuevoSaldoFavor,
//       estado: nuevoEstado,
//     };

//     try {
//       await addDoc(collection(db, "payments"), pagoFinal);
//       const clientRef = doc(db, "clients", clientSelected.id);
//       await updateDoc(clientRef, updateData);

//       handleClosePaymentModal();
//       setIsChange(true);

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

//   const deleteClient = (id) => {
//     Swal.fire({
//       title: "¿Estás seguro?",
//       text: "Este alumno será eliminado permanentemente.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Sí, eliminar",
//       cancelButtonText: "Cancelar",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         deleteDoc(doc(db, "clients", id)).then(() => {
//           setIsChange(true);
//           Swal.fire("Eliminado", "El alumno ha sido borrado.", "success");
//         });
//       }
//     });
//   };

//   const getDayName = (dateString) => {
//     const date = new Date(dateString);
//     const dayValue = date.getDay();
//     return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("es-ES", {
//       day: "2-digit",
//       month: "2-digit",
//     });
//   };

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

//   const filteredClients = Array.isArray(clients)
//     ? clients.filter((client) => {
//         const matchesActividad = actividadFilter
//           ? client.actividad === actividadFilter
//           : true;
//         const matchesSearch = `${client.name || ""} ${client.lastName || ""} ${
//           client.dni || ""
//         }`
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());
//         return matchesActividad && matchesSearch;
//       })
//     : [];

//   return (
//     <div style={{ marginTop: 20 }}>
//       {/* Header más compacto */}
//       <ActivityStats
//         clients={clients}
//         title="Resumen de Alumnos"
//         entityLabel="alumnos"
//       />
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 10,
//           flexWrap: "wrap",
//           gap: 10,
//         }}
//       >
//         <div style={{ marginLeft: 10 }}>
//           <h3 style={{ margin: 0 }}>Lista de alumnos</h3>
//           <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "gray" }}>
//             {filteredClients.length} alumnos
//           </p>
//         </div>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//             flexWrap: "wrap",
//           }}
//         >
//           <TextField
//             label="Buscar"
//             variant="outlined"
//             size="small"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             sx={{ width: 150 }}
//           />
//           <Select
//             displayEmpty
//             size="small"
//             value={actividadFilter}
//             onChange={(e) => setActividadFilter(e.target.value)}
//             sx={{ width: 120 }}
//           >
//             <MenuItem value="">Todas</MenuItem>
//             {Array.isArray(activities) &&
//               activities.map((actividad) => (
//                 <MenuItem key={actividad.id} value={actividad.label}>
//                   {actividad.label}
//                 </MenuItem>
//               ))}
//           </Select>
//           <Button
//             variant="outlined"
//             startIcon={<SettingsIcon />}
//             onClick={handleOpenPricesManager}
//             size="small"
//           >
//             Precios
//           </Button>
//           <Button
//             variant="contained"
//             onClick={() => handleOpenForm(null)}
//             size="small"
//           >
//             + Alumno
//           </Button>
//         </div>
//       </div>

//       <TableContainer component={Paper}>
//         <Table
//           sx={{ minWidth: 650 }}
//           size="small"
//           aria-label="tabla de alumnos"
//         >
//           <TableHead>
//             <TableRow>
//               <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
//                 Nombre
//               </TableCell>
//               <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
//                 Apellido
//               </TableCell>
//               <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
//                 DNI
//               </TableCell>
//               <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
//                 Celular
//               </TableCell>
//               <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
//                 Actividad
//               </TableCell>
//               <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
//                 Deuda
//               </TableCell>
//               <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
//                 Acciones
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredClients.map((client) => (
//               <TableRow key={client.id}>
//                 <TableCell
//                   sx={{
//                     color:
//                       client.estado === "Deudor"
//                         ? "red"
//                         : client.estado === "Inactivo"
//                         ? "goldenrod"
//                         : "green",
//                     fontWeight: "bold",
//                     cursor: "pointer",
//                     fontSize: "0.875rem",
//                   }}
//                   onClick={() => handleOpenProfile(client)}
//                 >
//                   {client.name}
//                 </TableCell>
//                 <TableCell
//                   sx={{ cursor: "pointer", fontSize: "0.875rem" }}
//                   onClick={() => handleOpenProfile(client)}
//                 >
//                   {client.lastName}
//                 </TableCell>
//                 <TableCell sx={{ fontSize: "0.875rem" }}>
//                   {client.dni}
//                 </TableCell>
//                 <TableCell sx={{ fontSize: "0.875rem" }}>
//                   {client.phone}
//                 </TableCell>
//                 <TableCell sx={{ fontSize: "0.875rem" }}>
//                   {client.actividad || "No asignada"}
//                 </TableCell>
//                 <TableCell
//                   sx={{
//                     color:
//                       (client.estado === "Inactivo" ? 0 : client.debt || 0) > 0
//                         ? "red"
//                         : "green",
//                     fontWeight: "bold",
//                     fontSize: "0.875rem",
//                   }}
//                 >
//                   $
//                   {client.estado === "Inactivo"
//                     ? 0
//                     : (client.debt || 0).toLocaleString()}
//                 </TableCell>
//                 <TableCell>
//                   <IconButton
//                     onClick={() => handleOpenPaymentModal(client)}
//                     color="primary"
//                     title="Registrar pago"
//                     size="small"
//                   >
//                     <PaymentIcon fontSize="small" />
//                   </IconButton>
//                   <IconButton
//                     onClick={() => handleOpenForm(client)}
//                     size="small"
//                   >
//                     <EditIcon fontSize="small" />
//                   </IconButton>
//                   <IconButton
//                     onClick={() => deleteClient(client.id)}
//                     size="small"
//                   >
//                     <DeleteIcon fontSize="small" />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Modal de edición - más compacto */}
//       <Modal open={openForm} onClose={handleCloseForm}>
//         <Box
//           sx={{ ...modalStyle, width: "90vw", maxWidth: 600, height: "85vh" }}
//         >
//           <ClientForm
//             handleClose={handleCloseForm}
//             setIsChange={setIsChange}
//             clientSelected={clientSelected}
//             setClientSelected={setClientSelected}
//           />
//         </Box>
//       </Modal>

//       {/* Modal de pago - optimizado */}
//       <Modal open={openPaymentModal} onClose={handleClosePaymentModal}>
//         <Box sx={modalStyle}>
//           <Typography variant="h6" sx={{ mb: 1, fontSize: "1.1rem" }}>
//             Registrar Pago
//           </Typography>
//           {clientSelected && (
//             <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
//               {clientSelected.name} {clientSelected.lastName} - DNI:{" "}
//               {clientSelected.dni}
//             </Typography>
//           )}

//           {avisoSaldo && (
//             <Alert
//               severity={
//                 avisoSaldo.includes("favor") ||
//                 avisoSaldo.includes("exactamente")
//                   ? "success"
//                   : avisoSaldo.includes("Restante")
//                   ? "warning"
//                   : "info"
//               }
//               sx={{ mb: 2, fontSize: "0.8rem" }}
//             >
//               {avisoSaldo}
//             </Alert>
//           )}

//           <Grid container spacing={1}>
//             <Grid item xs={12}>
//               <TextField
//                 label="Concepto"
//                 fullWidth
//                 size="small"
//                 value={nuevoPago.concepto}
//                 onChange={(e) =>
//                   setNuevoPago({ ...nuevoPago, concepto: e.target.value })
//                 }
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <TextField
//                 label="Método"
//                 select
//                 fullWidth
//                 size="small"
//                 value={nuevoPago.metodo}
//                 onChange={(e) =>
//                   setNuevoPago({ ...nuevoPago, metodo: e.target.value })
//                 }
//                 required
//               >
//                 <MenuItem value="efectivo">💵 Efectivo</MenuItem>
//                 <MenuItem value="transferencia">✔ Transfer.</MenuItem>
//                 <MenuItem value="tarjeta">💳 Tarjeta</MenuItem>
//               </TextField>
//             </Grid>
//             <Grid item xs={6}>
//               <TextField
//                 label="Monto"
//                 type="number"
//                 fullWidth
//                 size="small"
//                 value={nuevoPago.monto}
//                 onChange={(e) =>
//                   setNuevoPago({ ...nuevoPago, monto: e.target.value })
//                 }
//                 required
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <TextField
//                 label="Fecha"
//                 fullWidth
//                 size="small"
//                 value={nuevoPago.fecha}
//                 onChange={(e) =>
//                   setNuevoPago({ ...nuevoPago, fecha: e.target.value })
//                 }
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <TextField
//                 label="Hora"
//                 fullWidth
//                 size="small"
//                 value={nuevoPago.hora}
//                 onChange={(e) =>
//                   setNuevoPago({ ...nuevoPago, hora: e.target.value })
//                 }
//               />
//             </Grid>
//           </Grid>

//           <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
//             <Button
//               variant="outlined"
//               onClick={handleClosePaymentModal}
//               fullWidth
//               size="small"
//             >
//               Cancelar
//             </Button>
//             <Button
//               variant="contained"
//               onClick={handleRegistrarPago}
//               fullWidth
//               size="small"
//               disabled={!nuevoPago.monto || !nuevoPago.metodo}
//             >
//               Registrar
//             </Button>
//           </Box>
//         </Box>
//       </Modal>

//       {/* Modal de perfil - compacto con acordeones */}
//       <Modal open={openProfile} onClose={handleCloseProfile}>
//         <Box sx={profileModalStyle}>
//           {clientSelected && (
//             <>
//               <Typography
//                 variant="h6"
//                 sx={{
//                   fontWeight: "bold",
//                   textAlign: "center",
//                   mb: 2,
//                   fontSize: "1.1rem",
//                 }}
//               >
//                 {clientSelected.name} {clientSelected.lastName}
//               </Typography>

//               {/* Información básica */}
//               <Accordion defaultExpanded>
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     <PersonIcon color="primary" />
//                     <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
//                       Información Personal
//                     </Typography>
//                   </Box>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <Grid container spacing={1}>
//                     <Grid item xs={6}>
//                       <Typography variant="body2">
//                         <strong>DNI:</strong> {clientSelected.dni}
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={6}>
//                       <Typography variant="body2">
//                         <strong>Celular:</strong> {clientSelected.phone}
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={12}>
//                       <Typography variant="body2">
//                         <strong>Dirección:</strong> {clientSelected.address}
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={12}>
//                       <Typography variant="body2">
//                         <strong>Actividad:</strong>{" "}
//                         {clientSelected.actividad || "No asignada"}
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </AccordionDetails>
//               </Accordion>

//               {/* Estado financiero */}
//               <Accordion>
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     <AccountBalanceWalletIcon color="primary" />
//                     <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
//                       Estado Financiero
//                     </Typography>
//                   </Box>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <Grid container spacing={1}>
//                     <Grid item xs={6}>
//                       <Typography variant="body2">
//                         <strong>Estado:</strong> {clientSelected.estado}
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={6}>
//                       <Typography
//                         variant="body2"
//                         color={
//                           clientSelected.debt > 0 ? "error" : "success.main"
//                         }
//                       >
//                         <strong>Deuda:</strong> $
//                         {(clientSelected.debt || 0).toLocaleString()}
//                       </Typography>
//                     </Grid>
//                     {clientSelected.saldoFavor > 0 && (
//                       <Grid item xs={6}>
//                         <Typography variant="body2" color="success.main">
//                           <strong>Saldo a favor:</strong> $
//                           {(clientSelected.saldoFavor || 0).toLocaleString()}
//                         </Typography>
//                       </Grid>
//                     )}
//                     <Grid item xs={6}>
//                       <Typography variant="body2">
//                         <strong>Último pago:</strong>{" "}
//                         {clientSelected.ultimoPago || "Sin pagos"}
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </AccordionDetails>
//               </Accordion>

//               {/* Horarios */}
//               <Accordion>
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     <AccessTimeIcon color="primary" />
//                     <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
//                       Horarios ({clientSchedules.length})
//                     </Typography>
//                   </Box>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   {loadingSchedules ? (
//                     <Typography variant="body2">Cargando...</Typography>
//                   ) : clientSchedules.length > 0 ? (
//                     <>
//                       {/* Resumen compacto */}
//                       <Box sx={{ mb: 2 }}>
//                         <Typography
//                           variant="body2"
//                           sx={{ mb: 1, fontWeight: "bold" }}
//                         >
//                           Horarios habituales:
//                         </Typography>
//                         <Box
//                           sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
//                         >
//                           {getScheduleSummary(clientSchedules).map(
//                             (summary, index) => (
//                               <Chip
//                                 key={index}
//                                 label={`${summary.day}: ${summary.hours.join(
//                                   ", "
//                                 )}`}
//                                 variant="outlined"
//                                 size="small"
//                                 sx={{ fontSize: "0.7rem" }}
//                               />
//                             )
//                           )}
//                         </Box>
//                       </Box>

//                       {/* Próximos horarios - máximo 5 */}
//                       <Typography
//                         variant="body2"
//                         sx={{ mb: 1, fontWeight: "bold" }}
//                       >
//                         Próximos:
//                       </Typography>
//                       <Box sx={{ maxHeight: 150, overflow: "auto" }}>
//                         {clientSchedules
//                           .filter(
//                             (schedule) =>
//                               new Date(schedule.date) >=
//                               new Date().setHours(0, 0, 0, 0)
//                           )
//                           .slice(0, 5)
//                           .map((schedule, index) => (
//                             <Box
//                               key={index}
//                               sx={{
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 alignItems: "center",
//                                 p: 0.5,
//                                 mb: 0.5,
//                                 bgcolor: schedule.attended
//                                   ? "success.light"
//                                   : "grey.100",
//                                 borderRadius: 1,
//                                 fontSize: "0.75rem",
//                               }}
//                             >
//                               <Box>
//                                 <Typography variant="caption">
//                                   {getDayName(schedule.date)}{" "}
//                                   {formatDate(schedule.date)} - {schedule.hour}
//                                 </Typography>
//                               </Box>
//                               <Chip
//                                 label={schedule.attended ? "✓" : "○"}
//                                 color={
//                                   schedule.attended ? "success" : "default"
//                                 }
//                                 size="small"
//                                 sx={{ fontSize: "0.7rem", height: 18 }}
//                               />
//                             </Box>
//                           ))}
//                       </Box>

//                       {/* Estadísticas compactas */}
//                       <Box
//                         sx={{
//                           mt: 1,
//                           p: 1,
//                           bgcolor: "grey.50",
//                           borderRadius: 1,
//                         }}
//                       >
//                         <Grid container spacing={1}>
//                           <Grid item xs={4}>
//                             <Typography variant="caption">
//                               <strong>Total:</strong> {clientSchedules.length}
//                             </Typography>
//                           </Grid>
//                           <Grid item xs={4}>
//                             <Typography variant="caption">
//                               <strong>Asistió:</strong>{" "}
//                               {clientSchedules.filter((s) => s.attended).length}
//                             </Typography>
//                           </Grid>
//                           <Grid item xs={4}>
//                             <Typography variant="caption">
//                               <strong>%:</strong>{" "}
//                               {clientSchedules.length > 0
//                                 ? Math.round(
//                                     (clientSchedules.filter((s) => s.attended)
//                                       .length /
//                                       clientSchedules.length) *
//                                       100
//                                   )
//                                 : 0}
//                               %
//                             </Typography>
//                           </Grid>
//                         </Grid>
//                       </Box>
//                     </>
//                   ) : (
//                     <Typography variant="body2" color="text.secondary">
//                       Sin horarios programados
//                     </Typography>
//                   )}
//                 </AccordionDetails>
//               </Accordion>
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

// export default ClientsList;
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Button,
  IconButton,
  TextField,
  MenuItem,
  Select,
  Typography,
  Chip,
  Box,
  Modal,
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

import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { useActivities } from "../activities/useActivities";
import { db } from "../../../firebaseConfig";
import { ClientForm } from "./ClientForm";
import { ActivityPricesManager } from "../activities/ActivityPricesManager";
import { Timestamp } from "firebase/firestore";
import Swal from "sweetalert2";
import ActivityStats from "../activities/ActivityStats";

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

const ClientsList = ({ clients = [], setIsChange }) => {
  const [openForm, setOpenForm] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPricesManager, setOpenPricesManager] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [clientSelected, setClientSelected] = useState(null);
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSchedules, setClientSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [avisoSaldo, setAvisoSaldo] = useState("");

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
    setClientSchedules([]);
  };

  const handleClosePricesManager = () => setOpenPricesManager(false);

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setClientSelected(null);
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

  const handleOpenForm = (client) => {
    setClientSelected(client);
    setOpenForm(true);
  };

  const handleOpenPaymentModal = (client) => {
    setClientSelected(client);

    let aviso = "";
    if (client.saldoFavor > 0) {
      aviso = `⚠️ Saldo a favor: $${client.saldoFavor.toLocaleString("es-AR")}`;
    } else if (client.debt > 0) {
      // Mostrar si tiene deuda anterior
      if (client.deudaAnterior && client.deudaAnterior > 0) {
        aviso = `💰 Deuda total: $${client.debt.toLocaleString(
          "es-AR"
        )} (Incluye $${client.deudaAnterior.toLocaleString(
          "es-AR"
        )} de meses anteriores)`;
      } else {
        aviso = `💰 Deuda: $${client.debt.toLocaleString("es-AR")}`;
      }
    } else {
      aviso = "✅ Al día";
    }
    setAvisoSaldo(aviso);

    const conceptoPrecargado = client.actividad
      ? `${client.actividad}`
      : "Pago de clase";

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

  const handleOpenProfile = async (client) => {
    setClientSelected(client);
    setLoadingSchedules(true);

    try {
      const schedulesRef = collection(db, "schedules");
      const schedulesSnap = await getDocs(schedulesRef);

      const clientSchedulesList = [];

      schedulesSnap.docs.forEach((doc) => {
        const scheduleData = doc.data();
        const clientInSchedule = scheduleData.clients?.find(
          (c) => c.id === client.id
        );

        if (clientInSchedule) {
          clientSchedulesList.push({
            id: doc.id,
            date: scheduleData.date,
            hour: scheduleData.hour,
            attended: clientInSchedule.attended || false,
          });
        }
      });

      clientSchedulesList.sort((a, b) => {
        if (a.date === b.date) {
          return a.hour.localeCompare(b.hour);
        }
        return a.date.localeCompare(b.date);
      });

      setClientSchedules(clientSchedulesList);
    } catch (error) {
      console.error("Error al cargar horarios del cliente:", error);
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

  useEffect(() => {
    if (clientSelected && nuevoPago.monto) {
      const monto = parseInt(nuevoPago.monto);
      if (isNaN(monto) || monto <= 0) return;

      let avisoDetallado = "";
      const saldoFavorActual = clientSelected.saldoFavor || 0;
      const deudaActual = clientSelected.debt || 0;
      const deudaAnterior = clientSelected.deudaAnterior || 0;

      if (saldoFavorActual > 0) {
        const nuevoSaldoFavor = saldoFavorActual + monto;
        avisoDetallado = `💚 Nuevo saldo: $${nuevoSaldoFavor.toLocaleString(
          "es-AR"
        )}`;
      } else if (deudaActual > 0) {
        if (monto > deudaActual) {
          const saldoFavor = monto - deudaActual;
          avisoDetallado = `🎉 Cubre deuda completa + $${saldoFavor.toLocaleString(
            "es-AR"
          )} a favor`;
        } else if (monto === deudaActual) {
          avisoDetallado = `✅ Cubre exactamente la deuda`;
        } else {
          const deudaRestante = deudaActual - monto;

          // Si hay deuda anterior, mostrar cómo se distribuye el pago
          if (deudaAnterior > 0) {
            if (monto >= deudaAnterior) {
              const cubrioAnterior = true;
              const sobrante = monto - deudaAnterior;
              const cuotaActual = deudaActual - deudaAnterior;
              const nuevaCuotaActual = cuotaActual - sobrante;
              avisoDetallado = `✅ Cubre $${deudaAnterior.toLocaleString(
                "es-AR"
              )} de deuda anterior + $${sobrante.toLocaleString(
                "es-AR"
              )} de cuota actual. Restante: $${deudaRestante.toLocaleString(
                "es-AR"
              )}`;
            } else {
              const nuevaDeudaAnterior = deudaAnterior - monto;
              avisoDetallado = `⚠️ Se aplica a deuda anterior. Nueva deuda anterior: $${nuevaDeudaAnterior.toLocaleString(
                "es-AR"
              )}. Restante total: $${deudaRestante.toLocaleString("es-AR")}`;
            }
          } else {
            avisoDetallado = `⚠️ Restante: $${deudaRestante.toLocaleString(
              "es-AR"
            )}`;
          }
        }
      } else {
        avisoDetallado = `💚 Generará saldo a favor de $${monto.toLocaleString(
          "es-AR"
        )}`;
      }

      setAvisoSaldo(avisoDetallado);
    }
  }, [nuevoPago.monto, clientSelected]);

  const handleRegistrarPago = async () => {
    if (!clientSelected || !nuevoPago.monto || !nuevoPago.metodo) {
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
      concepto: nuevoPago.concepto || "Pago de clase",
      metodo: nuevoPago.metodo,
      monto: montoPagado,
      mes: mesPago,
      createdAt: Timestamp.fromDate(fechaPago),
      alumno: {
        name: clientSelected.name,
        lastName: clientSelected.lastName,
        dni: clientSelected.dni || "Sin DNI",
        id: clientSelected.id,
      },
    };

    const deudaActual = clientSelected.debt || 0;
    const saldoFavorActual = clientSelected.saldoFavor || 0;
    const deudaAnterior = clientSelected.deudaAnterior || 0;

    let nuevaDeuda = 0;
    let nuevoSaldoFavor = 0;
    let nuevoEstado = "Al día";
    let nuevaDeudaAnterior = deudaAnterior;

    if (saldoFavorActual > 0) {
      nuevoSaldoFavor = saldoFavorActual + montoPagado;
      nuevoEstado = "Al día";
    } else if (deudaActual > 0) {
      if (montoPagado >= deudaActual) {
        // Pago cubre toda la deuda
        nuevoSaldoFavor = montoPagado - deudaActual;
        nuevaDeuda = 0;
        nuevaDeudaAnterior = 0;
        nuevoEstado = "Al día";
      } else {
        // Pago parcial
        nuevaDeuda = deudaActual - montoPagado;
        nuevoSaldoFavor = 0;
        nuevoEstado = "Deudor";

        // Si hay deuda anterior, aplicar el pago primero allí
        if (deudaAnterior > 0) {
          if (montoPagado >= deudaAnterior) {
            // El pago cubre toda la deuda anterior
            nuevaDeudaAnterior = 0;
          } else {
            // El pago solo cubre parte de la deuda anterior
            nuevaDeudaAnterior = deudaAnterior - montoPagado;
          }
        }
      }
    } else {
      // No hay deuda, genera saldo a favor
      nuevoSaldoFavor = montoPagado;
      nuevaDeuda = 0;
      nuevaDeudaAnterior = 0;
      nuevoEstado = "Al día";
    }

    const updateData = {
      ultimoPago: nuevoPago.fecha,
      debt: nuevaDeuda,
      deudaAnterior: nuevaDeudaAnterior,
      saldoFavor: nuevoSaldoFavor,
      estado: nuevoEstado,
    };

    try {
      await addDoc(collection(db, "payments"), pagoFinal);
      const clientRef = doc(db, "clients", clientSelected.id);
      await updateDoc(clientRef, updateData);

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

  const deleteClient = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Este alumno será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDoc(doc(db, "clients", id)).then(() => {
          setIsChange(true);
          Swal.fire("Eliminado", "El alumno ha sido borrado.", "success");
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

  const filteredClients = Array.isArray(clients)
    ? clients.filter((client) => {
        const matchesActividad = actividadFilter
          ? client.actividad === actividadFilter
          : true;
        const matchesSearch = `${client.name || ""} ${client.lastName || ""} ${
          client.dni || ""
        }`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesActividad && matchesSearch;
      })
    : [];

  return (
    <div style={{ marginTop: 20 }}>
      <ActivityStats
        clients={clients}
        title="Resumen de Alumnos"
        entityLabel="alumnos"
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
          <h3 style={{ margin: 0 }}>Lista de alumnos</h3>
          <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "gray" }}>
            {filteredClients.length} alumnos
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
          <Select
            displayEmpty
            size="small"
            value={actividadFilter}
            onChange={(e) => setActividadFilter(e.target.value)}
            sx={{ width: 120 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {Array.isArray(activities) &&
              activities.map((actividad) => (
                <MenuItem key={actividad.id} value={actividad.label}>
                  {actividad.label}
                </MenuItem>
              ))}
          </Select>
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
            + Alumno
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="tabla de alumnos"
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
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell
                  sx={{
                    color:
                      client.estado === "Deudor"
                        ? "red"
                        : client.estado === "Inactivo"
                        ? "goldenrod"
                        : "green",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                  onClick={() => handleOpenProfile(client)}
                >
                  {client.name}
                </TableCell>
                <TableCell
                  sx={{ cursor: "pointer", fontSize: "0.875rem" }}
                  onClick={() => handleOpenProfile(client)}
                >
                  {client.lastName}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem" }}>
                  {client.dni}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem" }}>
                  {client.phone}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem" }}>
                  {client.actividad || "No asignada"}
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      (client.estado === "Inactivo" ? 0 : client.debt || 0) > 0
                        ? "red"
                        : "green",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  $
                  {client.estado === "Inactivo"
                    ? 0
                    : (client.debt || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenPaymentModal(client)}
                    color="primary"
                    title="Registrar pago"
                    size="small"
                  >
                    <PaymentIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenForm(client)}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => deleteClient(client.id)}
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

      <Modal open={openForm} onClose={handleCloseForm}>
        <Box
          sx={{ ...modalStyle, width: "90vw", maxWidth: 600, height: "85vh" }}
        >
          <ClientForm
            handleClose={handleCloseForm}
            setIsChange={setIsChange}
            clientSelected={clientSelected}
            setClientSelected={setClientSelected}
          />
        </Box>
      </Modal>

      <Modal open={openPaymentModal} onClose={handleClosePaymentModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 1, fontSize: "1.1rem" }}>
            Registrar Pago
          </Typography>
          {clientSelected && (
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              {clientSelected.name} {clientSelected.lastName} - DNI:{" "}
              {clientSelected.dni}
            </Typography>
          )}

          {avisoSaldo && (
            <Alert
              severity={
                avisoSaldo.includes("favor") ||
                avisoSaldo.includes("exactamente") ||
                avisoSaldo.includes("completa")
                  ? "success"
                  : avisoSaldo.includes("Restante") ||
                    avisoSaldo.includes("anterior")
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

      <Modal open={openProfile} onClose={handleCloseProfile}>
        <Box sx={profileModalStyle}>
          {clientSelected && (
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
                {clientSelected.name} {clientSelected.lastName}
              </Typography>

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
                        <strong>DNI:</strong> {clientSelected.dni}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Celular:</strong> {clientSelected.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Dirección:</strong> {clientSelected.address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Actividad:</strong>{" "}
                        {clientSelected.actividad || "No asignada"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Fecha de inicio:</strong>{" "}
                        {clientSelected.fechaInicio
                          ? new Date(
                              clientSelected.fechaInicio
                            ).toLocaleDateString("es-ES")
                          : "No especificada"}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

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
                        <strong>Estado:</strong> {clientSelected.estado}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="body2"
                        color={
                          clientSelected.debt > 0 ? "error" : "success.main"
                        }
                      >
                        <strong>Deuda Total:</strong> $
                        {(clientSelected.debt || 0).toLocaleString()}
                      </Typography>
                    </Grid>

                    {/* Mostrar deuda anterior si existe */}
                    {(clientSelected.deudaAnterior || 0) > 0 && (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: "#fff3e0",
                            borderRadius: 1,
                            border: "1px solid #ff9800",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              mb: 0.5,
                              color: "#e65100",
                            }}
                          >
                            Desglose de deuda:
                          </Typography>
                          <Typography variant="body2" color="error">
                            • <strong>Deuda de meses anteriores:</strong> $
                            {(
                              clientSelected.deudaAnterior || 0
                            ).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="warning.main">
                            • <strong>Cuota actual:</strong> $
                            {(
                              (clientSelected.debt || 0) -
                              (clientSelected.deudaAnterior || 0)
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {clientSelected.saldoFavor > 0 && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="success.main">
                          <strong>Saldo a favor:</strong> $
                          {(clientSelected.saldoFavor || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Último pago:</strong>{" "}
                        {clientSelected.ultimoPago || "Sin pagos"}
                      </Typography>
                    </Grid>

                    {clientSelected.ultimoMesFacturado && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Último mes facturado:</strong>{" "}
                          {clientSelected.ultimoMesFacturado}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Horarios ({clientSchedules.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {loadingSchedules ? (
                    <Typography variant="body2">Cargando...</Typography>
                  ) : clientSchedules.length > 0 ? (
                    <>
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
                          {getScheduleSummary(clientSchedules).map(
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

                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        Próximos:
                      </Typography>
                      <Box sx={{ maxHeight: 150, overflow: "auto" }}>
                        {clientSchedules
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
                              <strong>Total:</strong> {clientSchedules.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption">
                              <strong>Asistió:</strong>{" "}
                              {clientSchedules.filter((s) => s.attended).length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption">
                              <strong>%:</strong>{" "}
                              {clientSchedules.length > 0
                                ? Math.round(
                                    (clientSchedules.filter((s) => s.attended)
                                      .length /
                                      clientSchedules.length) *
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

      <ActivityPricesManager
        open={openPricesManager}
        onClose={handleClosePricesManager}
        onActivityUpdate={handleActivityUpdate}
      />
    </div>
  );
};

export default ClientsList;
