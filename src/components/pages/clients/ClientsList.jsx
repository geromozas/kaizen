
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, IconButton, TextField, MenuItem, Select } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../../../firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { ClientForm } from "./ClientForm";

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

const ClientsList = ({ clients, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [clientSelected, setClientSelected] = useState(null);
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleClose = () => setOpen(false);

  const handleOpen = (client) => {
    setClientSelected(client);
    setOpen(true);
  };

  const deleteClient = (id) => {
    deleteDoc(doc(db, "clients", id));
    alert("Alumno borrado");
    setIsChange(true);
  };

  const filteredClients = clients.filter((client) => {
    const matchesActividad = actividadFilter
      ? client.actividad === actividadFilter
      : true;
    const matchesSearch = `${client.name} ${client.lastName} ${client.dni}`
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
          <h2>Lista de alumnos</h2>
          <p>Alumnos registrados</p>
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
            + Nuevo alumno
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla de alumnos">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Apellido</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>DNI</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Celular</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>2do Celular</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Dirección</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Actividad</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell
                  style={{
                    color:
                      client.estado === "Deudor"
                        ? "red"
                        : client.estado === "Inactivo"
                        ? "goldenrod"
                        : "green",
                    fontWeight: "bold",
                  }}
                >
                  {client.name}
                </TableCell>
                <TableCell>{client.lastName}</TableCell>
                <TableCell>{client.dni}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.phoneHelp}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>{client.actividad || "No asignada"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteClient(client.id)}>
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
          <ClientForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            clientSelected={clientSelected}
            setClientSelected={setClientSelected}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default ClientsList;
