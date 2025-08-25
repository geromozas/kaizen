import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  OutlinedInput,
  FormGroup,
  FormControlLabel,
  TextField,
  Typography,
  Box,
  Chip,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  Radio,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
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

const NewScheduleModal = ({
  open,
  onClose,
  selectedDate,
  refresh,
  editData,
  kinesioClients = [],
  gimnasioClients = [],
  quiropraxiaClients = [],
}) => {
  const [clients, setClients] = useState([]);
  const [selectedHours, setSelectedHours] = useState([]); // Para modo edición
  const [selectedDays, setSelectedDays] = useState([]);
  const [daySchedules, setDaySchedules] = useState({}); // Nuevo: horarios por día
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [replicateToYear, setReplicateToYear] = useState(true);
  const [activityType, setActivityType] = useState("gimnasio"); // Nueva estado para tipo de actividad

  // Cargar clientes según el tipo de actividad seleccionado
  useEffect(() => {
    switch (activityType) {
      case "kinesio":
        setClients(kinesioClients);
        break;
      case "quiropraxia":
        setClients(quiropraxiaClients);
        break;
      case "gimnasio":
      default:
        setClients(gimnasioClients);
        break;
    }
    // Limpiar clientes seleccionados cuando cambia el tipo de actividad (solo en modo creación)
    if (!editData) {
      setSelectedClients([]);
    }
  }, [
    activityType,
    kinesioClients,
    gimnasioClients,
    quiropraxiaClients,
    editData,
  ]);

  useEffect(() => {
    if (editData) {
      // Modo edición - comportamiento original
      setSelectedHours([editData.hour]);
      setSelectedDays([selectedDate.getDay()]);
      // Extraer solo los IDs de los clientes para el modo edición
      const clientIds = editData.clients.map((c) =>
        typeof c === "string" ? c : c.id
      );
      setSelectedClients(clientIds);
      setReplicateToYear(false);
      setDaySchedules({});
      // Establecer el tipo de actividad del horario existente
      setActivityType(editData.activityType || "gimnasio");
    } else {
      // Modo creación - valores por defecto
      setSelectedHours([]);
      setSelectedDays([]);
      setSelectedClients([]);
      setReplicateToYear(true);
      setDaySchedules({});
      setActivityType("gimnasio");
    }
  }, [editData, selectedDate]);

  const generateYearlyDates = (selectedDaysValues, baseDate) => {
    const year = baseDate.getFullYear();
    const dates = [];

    // Obtener primer y último día del año
    const firstDay = new Date(year, 0, 1); // 1 de enero
    const lastDay = new Date(year, 11, 31); // 31 de diciembre

    // Iterar por todos los días del año
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
  const handleSave = async () => {
    if (selectedClients.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Por favor selecciona al menos un cliente",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (editData) {
      // Validación para modo edición
      if (selectedHours.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Atención",
          text: "Por favor selecciona al menos un horario",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    } else {
      // Validación para modo creación
      if (selectedDays.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Atención",
          text: "Por favor selecciona al menos un día de la semana",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Verificar que cada día seleccionado tenga al menos un horario
      const hasAllSchedules = selectedDays.every(
        (dayValue) =>
          daySchedules[dayValue] && daySchedules[dayValue].length > 0
      );

      if (!hasAllSchedules) {
        Swal.fire({
          icon: "warning",
          title: "Atención",
          text: "Por favor selecciona al menos un horario para cada día elegido",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    }

    // Preparar datos de clientes con información del tipo de actividad
    const clientsData = selectedClients.map((id) => ({
      id,
      attended: false,
      activityType: activityType, // Añadir tipo de actividad a cada cliente
    }));

    try {
      if (editData) {
        // Modo edición - actualizar solo el horario específico
        // Preservar la información de asistencia existente
        const existingClients = editData.clients || [];
        const updatedClientsData = selectedClients.map((id) => {
          // Buscar si el cliente ya existía en el horario
          const existingClient = existingClients.find((c) => {
            const existingId = typeof c === "string" ? c : c.id;
            return existingId === id;
          });

          // Si ya existía, preservar su estado de asistencia
          if (existingClient && typeof existingClient === "object") {
            return {
              id,
              attended: existingClient.attended,
              activityType: activityType,
            };
          }

          // Si es nuevo, marcar como no asistido
          return {
            id,
            attended: false,
            activityType: activityType,
          };
        });

        const data = {
          date: selectedDate.toISOString().split("T")[0],
          hour: selectedHours[0],
          clients: updatedClientsData,
          activityType: activityType, // Guardar tipo de actividad en el horario
          // Mantener el batchId existente si existe
          ...(editData.batchId && { batchId: editData.batchId }),
        };
        await setDoc(doc(db, "schedules", editData.id), data);

        // Alerta de éxito para edición
        Swal.fire({
          icon: "success",
          title: "¡Horario actualizado!",
          text: "El horario se ha actualizado correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Modo creación - crear múltiples horarios
        if (replicateToYear) {
          // Generar un ID único para este lote de horarios
          const batchId = `batch_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          // Generar fechas del año basadas en días seleccionados
          const dates = generateYearlyDates(selectedDays, selectedDate);

          // Usar batch para crear múltiples documentos
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
                activityType: activityType, // Guardar tipo de actividad
                batchId: batchId,
                createdAt: new Date().toISOString(),
              };
              batch.set(scheduleRef, data);
            });
          });

          await batch.commit();
        } else {
          // Crear solo para la fecha seleccionada
          const dayOfWeek = selectedDate.getDay();
          const hoursForDay = daySchedules[dayOfWeek] || [];

          for (const hour of hoursForDay) {
            const data = {
              date: selectedDate.toISOString().split("T")[0],
              hour: hour,
              clients: clientsData,
              activityType: activityType, // Guardar tipo de actividad
              createdAt: new Date().toISOString(),
            };
            await addDoc(collection(db, "schedules"), data);
          }
        }

        // Alerta de éxito para creación
        Swal.fire({
          icon: "success",
          title: "¡Horarios creados!",
          text: "Los horarios se han creado exitosamente",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      // Limpiar formulario y cerrar modal
      onClose();
      setSelectedHours([]);
      setSelectedDays([]);
      setSelectedClients([]);
      setDaySchedules({});
      setSearchTerm("");
      setReplicateToYear(true);
      setActivityType("gimnasio");
      refresh();
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al guardar los horarios",
        confirmButtonColor: "#d33",
      });
    }
  };
  // const handleSave = async () => {
  //   if (selectedClients.length === 0) {
  //     alert("Por favor selecciona al menos un cliente");
  //     return;
  //   }

  //   if (editData) {
  //     // Validación para modo edición
  //     if (selectedHours.length === 0) {
  //       alert("Por favor selecciona al menos un horario");
  //       return;
  //     }
  //   } else {
  //     // Validación para modo creación
  //     if (selectedDays.length === 0) {
  //       alert("Por favor selecciona al menos un día de la semana");
  //       return;
  //     }

  //     // Verificar que cada día seleccionado tenga al menos un horario
  //     const hasAllSchedules = selectedDays.every(
  //       (dayValue) =>
  //         daySchedules[dayValue] && daySchedules[dayValue].length > 0
  //     );

  //     if (!hasAllSchedules) {
  //       alert("Por favor selecciona al menos un horario para cada día elegido");
  //       return;
  //     }
  //   }

  //   // Preparar datos de clientes con información del tipo de actividad
  //   const clientsData = selectedClients.map((id) => ({
  //     id,
  //     attended: false,
  //     activityType: activityType, // Añadir tipo de actividad a cada cliente
  //   }));

  //   try {
  //     if (editData) {
  //       // Modo edición - actualizar solo el horario específico
  //       // Preservar la información de asistencia existente
  //       const existingClients = editData.clients || [];
  //       const updatedClientsData = selectedClients.map((id) => {
  //         // Buscar si el cliente ya existía en el horario
  //         const existingClient = existingClients.find((c) => {
  //           const existingId = typeof c === "string" ? c : c.id;
  //           return existingId === id;
  //         });

  //         // Si ya existía, preservar su estado de asistencia
  //         if (existingClient && typeof existingClient === "object") {
  //           return {
  //             id,
  //             attended: existingClient.attended,
  //             activityType: activityType,
  //           };
  //         }

  //         // Si es nuevo, marcar como no asistido
  //         return {
  //           id,
  //           attended: false,
  //           activityType: activityType,
  //         };
  //       });

  //       const data = {
  //         date: selectedDate.toISOString().split("T")[0],
  //         hour: selectedHours[0],
  //         clients: updatedClientsData,
  //         activityType: activityType, // Guardar tipo de actividad en el horario
  //         // Mantener el batchId existente si existe
  //         ...(editData.batchId && { batchId: editData.batchId }),
  //       };
  //       await setDoc(doc(db, "schedules", editData.id), data);
  //     } else {
  //       // Modo creación - crear múltiples horarios
  //       if (replicateToYear) {
  //         // Generar un ID único para este lote de horarios
  //         const batchId = `batch_${Date.now()}_${Math.random()
  //           .toString(36)
  //           .substr(2, 9)}`;

  //         // Generar fechas del año basadas en días seleccionados
  //         const dates = generateYearlyDates(selectedDays, selectedDate);

  //         // Usar batch para crear múltiples documentos
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
  //               activityType: activityType, // Guardar tipo de actividad
  //               batchId: batchId,
  //               createdAt: new Date().toISOString(),
  //             };
  //             batch.set(scheduleRef, data);
  //           });
  //         });

  //         await batch.commit();
  //       } else {
  //         // Crear solo para la fecha seleccionada
  //         const dayOfWeek = selectedDate.getDay();
  //         const hoursForDay = daySchedules[dayOfWeek] || [];

  //         for (const hour of hoursForDay) {
  //           const data = {
  //             date: selectedDate.toISOString().split("T")[0],
  //             hour: hour,
  //             clients: clientsData,
  //             activityType: activityType, // Guardar tipo de actividad
  //             createdAt: new Date().toISOString(),
  //           };
  //           await addDoc(collection(db, "schedules"), data);
  //         }
  //       }
  //     }

  //     // Limpiar formulario y cerrar modal
  //     onClose();
  //     setSelectedHours([]);
  //     setSelectedDays([]);
  //     setSelectedClients([]);
  //     setDaySchedules({});
  //     setSearchTerm("");
  //     setReplicateToYear(true);
  //     setActivityType("gimnasio");
  //     refresh();
  //   } catch (error) {
  //     console.error("Error al guardar:", error);
  //     alert("Error al guardar los horarios");
  //   }
  // };

  const handleHourChange = (event) => {
    const value = event.target.value;
    setSelectedHours(typeof value === "string" ? value.split(",") : value);
  };

  const handleDayChange = (dayValue) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        // Si se deselecciona un día, también limpiar sus horarios
        const newDaySchedules = { ...daySchedules };
        delete newDaySchedules[dayValue];
        setDaySchedules(newDaySchedules);
        return prev.filter((day) => day !== dayValue);
      } else {
        return [...prev, dayValue];
      }
    });
  };

  // Nueva función para manejar horarios por día
  const handleDayScheduleChange = (dayValue, hours) => {
    setDaySchedules((prev) => ({
      ...prev,
      [dayValue]: hours,
    }));
  };

  // Filtrado de clientes por nombre o apellido
  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.lastName} ${client.dni}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getDayName = (dayValue) => {
    return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
  };

  // Calcular total de horarios que se crearán
  const getTotalSchedules = () => {
    return selectedDays.reduce((total, dayValue) => {
      const hoursForDay = daySchedules[dayValue] || [];
      return total + hoursForDay.length;
    }, 0);
  };

  // Función para obtener el color del tipo de actividad
  const getActivityTypeColor = (type) => {
    return activityTypes.find((at) => at.value === type)?.color || "#1976d2";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editData ? "Editar Horario" : "Crear Nuevos Horarios"}
      </DialogTitle>
      <DialogContent>
        {/* Selector de tipo de actividad */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tipo de Actividad
          </Typography>
          <Paper sx={{ p: 2 }}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                disabled={editData} // Deshabilitar en modo edición
              >
                {activityTypes.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={<Radio sx={{ color: type.color }} />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{type.label}</span>
                        <Chip
                          size="small"
                          label={
                            type.value === "gimnasio"
                              ? gimnasioClients.length
                              : type.value === "kinesio"
                              ? kinesioClients.length
                              : quiropraxiaClients.length
                          }
                          sx={{
                            backgroundColor: type.color,
                            color: "white",
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
            {editData && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1, display: "block" }}
              >
                El tipo de actividad no se puede cambiar en modo edición
              </Typography>
            )}
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        {!editData && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
                              label={`${daySchedules[dayValue].length} horario${
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
                      <FormControl fullWidth>
                        <InputLabel>Seleccionar horarios</InputLabel>
                        <Select
                          multiple
                          value={daySchedules[dayValue] || []}
                          onChange={(event) => {
                            const value = event.target.value;
                            const hours =
                              typeof value === "string"
                                ? value.split(",")
                                : value;
                            handleDayScheduleChange(dayValue, hours);
                          }}
                          input={<OutlinedInput label="Seleccionar horarios" />}
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      getActivityTypeColor(activityType),
                                    color: "white",
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {availableHours.map((hour) => (
                            <MenuItem key={hour} value={hour}>
                              <Checkbox
                                checked={
                                  (daySchedules[dayValue] || []).indexOf(hour) >
                                  -1
                                }
                              />
                              {hour}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
              label="Replicar a todo el año"
            />
            <Typography variant="caption" display="block" gutterBottom>
              Si está marcado, se crearán horarios para todos los días
              seleccionados de todo el año ({selectedDate.getFullYear()})
            </Typography>

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Horarios para modo edición */}
        {editData && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Seleccionar hora</InputLabel>
            <Select
              value={selectedHours}
              onChange={handleHourChange}
              input={<OutlinedInput label="Seleccionar hora" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{
                        backgroundColor: getActivityTypeColor(activityType),
                        color: "white",
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {availableHours.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {hour}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          fullWidth
          margin="dense"
          label={`Buscar cliente de ${
            activityTypes.find((at) => at.value === activityType)?.label
          }`}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Seleccionar Clientes -{" "}
          {activityTypes.find((at) => at.value === activityType)?.label}
          <Chip
            size="small"
            label={`${clients.length} disponibles`}
            sx={{
              ml: 1,
              backgroundColor: getActivityTypeColor(activityType),
              color: "white",
            }}
          />
        </Typography>

        <Paper sx={{ maxHeight: 300, overflow: "auto", p: 1 }}>
          <FormGroup>
            {filteredClients.length === 0 ? (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ p: 2, textAlign: "center" }}
              >
                {clients.length === 0
                  ? `No hay clientes registrados para ${
                      activityTypes.find((at) => at.value === activityType)
                        ?.label
                    }`
                  : "No se encontraron clientes con ese criterio de búsqueda"}
              </Typography>
            ) : (
              filteredClients.map((client) => (
                <FormControlLabel
                  key={client.id}
                  control={
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClients([...selectedClients, client.id]);
                        } else {
                          setSelectedClients(
                            selectedClients.filter((id) => id !== client.id)
                          );
                        }
                      }}
                    />
                  }
                  label={`${client.name} ${client.lastName} - DNI: ${client.dni}`}
                />
              ))
            )}
          </FormGroup>
        </Paper>

        {!editData && selectedDays.length > 0 && getTotalSchedules() > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Resumen:</strong> Se crearán {getTotalSchedules()}{" "}
              horarios para{" "}
              {activityTypes.find((at) => at.value === activityType)?.label}
              {replicateToYear && " para todo el año"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Días: {selectedDays.map((d) => getDayName(d)).join(", ")}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Distribución por día:</strong>
              </Typography>
              {selectedDays.map((dayValue) => {
                const hours = daySchedules[dayValue] || [];
                return (
                  <Typography key={dayValue} variant="caption" display="block">
                    • {getDayName(dayValue)}:{" "}
                    {hours.join(", ") || "Sin horarios"}
                  </Typography>
                );
              })}
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              <strong>Clientes seleccionados:</strong> {selectedClients.length}
            </Typography>
          </Box>
        )}

        {editData && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Modo Edición:</strong> Editando horario de{" "}
              {activityTypes.find((at) => at.value === activityType)?.label}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Clientes seleccionados:</strong> {selectedClients.length}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 1, display: "block" }}
            >
              Los clientes que ya tenían asistencia registrada mantendrán su
              estado
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} style={{ color: "green" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          style={{
            backgroundColor: getActivityTypeColor(activityType),
            color: "white",
          }}
          disabled={
            selectedClients.length === 0 ||
            (editData && selectedHours.length === 0) ||
            (!editData &&
              (selectedDays.length === 0 || getTotalSchedules() === 0))
          }
        >
          {editData ? "Actualizar" : "Crear Horarios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewScheduleModal;
