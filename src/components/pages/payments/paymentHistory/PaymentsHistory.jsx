import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Table,
  TableHead,
  Paper,
  Alert,
  Typography,
} from "@mui/material";
import "./PaymentsHistory.css";
import { Timestamp } from "firebase/firestore";
import Swal from "sweetalert2";

export const PaymentsHistory = () => {
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [personaActual, setPersonaActual] = useState(null);
  const [avisoSaldo, setAvisoSaldo] = useState("");

  const [nuevoPago, setNuevoPago] = useState({
    nombre: "",
    dni: "",
    concepto: "",
    metodo: "",
    monto: "",
    fecha: new Date().toLocaleDateString("es-AR"),
    tipo: "", // cliente, paciente o quiropraxia
  });

  const cargarPagos = async () => {
    // Cargar pagos de clientes (gimnasio)
    const clientPaymentsSnap = await getDocs(collection(db, "payments"));
    const clientPayments = clientPaymentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipoPersona: "Cliente",
      personaInfo: doc.data().alumno,
      collection: "payments",
    }));

    // Cargar pagos de pacientes (kinesio)
    const patientPaymentsSnap = await getDocs(
      collection(db, "patientPayments")
    );
    const patientPayments = patientPaymentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipoPersona: "Paciente",
      personaInfo: doc.data().paciente,
      collection: "patientPayments",
    }));

    // Cargar pagos de quiropraxia
    const quiropraxiaPaymentsSnap = await getDocs(
      collection(db, "quiropraxiaPayments")
    );
    const quiropraxiaPayments = quiropraxiaPaymentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipoPersona: "Quiropraxia",
      personaInfo: doc.data().pacienteQuiro,
      collection: "quiropraxiaPayments",
    }));

    // Combinar los tres arrays
    const allPayments = [
      ...clientPayments,
      ...patientPayments,
      ...quiropraxiaPayments,
    ];

    const ordenado = allPayments.sort((a, b) => {
      const [d1, m1, y1] = a.fecha.split("/").map(Number);
      const [d2, m2, y2] = b.fecha.split("/").map(Number);
      return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
    });

    setPagos(ordenado);
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  useEffect(() => {
    const buscarPersona = async () => {
      if (nuevoPago.dni.trim().length >= 5 && nuevoPago.tipo) {
        let coleccion;

        if (nuevoPago.tipo === "cliente") {
          coleccion = "clients";
        } else if (nuevoPago.tipo === "paciente") {
          coleccion = "patients";
        } else if (nuevoPago.tipo === "quiropraxia") {
          coleccion = "quiropraxia";
        }

        const q = query(
          collection(db, coleccion),
          where("dni", "==", nuevoPago.dni.trim())
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const persona = snap.docs[0].data();
          setPersonaActual(persona);
          setNuevoPago((prev) => ({
            ...prev,
            nombre: persona.name,
          }));

          // Generar avisos según el estado de la persona
          let aviso = "";
          if (persona.saldoFavor > 0) {
            aviso = `⚠️ Esta persona tiene un saldo a favor de $${persona.saldoFavor.toLocaleString(
              "es-AR"
            )}`;
          } else if (persona.debt > 0) {
            aviso = `💰 Deuda actual: $${persona.debt.toLocaleString("es-AR")}`;
          } else {
            aviso = "✅ La persona está al día";
          }
          setAvisoSaldo(aviso);
        } else {
          setPersonaActual(null);
          setAvisoSaldo("");
          setNuevoPago((prev) => ({
            ...prev,
            nombre: "",
          }));
        }
      } else {
        setPersonaActual(null);
        setAvisoSaldo("");
      }
    };
    buscarPersona();
  }, [nuevoPago.dni, nuevoPago.tipo]);

  // Generar aviso dinámico según el monto ingresado
  useEffect(() => {
    if (personaActual && nuevoPago.monto) {
      const monto = parseInt(nuevoPago.monto);
      if (isNaN(monto) || monto <= 0) return;

      let avisoDetallado = "";

      if (personaActual.saldoFavor > 0) {
        const nuevoSaldoFavor = personaActual.saldoFavor + monto;
        avisoDetallado = `💚 Saldo a favor actual: $${personaActual.saldoFavor.toLocaleString(
          "es-AR"
        )} → Nuevo saldo: $${nuevoSaldoFavor.toLocaleString("es-AR")}`;
      } else if (personaActual.debt > 0) {
        const deudaActual = personaActual.debt;
        if (monto > deudaActual) {
          const saldoFavor = monto - deudaActual;
          avisoDetallado = `🎉 El pago de $${monto.toLocaleString(
            "es-AR"
          )} cubre la deuda de $${deudaActual.toLocaleString(
            "es-AR"
          )} y genera un saldo a favor de $${saldoFavor.toLocaleString(
            "es-AR"
          )}`;
        } else if (monto === deudaActual) {
          avisoDetallado = `✅ El pago de $${monto.toLocaleString(
            "es-AR"
          )} cubre exactamente la deuda. La persona quedará al día.`;
        } else {
          const deudaRestante = deudaActual - monto;
          avisoDetallado = `⚠️ Pago parcial: $${monto.toLocaleString(
            "es-AR"
          )} de $${deudaActual.toLocaleString(
            "es-AR"
          )}. Deuda restante: $${deudaRestante.toLocaleString("es-AR")}`;
        }
      } else {
        avisoDetallado = `💚 La persona está al día. Este pago de $${monto.toLocaleString(
          "es-AR"
        )} generará un saldo a favor.`;
      }

      setAvisoSaldo(avisoDetallado);
    }
  }, [nuevoPago.monto, personaActual]);

  const pagosFiltrados = pagos.filter((p) => {
    const coincideTexto =
      p.personaInfo.name?.toLowerCase().includes(filtro.toLowerCase()) ||
      p.personaInfo.dni.includes(filtro);

    const coincideMetodo =
      !filtroMetodo || p.metodo?.toLowerCase() === filtroMetodo;

    const coincideTipo =
      !filtroTipo || p.tipoPersona.toLowerCase() === filtroTipo;

    return coincideTexto && coincideMetodo && coincideTipo;
  });

  const handleRegistrarPago = async () => {
    if (!personaActual) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "⚠️ No se encontró la persona con ese DNI.",
      });
      return;
    }

    const montoPagado = parseInt(nuevoPago.monto);

    // Obtener el mes en formato YYYY-MM desde la fecha ingresada
    const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
    const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;
    const fechaPago = new Date(anio, mes - 1, dia);

    const pagoFinal = {
      fecha: nuevoPago.fecha,
      concepto: nuevoPago.concepto,
      metodo: nuevoPago.metodo,
      monto: montoPagado,
      mes: mesPago,
      createdAt: Timestamp.fromDate(fechaPago),
    };

    // Calcular nuevo estado y montos
    const deudaActual = personaActual.debt || 0;
    const saldoFavorActual = personaActual.saldoFavor || 0;

    let nuevaDeuda = 0;
    let nuevoSaldoFavor = 0;
    let nuevoEstado = "Al día";

    if (saldoFavorActual > 0) {
      // Si ya tiene saldo a favor, se suma al saldo
      nuevoSaldoFavor = saldoFavorActual + montoPagado;
      nuevoEstado = "Al día"; // Técnicamente tiene saldo a favor, pero se maneja en el frontend
    } else if (deudaActual > 0) {
      // Si tiene deuda
      if (montoPagado >= deudaActual) {
        // Pago cubre o supera la deuda
        nuevoSaldoFavor = montoPagado - deudaActual;
        nuevaDeuda = 0;
        nuevoEstado = "Al día";
      } else {
        // Pago parcial
        nuevaDeuda = deudaActual - montoPagado;
        nuevoSaldoFavor = 0;
        nuevoEstado = "Deudor";
      }
    } else {
      // Si está al día, genera saldo a favor
      nuevoSaldoFavor = montoPagado;
      nuevaDeuda = 0;
      nuevoEstado = "Al día";
    }

    // Determinar colección y estructura según el tipo
    if (nuevoPago.tipo === "cliente") {
      pagoFinal.alumno = {
        name: nuevoPago.nombre,
        dni: nuevoPago.dni,
      };
      await addDoc(collection(db, "payments"), pagoFinal);

      // Actualizar cliente
      const q = query(
        collection(db, "clients"),
        where("dni", "==", nuevoPago.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const clienteDoc = snap.docs[0];
        const clienteRef = doc(db, "clients", clienteDoc.id);

        await updateDoc(clienteRef, {
          ultimoPago: nuevoPago.fecha,
          debt: nuevaDeuda,
          saldoFavor: nuevoSaldoFavor,
          estado: nuevoEstado,
        });
      }
    } else if (nuevoPago.tipo === "paciente") {
      pagoFinal.paciente = {
        name: nuevoPago.nombre,
        dni: nuevoPago.dni,
      };
      await addDoc(collection(db, "patientPayments"), pagoFinal);

      // Actualizar paciente
      const q = query(
        collection(db, "patients"),
        where("dni", "==", nuevoPago.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const pacienteDoc = snap.docs[0];
        const pacienteRef = doc(db, "patients", pacienteDoc.id);

        await updateDoc(pacienteRef, {
          ultimoPago: nuevoPago.fecha,
          debt: nuevaDeuda,
          saldoFavor: nuevoSaldoFavor,
          estado: nuevoEstado,
        });
      }
    } else if (nuevoPago.tipo === "quiropraxia") {
      pagoFinal.pacienteQuiro = {
        name: nuevoPago.nombre,
        dni: nuevoPago.dni,
      };
      await addDoc(collection(db, "quiropraxiaPayments"), pagoFinal);

      // Actualizar paciente de quiropraxia
      const q = query(
        collection(db, "quiropraxia"),
        where("dni", "==", nuevoPago.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const quiroDoc = snap.docs[0];
        const quiroRef = doc(db, "quiropraxia", quiroDoc.id);

        await updateDoc(quiroRef, {
          ultimoPago: nuevoPago.fecha,
          debt: nuevaDeuda,
          saldoFavor: nuevoSaldoFavor,
          estado: nuevoEstado,
        });
      }
    }

    setNuevoPago({
      nombre: "",
      dni: "",
      concepto: "",
      metodo: "",
      monto: "",
      fecha: new Date().toLocaleDateString("es-AR"),
      tipo: "",
    });
    setPersonaActual(null);
    setAvisoSaldo("");
    setOpenModal(false);
    cargarPagos();

    Swal.fire({
      icon: "success",
      title: "Pago registrado",
      text: "El pago fue registrado exitosamente ✅",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const eliminarPago = async (pago) => {
    const result = await Swal.fire({
      title: "¿Eliminar pago?",
      text: `¿Seguro que deseas eliminar el pago de $${pago.monto.toLocaleString()} de ${
        pago.personaInfo.name
      }?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    await deleteDoc(doc(db, pago.collection, pago.id));

    // Actualizar deuda según el tipo
    if (pago.tipoPersona === "Cliente") {
      const q = query(
        collection(db, "clients"),
        where("dni", "==", pago.personaInfo.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const clienteDoc = snap.docs[0];
        const clienteRef = doc(db, "clients", clienteDoc.id);
        const clienteData = clienteDoc.data();

        // Lógica inversa: restar el pago eliminado
        const saldoFavorActual = clienteData.saldoFavor || 0;
        const deudaActual = clienteData.debt || 0;

        let nuevaDeuda = deudaActual;
        let nuevoSaldoFavor = saldoFavorActual;

        if (saldoFavorActual >= pago.monto) {
          // Si el saldo a favor cubre el monto eliminado
          nuevoSaldoFavor = saldoFavorActual - pago.monto;
        } else {
          // El pago eliminado genera deuda
          const montoDeuda = pago.monto - saldoFavorActual;
          nuevaDeuda = deudaActual + montoDeuda;
          nuevoSaldoFavor = 0;
        }

        const nuevoEstado = nuevaDeuda > 0 ? "Deudor" : "Al día";

        await updateDoc(clienteRef, {
          debt: nuevaDeuda,
          saldoFavor: nuevoSaldoFavor,
          estado: nuevoEstado,
        });
      }
    } else if (pago.tipoPersona === "Paciente") {
      const q = query(
        collection(db, "patients"),
        where("dni", "==", pago.personaInfo.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const pacienteDoc = snap.docs[0];
        const pacienteRef = doc(db, "patients", pacienteDoc.id);
        const pacienteData = pacienteDoc.data();

        const saldoFavorActual = pacienteData.saldoFavor || 0;
        const deudaActual = pacienteData.debt || 0;

        let nuevaDeuda = deudaActual;
        let nuevoSaldoFavor = saldoFavorActual;

        if (saldoFavorActual >= pago.monto) {
          nuevoSaldoFavor = saldoFavorActual - pago.monto;
        } else {
          const montoDeuda = pago.monto - saldoFavorActual;
          nuevaDeuda = deudaActual + montoDeuda;
          nuevoSaldoFavor = 0;
        }

        const nuevoEstado = nuevaDeuda > 0 ? "Deudor" : "Al día";

        await updateDoc(pacienteRef, {
          debt: nuevaDeuda,
          saldoFavor: nuevoSaldoFavor,
          estado: nuevoEstado,
        });
      }
    } else if (pago.tipoPersona === "Quiropraxia") {
      const q = query(
        collection(db, "quiropraxia"),
        where("dni", "==", pago.personaInfo.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const quiroDoc = snap.docs[0];
        const quiroRef = doc(db, "quiropraxia", quiroDoc.id);
        const quiroData = quiroDoc.data();

        const saldoFavorActual = quiroData.saldoFavor || 0;
        const deudaActual = quiroData.debt || 0;

        let nuevaDeuda = deudaActual;
        let nuevoSaldoFavor = saldoFavorActual;

        if (saldoFavorActual >= pago.monto) {
          nuevoSaldoFavor = saldoFavorActual - pago.monto;
        } else {
          const montoDeuda = pago.monto - saldoFavorActual;
          nuevaDeuda = deudaActual + montoDeuda;
          nuevoSaldoFavor = 0;
        }

        const nuevoEstado = nuevaDeuda > 0 ? "Deudor" : "Al día";

        await updateDoc(quiroRef, {
          debt: nuevaDeuda,
          saldoFavor: nuevoSaldoFavor,
          estado: nuevoEstado,
        });
      }
    }

    cargarPagos();
    Swal.fire({
      icon: "success",
      title: "Pago eliminado",
      text: "El pago fue eliminado correctamente ✅",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="historialPagos">
      <h2>Historial de Pagos</h2>
      <p>Registro de todos los pagos realizados</p>
      <div className="headerPagos">
        <div style={{ display: "flex", marginTop: 20, gap: 20 }}>
          <TextField
            size="small"
            label="Buscar por nombre o DNI"
            variant="outlined"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="tipo-select-label">Tipo</InputLabel>
            <Select
              labelId="tipo-select-label"
              value={filtroTipo}
              label="Tipo"
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="cliente">Gimnasio</MenuItem>
              <MenuItem value="paciente">Kinesio</MenuItem>
              <MenuItem value="quiropraxia">Quiropraxia</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="metodo-select-label">Método de pago</InputLabel>
            <Select
              labelId="metodo-select-label"
              value={filtroMetodo}
              label="Método de pago"
              onChange={(e) => setFiltroMetodo(e.target.value)}
            >
              <MenuItem value="">Todos los métodos</MenuItem>
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="tarjeta">Tarjeta</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Button variant="contained" onClick={() => setOpenModal(true)}>
          💲 Registrar Pago
        </Button>
      </div>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Fecha</strong>
              </TableCell>
              <TableCell>
                <strong>Tipo</strong>
              </TableCell>
              <TableCell>
                <strong>Nombre</strong>
              </TableCell>
              <TableCell>
                <strong>Método</strong>
              </TableCell>
              <TableCell>
                <strong>Monto</strong>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosFiltrados.map((pago) => (
              <TableRow key={`${pago.collection}-${pago.id}`}>
                <TableCell>{pago.fecha}</TableCell>
                <TableCell>
                  <span className={`tipo ${pago.tipoPersona}`}>
                    {pago.tipoPersona === "Cliente" && "🏋️ Gimnasio"}
                    {pago.tipoPersona === "Paciente" && "🏥 Kinesio"}
                    {pago.tipoPersona === "Quiropraxia" && "🦴 Quiropraxia"}
                  </span>
                </TableCell>
                <TableCell>{pago.personaInfo.name}</TableCell>
                <TableCell>{renderMetodo(pago.metodo)}</TableCell>
                <TableCell>${pago.monto.toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => eliminarPago(pago)}
                  >
                    🗑 Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <h3>Registrar Nuevo Pago</h3>

          <TextField
            label="Tipo de persona"
            select
            fullWidth
            margin="dense"
            value={nuevoPago.tipo}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, tipo: e.target.value, nombre: "" })
            }
          >
            <MenuItem value="cliente">🏋️ Gimnasio</MenuItem>
            <MenuItem value="paciente">🏥 Kinesio</MenuItem>
            <MenuItem value="quiropraxia">🦴 Quiropraxia</MenuItem>
          </TextField>

          <TextField
            label="DNI"
            fullWidth
            margin="dense"
            value={nuevoPago.dni}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, dni: e.target.value })
            }
            helperText={
              nuevoPago.tipo &&
              `Detectado como: ${
                nuevoPago.tipo === "cliente"
                  ? "Cliente (Gimnasio)"
                  : nuevoPago.tipo === "paciente"
                  ? "Paciente (Kinesio)"
                  : "Paciente (Quiropraxia)"
              }`
            }
          />

          <TextField
            label="Nombre"
            fullWidth
            margin="dense"
            value={nuevoPago.nombre}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, nombre: e.target.value })
            }
          />

          {/* Mostrar aviso del estado actual de la persona */}
          {avisoSaldo && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Alert
                severity={
                  avisoSaldo.includes("saldo a favor") ||
                  avisoSaldo.includes("cubre exactamente")
                    ? "success"
                    : avisoSaldo.includes("parcial")
                    ? "warning"
                    : "info"
                }
                sx={{ fontSize: "0.85rem" }}
              >
                <Typography variant="body2">{avisoSaldo}</Typography>
              </Alert>
            </Box>
          )}

          <TextField
            label="Método de pago"
            select
            fullWidth
            margin="dense"
            value={nuevoPago.metodo}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, metodo: e.target.value })
            }
          >
            <MenuItem value="efectivo">💵 Efectivo</MenuItem>
            <MenuItem value="transferencia">✔ Transferencia</MenuItem>
            <MenuItem value="tarjeta">💳 Tarjeta</MenuItem>
          </TextField>

          <TextField
            label="Monto"
            type="number"
            fullWidth
            margin="dense"
            value={nuevoPago.monto}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, monto: e.target.value })
            }
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleRegistrarPago}
            disabled={!nuevoPago.dni || !nuevoPago.monto || !nuevoPago.tipo}
          >
            Registrar Pago
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

const renderMetodo = (metodo) => {
  switch (metodo?.toLowerCase()) {
    case "efectivo":
      return "💵 Efectivo";
    case "transferencia":
      return "✔ Transferencia";
    case "tarjeta":
      return "💳 Tarjeta";
    default:
      return metodo;
  }
};
