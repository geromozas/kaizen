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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

import { deleteDoc, doc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { useActivities } from "../activities/useActivities";
import { db } from "../../../firebaseConfig";
import { QuiropraxiaForm } from "./QuiropraxiaForm";
import { ActivityPricesManager } from "../activities/ActivityPricesManager";

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

const QuiropraxiaList = ({ patients = [], setIsChange }) => {
  const [openForm, setOpenForm] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPricesManager, setOpenPricesManager] = useState(false);
  const [patientSelected, setPatientSelected] = useState(null);
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { activities = [], reloadActivities } = useActivities();

  const handleCloseForm = () => setOpenForm(false);
  const handleCloseProfile = () => setOpenProfile(false);
  const handleClosePricesManager = () => setOpenPricesManager(false);

  const handleOpenForm = (patient) => {
    setPatientSelected(patient);
    setOpenForm(true);
  };

  const handleOpenProfile = (patient) => {
    setPatientSelected(patient);
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
    if (confirm("¿Estás seguro de que quieres eliminar este paciente?")) {
      deleteDoc(doc(db, "quiropraxia", id));
      alert("Paciente borrado");
      setIsChange(true);
    }
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
            width: 450,
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
