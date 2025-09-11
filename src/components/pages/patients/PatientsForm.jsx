// import { Button, TextField, MenuItem } from "@mui/material";
// import { useState, useEffect } from "react";
// import { db } from "../../../firebaseConfig";
// import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
// import { useActivities } from "../activities/useActivities";
// import Swal from "sweetalert2";

// export const PatientForm = ({
//   handleClose,
//   setIsChange,
//   patientSelected,
//   setPatientSelected,
// }) => {
//   const [isUploading, setIsUploading] = useState(false);
//   const { activities, loading: activitiesLoading } = useActivities();

//   const [newPatient, setNewPatient] = useState({
//     name: "",
//     lastName: "",
//     phone: "",
//     address: "",
//     phoneHelp: "",
//     dni: "",
//     actividad: "",
//     sessions: 1,
//     debt: 0,
//     lastpay: "",
//   });

//   const calcularDeuda = (actividadLabel, sessions) => {
//     const actividad = activities.find((a) => a.label === actividadLabel);
//     if (!actividad || !sessions) return 0;
//     return Math.round((actividad.valor * sessions) / 100) * 100;
//   };

//   // Nueva función para calcular el estado basado en deuda y saldo
//   const calcularEstado = (debt, saldoFavor = 0) => {
//     if (saldoFavor > 0) {
//       return "Saldo a favor";
//     } else if (debt > 0) {
//       return "Deudor";
//     } else {
//       return "Al día";
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     let updatedActividad =
//       name === "actividad"
//         ? value
//         : patientSelected?.actividad || newPatient.actividad;

//     let updatedSessions =
//       name === "sessions"
//         ? parseInt(value) || 0
//         : patientSelected?.sessions || newPatient.sessions;

//     const updatedDebt = calcularDeuda(updatedActividad, updatedSessions);

//     // Calcular el nuevo estado basado en la deuda
//     const currentSaldoFavor =
//       patientSelected?.saldoFavor || newPatient.saldoFavor || 0;
//     const updatedEstado = calcularEstado(updatedDebt, currentSaldoFavor);

//     const updatedValues = {
//       [name]: name === "sessions" ? parseInt(value) || 0 : value,
//       debt: updatedDebt,
//       estado: updatedEstado, // Actualizar también el estado
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

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsUploading(true);

//     try {
//       const patientsRef = collection(db, "patients");

//       if (patientSelected) {
//         // Para pacientes existentes, asegurar que el estado se actualiza
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
//         // Para pacientes nuevos, calcular el estado inicial
//         const estadoInicial = calcularEstado(
//           newPatient.debt,
//           newPatient.saldoFavor || 0
//         );
//         await addDoc(patientsRef, {
//           ...newPatient,
//           estado: estadoInicial,
//         });

//         Swal.fire({
//           icon: "success",
//           title: "Paciente creado",
//           text: "El paciente fue agregado con éxito",
//           timer: 2000,
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

//   // Recalcular deuda y estado cuando se carga un paciente existente
//   useEffect(() => {
//     if (patientSelected && activities.length > 0) {
//       const debt = calcularDeuda(
//         patientSelected.actividad,
//         patientSelected.sessions
//       );
//       const estado = calcularEstado(debt, patientSelected.saldoFavor || 0);

//       if (debt !== patientSelected.debt || estado !== patientSelected.estado) {
//         setPatientSelected({
//           ...patientSelected,
//           debt: debt,
//           estado: estado, // Actualizar también el estado
//         });
//       }
//     }
//   }, [patientSelected, activities]);

//   return (
//     <form
//       onSubmit={handleSubmit}
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         gap: 10,
//       }}
//     >
//       <h1>{patientSelected ? "Editar Paciente" : "Nuevo Paciente"}</h1>

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
//         select
//         label="Actividad"
//         name="actividad"
//         value={patientSelected?.actividad || newPatient.actividad}
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
//         label="Cantidad de sesiones"
//         name="sessions"
//         type="number"
//         value={patientSelected?.sessions || newPatient.sessions}
//         onChange={handleChange}
//         inputProps={{ min: 1 }}
//       />

//       <p>
//         <strong>Deuda estimada:</strong> $
//         {(patientSelected?.debt || newPatient.debt).toLocaleString()}
//       </p>

//       {/* Mostrar el estado calculado para feedback visual */}
//       <p>
//         <strong>Estado:</strong>{" "}
//         {patientSelected?.estado ||
//           calcularEstado(newPatient.debt, newPatient.saldoFavor || 0)}
//       </p>

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-around",
//           marginTop: 20,
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
//       </div>
//     </form>
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

export const PatientForm = ({
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
  const [activityType, setActivityType] = useState("kinesio");
  const [replicateToYear, setReplicateToYear] = useState(true);

  const [newPatient, setNewPatient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    dni: "",
    actividad: "",
    sessions: 1,
    debt: 0,
    lastpay: "",
  });

  const calcularDeuda = (actividadLabel, sessions) => {
    const actividad = activities.find((a) => a.label === actividadLabel);
    if (!actividad || !sessions) return 0;
    return Math.round((actividad.valor * sessions) / 100) * 100;
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
    return activityTypes.find((at) => at.value === type)?.color || "#2e7d32";
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedActividad =
      name === "actividad"
        ? value
        : patientSelected?.actividad || newPatient.actividad;

    let updatedSessions =
      name === "sessions"
        ? parseInt(value) || 0
        : patientSelected?.sessions || newPatient.sessions;

    const updatedDebt = calcularDeuda(updatedActividad, updatedSessions);
    const currentSaldoFavor =
      patientSelected?.saldoFavor || newPatient.saldoFavor || 0;
    const updatedEstado = calcularEstado(updatedDebt, currentSaldoFavor);

    const updatedValues = {
      [name]: name === "sessions" ? parseInt(value) || 0 : value,
      debt: updatedDebt,
      estado: updatedEstado,
    };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const patientsRef = collection(db, "patients");

      if (patientSelected) {
        const dataToUpdate = {
          ...patientSelected,
          estado: calcularEstado(
            patientSelected.debt,
            patientSelected.saldoFavor || 0
          ),
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
        const estadoInicial = calcularEstado(
          newPatient.debt,
          newPatient.saldoFavor || 0
        );

        const patientData = {
          ...newPatient,
          estado: estadoInicial,
        };

        const docRef = await addDoc(patientsRef, patientData);

        // Crear horarios si está habilitado
        if (createSchedules) {
          await createPatientSchedules(docRef.id, patientData);
        }

        Swal.fire({
          icon: "success",
          title: "Paciente creado",
          text: createSchedules
            ? "El paciente y sus horarios fueron creados con éxito"
            : "El paciente fue agregado con éxito",
          timer: 2500,
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

  useEffect(() => {
    if (patientSelected && activities.length > 0) {
      const debt = calcularDeuda(
        patientSelected.actividad,
        patientSelected.sessions
      );
      const estado = calcularEstado(debt, patientSelected.saldoFavor || 0);

      if (debt !== patientSelected.debt || estado !== patientSelected.estado) {
        setPatientSelected({
          ...patientSelected,
          debt: debt,
          estado: estado,
        });
      }
    }
  }, [patientSelected, activities]);

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
        select
        label="Actividad"
        name="actividad"
        value={patientSelected?.actividad || newPatient.actividad}
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
        label="Cantidad de sesiones"
        name="sessions"
        type="number"
        value={patientSelected?.sessions || newPatient.sessions}
        onChange={handleChange}
        inputProps={{ min: 1 }}
      />

      <Typography>
        <strong>Deuda estimada:</strong> $
        {(patientSelected?.debt || newPatient.debt).toLocaleString()}
      </Typography>

      <Typography>
        <strong>Estado:</strong>{" "}
        {patientSelected?.estado ||
          calcularEstado(newPatient.debt, newPatient.saldoFavor || 0)}
      </Typography>

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
              {/* Selector de tipo de actividad */}
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

              {/* Días de la semana */}
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

              {/* Horarios por día */}
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

              {/* Resumen */}
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
