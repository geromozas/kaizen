import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, IconButton, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../../../firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { PatientForm } from "./PatientsForm";

// import ProductForm from "./ProductForm";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};

export const PatientsList = ({ patients, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [patientSelected, setPatientSelected] = useState(null);

  const handleClose = () => {
    setOpen(false);
  };

  const deletePatient = (id) => {
    deleteDoc(doc(db, "patients", id));
    console.log("el paciente con el id " + id + " se ha borrado");
    alert("Paciente borrado");

    setIsChange(true);
  };

  const handleOpen = (patient) => {
    setPatientSelected(patient);
    setOpen(true);
  };

  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ marginLeft: 10, marginBottom: 15 }}>
          <h2>Lista de pacientes</h2>
          <p>Pacientes registrados</p>
        </div>
        <div>
          <Button
            variant="contained"
            style={{ marginBottom: 20, marginRight: 10 }}
            onClick={() => handleOpen(null)}
          >
            + Nuevo paciente
          </Button>
          <TextField
            id="outlined-basic"
            label="Buscar"
            variant="outlined"
            sx={{ marginRight: 5 }}
          />
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {/* <TableCell align="left" style={{ fontWeight: "bold" }}>
                ID
              </TableCell> */}
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                Nombre
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                Apellido
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                Celular
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                2do Celular
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                Dirección
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                Obra Social
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                ACCIONES
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow
                key={patient.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {/* <TableCell component="th" scope="row" align="left">
                  {patient.id}
                </TableCell> */}
                <TableCell component="th" scope="row" align="left">
                  {patient.name}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {patient.lastName}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {patient.phone}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {patient.phoneHelp}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {patient.address}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {patient.socialWork}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
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
