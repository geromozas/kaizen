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
//   Timestamp,
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

// // Hook para pago automático
// const useAutoPayment = () => {
//   const registerAutoPayment = async (
//     patientData,
//     activityPrice,
//     collectionName = "quiropraxiaPayments"
//   ) => {
//     if (!activityPrice || activityPrice <= 0) {
//       return { success: true, message: "No se requiere pago inicial" };
//     }

//     try {
//       const now = new Date();
//       const fechaPago = now.toLocaleDateString("es-AR");
//       const horaPago = now.toLocaleTimeString("es-AR", {
//         hour12: false,
//         hour: "2-digit",
//         minute: "2-digit",
//       });

//       const mesPago = `${now.getFullYear()}-${String(
//         now.getMonth() + 1
//       ).padStart(2, "0")}`;

//       const pagoAutomatico = {
//         fecha: fechaPago,
//         hora: horaPago,
//         concepto: `Pago inicial - ${patientData.actividad || "Sesión"}`,
//         metodo: "efectivo",
//         monto: activityPrice,
//         mes: mesPago,
//         createdAt: Timestamp.fromDate(now),
//         esAutomatico: true,
//         pacienteQuiro: {
//           name: patientData.name,
//           lastName: patientData.lastName,
//           dni: patientData.dni || "Sin DNI",
//           id: patientData.id,
//         },
//       };

//       await addDoc(collection(db, collectionName), pagoAutomatico);

//       return {
//         success: true,
//         message: "Pago inicial registrado automáticamente",
//         paymentAmount: activityPrice,
//       };
//     } catch (error) {
//       console.error("Error al registrar pago automático:", error);
//       return {
//         success: false,
//         message: "Error al registrar el pago inicial",
//         error,
//       };
//     }
//   };

//   return { registerAutoPayment };
// };

// // Función para calcular estado inicial con pago automático
// const calculateInitialPaymentState = (activityPrice) => {
//   if (!activityPrice || activityPrice <= 0) {
//     return {
//       debt: 0,
//       saldoFavor: 0,
//       estado: "Al día",
//       ultimoPago: null,
//     };
//   }

//   return {
//     debt: 0,
//     saldoFavor: 0,
//     estado: "Al día",
//     ultimoPago: new Date().toLocaleDateString("es-AR"),
//   };
// };

// export const QuiropraxiaForm = ({
//   handleClose,
//   setIsChange,
//   patientSelected,
//   setPatientSelected,
// }) => {
//   const [isUploading, setIsUploading] = useState(false);
//   const { activities, loading: activitiesLoading } = useActivities();
//   const { registerAutoPayment } = useAutoPayment();

//   // Estados para horarios
//   const [selectedDays, setSelectedDays] = useState([]);
//   const [daySchedules, setDaySchedules] = useState({});
//   const [createSchedules, setCreateSchedules] = useState(false);
//   const [activityType, setActivityType] = useState("quiropraxia");
//   const [replicateToYear, setReplicateToYear] = useState(true);

//   // Estados para control de recálculo de deuda
//   const [showDebtRecalculation, setShowDebtRecalculation] = useState(false);
//   const [originalDebt, setOriginalDebt] = useState(0);
//   const [manualDebtOverride, setManualDebtOverride] = useState(false);

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [newPatient, setNewPatient] = useState({
//     name: "",
//     lastName: "",
//     phone: "",
//     address: "",
//     phoneHelp: "",
//     dni: "",
//     actividad: "",
//     sesiones: 1,
//     debt: 0,
//     lastpay: "",
//     condition: "",
//     treatment: "",
//     fechaInicio: getCurrentDate(),
//   });

//   const calcularDeuda = (actividadLabel, sesiones) => {
//     const actividad = activities.find((a) => a.label === actividadLabel);
//     if (!actividad || sesiones == null || sesiones <= 0) return 0;
//     return actividad.valor * sesiones;
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
//     return patientSelected && currentDebt !== 0 && newDebt !== currentDebt;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Si es un cliente existente y estamos cambiando actividad o sesiones
//     const isDebtAffectingChange =
//       patientSelected && (name === "actividad" || name === "sesiones");

//     let updatedActividad =
//       name === "actividad"
//         ? value
//         : patientSelected?.actividad || newPatient.actividad;

//     let updatedSesiones =
//       name === "sesiones"
//         ? parseInt(value) || 0
//         : patientSelected?.sesiones || newPatient.sesiones;

//     const calculatedDebt = calcularDeuda(updatedActividad, updatedSesiones);
//     const currentDebt = patientSelected?.debt || newPatient.debt;

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
//     if (patientSelected && manualDebtOverride) {
//       // Si el usuario decidió mantener la deuda manual, no recalcular
//       finalDebt = currentDebt;
//     } else if (patientSelected && !showDebtRecalculation) {
//       // Si es edición pero no hay cambios que afecten la deuda
//       finalDebt = name === "debt" ? parseFloat(value) || 0 : currentDebt;
//     } else if (patientSelected) {
//       // Para pacientes existentes, usar deuda calculada solo si hay recálculo
//       finalDebt = calculatedDebt;
//     } else {
//       // Para nuevos pacientes, siempre usar 0 (se pagará automáticamente)
//       finalDebt = 0;
//     }

//     const currentSaldoFavor =
//       patientSelected?.saldoFavor || newPatient.saldoFavor || 0;
//     const updatedEstado = calcularEstado(finalDebt, currentSaldoFavor);

//     const updatedValues = {
//       [name]: name === "sesiones" ? parseInt(value) || 0 : value,
//       debt: finalDebt,
//       estado: updatedEstado,
//     };

//     if (patientSelected) {
//       setPatientSelected({
//         ...patientSelected,
//         ...updatedValues,
//       });
//     } else {
//       setNewPatient({
//         ...newPatient,
//         ...updatedValues,
//       });
//     }
//   };

//   // Función para manejar la decisión del usuario sobre el recálculo
//   const handleDebtRecalculationDecision = (shouldRecalculate) => {
//     const currentPatient = patientSelected;
//     const calculatedDebt = calcularDeuda(
//       currentPatient.actividad,
//       currentPatient.sesiones
//     );

//     if (shouldRecalculate) {
//       // Recalcular la deuda
//       const updatedEstado = calcularEstado(
//         calculatedDebt,
//         currentPatient.saldoFavor || 0
//       );
//       setPatientSelected({
//         ...currentPatient,
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
//     const currentPatient = patientSelected || newPatient;
//     const updatedEstado = calcularEstado(
//       newDebt,
//       currentPatient.saldoFavor || 0
//     );

//     const updatedValues = {
//       debt: newDebt,
//       estado: updatedEstado,
//     };

//     if (patientSelected) {
//       setPatientSelected({
//         ...patientSelected,
//         ...updatedValues,
//       });
//       setManualDebtOverride(true);
//     } else {
//       setNewPatient({
//         ...newPatient,
//         ...updatedValues,
//       });
//     }
//   };

//   // Funciones para manejo de horarios
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
//     return activityTypes.find((at) => at.value === type)?.color || "#f57c00";
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

//   const createPatientSchedules = async (patientId, patientData) => {
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

//       const patientsData = [
//         {
//           id: patientId,
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
//               clients: patientsData,
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
//             clients: patientsData,
//             activityType: activityType,
//             createdAt: new Date().toISOString(),
//           };
//           await addDoc(collection(db, "schedules"), data);
//         }
//       }

//       console.log(
//         `Horarios creados para paciente: ${patientData.name} ${patientData.lastName}`
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
//       const patientsRef = collection(db, "quiropraxia");

//       if (patientSelected) {
//         // Actualización de paciente existente
//         const dataToUpdate = {
//           ...patientSelected,
//           estado: calcularEstado(
//             patientSelected.debt,
//             patientSelected.saldoFavor || 0
//           ),
//         };
//         await updateDoc(doc(patientsRef, patientSelected.id), dataToUpdate);

//         Swal.fire({
//           icon: "success",
//           title: "Paciente modificado",
//           text: "Los datos se guardaron correctamente",
//           timer: 2000,
//           showConfirmButton: false,
//         });
//       } else {
//         // Creación de nuevo paciente
//         const selectedActivity = activities.find(
//           (activity) => activity.label === newPatient.actividad
//         );
//         const activityPrice = selectedActivity
//           ? (selectedActivity.valor || 0) * newPatient.sesiones
//           : 0;

//         // Calcular estado inicial con pago automático
//         const initialPaymentState = calculateInitialPaymentState(activityPrice);

//         const patientData = {
//           ...newPatient,
//           ...initialPaymentState,
//           fechaCreacion: new Date().toISOString(),
//         };

//         const docRef = await addDoc(patientsRef, patientData);

//         // Registrar pago automático para nuevos pacientes de quiropraxia
//         if (activityPrice > 0) {
//           const paymentResult = await registerAutoPayment(
//             { ...patientData, id: docRef.id },
//             activityPrice,
//             "quiropraxiaPayments"
//           );

//           console.log(
//             paymentResult.success
//               ? `✅ Pago inicial registrado: $${paymentResult.paymentAmount}`
//               : `❌ Error en pago automático: ${paymentResult.message}`
//           );
//         }

//         // Crear horarios si está habilitado
//         if (createSchedules) {
//           await createPatientSchedules(docRef.id, patientData);
//         }

//         Swal.fire({
//           icon: "success",
//           title: "Paciente creado",
//           text:
//             activityPrice > 0
//               ? `Paciente creado y pago de $${activityPrice.toLocaleString()} registrado automáticamente`
//               : createSchedules
//               ? "El paciente y sus horarios fueron creados con éxito"
//               : "El paciente fue agregado con éxito",
//           timer: 3500,
//           showConfirmButton: false,
//         });
//       }

//       setIsChange(true);
//       handleClose();
//     } catch (error) {
//       console.error("Error al guardar paciente:", error);
//       Swal.fire("Error", "Hubo un problema al guardar el paciente", "error");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // Efecto simplificado para inicialización
//   useEffect(() => {
//     if (patientSelected) {
//       setOriginalDebt(patientSelected.debt || 0);
//     }
//   }, [patientSelected?.id]); // Solo cuando cambia el paciente seleccionado

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
//         {patientSelected ? "Editar Paciente" : "Nuevo Paciente"}
//       </Typography>

//       {!patientSelected && (
//         <Alert severity="info" sx={{ mb: 2 }}>
//           Al crear un nuevo paciente, se registrará automáticamente el pago
//           inicial por el servicio seleccionado.
//         </Alert>
//       )}

//       <TextField
//         label="Nombre"
//         name="name"
//         onChange={handleChange}
//         defaultValue={patientSelected?.name}
//         required
//       />
//       <TextField
//         label="Apellido"
//         name="lastName"
//         onChange={handleChange}
//         defaultValue={patientSelected?.lastName}
//         required
//       />
//       <TextField
//         label="Celular"
//         name="phone"
//         onChange={handleChange}
//         defaultValue={patientSelected?.phone}
//         required
//       />
//       <TextField
//         label="2do Celular"
//         name="phoneHelp"
//         onChange={handleChange}
//         defaultValue={patientSelected?.phoneHelp}
//       />
//       <TextField
//         label="Dirección"
//         name="address"
//         onChange={handleChange}
//         defaultValue={patientSelected?.address}
//       />
//       <TextField
//         label="DNI"
//         name="dni"
//         onChange={handleChange}
//         defaultValue={patientSelected?.dni}
//         required
//       />

//       <TextField
//         label="Fecha de Inicio"
//         name="fechaInicio"
//         type="date"
//         value={patientSelected?.fechaInicio || newPatient.fechaInicio}
//         onChange={handleChange}
//         InputLabelProps={{
//           shrink: true,
//         }}
//         required
//       />

//       <TextField
//         label="Condición Médica"
//         name="condition"
//         onChange={handleChange}
//         defaultValue={patientSelected?.condition}
//         multiline
//         rows={2}
//         placeholder="Ej: Dolor de espalda baja, Ciática, etc."
//       />

//       <TextField
//         label="Tratamiento"
//         name="treatment"
//         onChange={handleChange}
//         defaultValue={patientSelected?.treatment}
//         multiline
//         rows={2}
//         placeholder="Ej: Ajustes vertebrales, terapia manual, etc."
//       />

//       <TextField
//         select
//         label="Servicio"
//         name="actividad"
//         value={patientSelected?.actividad || newPatient.actividad}
//         onChange={handleChange}
//         fullWidth
//         required
//         disabled={activitiesLoading}
//       >
//         {activitiesLoading ? (
//           <MenuItem disabled>Cargando servicios...</MenuItem>
//         ) : (
//           activities.map((actividad) => (
//             <MenuItem key={actividad.id} value={actividad.label}>
//               {actividad.label} - ${actividad.valor.toLocaleString()}
//             </MenuItem>
//           ))
//         )}
//       </TextField>

//       <TextField
//         label="Cantidad de Sesiones"
//         name="sesiones"
//         type="number"
//         value={patientSelected?.sesiones || newPatient.sesiones}
//         onChange={handleChange}
//         fullWidth
//         required
//         inputProps={{ min: 1, step: 1 }}
//         helperText="Número de sesiones programadas"
//       />

//       {/* Mostrar costo total para nuevos pacientes */}
//       {!patientSelected && newPatient.actividad && (
//         <Alert severity="success" sx={{ mb: 2 }}>
//           <Typography variant="body2">
//             <strong>Costo total:</strong> $
//             {(activities.find((a) => a.label === newPatient.actividad)?.valor ||
//               0) * newPatient.sesiones}{" "}
//             (se registrará como pago inicial automáticamente)
//           </Typography>
//         </Alert>
//       )}

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
//             <strong>¡Atención!</strong> Los cambios en el servicio o sesiones
//             afectarían la deuda.
//             <br />
//             <strong>Deuda actual:</strong> ${originalDebt.toLocaleString()}
//             <br />
//             <strong>Nueva deuda calculada:</strong> $
//             {calcularDeuda(
//               patientSelected?.actividad || newPatient.actividad,
//               patientSelected?.sesiones || newPatient.sesiones
//             ).toLocaleString()}
//           </Typography>
//         </Alert>
//       )}

//       {/* Campo de deuda - editable para pacientes existentes */}
//       <TextField
//         label="Deuda"
//         type="number"
//         value={patientSelected?.debt || newPatient.debt}
//         onChange={handleManualDebtChange}
//         InputProps={{
//           startAdornment: <Typography>$</Typography>,
//           readOnly: !patientSelected, // Solo editable para pacientes existentes
//         }}
//         helperText={
//           patientSelected
//             ? "Puedes editar la deuda manualmente si es necesario"
//             : "Nuevos pacientes inician con deuda $0 (pago automático)"
//         }
//       />

//       <Typography>
//         <strong>Estado:</strong>{" "}
//         {patientSelected?.estado ||
//           calcularEstado(newPatient.debt, newPatient.saldoFavor || 0)}
//       </Typography>

//       {patientSelected && patientSelected.fechaCreacion && (
//         <Typography variant="body2" color="textSecondary">
//           <strong>Creado el:</strong>{" "}
//           {new Date(patientSelected.fechaCreacion).toLocaleDateString("es-ES", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//         </Typography>
//       )}

//       {/* Sección de horarios solo para creación de nuevos pacientes */}
//       {!patientSelected && (
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
//             : patientSelected
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
  Timestamp,
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

export const QuiropraxiaForm = ({
  handleClose,
  setIsChange,
  patientSelected,
  setPatientSelected,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { activities, loading: activitiesLoading } = useActivities();

  // Estados para horarios
  const [selectedDays, setSelectedDays] = useState([]);
  const [daySchedules, setDaySchedules] = useState({});
  const [createSchedules, setCreateSchedules] = useState(false);
  const [activityType, setActivityType] = useState("quiropraxia");
  const [replicateToYear, setReplicateToYear] = useState(true);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [newPatient, setNewPatient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    dni: "",
    actividad: "",
    sessions: 1,
    sesionesRestantes: 0,
    sesionesCompradas: 0,
    precioSesion: 0,
    condition: "",
    treatment: "",
    fechaInicio: getCurrentDate(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValues = {
      [name]: name === "sessions" ? parseInt(value) || 0 : value,
    };

    // Si cambia la actividad, actualizar el precio por sesión
    if (name === "actividad") {
      const selectedActivity = activities.find((a) => a.label === value);
      if (selectedActivity) {
        updatedValues.precioSesion = selectedActivity.valor || 0;
      }
    }

    // Si cambia las sesiones, actualizar sesiones compradas y restantes
    if (name === "sessions") {
      const sessions = parseInt(value) || 0;
      updatedValues.sesionesCompradas = sessions;
      updatedValues.sesionesRestantes = sessions;
    }

    if (patientSelected) {
      setPatientSelected({
        ...patientSelected,
        ...updatedValues,
      });
    } else {
      setNewPatient({
        ...newPatient,
        ...updatedValues,
      });
    }
  };

  // Funciones para manejo de horarios
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
    return activityTypes.find((at) => at.value === type)?.color || "#f57c00";
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

  const createPatientSchedules = async (patientId, patientData) => {
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

      const patientsData = [
        {
          id: patientId,
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
              clients: patientsData,
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
            clients: patientsData,
            activityType: activityType,
            createdAt: new Date().toISOString(),
          };
          await addDoc(collection(db, "schedules"), data);
        }
      }

      console.log(
        `Horarios creados para paciente: ${patientData.name} ${patientData.lastName}`
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
      const patientsRef = collection(db, "quiropraxia");

      if (patientSelected) {
        // Actualización de paciente existente
        const dataToUpdate = {
          ...patientSelected,
        };
        await updateDoc(doc(patientsRef, patientSelected.id), dataToUpdate);

        Swal.fire({
          icon: "success",
          title: "Paciente modificado",
          text: "Los datos se guardaron correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Creación de nuevo paciente
        const selectedActivity = activities.find(
          (activity) => activity.label === newPatient.actividad
        );
        const precioSesion = selectedActivity ? selectedActivity.valor || 0 : 0;

        const patientData = {
          ...newPatient,
          sesionesCompradas: newPatient.sessions,
          sesionesRestantes: newPatient.sessions,
          precioSesion: precioSesion,
          fechaCreacion: new Date().toISOString(),
        };

        const docRef = await addDoc(patientsRef, patientData);

        if (createSchedules) {
          await createPatientSchedules(docRef.id, patientData);
        }

        Swal.fire({
          icon: "success",
          title: "Paciente creado",
          text: createSchedules
            ? "El paciente y sus horarios fueron creados con éxito"
            : "El paciente fue agregado con éxito",
          timer: 3500,
          showConfirmButton: false,
        });
      }

      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error al guardar paciente:", error);
      Swal.fire("Error", "Hubo un problema al guardar el paciente", "error");
    } finally {
      setIsUploading(false);
    }
  };

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
        {patientSelected ? "Editar Paciente" : "Nuevo Paciente"}
      </Typography>

      {!patientSelected && (
        <Alert severity="info" sx={{ mb: 2 }}>
          El paciente comprará un paquete de sesiones. Se registrará el pago
          cada vez que asista.
        </Alert>
      )}

      <TextField
        label="Nombre"
        name="name"
        onChange={handleChange}
        defaultValue={patientSelected?.name}
        required
      />
      <TextField
        label="Apellido"
        name="lastName"
        onChange={handleChange}
        defaultValue={patientSelected?.lastName}
        required
      />
      <TextField
        label="Celular"
        name="phone"
        onChange={handleChange}
        defaultValue={patientSelected?.phone}
        required
      />
      <TextField
        label="2do Celular"
        name="phoneHelp"
        onChange={handleChange}
        defaultValue={patientSelected?.phoneHelp}
      />
      <TextField
        label="Dirección"
        name="address"
        onChange={handleChange}
        defaultValue={patientSelected?.address}
      />
      <TextField
        label="DNI"
        name="dni"
        onChange={handleChange}
        defaultValue={patientSelected?.dni}
        required
      />

      <TextField
        label="Fecha de Inicio"
        name="fechaInicio"
        type="date"
        value={patientSelected?.fechaInicio || newPatient.fechaInicio}
        onChange={handleChange}
        InputLabelProps={{
          shrink: true,
        }}
        required
      />

      <TextField
        label="Condición Médica"
        name="condition"
        onChange={handleChange}
        defaultValue={patientSelected?.condition}
        multiline
        rows={2}
        placeholder="Ej: Dolor de espalda baja, Ciática, etc."
      />

      <TextField
        label="Tratamiento"
        name="treatment"
        onChange={handleChange}
        defaultValue={patientSelected?.treatment}
        multiline
        rows={2}
        placeholder="Ej: Ajustes vertebrales, terapia manual, etc."
      />

      <TextField
        select
        label="Servicio"
        name="actividad"
        value={patientSelected?.actividad || newPatient.actividad}
        onChange={handleChange}
        fullWidth
        required
        disabled={activitiesLoading}
      >
        {activitiesLoading ? (
          <MenuItem disabled>Cargando servicios...</MenuItem>
        ) : (
          activities.map((actividad) => (
            <MenuItem key={actividad.id} value={actividad.label}>
              {actividad.label} - ${actividad.valor.toLocaleString()} por sesión
            </MenuItem>
          ))
        )}
      </TextField>

      <TextField
        label="Cantidad de sesiones a comprar"
        name="sessions"
        type="number"
        value={patientSelected?.sessions || newPatient.sessions}
        onChange={handleChange}
        inputProps={{ min: 1 }}
      />

      {!patientSelected && newPatient.actividad && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Paquete:</strong> {newPatient.sessions} sesiones
            <br />
            <strong>Precio por sesión:</strong> $
            {activities.find((a) => a.label === newPatient.actividad)?.valor ||
              0}
            <br />
            <strong>Total a pagar:</strong> $
            {(activities.find((a) => a.label === newPatient.actividad)?.valor ||
              0) * newPatient.sessions}
          </Typography>
        </Alert>
      )}

      {patientSelected && patientSelected.fechaCreacion && (
        <Typography variant="body2" color="textSecondary">
          <strong>Creado el:</strong>{" "}
          {new Date(patientSelected.fechaCreacion).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      )}

      {/* Sección de horarios solo para creación de nuevos pacientes */}
      {!patientSelected && (
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
            : patientSelected
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
