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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../../../firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { PatientForm } from "./PatientsForm";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 750,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};

const actividadOptions = [
  "1 vez por semana",
  "2 veces por semana",
  "3 veces por semana",
];

const PatientsList = ({ patients, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [patientSelected, setPatientSelected] = useState(null);
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleClose = () => setOpen(false);

  const handleOpen = (patient) => {
    setPatientSelected(patient);
    setOpen(true);
  };

  const deletePatient = (id) => {
    deleteDoc(doc(db, "patients", id));
    alert("Paciente eliminado");
    setIsChange(true);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesActividad = actividadFilter
      ? patient.actividad === actividadFilter
      : true;
    const matchesSearch = `${patient.name} ${patient.lastName} ${patient.dni}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesActividad && matchesSearch;
  });

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
          <p>Pacientes registrados</p>
        </div>
        <div>
          <TextField
            label="Buscar por nombre o DNI"
            variant="outlined"
            size="small"
            sx={{ marginRight: 2 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            displayEmpty
            size="small"
            value={actividadFilter}
            onChange={(e) => setActividadFilter(e.target.value)}
            sx={{ width: 200, marginRight: 2 }}
          >
            <MenuItem value="">Todas las actividades</MenuItem>
            {actividadOptions.map((actividad) => (
              <MenuItem key={actividad} value={actividad}>
                {actividad}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={() => handleOpen(null)}>
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
              <TableCell style={{ fontWeight: "bold" }}>2do Celular</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Dirección</TableCell>
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
                  }}
                >
                  {patient.name}
                </TableCell>
                <TableCell>{patient.lastName}</TableCell>
                <TableCell>{patient.dni}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.phoneHelp}</TableCell>
                <TableCell>{patient.address}</TableCell>

                <TableCell>
                  <IconButton onClick={() => handleOpen(patient)}>
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

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <PatientForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            patientSelected={patientSelected}
            setPatientSelected={setPatientSelected}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default PatientsList;
