// components/clients/ScheduleAssignmentModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  Radio,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { collection, doc, writeBatch, addDoc } from "firebase/firestore";
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

export const ScheduleAssignmentModal = ({
  open,
  onClose,
  client,
  onSuccess,
}) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [daySchedules, setDaySchedules] = useState({});
  const [replicateToYear, setReplicateToYear] = useState(true);
  const [activityType, setActivityType] = useState("gimnasio");

  const generateYearlyDates = (selectedDaysValues, baseDate = new Date()) => {
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

  const handleSave = async () => {
    if (!client) return;

    if (selectedDays.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Por favor selecciona al menos un día de la semana",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const hasAllSchedules = selectedDays.every(
      (dayValue) => daySchedules[dayValue] && daySchedules[dayValue].length > 0
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

    const clientsData = [
      {
        id: client.id,
        attended: false,
        activityType: activityType,
      },
    ];

    try {
      if (replicateToYear) {
        const batchId = `batch_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const dates = generateYearlyDates(selectedDays);
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

      Swal.fire({
        icon: "success",
        title: "¡Horarios asignados!",
        html: `
          <p>Los horarios se han asignado exitosamente a:</p>
          <p><strong>${client.name} ${client.lastName}</strong></p>
        `,
        timer: 2500,
        showConfirmButton: false,
      });

      // Limpiar y cerrar
      setSelectedDays([]);
      setDaySchedules({});
      setReplicateToYear(true);
      setActivityType("gimnasio");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al asignar horarios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al asignar los horarios",
        confirmButtonColor: "#d33",
      });
    }
  };

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

  const getTotalSchedules = () => {
    return selectedDays.reduce((total, dayValue) => {
      const hoursForDay = daySchedules[dayValue] || [];
      return total + hoursForDay.length;
    }, 0);
  };

  const getActivityTypeColor = (type) => {
    return activityTypes.find((at) => at.value === type)?.color || "#1976d2";
  };

  if (!client) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Asignar Horarios a {client.name} {client.lastName}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Configura los días y horarios que deseas asignar a este alumno
        </Alert>

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
              >
                {activityTypes.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={<Radio sx={{ color: type.color }} />}
                    label={type.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>
        </Box>

        {/* Días de la semana */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Días de la Semana
        </Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
          </Box>
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
                            backgroundColor: getActivityTypeColor(activityType),
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
                            checked={(daySchedules[dayValue] || []).includes(
                              hour
                            )}
                            onChange={(e) => {
                              const currentHours = daySchedules[dayValue] || [];
                              const updatedHours = e.target.checked
                                ? [...currentHours, hour]
                                : currentHours.filter((h) => h !== hour);
                              handleDayScheduleChange(dayValue, updatedHours);
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
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          style={{
            backgroundColor: getActivityTypeColor(activityType),
            color: "white",
          }}
          disabled={selectedDays.length === 0 || getTotalSchedules() === 0}
        >
          Asignar Horarios
        </Button>
      </DialogActions>
    </Dialog>
  );
};
