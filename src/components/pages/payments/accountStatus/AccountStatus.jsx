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
    // Cargar clientes (gimnasio)
    const clientSnap = await getDocs(collection(db, "clients"));
    const clientsData = clientSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipo: "Cliente",
      collection: "clients",
    }));

    // Cargar pacientes (kinesio)
    const patientSnap = await getDocs(collection(db, "patients"));
    const patientsData = patientSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipo: "Paciente",
      collection: "patients",
    }));

    // Cargar pacientes de quiropraxia
    const quiropraxiaSnap = await getDocs(collection(db, "quiropraxia"));
    const quiropraxiaData = quiropraxiaSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipo: "Quiropraxia",
      collection: "quiropraxia",
    }));

    const combined = [...clientsData, ...patientsData, ...quiropraxiaData];
    setAllPersons(combined);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleInactivo = async (person) => {
    let nuevoEstado;
    let nuevaDeuda = person.debt || 0;
    let nuevoSaldoFavor = person.saldoFavor || 0;

    if (person.estado === "Inactivo") {
      // Reactivar: vuelve al estado anterior según deuda/saldo
      if (nuevoSaldoFavor > 0) {
        nuevoEstado = "Saldo a favor";
      } else if (nuevaDeuda > 0) {
        nuevoEstado = "Deudor";
      } else {
        nuevoEstado = "Al día";
      }
    } else {
      // Poner inactivo: deuda en 0, saldo a favor en 0
      nuevoEstado = "Inactivo";
      nuevaDeuda = 0;
      nuevoSaldoFavor = 0;
    }

    await updateDoc(doc(db, person.collection, person.id), {
      estado: nuevoEstado,
      debt: nuevaDeuda,
      saldoFavor: nuevoSaldoFavor,
    });

    fetchData();
  };

  const eliminarDeuda = async (person) => {
    await updateDoc(doc(db, person.collection, person.id), {
      estado: "Al día",
      debt: 0,
    });

    fetchData();
  };

  const eliminarSaldoFavor = async (person) => {
    await updateDoc(doc(db, person.collection, person.id), {
      estado: "Al día",
      saldoFavor: 0,
    });

    fetchData();
  };

  const getEstadoDisplay = (person) => {
    if (person.saldoFavor > 0) {
      return "Saldo a favor";
    }
    return person.estado;
  };

  const getEstadoClass = (person) => {
    if (person.saldoFavor > 0) {
      return "favor";
    }
    switch (person.estado) {
      case "Al día":
        return "ok";
      case "Inactivo":
        return "inactive";
      case "Deudor":
        return "debt";
      default:
        return "";
    }
  };

  const getMontoDisplay = (person) => {
    if (person.estado === "Inactivo") {
      return 0;
    }
    if (person.saldoFavor > 0) {
      return person.saldoFavor;
    }
    return person.debt || 0;
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
      (filterTipo === "Kinesio" && person.tipo === "Paciente") ||
      (filterTipo === "Quiropraxia" && person.tipo === "Quiropraxia");

    return matchesSearch && matchesTipo;
  });

  return (
    <div className="accountStatus">
      <h2>Estado de Cuenta</h2>
      <p>
        Visualiza quién está al día, quién debe, tiene saldo a favor o está
        inactivo (Clientes, Pacientes y Quiropraxia)
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
            <MenuItem value="Quiropraxia">Quiropraxia</MenuItem>
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
                <strong>Deuda/Saldo</strong>
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
                  <span className={`tipo ${person.tipo}`}>
                    {person.tipo === "Cliente" && "🏋️ Gimnasio"}
                    {person.tipo === "Paciente" && "🏥 Kinesio"}
                    {person.tipo === "Quiropraxia" && "🦴 Quiropraxia"}
                  </span>
                </TableCell>
                <TableCell>
                  {person.name} {person.lastName}
                </TableCell>
                <TableCell>
                  <span className={`status ${getEstadoClass(person)}`}>
                    {getEstadoDisplay(person)}
                  </span>
                </TableCell>
                <TableCell>{person.ultimoPago || "Sin pagos"}</TableCell>
                <TableCell>
                  <span
                    style={{
                      color:
                        person.saldoFavor > 0
                          ? "#4caf50"
                          : person.debt > 0
                          ? "#f44336"
                          : "#666",
                    }}
                  >
                    {person.saldoFavor > 0 ? "+" : ""}$
                    {getMontoDisplay(person).toLocaleString("es-AR")}
                  </span>
                </TableCell>
                <TableCell>
                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => toggleInactivo(person)}
                    >
                      {person.estado === "Inactivo"
                        ? "Activar"
                        : "Marcar Inactivo"}
                    </Button>
                    {person.estado === "Deudor" && (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => eliminarDeuda(person)}
                      >
                        Eliminar Deuda
                      </Button>
                    )}
                    {person.saldoFavor > 0 && (
                      <Button
                        variant="contained"
                        color="info"
                        onClick={() => eliminarSaldoFavor(person)}
                      >
                        Eliminar Saldo
                      </Button>
                    )}
                  </div>
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
