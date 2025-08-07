import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import "./AccountStatus.css";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";

const AccountStatus = () => {
  const [allPersons, setAllPersons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");

  const fetchData = async () => {
    const clientSnap = await getDocs(collection(db, "clients"));
    const clientsData = clientSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipo: "Cliente",
      collection: "clients",
    }));

    const patientSnap = await getDocs(collection(db, "patients"));
    const patientsData = patientSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipo: "Paciente",
      collection: "patients",
    }));

    const combined = [...clientsData, ...patientsData];
    setAllPersons(combined);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleInactivo = async (person) => {
    const nuevoEstado =
      person.estado === "Inactivo"
        ? person.debt > 0
          ? "Deudor"
          : "Al día"
        : "Inactivo";

    await updateDoc(doc(db, person.collection, person.id), {
      estado: nuevoEstado,
    });
    fetchData();
  };

  const filteredPersons = allPersons.filter((person) => {
    const nombreCompleto = `${person.name} ${person.lastName}`.toLowerCase();
    const dni = person.dni?.toString() || "";

    const matchesSearch =
      nombreCompleto.includes(searchTerm.toLowerCase()) ||
      dni.includes(searchTerm);

    const matchesTipo =
      filterTipo === "Todos" ||
      (filterTipo === "Gimnasio" && person.tipo === "Cliente") ||
      (filterTipo === "Kinesio" && person.tipo === "Paciente");

    return matchesSearch && matchesTipo;
  });

  return (
    <div className="accountStatus">
      <h2>Estado de Cuenta</h2>
      <p>
        Visualiza quién está al día, quién debe o está inactivo (Clientes y
        Pacientes)
      </p>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          marginTop: "20px",
        }}
      >
        <TextField
          size="small"
          label="Buscar por nombre o DNI"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl size="small">
          <InputLabel id="tipo-select-label">Tipo</InputLabel>
          <Select
            labelId="tipo-select-label"
            value={filterTipo}
            label="Tipo"
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Gimnasio">Gimnasio</MenuItem>
            <MenuItem value="Kinesio">Kinesio</MenuItem>
          </Select>
        </FormControl>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Tipo</strong>
              </TableCell>
              <TableCell>
                <strong>Nombre</strong>
              </TableCell>
              <TableCell>
                <strong>Estado</strong>
              </TableCell>
              <TableCell>
                <strong>Último Pago</strong>
              </TableCell>
              <TableCell>
                <strong>Deuda</strong>
              </TableCell>
              <TableCell>
                <strong>Acciones</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPersons.map((person) => (
              <TableRow key={`${person.collection}-${person.id}`}>
                <TableCell>
                  <span
                    className={`tipo ${
                      person.tipo === "Cliente" ? "Gimnasio" : "Kinesio"
                    }`}
                  >
                    {person.tipo === "Cliente" ? "🏋️ Gimnasio" : "🏥 Kinesio"}
                  </span>
                </TableCell>
                <TableCell>
                  {person.name} {person.lastName}
                </TableCell>
                <TableCell>
                  <span
                    className={`status ${
                      person.estado === "Al día"
                        ? "ok"
                        : person.estado === "Inactivo"
                        ? "inactive"
                        : "debt"
                    }`}
                  >
                    {person.estado}
                  </span>
                </TableCell>
                <TableCell>{person.ultimoPago || "Sin pagos"}</TableCell>
                <TableCell>
                  $
                  {person.estado === "Inactivo"
                    ? 0
                    : (person.debt || 0).toLocaleString("es-AR")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => toggleInactivo(person)}
                  >
                    {person.estado === "Inactivo"
                      ? "Activar"
                      : "Marcar Inactivo"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AccountStatus;
