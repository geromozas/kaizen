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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { deleteDoc, doc, collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { useActivities } from "../activities/useActivities";
import { db } from "../../../firebaseConfig";
import { QuiropraxiaForm } from "./QuiropraxiaForm";
import { ActivityPricesManager } from "../activities/ActivityPricesManager";
import Swal from "sweetalert2";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};

const daysOfWeek = [
  { key: "sunday", label: "Domingo", value: 0 },
  { key: "monday", label: "Lunes", value: 1 },
  { key: "tuesday", label: "Martes", value: 2 },
  { key: "wednesday", label: "Miércoles", value: 3 },
  { key: "thursday", label: "Jueves", value: 4 },
  { key: "friday", label: "Viernes", value: 5 },
  { key: "saturday", label: "Sábado", value: 6 },
];

const QuiropraxiaList = ({ patients = [], setIsChange }) => {
  const [openForm, setOpenForm] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPricesManager, setOpenPricesManager] = useState(false);
  const [patientSelected, setPatientSelected] = useState(null);
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [patientSchedules, setPatientSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const { activities = [], reloadActivities } = useActivities();

  const handleCloseForm = () => setOpenForm(false);
  const handleCloseProfile = () => {
    setOpenProfile(false);
    setPatientSchedules([]);
  };
  const handleClosePricesManager = () => setOpenPricesManager(false);

  const handleOpenForm = (patient) => {
    setPatientSelected(patient);
    setOpenForm(true);
  };

  const handleOpenProfile = async (patient) => {
    setPatientSelected(patient);
    setLoadingSchedules(true);

    try {
      // Obtener los horarios donde aparece este paciente
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

      // Ordenar por fecha y hora
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
    setIsChange(true); // Para refrescar la lista de pacientes también
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
        deleteDoc(doc(db, "quiropraxia", id)).then(() => {
          setIsChange(true);
          Swal.fire("Eliminado", "El paciente ha sido borrado.", "success");
        });
      }
    });
  };

  // Función para obtener el nombre del día de la semana
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const dayValue = date.getDay();
    return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Agrupar horarios por día de la semana para mostrar resumen
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

  // Verificación de seguridad para evitar el error de filter
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
    <div style={{ marginTop: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <div style={{ marginLeft: 10 }}>
          <h2>Lista de pacientes</h2>
          <p>Pacientes de quiropraxia registrados</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TextField
            label="Buscar por nombre o DNI"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            displayEmpty
            size="small"
            value={actividadFilter}
            onChange={(e) => setActividadFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Todos los servicios</MenuItem>
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
          >
            Gestionar Precios
          </Button>
          <Button variant="contained" onClick={() => handleOpenForm(null)}>
            + Nuevo paciente
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla de pacientes">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Apellido</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>DNI</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Celular</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Condición</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Servicio</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Sesiones</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Deuda</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell
                  style={{
                    color:
                      patient.estado === "Deudor"
                        ? "red"
                        : patient.estado === "Inactivo"
                        ? "goldenrod"
                        : "green",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOpenProfile(patient)}
                >
                  {patient.name}
                </TableCell>
                <TableCell
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOpenProfile(patient)}
                >
                  {patient.lastName}
                </TableCell>
                <TableCell>{patient.dni}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.condition || "No especificada"}</TableCell>
                <TableCell>{patient.actividad || "No asignado"}</TableCell>
                <TableCell style={{ textAlign: "center", fontWeight: "bold" }}>
                  {patient.sesiones || 0}
                </TableCell>

                <TableCell
                  style={{
                    color:
                      (patient.estado === "Inactivo" ? 0 : patient.debt || 0) >
                      0
                        ? "red"
                        : "green",
                    fontWeight: "bold",
                  }}
                >
                  $
                  {patient.estado === "Inactivo"
                    ? 0
                    : (patient.debt || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenForm(patient)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deletePatient(patient.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de edición */}
      <Modal open={openForm} onClose={handleCloseForm}>
        <Box
          sx={{
            ...style,
            width: 800,
            maxHeight: "90vh",
            overflow: "auto",
            height: "auto",
          }}
        >
          <QuiropraxiaForm
            handleClose={handleCloseForm}
            setIsChange={setIsChange}
            patientSelected={patientSelected}
            setPatientSelected={setPatientSelected}
          />
        </Box>
      </Modal>

      {/* Modal de perfil */}
      <Modal open={openProfile} onClose={handleCloseProfile}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {patientSelected && (
            <>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}
              >
                Perfil de {patientSelected.name} {patientSelected.lastName}
              </Typography>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}
              >
                <Typography>
                  <strong>DNI:</strong> {patientSelected.dni}
                </Typography>
                <Typography>
                  <strong>Celular:</strong> {patientSelected.phone}
                </Typography>
                <Typography>
                  <strong>Dirección:</strong> {patientSelected.address}
                </Typography>
                <Typography>
                  <strong>Condición Médica:</strong>{" "}
                  {patientSelected.condition || "No especificada"}
                </Typography>
                <Typography>
                  <strong>Tratamiento:</strong>{" "}
                  {patientSelected.treatment || "No especificado"}
                </Typography>
                <Typography>
                  <strong>Servicio:</strong>{" "}
                  {patientSelected.actividad || "No asignado"}
                </Typography>
                <Typography>
                  <strong>Sesiones programadas:</strong>{" "}
                  {patientSelected.sesiones || 0}
                </Typography>
                <Typography>
                  <strong>Estado:</strong> {patientSelected.estado}
                </Typography>
                <Typography
                  color={patientSelected.debt > 0 ? "error" : "success.main"}
                >
                  <strong>Deuda:</strong> $
                  {(patientSelected.debt || 0).toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Último pago:</strong>{" "}
                  {patientSelected.ultimoPago || "Sin pagos"}
                </Typography>
              </Box>

              {/* Sección de Horarios */}
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <AccessTimeIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Horarios Programados
                  </Typography>
                </Box>

                {loadingSchedules ? (
                  <Typography>Cargando horarios...</Typography>
                ) : patientSchedules.length > 0 ? (
                  <>
                    {/* Resumen por día de la semana */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, color: "text.secondary" }}
                      >
                        Horarios habituales:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {getScheduleSummary(patientSchedules).map(
                          (summary, index) => (
                            <Chip
                              key={index}
                              label={`${summary.day}: ${summary.hours.join(
                                ", "
                              )}`}
                              variant="outlined"
                              size="small"
                              color="primary"
                            />
                          )
                        )}
                      </Box>
                    </Box>

                    {/* Lista detallada de horarios próximos */}
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      Próximas sesiones programadas:
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                      {patientSchedules
                        .filter(
                          (schedule) =>
                            new Date(schedule.date) >=
                            new Date().setHours(0, 0, 0, 0)
                        )
                        .slice(0, 10)
                        .map((schedule, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 1,
                              mb: 1,
                              bgcolor: schedule.attended
                                ? "success.light"
                                : "grey.100",
                              borderRadius: 1,
                              border: schedule.attended
                                ? "1px solid green"
                                : "1px solid #e0e0e0",
                            }}
                          >
                            <Box>
                              <Typography variant="body2">
                                <strong>{getDayName(schedule.date)}</strong>{" "}
                                {formatDate(schedule.date)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Hora: {schedule.hour}
                              </Typography>
                            </Box>
                            <Chip
                              label={
                                schedule.attended ? "Completada" : "Programada"
                              }
                              color={schedule.attended ? "success" : "default"}
                              size="small"
                            />
                          </Box>
                        ))}
                    </Box>

                    {/* Estadísticas de sesiones */}
                    <Box
                      sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Estadísticas de Sesiones:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Typography variant="body2">
                          <strong>Total sesiones:</strong>{" "}
                          {patientSchedules.length}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Completadas:</strong>{" "}
                          {patientSchedules.filter((s) => s.attended).length}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Asistencia:</strong>{" "}
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
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Sesiones restantes:</strong>{" "}
                          {Math.max(
                            0,
                            (patientSelected.sesiones || 0) -
                              patientSchedules.filter((s) => s.attended).length
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Typography color="text.secondary">
                    No tiene sesiones programadas
                  </Typography>
                )}
              </Box>
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

export default QuiropraxiaList;
