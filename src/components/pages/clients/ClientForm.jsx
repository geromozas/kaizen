// import {
//   Button,
//   TextField,
//   MenuItem,
//   FormControlLabel,
//   Checkbox,
//   FormGroup,
//   Typography,
//   Box,
//   Paper,
//   Chip,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Alert,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import { useState, useEffect } from "react";
// import { db } from "../../../firebaseConfig";
// import {
//   addDoc,
//   collection,
//   doc,
//   updateDoc,
//   writeBatch,
// } from "firebase/firestore";
// import { useActivities } from "../activities/useActivities";
// import Swal from "sweetalert2";

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

// const daysOfWeek = [
//   { key: "monday", label: "Lunes", value: 1 },
//   { key: "tuesday", label: "Martes", value: 2 },
//   { key: "wednesday", label: "Miércoles", value: 3 },
//   { key: "thursday", label: "Jueves", value: 4 },
//   { key: "friday", label: "Viernes", value: 5 },
//   { key: "saturday", label: "Sábado", value: 6 },
//   { key: "sunday", label: "Domingo", value: 0 },
// ];

// const activityTypes = [
//   { value: "gimnasio", label: "Gimnasio", color: "#1976d2" },
//   { value: "kinesio", label: "Kinesiología", color: "#2e7d32" },
//   { value: "quiropraxia", label: "Quiropraxia", color: "#f57c00" },
// ];

// export const ClientForm = ({
//   handleClose,
//   setIsChange,
//   clientSelected,
//   setClientSelected,
// }) => {
//   const [isUploading, setIsUploading] = useState(false);
//   const { activities, loading: activitiesLoading } = useActivities();

//   // Estados para horarios
//   const [selectedDays, setSelectedDays] = useState([]);
//   const [daySchedules, setDaySchedules] = useState({});
//   const [createSchedules, setCreateSchedules] = useState(false);
//   const [activityType, setActivityType] = useState("gimnasio");
//   const [replicateToYear, setReplicateToYear] = useState(true);

//   // Estados para control de recálculo de deuda
//   const [showDebtRecalculation, setShowDebtRecalculation] = useState(false);
//   const [originalDebt, setOriginalDebt] = useState(0);
//   const [manualDebtOverride, setManualDebtOverride] = useState(false);

//   const proporciones = [
//     { label: "Mes completo", factor: 1 },
//     { label: "3/4 del mes", factor: 0.75 },
//     { label: "1/2 mes", factor: 0.5 },
//     { label: "1/4 del mes", factor: 0.25 },
//   ];

//   // Función para obtener la fecha actual en formato YYYY-MM-DD
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [newClient, setNewClient] = useState({
//     name: "",
//     lastName: "",
//     phone: "",
//     address: "",
//     phoneHelp: "",
//     dni: "",
//     actividad: "",
//     proporcion: 1,
//     debt: 0,
//     lastpay: "",
//     fechaInicio: getCurrentDate(), // Fecha de inicio por defecto hoy
//   });

//   const calcularDeuda = (actividadLabel, proporcion) => {
//     const actividad = activities.find((a) => a.label === actividadLabel);
//     if (!actividad || proporcion == null) return 0;
//     return Math.round((actividad.valor * proporcion) / 100) * 100;
//   };

//   const calcularEstado = (debt, saldoFavor = 0) => {
//     if (saldoFavor > 0) {
//       return "Saldo a favor";
//     } else if (debt > 0) {
//       return "Deudor";
//     } else {
//       return "Al día";
//     }
//   };

//   // Función para verificar si el recálculo afectaría la deuda existente
//   const shouldShowRecalculationWarning = (newDebt, currentDebt) => {
//     return clientSelected && currentDebt !== 0 && newDebt !== currentDebt;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Si es un cliente existente y estamos cambiando actividad o proporción
//     const isDebtAffectingChange =
//       clientSelected && (name === "actividad" || name === "proporcion");

//     let updatedActividad =
//       name === "actividad"
//         ? value
//         : clientSelected?.actividad || newClient.actividad;

//     let updatedProporcion =
//       name === "proporcion"
//         ? parseFloat(value)
//         : clientSelected?.proporcion || newClient.proporcion;

//     const calculatedDebt = calcularDeuda(updatedActividad, updatedProporcion);
//     const currentDebt = clientSelected?.debt || newClient.debt;

//     // Verificar si necesitamos mostrar advertencia de recálculo
//     if (
//       isDebtAffectingChange &&
//       shouldShowRecalculationWarning(calculatedDebt, currentDebt)
//     ) {
//       if (!showDebtRecalculation) {
//         setOriginalDebt(currentDebt);
//         setShowDebtRecalculation(true);
//       }
//     }

//     // Determinar qué deuda usar
//     let finalDebt;
//     if (clientSelected && manualDebtOverride) {
//       // Si el usuario decidió mantener la deuda manual, no recalcular
//       finalDebt = currentDebt;
//     } else if (clientSelected && !showDebtRecalculation) {
//       // Si es edición pero no hay cambios que afecten la deuda
//       finalDebt = name === "debt" ? parseFloat(value) || 0 : currentDebt;
//     } else {
//       // Para nuevos clientes o cuando el usuario acepta recalcular
//       finalDebt = calculatedDebt;
//     }

//     const currentSaldoFavor =
//       clientSelected?.saldoFavor || newClient.saldoFavor || 0;
//     const updatedEstado = calcularEstado(finalDebt, currentSaldoFavor);

//     const updatedValues = {
//       [name]: name === "proporcion" ? parseFloat(value) : value,
//       debt: finalDebt,
//       estado: updatedEstado,
//     };

//     if (clientSelected) {
//       setClientSelected({
//         ...clientSelected,
//         ...updatedValues,
//       });
//     } else {
//       setNewClient({
//         ...newClient,
//         ...updatedValues,
//       });
//     }
//   };

//   // Función para manejar la decisión del usuario sobre el recálculo
//   const handleDebtRecalculationDecision = (shouldRecalculate) => {
//     const currentClient = clientSelected;
//     const calculatedDebt = calcularDeuda(
//       currentClient.actividad,
//       currentClient.proporcion
//     );

//     if (shouldRecalculate) {
//       // Recalcular la deuda
//       const updatedEstado = calcularEstado(
//         calculatedDebt,
//         currentClient.saldoFavor || 0
//       );
//       setClientSelected({
//         ...currentClient,
//         debt: calculatedDebt,
//         estado: updatedEstado,
//       });
//       setManualDebtOverride(false);
//     } else {
//       // Mantener la deuda original
//       setManualDebtOverride(true);
//     }

//     setShowDebtRecalculation(false);
//   };

//   // Función para permitir edición manual de la deuda
//   const handleManualDebtChange = (e) => {
//     const newDebt = parseFloat(e.target.value) || 0;
//     const currentClient = clientSelected || newClient;
//     const updatedEstado = calcularEstado(
//       newDebt,
//       currentClient.saldoFavor || 0
//     );

//     const updatedValues = {
//       debt: newDebt,
//       estado: updatedEstado,
//     };

//     if (clientSelected) {
//       setClientSelected({
//         ...clientSelected,
//         ...updatedValues,
//       });
//       setManualDebtOverride(true);
//     } else {
//       setNewClient({
//         ...newClient,
//         ...updatedValues,
//       });
//     }
//   };

//   // Función para determinar si el campo de deuda debe estar en rojo
//   const isDebtPositive = () => {
//     const currentDebt = clientSelected?.debt || newClient.debt;
//     return currentDebt > 0;
//   };

//   // Resto de las funciones de horarios (sin cambios)
//   const handleDayChange = (dayValue) => {
//     setSelectedDays((prev) => {
//       if (prev.includes(dayValue)) {
//         const newDaySchedules = { ...daySchedules };
//         delete newDaySchedules[dayValue];
//         setDaySchedules(newDaySchedules);
//         return prev.filter((day) => day !== dayValue);
//       } else {
//         return [...prev, dayValue];
//       }
//     });
//   };

//   const handleDayScheduleChange = (dayValue, hours) => {
//     setDaySchedules((prev) => ({
//       ...prev,
//       [dayValue]: hours,
//     }));
//   };

//   const getDayName = (dayValue) => {
//     return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
//   };

//   const getActivityTypeColor = (type) => {
//     return activityTypes.find((at) => at.value === type)?.color || "#1976d2";
//   };

//   const getTotalSchedules = () => {
//     return selectedDays.reduce((total, dayValue) => {
//       const hoursForDay = daySchedules[dayValue] || [];
//       return total + hoursForDay.length;
//     }, 0);
//   };

//   const generateYearlyDates = (selectedDaysValues, baseDate) => {
//     const year = baseDate.getFullYear();
//     const dates = [];
//     const firstDay = new Date(year, 0, 1);
//     const lastDay = new Date(year, 11, 31);

//     for (
//       let date = new Date(firstDay);
//       date <= lastDay;
//       date.setDate(date.getDate() + 1)
//     ) {
//       if (selectedDaysValues.includes(date.getDay())) {
//         dates.push(new Date(date));
//       }
//     }
//     return dates;
//   };

//   const createClientSchedules = async (clientId, clientData) => {
//     if (
//       !createSchedules ||
//       selectedDays.length === 0 ||
//       getTotalSchedules() === 0
//     ) {
//       return;
//     }

//     try {
//       const batchId = `batch_${Date.now()}_${Math.random()
//         .toString(36)
//         .substr(2, 9)}`;

//       const clientsData = [
//         {
//           id: clientId,
//           attended: false,
//           activityType: activityType,
//         },
//       ];

//       if (replicateToYear) {
//         const dates = generateYearlyDates(selectedDays, new Date());
//         const batch = writeBatch(db);

//         dates.forEach((date) => {
//           const dayOfWeek = date.getDay();
//           const hoursForDay = daySchedules[dayOfWeek] || [];

//           hoursForDay.forEach((hour) => {
//             const scheduleRef = doc(collection(db, "schedules"));
//             const data = {
//               date: date.toISOString().split("T")[0],
//               hour: hour,
//               clients: clientsData,
//               activityType: activityType,
//               batchId: batchId,
//               createdAt: new Date().toISOString(),
//             };
//             batch.set(scheduleRef, data);
//           });
//         });

//         await batch.commit();
//       } else {
//         const today = new Date();
//         const dayOfWeek = today.getDay();
//         const hoursForDay = daySchedules[dayOfWeek] || [];

//         for (const hour of hoursForDay) {
//           const data = {
//             date: today.toISOString().split("T")[0],
//             hour: hour,
//             clients: clientsData,
//             activityType: activityType,
//             createdAt: new Date().toISOString(),
//           };
//           await addDoc(collection(db, "schedules"), data);
//         }
//       }

//       console.log(
//         `Horarios creados para cliente: ${clientData.name} ${clientData.lastName}`
//       );
//     } catch (error) {
//       console.error("Error al crear horarios:", error);
//       throw error;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsUploading(true);

//     try {
//       const clientsRef = collection(db, "clients");

//       if (clientSelected) {
//         const dataToUpdate = {
//           ...clientSelected,
//           estado: calcularEstado(
//             clientSelected.debt,
//             clientSelected.saldoFavor || 0
//           ),
//         };
//         await updateDoc(doc(clientsRef, clientSelected.id), dataToUpdate);

//         Swal.fire({
//           icon: "success",
//           title: "Alumno modificado",
//           text: "Los datos se guardaron correctamente",
//           timer: 2000,
//           showConfirmButton: false,
//         });
//       } else {
//         const estadoInicial = calcularEstado(
//           newClient.debt,
//           newClient.saldoFavor || 0
//         );

//         const clientData = {
//           ...newClient,
//           estado: estadoInicial,
//           fechaCreacion: new Date().toISOString(), // Agregar timestamp de creación
//         };

//         const docRef = await addDoc(clientsRef, clientData);

//         if (createSchedules) {
//           await createClientSchedules(docRef.id, clientData);
//         }

//         Swal.fire({
//           icon: "success",
//           title: "Alumno creado",
//           text: createSchedules
//             ? "El alumno y sus horarios fueron creados con éxito"
//             : "El alumno fue agregado con éxito",
//           timer: 2500,
//           showConfirmButton: false,
//         });
//       }

//       setIsChange(true);
//       handleClose();
//     } catch (error) {
//       console.error("Error al guardar cliente:", error);
//       Swal.fire("Error", "Hubo un problema al guardar el alumno", "error");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // Efecto simplificado para inicialización
//   useEffect(() => {
//     if (clientSelected) {
//       setOriginalDebt(clientSelected.debt || 0);
//     }
//   }, [clientSelected?.id]); // Solo cuando cambia el cliente seleccionado

//   return (
//     <Box
//       component="form"
//       onSubmit={handleSubmit}
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         gap: 2,
//         maxHeight: "80vh",
//         overflowY: "auto",
//         padding: 2,
//         "&::-webkit-scrollbar": {
//           width: "8px",
//         },
//         "&::-webkit-scrollbar-track": {
//           background: "#f1f1f1",
//         },
//         "&::-webkit-scrollbar-thumb": {
//           background: "#888",
//           borderRadius: "4px",
//         },
//         "&::-webkit-scrollbar-thumb:hover": {
//           background: "#555",
//         },
//       }}
//     >
//       <Typography variant="h4" component="h1">
//         {clientSelected ? "Editar Alumno" : "Nuevo Alumno"}
//       </Typography>

//       <TextField
//         label="Nombre"
//         name="name"
//         onChange={handleChange}
//         defaultValue={clientSelected?.name}
//         required
//       />
//       <TextField
//         label="Apellido"
//         name="lastName"
//         onChange={handleChange}
//         defaultValue={clientSelected?.lastName}
//         required
//       />
//       <TextField
//         label="Celular"
//         name="phone"
//         onChange={handleChange}
//         defaultValue={clientSelected?.phone}
//         required
//       />
//       <TextField
//         label="2do Celular"
//         name="phoneHelp"
//         onChange={handleChange}
//         defaultValue={clientSelected?.phoneHelp}
//       />
//       <TextField
//         label="Dirección"
//         name="address"
//         onChange={handleChange}
//         defaultValue={clientSelected?.address}
//       />
//       <TextField
//         label="DNI"
//         name="dni"
//         onChange={handleChange}
//         defaultValue={clientSelected?.dni}
//         required
//       />

//       {/* Campo de fecha de inicio */}
//       <TextField
//         label="Fecha de Inicio"
//         name="fechaInicio"
//         type="date"
//         value={clientSelected?.fechaInicio || newClient.fechaInicio}
//         onChange={handleChange}
//         InputLabelProps={{
//           shrink: true,
//         }}
//         required
//       />

//       <TextField
//         select
//         label="Actividad"
//         name="actividad"
//         value={clientSelected?.actividad || newClient.actividad}
//         onChange={handleChange}
//         fullWidth
//         required
//         disabled={activitiesLoading}
//       >
//         {activitiesLoading ? (
//           <MenuItem disabled>Cargando actividades...</MenuItem>
//         ) : (
//           activities.map((actividad) => (
//             <MenuItem key={actividad.id} value={actividad.label}>
//               {actividad.label} - ${actividad.valor.toLocaleString()}
//             </MenuItem>
//           ))
//         )}
//       </TextField>

//       <TextField
//         select
//         label="Inicio del mes"
//         name="proporcion"
//         value={
//           clientSelected?.proporcion?.toString() ||
//           newClient.proporcion.toString()
//         }
//         onChange={handleChange}
//         fullWidth
//         required
//       >
//         {proporciones.map((p) => (
//           <MenuItem key={p.label} value={p.factor}>
//             {p.label}
//           </MenuItem>
//         ))}
//       </TextField>

//       {/* Alerta para recálculo de deuda */}
//       {showDebtRecalculation && (
//         <Alert
//           severity="warning"
//           sx={{ mb: 2 }}
//           action={
//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button
//                 size="small"
//                 onClick={() => handleDebtRecalculationDecision(true)}
//                 color="warning"
//               >
//                 Recalcular
//               </Button>
//               <Button
//                 size="small"
//                 onClick={() => handleDebtRecalculationDecision(false)}
//                 variant="outlined"
//                 color="warning"
//               >
//                 Mantener actual
//               </Button>
//             </Box>
//           }
//         >
//           <Typography variant="body2">
//             <strong>¡Atención!</strong> Los cambios en la actividad o proporción
//             afectarían la deuda.
//             <br />
//             <strong>Deuda actual:</strong> ${originalDebt.toLocaleString()}
//             <br />
//             <strong>Nueva deuda calculada:</strong> $
//             {calcularDeuda(
//               clientSelected?.actividad || newClient.actividad,
//               clientSelected?.proporcion || newClient.proporcion
//             ).toLocaleString()}
//           </Typography>
//         </Alert>
//       )}

//       {/* Campo de deuda con estilo condicional */}
//       <TextField
//         label="Deuda"
//         type="number"
//         value={clientSelected?.debt || newClient.debt}
//         onChange={handleManualDebtChange}
//         InputProps={{
//           startAdornment: <Typography>$</Typography>,
//           readOnly: !clientSelected, // Solo editable para clientes existentes
//         }}
//         helperText={
//           clientSelected
//             ? "Puedes editar la deuda manualmente si es necesario"
//             : "La deuda se calcula automáticamente"
//         }
//         sx={{
//           "& .MuiOutlinedInput-root": {
//             backgroundColor: isDebtPositive() ? "#ffebee" : "transparent",
//             borderColor: isDebtPositive() ? "#f44336" : undefined,
//             "&:hover": {
//               backgroundColor: isDebtPositive() ? "#ffcdd2" : undefined,
//             },
//             "&.Mui-focused": {
//               backgroundColor: isDebtPositive() ? "#ffebee" : "transparent",
//             },
//           },
//           "& .MuiOutlinedInput-notchedOutline": {
//             borderColor: isDebtPositive() ? "#f44336" : undefined,
//           },
//           "& .MuiInputLabel-root": {
//             color: isDebtPositive() ? "#f44336" : undefined,
//             "&.Mui-focused": {
//               color: isDebtPositive() ? "#f44336" : undefined,
//             },
//           },
//           "& .MuiInputBase-input": {
//             color: isDebtPositive() ? "#000" : undefined,
//             fontWeight: isDebtPositive() ? "bold" : "normal",
//           },
//           "& .MuiInputAdornment-root .MuiTypography-root": {
//             color: isDebtPositive() ? "#f44336" : undefined,
//             fontWeight: isDebtPositive() ? "bold" : "normal",
//           },
//         }}
//       />

//       <Typography>
//         <strong>Estado:</strong>{" "}
//         {clientSelected?.estado ||
//           calcularEstado(newClient.debt, newClient.saldoFavor || 0)}
//       </Typography>

//       {/* Mostrar fecha de creación para clientes existentes */}
//       {clientSelected && clientSelected.fechaCreacion && (
//         <Typography variant="body2" color="textSecondary">
//           <strong>Creado el:</strong>{" "}
//           {new Date(clientSelected.fechaCreacion).toLocaleDateString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//         </Typography>
//       )}

//       {/* Sección de horarios solo para creación de nuevos clientes */}
//       {!clientSelected && (
//         <Box sx={{ mt: 3, border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={createSchedules}
//                 onChange={(e) => setCreateSchedules(e.target.checked)}
//               />
//             }
//             label="Crear horarios automáticamente"
//           />

//           {createSchedules && (
//             <Box sx={{ mt: 2 }}>
//               {/* Selector de tipo de actividad */}
//               <Typography variant="h6" gutterBottom>
//                 Tipo de Actividad
//               </Typography>
//               <Paper sx={{ p: 2, mb: 2 }}>
//                 <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
//                   {activityTypes.map((type) => (
//                     <FormControlLabel
//                       key={type.value}
//                       control={
//                         <Checkbox
//                           checked={activityType === type.value}
//                           onChange={() => setActivityType(type.value)}
//                           sx={{ color: type.color }}
//                         />
//                       }
//                       label={type.label}
//                     />
//                   ))}
//                 </Box>
//               </Paper>

//               {/* Días de la semana */}
//               <Typography variant="h6" gutterBottom>
//                 Días de la Semana
//               </Typography>
//               <Paper sx={{ p: 2, mb: 2 }}>
//                 <FormGroup row>
//                   {daysOfWeek.map((day) => (
//                     <FormControlLabel
//                       key={day.key}
//                       control={
//                         <Checkbox
//                           checked={selectedDays.includes(day.value)}
//                           onChange={() => handleDayChange(day.value)}
//                         />
//                       }
//                       label={day.label}
//                     />
//                   ))}
//                 </FormGroup>
//               </Paper>

//               {/* Horarios por día */}
//               {selectedDays.length > 0 && (
//                 <Box sx={{ mb: 2 }}>
//                   <Typography variant="h6" gutterBottom>
//                     Horarios por Día
//                   </Typography>
//                   {selectedDays.map((dayValue) => (
//                     <Accordion key={dayValue} sx={{ mb: 1 }}>
//                       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                         <Typography sx={{ fontWeight: "medium" }}>
//                           {getDayName(dayValue)}
//                           {daySchedules[dayValue] &&
//                             daySchedules[dayValue].length > 0 && (
//                               <Chip
//                                 label={`${
//                                   daySchedules[dayValue].length
//                                 } horario${
//                                   daySchedules[dayValue].length > 1 ? "s" : ""
//                                 }`}
//                                 size="small"
//                                 sx={{
//                                   ml: 2,
//                                   backgroundColor:
//                                     getActivityTypeColor(activityType),
//                                   color: "white",
//                                 }}
//                               />
//                             )}
//                         </Typography>
//                       </AccordionSummary>
//                       <AccordionDetails>
//                         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                           {availableHours.map((hour) => (
//                             <FormControlLabel
//                               key={hour}
//                               control={
//                                 <Checkbox
//                                   checked={(
//                                     daySchedules[dayValue] || []
//                                   ).includes(hour)}
//                                   onChange={(e) => {
//                                     const currentHours =
//                                       daySchedules[dayValue] || [];
//                                     const updatedHours = e.target.checked
//                                       ? [...currentHours, hour]
//                                       : currentHours.filter((h) => h !== hour);
//                                     handleDayScheduleChange(
//                                       dayValue,
//                                       updatedHours
//                                     );
//                                   }}
//                                 />
//                               }
//                               label={hour}
//                             />
//                           ))}
//                         </Box>
//                       </AccordionDetails>
//                     </Accordion>
//                   ))}
//                 </Box>
//               )}

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={replicateToYear}
//                     onChange={(e) => setReplicateToYear(e.target.checked)}
//                   />
//                 }
//                 label="Replicar horarios a todo el año"
//               />

//               {/* Resumen */}
//               {selectedDays.length > 0 && getTotalSchedules() > 0 && (
//                 <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
//                   <Typography variant="body2" color="textSecondary">
//                     <strong>Resumen:</strong> Se crearán {getTotalSchedules()}{" "}
//                     horarios para{" "}
//                     {
//                       activityTypes.find((at) => at.value === activityType)
//                         ?.label
//                     }
//                     {replicateToYear && " para todo el año"}
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     Días: {selectedDays.map((d) => getDayName(d)).join(", ")}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           )}
//         </Box>
//       )}

//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-around",
//           marginTop: 2,
//           gap: 2,
//         }}
//       >
//         <Button
//           variant="contained"
//           type="submit"
//           disabled={isUploading || activitiesLoading}
//         >
//           {isUploading
//             ? "Guardando..."
//             : clientSelected
//             ? "Modificar"
//             : "Crear"}
//         </Button>
//         <Button variant="contained" onClick={handleClose}>
//           Cancelar
//         </Button>
//       </Box>
//     </Box>
//   );
// };
import {
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Box,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useActivities } from "../activities/useActivities";
import Swal from "sweetalert2";

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

const daysOfWeek = [
  { key: "monday", label: "Lunes", value: 1 },
  { key: "tuesday", label: "Martes", value: 2 },
  { key: "wednesday", label: "Miércoles", value: 3 },
  { key: "thursday", label: "Jueves", value: 4 },
  { key: "friday", label: "Viernes", value: 5 },
  { key: "saturday", label: "Sábado", value: 6 },
  { key: "sunday", label: "Domingo", value: 0 },
];

const activityTypes = [
  { value: "gimnasio", label: "Gimnasio", color: "#1976d2" },
  { value: "kinesio", label: "Kinesiología", color: "#2e7d32" },
  { value: "quiropraxia", label: "Quiropraxia", color: "#f57c00" },
];

export const ClientForm = ({
  handleClose,
  setIsChange,
  clientSelected,
  setClientSelected,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { activities, loading: activitiesLoading } = useActivities();

  // Estados para horarios
  const [selectedDays, setSelectedDays] = useState([]);
  const [daySchedules, setDaySchedules] = useState({});
  const [createSchedules, setCreateSchedules] = useState(false);
  const [activityType, setActivityType] = useState("gimnasio");
  const [replicateToYear, setReplicateToYear] = useState(true);

  // Estados para control de recálculo de deuda
  const [showDebtRecalculation, setShowDebtRecalculation] = useState(false);
  const [originalDebt, setOriginalDebt] = useState(0);
  const [manualDebtOverride, setManualDebtOverride] = useState(false);

  const proporciones = [
    { label: "Mes completo", factor: 1 },
    { label: "3/4 del mes", factor: 0.75 },
    { label: "1/2 mes", factor: 0.5 },
    { label: "1/4 del mes", factor: 0.25 },
  ];

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Función para obtener mes actual en formato YYYY-MM
  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const [newClient, setNewClient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    dni: "",
    actividad: "",
    proporcion: 1,
    debt: 0,
    deudaAnterior: 0, // Deuda de meses pasados
    lastpay: "",
    fechaInicio: getCurrentDate(),
    ultimoMesFacturado: getCurrentMonth(),
  });

  const calcularDeuda = (actividadLabel, proporcion) => {
    const actividad = activities.find((a) => a.label === actividadLabel);
    if (!actividad || proporcion == null) return 0;
    return Math.round((actividad.valor * proporcion) / 100) * 100;
  };

  const calcularEstado = (debt, saldoFavor = 0) => {
    if (saldoFavor > 0) {
      return "Saldo a favor";
    } else if (debt > 0) {
      return "Deudor";
    } else {
      return "Al día";
    }
  };

  // Función para verificar si el recálculo afectaría la deuda existente
  const shouldShowRecalculationWarning = (newDebt, currentDebt) => {
    return clientSelected && currentDebt !== 0 && newDebt !== currentDebt;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si es un cliente existente y estamos cambiando actividad o proporción
    const isDebtAffectingChange =
      clientSelected && (name === "actividad" || name === "proporcion");

    let updatedActividad =
      name === "actividad"
        ? value
        : clientSelected?.actividad || newClient.actividad;

    let updatedProporcion =
      name === "proporcion"
        ? parseFloat(value)
        : clientSelected?.proporcion || newClient.proporcion;

    const calculatedDebt = calcularDeuda(updatedActividad, updatedProporcion);
    const currentDebt = clientSelected?.debt || newClient.debt;

    // Verificar si necesitamos mostrar advertencia de recálculo
    if (
      isDebtAffectingChange &&
      shouldShowRecalculationWarning(calculatedDebt, currentDebt)
    ) {
      if (!showDebtRecalculation) {
        setOriginalDebt(currentDebt);
        setShowDebtRecalculation(true);
      }
    }

    // Determinar qué deuda usar
    let finalDebt;
    if (clientSelected && manualDebtOverride) {
      // Si el usuario decidió mantener la deuda manual, no recalcular
      finalDebt = currentDebt;
    } else if (clientSelected && !showDebtRecalculation) {
      // Si es edición pero no hay cambios que afecten la deuda
      finalDebt = name === "debt" ? parseFloat(value) || 0 : currentDebt;
    } else {
      // Para nuevos clientes o cuando el usuario acepta recalcular
      finalDebt = calculatedDebt;
    }

    const currentSaldoFavor =
      clientSelected?.saldoFavor || newClient.saldoFavor || 0;
    const updatedEstado = calcularEstado(finalDebt, currentSaldoFavor);

    const updatedValues = {
      [name]: name === "proporcion" ? parseFloat(value) : value,
      debt: finalDebt,
      estado: updatedEstado,
    };

    if (clientSelected) {
      setClientSelected({
        ...clientSelected,
        ...updatedValues,
      });
    } else {
      setNewClient({
        ...newClient,
        ...updatedValues,
      });
    }
  };

  // Función para manejar la decisión del usuario sobre el recálculo
  const handleDebtRecalculationDecision = (shouldRecalculate) => {
    const currentClient = clientSelected;
    const calculatedDebt = calcularDeuda(
      currentClient.actividad,
      currentClient.proporcion
    );

    if (shouldRecalculate) {
      // Recalcular la deuda
      const updatedEstado = calcularEstado(
        calculatedDebt,
        currentClient.saldoFavor || 0
      );
      setClientSelected({
        ...currentClient,
        debt: calculatedDebt,
        estado: updatedEstado,
      });
      setManualDebtOverride(false);
    } else {
      // Mantener la deuda original
      setManualDebtOverride(true);
    }

    setShowDebtRecalculation(false);
  };

  // Función para permitir edición manual de la deuda
  const handleManualDebtChange = (e) => {
    const newDebt = parseFloat(e.target.value) || 0;
    const currentClient = clientSelected || newClient;
    const updatedEstado = calcularEstado(
      newDebt,
      currentClient.saldoFavor || 0
    );

    const updatedValues = {
      debt: newDebt,
      estado: updatedEstado,
    };

    if (clientSelected) {
      setClientSelected({
        ...clientSelected,
        ...updatedValues,
      });
      setManualDebtOverride(true);
    } else {
      setNewClient({
        ...newClient,
        ...updatedValues,
      });
    }
  };

  // Función para renovar mes (sumar nueva cuota a deuda existente)
  const handleRenovarMes = () => {
    if (!clientSelected) return;

    const nuevaCuota = calcularDeuda(
      clientSelected.actividad,
      clientSelected.proporcion
    );
    const deudaActual = clientSelected.debt || 0;
    const nuevaDeudaTotal = deudaActual + nuevaCuota;

    Swal.fire({
      title: "Renovar mes",
      html: `
        <div style="text-align: left;">
          <p><strong>Deuda actual:</strong> $${deudaActual.toLocaleString()}</p>
          <p><strong>Nueva cuota:</strong> $${nuevaCuota.toLocaleString()}</p>
          <hr>
          <p style="color: #d32f2f;"><strong>Total a deber:</strong> $${nuevaDeudaTotal.toLocaleString()}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, renovar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d32f2f",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedEstado = calcularEstado(
          nuevaDeudaTotal,
          clientSelected.saldoFavor || 0
        );

        setClientSelected({
          ...clientSelected,
          debt: nuevaDeudaTotal,
          deudaAnterior: deudaActual, // Guardar la deuda anterior
          ultimoMesFacturado: getCurrentMonth(),
          estado: updatedEstado,
        });

        Swal.fire({
          icon: "success",
          title: "Mes renovado",
          text: "Se agregó la nueva cuota a la deuda pendiente",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Función para determinar si el campo de deuda debe estar en rojo
  const isDebtPositive = () => {
    const currentDebt = clientSelected?.debt || newClient.debt;
    return currentDebt > 0;
  };

  // Resto de las funciones de horarios (sin cambios)
  const handleDayChange = (dayValue) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        const newDaySchedules = { ...daySchedules };
        delete newDaySchedules[dayValue];
        setDaySchedules(newDaySchedules);
        return prev.filter((day) => day !== dayValue);
      } else {
        return [...prev, dayValue];
      }
    });
  };

  const handleDayScheduleChange = (dayValue, hours) => {
    setDaySchedules((prev) => ({
      ...prev,
      [dayValue]: hours,
    }));
  };

  const getDayName = (dayValue) => {
    return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
  };

  const getActivityTypeColor = (type) => {
    return activityTypes.find((at) => at.value === type)?.color || "#1976d2";
  };

  const getTotalSchedules = () => {
    return selectedDays.reduce((total, dayValue) => {
      const hoursForDay = daySchedules[dayValue] || [];
      return total + hoursForDay.length;
    }, 0);
  };

  const generateYearlyDates = (selectedDaysValues, baseDate) => {
    const year = baseDate.getFullYear();
    const dates = [];
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);

    for (
      let date = new Date(firstDay);
      date <= lastDay;
      date.setDate(date.getDate() + 1)
    ) {
      if (selectedDaysValues.includes(date.getDay())) {
        dates.push(new Date(date));
      }
    }
    return dates;
  };

  const createClientSchedules = async (clientId, clientData) => {
    if (
      !createSchedules ||
      selectedDays.length === 0 ||
      getTotalSchedules() === 0
    ) {
      return;
    }

    try {
      const batchId = `batch_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const clientsData = [
        {
          id: clientId,
          attended: false,
          activityType: activityType,
        },
      ];

      if (replicateToYear) {
        const dates = generateYearlyDates(selectedDays, new Date());
        const batch = writeBatch(db);

        dates.forEach((date) => {
          const dayOfWeek = date.getDay();
          const hoursForDay = daySchedules[dayOfWeek] || [];

          hoursForDay.forEach((hour) => {
            const scheduleRef = doc(collection(db, "schedules"));
            const data = {
              date: date.toISOString().split("T")[0],
              hour: hour,
              clients: clientsData,
              activityType: activityType,
              batchId: batchId,
              createdAt: new Date().toISOString(),
            };
            batch.set(scheduleRef, data);
          });
        });

        await batch.commit();
      } else {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const hoursForDay = daySchedules[dayOfWeek] || [];

        for (const hour of hoursForDay) {
          const data = {
            date: today.toISOString().split("T")[0],
            hour: hour,
            clients: clientsData,
            activityType: activityType,
            createdAt: new Date().toISOString(),
          };
          await addDoc(collection(db, "schedules"), data);
        }
      }

      console.log(
        `Horarios creados para cliente: ${clientData.name} ${clientData.lastName}`
      );
    } catch (error) {
      console.error("Error al crear horarios:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const clientsRef = collection(db, "clients");

      if (clientSelected) {
        const dataToUpdate = {
          ...clientSelected,
          estado: calcularEstado(
            clientSelected.debt,
            clientSelected.saldoFavor || 0
          ),
        };
        await updateDoc(doc(clientsRef, clientSelected.id), dataToUpdate);

        Swal.fire({
          icon: "success",
          title: "Alumno modificado",
          text: "Los datos se guardaron correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const estadoInicial = calcularEstado(
          newClient.debt,
          newClient.saldoFavor || 0
        );

        const clientData = {
          ...newClient,
          estado: estadoInicial,
          fechaCreacion: new Date().toISOString(),
        };

        const docRef = await addDoc(clientsRef, clientData);

        if (createSchedules) {
          await createClientSchedules(docRef.id, clientData);
        }

        Swal.fire({
          icon: "success",
          title: "Alumno creado",
          text: createSchedules
            ? "El alumno y sus horarios fueron creados con éxito"
            : "El alumno fue agregado con éxito",
          timer: 2500,
          showConfirmButton: false,
        });
      }

      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      Swal.fire("Error", "Hubo un problema al guardar el alumno", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Efecto simplificado para inicialización
  useEffect(() => {
    if (clientSelected) {
      setOriginalDebt(clientSelected.debt || 0);
    }
  }, [clientSelected?.id]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxHeight: "80vh",
        overflowY: "auto",
        padding: 2,
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
      }}
    >
      <Typography variant="h4" component="h1">
        {clientSelected ? "Editar Alumno" : "Nuevo Alumno"}
      </Typography>

      <TextField
        label="Nombre"
        name="name"
        onChange={handleChange}
        defaultValue={clientSelected?.name}
        required
      />
      <TextField
        label="Apellido"
        name="lastName"
        onChange={handleChange}
        defaultValue={clientSelected?.lastName}
        required
      />
      <TextField
        label="Celular"
        name="phone"
        onChange={handleChange}
        defaultValue={clientSelected?.phone}
        required
      />
      <TextField
        label="2do Celular"
        name="phoneHelp"
        onChange={handleChange}
        defaultValue={clientSelected?.phoneHelp}
      />
      <TextField
        label="Dirección"
        name="address"
        onChange={handleChange}
        defaultValue={clientSelected?.address}
      />
      <TextField
        label="DNI"
        name="dni"
        onChange={handleChange}
        defaultValue={clientSelected?.dni}
        required
      />

      <TextField
        label="Fecha de Inicio"
        name="fechaInicio"
        type="date"
        value={clientSelected?.fechaInicio || newClient.fechaInicio}
        onChange={handleChange}
        InputLabelProps={{
          shrink: true,
        }}
        required
      />

      <TextField
        select
        label="Actividad"
        name="actividad"
        value={clientSelected?.actividad || newClient.actividad}
        onChange={handleChange}
        fullWidth
        required
        disabled={activitiesLoading}
      >
        {activitiesLoading ? (
          <MenuItem disabled>Cargando actividades...</MenuItem>
        ) : (
          activities.map((actividad) => (
            <MenuItem key={actividad.id} value={actividad.label}>
              {actividad.label} - ${actividad.valor.toLocaleString()}
            </MenuItem>
          ))
        )}
      </TextField>

      <TextField
        select
        label="Inicio del mes"
        name="proporcion"
        value={
          clientSelected?.proporcion?.toString() ||
          newClient.proporcion.toString()
        }
        onChange={handleChange}
        fullWidth
        required
      >
        {proporciones.map((p) => (
          <MenuItem key={p.label} value={p.factor}>
            {p.label}
          </MenuItem>
        ))}
      </TextField>

      {showDebtRecalculation && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                onClick={() => handleDebtRecalculationDecision(true)}
                color="warning"
              >
                Recalcular
              </Button>
              <Button
                size="small"
                onClick={() => handleDebtRecalculationDecision(false)}
                variant="outlined"
                color="warning"
              >
                Mantener actual
              </Button>
            </Box>
          }
        >
          <Typography variant="body2">
            <strong>¡Atención!</strong> Los cambios en la actividad o proporción
            afectarían la deuda.
            <br />
            <strong>Deuda actual:</strong> ${originalDebt.toLocaleString()}
            <br />
            <strong>Nueva deuda calculada:</strong> $
            {calcularDeuda(
              clientSelected?.actividad || newClient.actividad,
              clientSelected?.proporcion || newClient.proporcion
            ).toLocaleString()}
          </Typography>
        </Alert>
      )}

      <TextField
        label="Deuda"
        type="number"
        value={clientSelected?.debt || newClient.debt}
        onChange={handleManualDebtChange}
        InputProps={{
          startAdornment: <Typography>$</Typography>,
          readOnly: !clientSelected,
        }}
        helperText={
          clientSelected
            ? "Puedes editar la deuda manualmente si es necesario"
            : "La deuda se calcula automáticamente"
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: isDebtPositive() ? "#ffebee" : "transparent",
            borderColor: isDebtPositive() ? "#f44336" : undefined,
            "&:hover": {
              backgroundColor: isDebtPositive() ? "#ffcdd2" : undefined,
            },
            "&.Mui-focused": {
              backgroundColor: isDebtPositive() ? "#ffebee" : "transparent",
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: isDebtPositive() ? "#f44336" : undefined,
          },
          "& .MuiInputLabel-root": {
            color: isDebtPositive() ? "#f44336" : undefined,
            "&.Mui-focused": {
              color: isDebtPositive() ? "#f44336" : undefined,
            },
          },
          "& .MuiInputBase-input": {
            color: isDebtPositive() ? "#000" : undefined,
            fontWeight: isDebtPositive() ? "bold" : "normal",
          },
          "& .MuiInputAdornment-root .MuiTypography-root": {
            color: isDebtPositive() ? "#f44336" : undefined,
            fontWeight: isDebtPositive() ? "bold" : "normal",
          },
        }}
      />

      {/* Botón para renovar mes */}
      {clientSelected && clientSelected.actividad && (
        <Button
          variant="contained"
          color="warning"
          onClick={handleRenovarMes}
          fullWidth
        >
          Renovar Mes (Agregar Nueva Cuota)
        </Button>
      )}

      {/* Mostrar información de deuda anterior si existe */}
      {clientSelected && (clientSelected.deudaAnterior || 0) > 0 && (
        <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Deuda de meses anteriores:</strong> $
            {(clientSelected.deudaAnterior || 0).toLocaleString()}
          </Typography>
        </Box>
      )}

      <Typography>
        <strong>Estado:</strong>{" "}
        {clientSelected?.estado ||
          calcularEstado(newClient.debt, newClient.saldoFavor || 0)}
      </Typography>

      {clientSelected && clientSelected.fechaCreacion && (
        <Typography variant="body2" color="textSecondary">
          <strong>Creado el:</strong>{" "}
          {new Date(clientSelected.fechaCreacion).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      )}

      {!clientSelected && (
        <Box sx={{ mt: 3, border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={createSchedules}
                onChange={(e) => setCreateSchedules(e.target.checked)}
              />
            }
            label="Crear horarios automáticamente"
          />

          {createSchedules && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tipo de Actividad
              </Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {activityTypes.map((type) => (
                    <FormControlLabel
                      key={type.value}
                      control={
                        <Checkbox
                          checked={activityType === type.value}
                          onChange={() => setActivityType(type.value)}
                          sx={{ color: type.color }}
                        />
                      }
                      label={type.label}
                    />
                  ))}
                </Box>
              </Paper>

              <Typography variant="h6" gutterBottom>
                Días de la Semana
              </Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <FormGroup row>
                  {daysOfWeek.map((day) => (
                    <FormControlLabel
                      key={day.key}
                      control={
                        <Checkbox
                          checked={selectedDays.includes(day.value)}
                          onChange={() => handleDayChange(day.value)}
                        />
                      }
                      label={day.label}
                    />
                  ))}
                </FormGroup>
              </Paper>

              {selectedDays.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Horarios por Día
                  </Typography>
                  {selectedDays.map((dayValue) => (
                    <Accordion key={dayValue} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: "medium" }}>
                          {getDayName(dayValue)}
                          {daySchedules[dayValue] &&
                            daySchedules[dayValue].length > 0 && (
                              <Chip
                                label={`${
                                  daySchedules[dayValue].length
                                } horario${
                                  daySchedules[dayValue].length > 1 ? "s" : ""
                                }`}
                                size="small"
                                sx={{
                                  ml: 2,
                                  backgroundColor:
                                    getActivityTypeColor(activityType),
                                  color: "white",
                                }}
                              />
                            )}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {availableHours.map((hour) => (
                            <FormControlLabel
                              key={hour}
                              control={
                                <Checkbox
                                  checked={(
                                    daySchedules[dayValue] || []
                                  ).includes(hour)}
                                  onChange={(e) => {
                                    const currentHours =
                                      daySchedules[dayValue] || [];
                                    const updatedHours = e.target.checked
                                      ? [...currentHours, hour]
                                      : currentHours.filter((h) => h !== hour);
                                    handleDayScheduleChange(
                                      dayValue,
                                      updatedHours
                                    );
                                  }}
                                />
                              }
                              label={hour}
                            />
                          ))}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={replicateToYear}
                    onChange={(e) => setReplicateToYear(e.target.checked)}
                  />
                }
                label="Replicar horarios a todo el año"
              />

              {selectedDays.length > 0 && getTotalSchedules() > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Resumen:</strong> Se crearán {getTotalSchedules()}{" "}
                    horarios para{" "}
                    {
                      activityTypes.find((at) => at.value === activityType)
                        ?.label
                    }
                    {replicateToYear && " para todo el año"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Días: {selectedDays.map((d) => getDayName(d)).join(", ")}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: 2,
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          type="submit"
          disabled={isUploading || activitiesLoading}
        >
          {isUploading
            ? "Guardando..."
            : clientSelected
            ? "Modificar"
            : "Crear"}
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};
