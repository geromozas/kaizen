import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../../../firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { ClientForm } from "./ClientForm";
// import ProductForm from "./ProductForm";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 850,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};

const ClientsList = ({ clients, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [clientSelected, setClientSelected] = useState(null);

  const handleClose = () => {
    setOpen(false);
  };

  const deleteClient = (id) => {
    deleteDoc(doc(db, "clients", id));
    console.log("el alumno con el id " + id + " se ha borrado");
    alert("Alumno borrado");

    setIsChange(true);
  };

  const handleOpen = (client) => {
    setClientSelected(client);
    setOpen(true);
  };

  return (
    <div style={{ marginTop: 30 }}>
      <Button
        variant="contained"
        style={{ marginBottom: 20 }}
        onClick={() => handleOpen(null)}
      >
        + Nuevo alumno
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                ID
              </TableCell>
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
                ACCIONES
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row" align="left">
                  {client.id}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {client.name}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {client.lastName}
                </TableCell>
                <TableCell
                  component="th"
                  scope="row"
                  width="600px"
                  align="left"
                >
                  {client.phone}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  ${client.phoneHelp}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {client.address}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
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
