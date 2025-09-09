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
  getDoc,
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

  // Estados para el buscador
  const [personasBusqueda, setPersonasBusqueda] = useState([]);
  const [busquedaPersona, setBusquedaPersona] = useState("");
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);

  const [nuevoPago, setNuevoPago] = useState({
    nombre: "",
    dni: "",
    concepto: "",
    metodo: "",
    monto: "",
    fecha: new Date().toLocaleDateString("es-AR"),
    hora: new Date().toLocaleTimeString("es-AR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }), // Agregado campo hora
    tipo: "", // cliente, paciente o quiropraxia
  });

  const cargarPagos = async () => {
    try {
      // Cargar pagos de clientes (gimnasio)
      const clientPaymentsSnap = await getDocs(collection(db, "payments"));
      const clientPayments = clientPaymentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        tipoPersona: "Cliente",
        personaInfo: doc.data().alumno || {
          name: "Sin nombre",
          dni: "Sin DNI",
        },
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
        personaInfo: doc.data().paciente || {
          name: "Sin nombre",
          dni: "Sin DNI",
        },
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
        personaInfo: doc.data().pacienteQuiro || {
          name: "Sin nombre",
          dni: "Sin DNI",
        },
        collection: "quiropraxiaPayments",
      }));

      // Combinar los tres arrays
      const allPayments = [
        ...clientPayments,
        ...patientPayments,
        ...quiropraxiaPayments,
      ];

      // Ordenar por createdAt si existe, sino por fecha y hora
      const ordenado = allPayments.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate() - a.createdAt.toDate();
        }

        // Fallback: ordenar por fecha y hora string
        const [d1, m1, y1] = a.fecha.split("/").map(Number);
        const [d2, m2, y2] = b.fecha.split("/").map(Number);
        const fecha1 = new Date(y1, m1 - 1, d1);
        const fecha2 = new Date(y2, m2 - 1, d2);

        if (fecha1.getTime() === fecha2.getTime()) {
          // Si las fechas son iguales, ordenar por hora
          const hora1 = a.hora || "00:00";
          const hora2 = b.hora || "00:00";
          return hora2.localeCompare(hora1);
        }

        return fecha2 - fecha1;
      });

      setPagos(ordenado);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pagos. Revisa la consola para más detalles.",
      });
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  // Buscar personas cuando se escribe en el buscador
  useEffect(() => {
    const buscarPersonas = async () => {
      if (busquedaPersona.trim().length >= 2 && nuevoPago.tipo) {
        let coleccion;

        if (nuevoPago.tipo === "cliente") {
          coleccion = "clients";
        } else if (nuevoPago.tipo === "paciente") {
          coleccion = "patients";
        } else if (nuevoPago.tipo === "quiropraxia") {
          coleccion = "quiropraxia";
        }

        try {
          const snap = await getDocs(collection(db, coleccion));
          const personas = snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((persona) => {
              const nombreCompleto = `${persona.name || ""} ${
                persona.lastName || ""
              }`.toLowerCase();
              return (
                nombreCompleto.includes(busquedaPersona.toLowerCase()) ||
                persona.dni?.includes(busquedaPersona)
              );
            });

          setPersonasBusqueda(personas);
        } catch (error) {
          console.error("Error buscando personas:", error);
          setPersonasBusqueda([]);
        }
      } else {
        setPersonasBusqueda([]);
      }
    };

    buscarPersonas();
  }, [busquedaPersona, nuevoPago.tipo]);

  // Función para seleccionar una persona del buscador
  const seleccionarPersona = (persona) => {
    setPersonaSeleccionada(persona);
    setPersonaActual(persona);
    const nombreCompleto = `${persona.name || ""} ${
      persona.lastName || ""
    }`.trim();
    setNuevoPago((prev) => ({
      ...prev,
      nombre: nombreCompleto,
      dni: persona.dni,
    }));
    setBusquedaPersona(nombreCompleto);
    // setNuevoPago((prev) => ({
    //   ...prev,
    //   nombre: persona.name,
    //   dni: persona.dni,
    // }));
    // setBusquedaPersona(persona.name);
    setPersonasBusqueda([]);

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
  };

  // Generar aviso dinámico según el monto ingresado
  useEffect(() => {
    if (personaSeleccionada && nuevoPago.monto) {
      const monto = parseInt(nuevoPago.monto);
      if (isNaN(monto) || monto <= 0) return;

      let avisoDetallado = "";

      if (personaSeleccionada.saldoFavor > 0) {
        const nuevoSaldoFavor = personaSeleccionada.saldoFavor + monto;
        avisoDetallado = `💚 Saldo a favor actual: $${personaSeleccionada.saldoFavor.toLocaleString(
          "es-AR"
        )} → Nuevo saldo: $${nuevoSaldoFavor.toLocaleString("es-AR")}`;
      } else if (personaSeleccionada.debt > 0) {
        const deudaActual = personaSeleccionada.debt;
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
  }, [nuevoPago.monto, personaSeleccionada]);

  const handleRegistrarPago = async () => {
    if (!personaSeleccionada) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "⚠️ Debes seleccionar una persona primero.",
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
      hora: nuevoPago.hora,
      concepto: nuevoPago.concepto,
      metodo: nuevoPago.metodo,
      monto: montoPagado,
      mes: mesPago,
      createdAt: Timestamp.fromDate(fechaPago),
    };

    // Calcular nuevo estado y montos
    const deudaActual = personaSeleccionada.debt || 0;
    const saldoFavorActual = personaSeleccionada.saldoFavor || 0;

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

    // Datos para actualizar
    const updateData = {
      ultimoPago: nuevoPago.fecha,
      debt: nuevaDeuda,
      saldoFavor: nuevoSaldoFavor,
      estado: nuevoEstado,
    };

    try {
      // Determinar colección y estructura según el tipo
      if (nuevoPago.tipo === "cliente") {
        pagoFinal.alumno = {
          name: personaSeleccionada.name,
          lastName: personaSeleccionada.lastName, // Asegurar que se incluya el apellido
          dni: personaSeleccionada.dni || "Sin DNI",
          id: personaSeleccionada.id,
        };
        await addDoc(collection(db, "payments"), pagoFinal);

        // 🔥 USAR SIEMPRE EL ID DIRECTO - NO BUSCAR POR DNI
        const clientRef = doc(db, "clients", personaSeleccionada.id);
        await updateDoc(clientRef, updateData);
      } else if (nuevoPago.tipo === "paciente") {
        pagoFinal.paciente = {
          name: personaSeleccionada.name,
          lastName: personaSeleccionada.lastName,
          dni: personaSeleccionada.dni || "Sin DNI",
          id: personaSeleccionada.id,
        };
        await addDoc(collection(db, "patientPayments"), pagoFinal);

        // 🔥 USAR SIEMPRE EL ID DIRECTO - NO BUSCAR POR DNI
        const patientRef = doc(db, "patients", personaSeleccionada.id);
        await updateDoc(patientRef, updateData);
      } else if (nuevoPago.tipo === "quiropraxia") {
        pagoFinal.pacienteQuiro = {
          name: personaSeleccionada.name,
          lastName: personaSeleccionada.lastName,
          dni: personaSeleccionada.dni || "Sin DNI",
          id: personaSeleccionada.id,
        };
        await addDoc(collection(db, "quiropraxiaPayments"), pagoFinal);

        // 🔥 USAR SIEMPRE EL ID DIRECTO - NO BUSCAR POR DNI
        const quiroRef = doc(db, "quiropraxia", personaSeleccionada.id);
        await updateDoc(quiroRef, updateData);
      }

      // Reset form
      setNuevoPago({
        nombre: "",
        dni: "",
        concepto: "",
        metodo: "",
        monto: "",
        fecha: new Date().toLocaleDateString("es-AR"),
        hora: new Date().toLocaleTimeString("es-AR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        tipo: "",
      });
      setPersonaActual(null);
      setPersonaSeleccionada(null);
      setBusquedaPersona("");
      setPersonasBusqueda([]);
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
    } catch (error) {
      console.error("Error registrando pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema registrando el pago. Intenta de nuevo.",
      });
    }
  };

  const eliminarPago = async (pago) => {
    const result = await Swal.fire({
      title: "¿Eliminar pago?",
      text: `¿Seguro que deseas eliminar el pago de $${pago.monto.toLocaleString()} de ${
        pago.personaInfo?.name || "Sin nombre"
      }?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      // Eliminar el pago de la base de datos
      await deleteDoc(doc(db, pago.collection, pago.id));

      // 🔥 FUNCIÓN CORREGIDA: Usar SIEMPRE el ID directo para actualizar
      const updatePersonaAfterDelete = async (collectionName, personaInfo) => {
        if (!personaInfo || !personaInfo.id) {
          console.error(
            "No se puede actualizar: falta información de la persona"
          );
          return;
        }

        try {
          // 🔥 USAR SIEMPRE EL ID DIRECTO - NO BUSCAR POR DNI
          const personaRef = doc(db, collectionName, personaInfo.id);

          // Obtener los datos actuales de la persona
          const personaDoc = await getDoc(personaRef);

          if (!personaDoc.exists()) {
            console.error(
              `Persona no encontrada en ${collectionName} con ID: ${personaInfo.id}`
            );
            return;
          }

          const personaData = personaDoc.data();
          const saldoFavorActual = personaData.saldoFavor || 0;
          const deudaActual = personaData.debt || 0;

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

          await updateDoc(personaRef, {
            debt: nuevaDeuda,
            saldoFavor: nuevoSaldoFavor,
            estado: nuevoEstado,
          });

          console.log(`✅ Persona actualizada en ${collectionName}:`, {
            id: personaInfo.id,
            nuevaDeuda,
            nuevoSaldoFavor,
            nuevoEstado,
          });
        } catch (error) {
          console.error(
            `Error actualizando persona en ${collectionName}:`,
            error
          );
        }
      };

      // Actualizar según el tipo de persona
      if (pago.tipoPersona === "Cliente") {
        await updatePersonaAfterDelete("clients", pago.personaInfo);
      } else if (pago.tipoPersona === "Paciente") {
        await updatePersonaAfterDelete("patients", pago.personaInfo);
      } else if (pago.tipoPersona === "Quiropraxia") {
        await updatePersonaAfterDelete("quiropraxia", pago.personaInfo);
      }

      cargarPagos();
      Swal.fire({
        icon: "success",
        title: "Pago eliminado",
        text: "El pago fue eliminado correctamente ✅",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error eliminando pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema eliminando el pago. Intenta de nuevo.",
      });
    }
  };

  const pagosFiltrados = pagos.filter((p) => {
    // Validar que p.personaInfo existe y tiene las propiedades necesarias
    if (!p.personaInfo || typeof p.personaInfo !== "object") {
      return false;
    }

    const nombre = p.personaInfo.name || "";
    const dni = p.personaInfo.dni || "";

    const coincideTexto =
      nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      dni.includes(filtro);

    const coincideMetodo =
      !filtroMetodo || p.metodo?.toLowerCase() === filtroMetodo;

    const coincideTipo =
      !filtroTipo || p.tipoPersona.toLowerCase() === filtroTipo;

    return coincideTexto && coincideMetodo && coincideTipo;
  });

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
                <strong>Fecha y Hora</strong>
              </TableCell>
              <TableCell>
                <strong>Tipo</strong>
              </TableCell>
              <TableCell>
                <strong>Nombre y Apellido</strong>
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
                <TableCell>
                  <div>{pago.fecha}</div>
                  {pago.hora && (
                    <div style={{ fontSize: "0.8em", color: "#666" }}>
                      {pago.hora}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`tipo ${pago.tipoPersona}`}>
                    {pago.tipoPersona === "Cliente" && "🏋️ Gimnasio"}
                    {pago.tipoPersona === "Paciente" && "🏥 Kinesio"}
                    {pago.tipoPersona === "Quiropraxia" && "🦴 Quiropraxia"}
                  </span>
                </TableCell>
                <TableCell>
                  {`${pago.personaInfo?.name || ""} ${
                    pago.personaInfo?.lastName || ""
                  }`.trim() || "Sin nombre"}
                </TableCell>
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
            onChange={(e) => {
              setNuevoPago({
                ...nuevoPago,
                tipo: e.target.value,
                nombre: "",
                dni: "",
              });
              setPersonaSeleccionada(null);
              setBusquedaPersona("");
              setPersonasBusqueda([]);
              setPersonaActual(null);
              setAvisoSaldo("");
            }}
          >
            <MenuItem value="cliente">🏋️ Gimnasio</MenuItem>
            <MenuItem value="paciente">🏥 Kinesio</MenuItem>
            <MenuItem value="quiropraxia">🦴 Quiropraxia</MenuItem>
          </TextField>

          <Box sx={{ position: "relative" }}>
            <TextField
              label={`Buscar ${
                nuevoPago.tipo === "cliente"
                  ? "cliente"
                  : nuevoPago.tipo === "paciente"
                  ? "paciente"
                  : "paciente de quiropraxia"
              }`}
              fullWidth
              margin="dense"
              value={busquedaPersona}
              onChange={(e) => setBusquedaPersona(e.target.value)}
              disabled={!nuevoPago.tipo}
              helperText={
                nuevoPago.tipo
                  ? `Busca por nombre o DNI del ${
                      nuevoPago.tipo === "cliente" ? "cliente" : "paciente"
                    }`
                  : "Primero selecciona el tipo de persona"
              }
            />

            {/* Lista de resultados de búsqueda */}
            {personasBusqueda.length > 0 && (
              <Paper
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: 200,
                  overflow: "auto",
                  mt: 1,
                }}
              >
                {personasBusqueda.map((persona) => (
                  <Box
                    key={persona.id}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                    onClick={() => seleccionarPersona(persona)}
                  >
                    {/* <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {persona.name}
                    </Typography> */}
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {`${persona.name || ""} ${
                        persona.lastName || ""
                      }`.trim() || "Sin nombre"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DNI: {persona.dni} |
                      {persona.debt > 0 &&
                        ` Deuda: ${persona.debt.toLocaleString()}`}
                      {persona.saldoFavor > 0 &&
                        ` Saldo a favor: ${persona.saldoFavor.toLocaleString()}`}
                      {!persona.debt && !persona.saldoFavor && " Al día"}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          {/* Mostrar información de la persona seleccionada */}
          {personaSeleccionada && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#f8f9fa", borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Seleccionado:</strong>{" "}
                {`${personaSeleccionada.name || ""} ${
                  personaSeleccionada.lastName || ""
                }`.trim()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                DNI: {personaSeleccionada.dni}
              </Typography>
            </Box>
          )}

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
            label="Concepto"
            fullWidth
            margin="dense"
            value={nuevoPago.concepto}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, concepto: e.target.value })
            }
            placeholder={
              nuevoPago.tipo === "cliente" ? "Pago de clase" : "Pago de sesión"
            }
          />

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

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Fecha"
              fullWidth
              margin="dense"
              value={nuevoPago.fecha}
              onChange={(e) =>
                setNuevoPago({ ...nuevoPago, fecha: e.target.value })
              }
              helperText="DD/MM/YYYY"
            />

            <TextField
              label="Hora"
              fullWidth
              margin="dense"
              value={nuevoPago.hora}
              onChange={(e) =>
                setNuevoPago({ ...nuevoPago, hora: e.target.value })
              }
              helperText="HH:MM"
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleRegistrarPago}
            disabled={
              !personaSeleccionada ||
              !nuevoPago.monto ||
              !nuevoPago.tipo ||
              !nuevoPago.metodo
            }
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
