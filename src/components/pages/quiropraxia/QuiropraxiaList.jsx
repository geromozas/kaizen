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
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

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
import { QuiropraxiaForm } from "./QuiropraxiaForm";
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

const QuiropraxiaList = ({ patients = [], setIsChange }) => {
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
      pacienteQuiro: {
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
      await addDoc(collection(db, "quiropraxiaPayments"), pagoFinal);
      const quiroRef = doc(db, "quiropraxia", patientSelected.id);
      await updateDoc(quiroRef, updateData);

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
        deleteDoc(doc(db, "quiropraxia", id)).then(() => {
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
        title="Resumen de Quiropraxia"
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
            {filteredPatients.length} pacientes de quiropraxia
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
            <MenuItem value="">Todos</MenuItem>
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
                Condición
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Servicio
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Sesiones
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
                  {patient.condition || "N/A"}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem" }}>
                  {patient.actividad || "N/A"}
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  {patient.sesiones || 0}
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
          <QuiropraxiaForm
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
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Dirección:</strong> {patientSelected.address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Servicio:</strong>{" "}
                        {patientSelected.actividad || "No asignado"}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Información médica */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalHospitalIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Información Médica
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Condición:</strong>{" "}
                        {patientSelected.condition || "No especificada"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Tratamiento:</strong>{" "}
                        {patientSelected.treatment || "No especificado"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Sesiones programadas:</strong>{" "}
                        {patientSelected.sesiones || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Completadas:</strong>{" "}
                        {patientSchedules.filter((s) => s.attended).length}
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
                      Sesiones ({patientSchedules.length})
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

                      {/* Próximas sesiones - máximo 5 */}
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        Próximas sesiones:
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
                              <strong>Completadas:</strong>{" "}
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
                          <Grid item xs={12}>
                            <Typography variant="caption">
                              <strong>Sesiones restantes:</strong>{" "}
                              {Math.max(
                                0,
                                (patientSelected.sesiones || 0) -
                                  patientSchedules.filter((s) => s.attended)
                                    .length
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin sesiones programadas
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

export default QuiropraxiaList;
