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
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";

import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { useActivities } from "../activities/useActivities";
import { db } from "../../../firebaseConfig";
import { ClientForm } from "./ClientForm";
import { ActivityPricesManager } from "../activities/ActivityPricesManager";
import Swal from "sweetalert2";
import ActivityStats from "../activities/ActivityStats";
import MonthlyBillingManager from "./MonthlyBillingManager";
import { ScheduleAssignmentModal } from "./ScheduleAssignmentModal ";
import FixClientData from "./FixClientData";

// ─── constantes ─────────────────────────────────────────────────────────────

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
  ...modalStyle,
  maxWidth: 500,
  maxHeight: "90vh",
};

const PROPORCIONES = [
  { label: "Mes completo", factor: 1 },
  { label: "3/4 del mes", factor: 0.75 },
  { label: "1/2 mes", factor: 0.5 },
  { label: "1/4 del mes", factor: 0.25 },
];

const DAYS_OF_WEEK = [
  { key: "sunday", label: "Dom", value: 0 },
  { key: "monday", label: "Lun", value: 1 },
  { key: "tuesday", label: "Mar", value: 2 },
  { key: "wednesday", label: "Mié", value: 3 },
  { key: "thursday", label: "Jue", value: 4 },
  { key: "friday", label: "Vie", value: 5 },
  { key: "saturday", label: "Sáb", value: 6 },
];

// ─── helpers ────────────────────────────────────────────────────────────────

const calcularPrecio = (actividadLabel, proporcion, activities) => {
  const actividad = activities.find((a) => a.label === actividadLabel);
  if (!actividad) return 0;
  return Math.round((actividad.valor * proporcion) / 100) * 100;
};

const horaActual = () =>
  new Date().toLocaleTimeString("es-AR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

const fechaActual = () => new Date().toLocaleDateString("es-AR");

const pagoVacio = () => ({
  concepto: "",
  metodo: "",
  monto: "",
  fecha: fechaActual(),
  hora: horaActual(),
});

// ─── componente ─────────────────────────────────────────────────────────────

const ClientsList = ({ clients = [], setIsChange }) => {
  // ── Modales
  const [openForm, setOpenForm] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPricesManager, setOpenPricesManager] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openScheduleAssignment, setOpenScheduleAssignment] = useState(false);

  // ── Selección
  const [clientSelected, setClientSelected] = useState(null);
  const [clientForSchedule, setClientForSchedule] = useState(null);

  // ── Filtros
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Perfil: horarios
  const [clientSchedules, setClientSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // ── Modal de pago
  const [nuevoPago, setNuevoPago] = useState(pagoVacio());
  const [tipoPago, setTipoPago] = useState("normal");
  const [mesesAdelantados, setMesesAdelantados] = useState(1);
  const [fechaInicioAdelantado, setFechaInicioAdelantado] = useState("");
  const [cobrarSinDeuda, setCobrarSinDeuda] = useState(false);
  const [actividadPago, setActividadPago] = useState("");
  const [proporcionPago, setProporcionPago] = useState(1);
  const [avisoSaldo, setAvisoSaldo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activities = [], reloadActivities } = useActivities();

  // ── Precio calculado en tiempo real
  const precioPago = calcularPrecio(actividadPago, proporcionPago, activities);

  // ────────────────────────────────────────────────────────────────────────────
  // HANDLERS — modales
  // ────────────────────────────────────────────────────────────────────────────

  const handleCloseForm = () => setOpenForm(false);
  const handleCloseProfile = () => {
    setOpenProfile(false);
    setClientSchedules([]);
  };
  const handleClosePricesManager = () => setOpenPricesManager(false);

  const resetPaymentModal = () => {
    setIsSubmitting(false);
    setOpenPaymentModal(false);
    setClientSelected(null);
    setTipoPago("normal");
    setMesesAdelantados(1);
    setFechaInicioAdelantado("");
    setCobrarSinDeuda(false);
    setActividadPago("");
    setProporcionPago(1);
    setNuevoPago(pagoVacio());
    setAvisoSaldo("");
  };

  const handleOpenForm = (client) => {
    setClientSelected(client);
    setOpenForm(true);
  };

  // Calcula la fecha de inicio sugerida para pagos adelantados
  const calcularFechaInicioAdelantado = (client) => {
    const hoy = new Date();
    if (client.ultimoMesFacturado) {
      // Si ya tiene mes facturado, el inicio es el mes SIGUIENTE al último facturado
      const [anio, mes] = client.ultimoMesFacturado.split("-").map(Number);
      // new Date(anio, mes, 1) => mes es 1-indexed del string, pero Date es 0-indexed,
      // entonces mes sin restar 1 ya apunta al mes siguiente. Ej: "2026-05" => mes=5 => new Date(2026,5,1) = junio ✅
      return new Date(anio, mes, 1).toISOString().split("T")[0];
    }
    // Sin historial: el pago adelantado cubre el MES SIGUIENTE al actual
    return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
      .toISOString()
      .split("T")[0];
  };

  const handleOpenPaymentModal = (client) => {
    setClientSelected(client);
    setCobrarSinDeuda(false);
    setActividadPago(client.actividad || "");
    setProporcionPago(client.proporcion || 1);

    const deudaTotal = (client.debt || 0) + (client.deudaAnterior || 0);
    let aviso = "";
    if (client.saldoFavor > 0) {
      aviso = `💚 Saldo a favor: $${client.saldoFavor.toLocaleString("es-AR")}`;
    } else if (deudaTotal > 0) {
      aviso =
        client.deudaAnterior > 0
          ? `💰 Deuda total: $${deudaTotal.toLocaleString("es-AR")} (Anterior: $${client.deudaAnterior.toLocaleString("es-AR")} + Mes actual: $${(client.debt || 0).toLocaleString("es-AR")})`
          : `💰 Deuda mes actual: $${(client.debt || 0).toLocaleString("es-AR")}`;
    } else {
      aviso = "✅ Al día - Sin deudas";
    }
    setAvisoSaldo(aviso);

    setFechaInicioAdelantado(calcularFechaInicioAdelantado(client));
    setNuevoPago({
      ...pagoVacio(),
      concepto: client.actividad || "Pago de clase",
    });
    setOpenPaymentModal(true);
  };

  const handleOpenProfile = async (client) => {
    setClientSelected(client);
    setLoadingSchedules(true);
    setOpenProfile(true);

    try {
      const schedulesSnap = await getDocs(collection(db, "schedules"));
      const lista = [];
      schedulesSnap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const clientInSchedule = data.clients?.find((c) => c.id === client.id);
        if (clientInSchedule) {
          lista.push({
            id: docSnap.id,
            date: data.date,
            hour: data.hour,
            attended: clientInSchedule.attended || false,
          });
        }
      });
      lista.sort((a, b) =>
        a.date === b.date
          ? a.hour.localeCompare(b.hour)
          : a.date.localeCompare(b.date),
      );
      setClientSchedules(lista);
    } catch (error) {
      console.error("Error al cargar horarios:", error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // AVISO DE SALDO — se recalcula con cada cambio de monto/tipo/proporción
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!clientSelected || !nuevoPago.monto) return;
    const monto = parseInt(nuevoPago.monto);
    if (isNaN(monto) || monto <= 0) return;

    const saldoFavor = clientSelected.saldoFavor || 0;
    const deudaActual = clientSelected.debt || 0;
    const deudaAnterior = clientSelected.deudaAnterior || 0;
    const deudaTotal = deudaActual + deudaAnterior;
    let aviso = "";

    if (tipoPago === "adelantado") {
      const montoTotal = precioPago * mesesAdelantados;
      let montoNeto = montoTotal - saldoFavor;
      if (montoNeto < 0) montoNeto = 0;

      if (saldoFavor >= montoTotal) {
        aviso = `✅ Saldo a favor ($${saldoFavor.toLocaleString("es-AR")}) cubre los ${mesesAdelantados} mes(es). Sobrante: $${(saldoFavor - montoTotal).toLocaleString("es-AR")}`;
      } else if (saldoFavor > 0) {
        aviso = `💰 Total: $${montoTotal.toLocaleString("es-AR")} - Saldo: $${saldoFavor.toLocaleString("es-AR")} = A pagar: $${montoNeto.toLocaleString("es-AR")}`;
      } else {
        aviso = `📅 ${mesesAdelantados} mes(es) x $${precioPago.toLocaleString("es-AR")} = $${montoTotal.toLocaleString("es-AR")}`;
      }
      if (monto !== montoNeto && montoNeto > 0) {
        aviso += `\n💡 Sugerido: $${montoNeto.toLocaleString("es-AR")}`;
      }
    } else {
      if (cobrarSinDeuda) {
        const sobrante = monto - deudaTotal;
        aviso =
          sobrante >= 0
            ? `✅ Se cobrará sin deuda. Cliente quedará "Al día"${sobrante > 0 ? ` con $${sobrante.toLocaleString("es-AR")} a favor` : ""}`
            : `✅ Se cobrará sin deuda. Cliente quedará "Al día" (se condona $${Math.abs(sobrante).toLocaleString("es-AR")})`;
      } else if (saldoFavor > 0) {
        aviso = `💚 Nuevo saldo a favor: $${(saldoFavor + monto).toLocaleString("es-AR")}`;
      } else if (deudaTotal > 0) {
        if (monto > deudaTotal) {
          aviso = `🎉 Cubre toda la deuda ($${deudaTotal.toLocaleString("es-AR")}) + $${(monto - deudaTotal).toLocaleString("es-AR")} a favor`;
        } else if (monto === deudaTotal) {
          aviso = `✅ Cubre exactamente la deuda total ($${deudaTotal.toLocaleString("es-AR")})`;
        } else {
          const restante = deudaTotal - monto;
          if (deudaAnterior > 0 && monto >= deudaAnterior) {
            aviso = `✅ Cubre deuda anterior ($${deudaAnterior.toLocaleString("es-AR")}) + $${(monto - deudaAnterior).toLocaleString("es-AR")} del mes actual. Restante: $${restante.toLocaleString("es-AR")}`;
          } else if (deudaAnterior > 0) {
            aviso = `⚠️ Se aplica a deuda anterior. Nueva anterior: $${(deudaAnterior - monto).toLocaleString("es-AR")}. Restante total: $${restante.toLocaleString("es-AR")}`;
          } else {
            aviso = `⚠️ Cubre $${monto.toLocaleString("es-AR")} de deuda. Restante: $${restante.toLocaleString("es-AR")}`;
          }
        }
      } else {
        aviso = `💚 Generará saldo a favor de $${monto.toLocaleString("es-AR")}`;
      }
    }
    setAvisoSaldo(aviso);
  }, [
    nuevoPago.monto,
    tipoPago,
    mesesAdelantados,
    cobrarSinDeuda,
    actividadPago,
    proporcionPago,
    precioPago,
    clientSelected,
  ]);

  // ────────────────────────────────────────────────────────────────────────────
  // REGISTRAR PAGO
  // ────────────────────────────────────────────────────────────────────────────

  const handleRegistrarPago = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!clientSelected || !nuevoPago.monto || !nuevoPago.metodo) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Completá todos los campos obligatorios.",
        });
        return;
      }
      if (!actividadPago) {
        Swal.fire({
          icon: "warning",
          title: "Seleccioná una actividad",
          text: "Debés elegir la actividad para el pago.",
        });
        return;
      }

      const montoPagado = parseInt(nuevoPago.monto);
      const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
      const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;
      const fechaPago = new Date(anio, mes - 1, dia);
      const actividadCambio = actividadPago !== clientSelected.actividad;
      const labelProporcion =
        PROPORCIONES.find((p) => p.factor === proporcionPago)?.label || "";

      if (tipoPago === "adelantado") {
        // ── Pago adelantado ──────────────────────────────────────────────────
        const montoTotal = precioPago * mesesAdelantados;
        const saldoFavor = clientSelected.saldoFavor || 0;
        const montoFaltante = Math.max(0, montoTotal - saldoFavor);

        if (saldoFavor < montoTotal && montoPagado < montoFaltante) {
          Swal.fire({
            icon: "warning",
            title: "Monto insuficiente",
            text: `Necesitás pagar al menos $${montoFaltante.toLocaleString("es-AR")} para cubrir ${mesesAdelantados} mes(es).`,
          });
          return;
        }

        const saldoTotal = saldoFavor + montoPagado;
        const nuevoSaldoFavor =
          saldoTotal >= montoTotal ? saldoTotal - montoTotal : 0;

        // ✅ Parsear YYYY-MM-DD directo para evitar bug de timezone
        // new Date("2026-06-01") en UTC-3 da 31/05 → mes incorrecto
        const [inicioAnio, inicioMes] = fechaInicioAdelantado
          .split("-")
          .map(Number);
        const mesFinNum = inicioMes + mesesAdelantados - 1;
        const anioFin = inicioAnio + Math.floor((mesFinNum - 1) / 12);
        const mesFinAjustado = ((mesFinNum - 1) % 12) + 1;
        const ultimoMesFacturado = `${anioFin}-${String(mesFinAjustado).padStart(2, "0")}`;

        // ✅ No pisar si el existente es posterior
        const ultimoMesExistente = clientSelected.ultimoMesFacturado || "";
        const nuevoUltimoMes =
          ultimoMesExistente > ultimoMesFacturado
            ? ultimoMesExistente
            : ultimoMesFacturado;

        const pagoFinal = {
          fecha: nuevoPago.fecha,
          hora: nuevoPago.hora,
          concepto: `${actividadPago} (${labelProporcion}) - ${mesesAdelantados} mes(es) adelantado(s)`,
          actividad: actividadPago,
          proporcion: proporcionPago,
          metodo: nuevoPago.metodo,
          monto: montoPagado,
          mes: mesPago,
          mesesPagados: mesesAdelantados,
          fechaInicioCobertura: fechaInicioAdelantado,
          fechaFinCobertura: ultimoMesFacturado,
          tipoPago: "adelantado",
          createdAt: Timestamp.fromDate(fechaPago),
          alumno: {
            name: clientSelected.name,
            lastName: clientSelected.lastName,
            dni: clientSelected.dni || "Sin DNI",
            id: clientSelected.id,
          },
        };

        await addDoc(collection(db, "payments"), pagoFinal);
        await updateDoc(doc(db, "clients", clientSelected.id), {
          ultimoPago: nuevoPago.fecha,
          debt: 0,
          deudaAnterior: 0,
          saldoFavor: nuevoSaldoFavor,
          estado: "Al día",
          ultimoMesFacturado: nuevoUltimoMes,
          mesesPagadosAdelantado: mesesAdelantados,
          ...(actividadCambio && { actividad: actividadPago }),
        });

        resetPaymentModal();
        setIsChange(true);

        Swal.fire({
          icon: "success",
          title: "Pago adelantado registrado",
          html: `
            <p>✅ ${mesesAdelantados} mes(es) de <strong>${actividadPago}</strong> (${labelProporcion}) pagado(s)</p>
            <p>📅 Cobertura hasta: ${new Date(ultimoMesFacturado + "-01").toLocaleDateString("es-AR", { year: "numeric", month: "long" })}</p>
            ${nuevoSaldoFavor > 0 ? `<p>💚 Saldo a favor: $${nuevoSaldoFavor.toLocaleString("es-AR")}</p>` : ""}
            ${actividadCambio ? `<p>📝 Actividad actualizada a <strong>${actividadPago}</strong></p>` : ""}
          `,
          timer: 3500,
          showConfirmButton: false,
        });
      } else {
        // ── Pago normal ──────────────────────────────────────────────────────
        const deudaActual = clientSelected.debt || 0;
        const saldoFavor = clientSelected.saldoFavor || 0;
        const deudaAnterior = clientSelected.deudaAnterior || 0;
        const deudaTotal = deudaActual + deudaAnterior;

        let nuevaDeuda = 0;
        let nuevoSaldoFavor = 0;
        let nuevoEstado = "Al día";
        let nuevaDeudaAnterior = 0;

        if (cobrarSinDeuda) {
          // Acepta como válido sin importar si cubre la deuda
          nuevoSaldoFavor =
            montoPagado > deudaTotal ? montoPagado - deudaTotal : 0;
          nuevaDeuda = 0;
          nuevaDeudaAnterior = 0;
          nuevoEstado = "Al día";
        } else if (saldoFavor > 0) {
          // Ya tiene saldo a favor: el pago se suma
          nuevoSaldoFavor = saldoFavor + montoPagado;
          nuevaDeuda = 0;
          nuevaDeudaAnterior = 0;
          nuevoEstado = "Al día";
        } else if (deudaTotal > 0) {
          if (montoPagado >= deudaTotal) {
            nuevoSaldoFavor = montoPagado - deudaTotal;
            nuevaDeuda = 0;
            nuevaDeudaAnterior = 0;
            nuevoEstado = "Al día";
          } else {
            // Pago parcial: primero cubre deuda anterior
            nuevoSaldoFavor = 0;
            if (montoPagado >= deudaAnterior) {
              nuevaDeudaAnterior = 0;
              nuevaDeuda = deudaActual - (montoPagado - deudaAnterior);
            } else {
              nuevaDeudaAnterior = deudaAnterior - montoPagado;
              nuevaDeuda = deudaActual;
            }
            nuevoEstado = "Deudor";
          }
        } else {
          // Sin deuda: todo pasa a saldo a favor
          nuevoSaldoFavor = montoPagado;
          nuevaDeuda = 0;
          nuevaDeudaAnterior = 0;
          nuevoEstado = "Al día";
        }

        // ✅ No pisar ultimoMesFacturado si el existente es posterior
        const ultimoMesExistente = clientSelected.ultimoMesFacturado || "";
        const nuevoUltimoMes =
          ultimoMesExistente > mesPago ? ultimoMesExistente : mesPago;

        const pagoFinal = {
          fecha: nuevoPago.fecha,
          hora: nuevoPago.hora,
          concepto: nuevoPago.concepto || "Pago de clase",
          actividad: actividadPago,
          proporcion: proporcionPago,
          metodo: nuevoPago.metodo,
          monto: montoPagado,
          mes: mesPago,
          tipoPago: cobrarSinDeuda ? "sin_deuda" : "normal",
          createdAt: Timestamp.fromDate(fechaPago),
          alumno: {
            name: clientSelected.name,
            lastName: clientSelected.lastName,
            dni: clientSelected.dni || "Sin DNI",
            id: clientSelected.id,
          },
        };

        await addDoc(collection(db, "payments"), pagoFinal);
        await updateDoc(doc(db, "clients", clientSelected.id), {
          ultimoPago: nuevoPago.fecha,
          debt: nuevaDeuda,
          deudaAnterior: nuevaDeudaAnterior,
          saldoFavor: nuevoSaldoFavor,
          estado: nuevoEstado,
          ultimoMesFacturado: nuevoUltimoMes,
          ...(actividadCambio && { actividad: actividadPago }),
        });

        resetPaymentModal();
        setIsChange(true);

        Swal.fire({
          icon: "success",
          title: cobrarSinDeuda
            ? "Pago sin deuda registrado"
            : "Pago registrado",
          html: `
            <p>${cobrarSinDeuda ? "El pago fue aceptado sin generar deuda ✅" : "El pago fue registrado exitosamente ✅"}</p>
            ${actividadCambio ? `<p>📝 Actividad actualizada a <strong>${actividadPago}</strong></p>` : ""}
          `,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error al registrar pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al registrar el pago.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // ELIMINAR CLIENTE
  // ────────────────────────────────────────────────────────────────────────────

  const deleteClient = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Este alumno será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDoc(doc(db, "clients", id)).then(() => {
          setIsChange(true);
          Swal.fire("Eliminado", "El alumno ha sido borrado.", "success");
        });
      }
    });
  };

  // ────────────────────────────────────────────────────────────────────────────
  // HELPERS DE HORARIOS
  // ────────────────────────────────────────────────────────────────────────────

  const getDayName = (dateString) => {
    const dayValue = new Date(dateString).getDay();
    return DAYS_OF_WEEK.find((d) => d.value === dayValue)?.label || "";
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });

  const getScheduleSummary = (schedules) => {
    const summary = {};
    schedules.forEach((s) => {
      const dayValue = new Date(s.date).getDay();
      const dayName = getDayName(s.date);
      if (!summary[dayValue])
        summary[dayValue] = { day: dayName, hours: new Set() };
      summary[dayValue].hours.add(s.hour);
    });
    return Object.values(summary).map((item) => ({
      day: item.day,
      hours: Array.from(item.hours).sort(),
    }));
  };

  // ────────────────────────────────────────────────────────────────────────────
  // FILTRADO
  // ────────────────────────────────────────────────────────────────────────────

  const filteredClients = Array.isArray(clients)
    ? clients.filter((c) => {
        const matchAct = actividadFilter
          ? c.actividad === actividadFilter
          : true;
        const matchSearch = `${c.name || ""} ${c.lastName || ""} ${c.dni || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchAct && matchSearch;
      })
    : [];

  // ────────────────────────────────────────────────────────────────────────────
  // BLOQUE REUTILIZABLE — actividad + proporción
  // ────────────────────────────────────────────────────────────────────────────

  const renderActividadYProporcion = () => (
    <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
      <Grid item xs={12}>
        <TextField
          select
          label="Actividad"
          size="small"
          fullWidth
          value={actividadPago}
          onChange={(e) => {
            setActividadPago(e.target.value);
            setNuevoPago((prev) => ({ ...prev, concepto: e.target.value }));
          }}
        >
          {activities.map((a) => (
            <MenuItem key={a.id} value={a.label}>
              {a.label} — ${a.valor.toLocaleString("es-AR")}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField
          select
          label="Proporción del mes"
          size="small"
          fullWidth
          value={proporcionPago}
          onChange={(e) => setProporcionPago(parseFloat(e.target.value))}
        >
          {PROPORCIONES.map((p) => (
            <MenuItem key={p.factor} value={p.factor}>
              {p.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      {actividadPago && (
        <Grid item xs={12}>
          <Box
            sx={{
              p: 1,
              bgcolor: "white",
              borderRadius: 1,
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Precio calculado:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              ${precioPago.toLocaleString("es-AR")}
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ marginTop: 20 }}>
      <ActivityStats
        clients={clients}
        title="Resumen de Alumnos"
        entityLabel="alumnos"
      />

      {/* ── Barra de acciones ── */}
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
          <h3 style={{ margin: 0 }}>Lista de alumnos</h3>
          <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "gray" }}>
            {filteredClients.length} alumnos
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
            <MenuItem value="">Todas</MenuItem>
            {activities.map((a) => (
              <MenuItem key={a.id} value={a.label}>
                {a.label}
              </MenuItem>
            ))}
          </Select>
          <MonthlyBillingManager
            activities={activities}
            setIsChange={setIsChange}
          />
          {/* <FixClientData /> */}
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenPricesManager(true)}
            size="small"
          >
            Precios
          </Button>
          <Button
            variant="contained"
            onClick={() => handleOpenForm(null)}
            size="small"
          >
            + Alumno
          </Button>
        </div>
      </div>

      {/* ── Tabla ── */}
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="tabla de alumnos"
        >
          <TableHead>
            <TableRow>
              {["Nombre", "Apellido", "DNI", "Celular", "Actividad"].map(
                (col) => (
                  <TableCell
                    key={col}
                    sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
                  >
                    {col}
                  </TableCell>
                ),
              )}
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                <Tooltip title="Deuda del mes actual" arrow>
                  <span>Deuda</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.map((client) => {
              const deudaTotal =
                (client.debt || 0) + (client.deudaAnterior || 0);
              const tieneDeudaAnterior = (client.deudaAnterior || 0) > 0;
              return (
                <TableRow key={client.id}>
                  <TableCell
                    sx={{
                      color:
                        client.estado === "Deudor"
                          ? "red"
                          : client.estado === "Inactivo"
                            ? "goldenrod"
                            : "green",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                    onClick={() => handleOpenProfile(client)}
                  >
                    {client.name}
                  </TableCell>
                  <TableCell
                    sx={{ cursor: "pointer", fontSize: "0.875rem" }}
                    onClick={() => handleOpenProfile(client)}
                  >
                    {client.lastName}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>
                    {client.dni}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>
                    {client.phone}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>
                    {client.actividad || "No asignada"}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            client.estado === "Inactivo"
                              ? "goldenrod"
                              : deudaTotal > 0
                                ? "error.main"
                                : "success.main",
                          fontWeight: "bold",
                          fontSize: "0.875rem",
                        }}
                      >
                        {client.estado === "Inactivo"
                          ? "INACTIVO"
                          : `$${deudaTotal.toLocaleString("es-AR")}`}
                      </Typography>
                      {tieneDeudaAnterior && (
                        <Tooltip
                          title={`Anterior: $${client.deudaAnterior.toLocaleString("es-AR")} | Mes actual: $${(client.debt || 0).toLocaleString("es-AR")}`}
                          arrow
                        >
                          <InfoIcon
                            sx={{ fontSize: 16, color: "warning.main" }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenPaymentModal(client)}
                      color="primary"
                      title="Registrar pago"
                      size="small"
                    >
                      <PaymentIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenForm(client)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteClient(client.id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setClientForSchedule(client);
                        setOpenScheduleAssignment(true);
                      }}
                      color="secondary"
                      title="Asignar horarios"
                      size="small"
                    >
                      <AccessTimeFilledIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Modal: formulario de cliente ── */}
      <Modal open={openForm} onClose={handleCloseForm}>
        <Box sx={{ ...modalStyle, maxWidth: 600, height: "85vh" }}>
          <ClientForm
            handleClose={handleCloseForm}
            setIsChange={setIsChange}
            clientSelected={clientSelected}
            setClientSelected={setClientSelected}
          />
        </Box>
      </Modal>

      {/* ── Modal: registrar pago ── */}
      <Modal open={openPaymentModal} onClose={resetPaymentModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 1, fontSize: "1.1rem" }}>
            Registrar Pago
          </Typography>
          {clientSelected && (
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              {clientSelected.name} {clientSelected.lastName} — DNI:{" "}
              {clientSelected.dni}
            </Typography>
          )}

          {/* Tipo de pago */}
          <Box sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Tipo de Pago
            </Typography>
            <RadioGroup
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
              row
            >
              <FormControlLabel
                value="normal"
                control={<Radio size="small" />}
                label="Pago Normal"
              />
              <FormControlLabel
                value="adelantado"
                control={<Radio size="small" />}
                label="Pago Adelantado"
              />
            </RadioGroup>
          </Box>

          {/* Pago normal */}
          {tipoPago === "normal" && clientSelected && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, fontWeight: "bold" }}
              >
                Configuración del Pago
              </Typography>
              {renderActividadYProporcion()}
              {(clientSelected.debt || 0) +
                (clientSelected.deudaAnterior || 0) >
                0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cobrarSinDeuda}
                      onChange={(e) => setCobrarSinDeuda(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Cobrar sin deuda
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Acepta el pago como válido sin importar si cubre la
                        deuda total
                      </Typography>
                    </Box>
                  }
                />
              )}
            </Box>
          )}

          {/* Pago adelantado */}
          {tipoPago === "adelantado" && clientSelected && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, fontWeight: "bold" }}
              >
                Configuración de Pago Adelantado
              </Typography>
              {renderActividadYProporcion()}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Cantidad de meses"
                    type="number"
                    size="small"
                    fullWidth
                    value={mesesAdelantados}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (v > 0 && v <= 12) setMesesAdelantados(v);
                    }}
                    inputProps={{ min: 1, max: 12 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Inicio cobertura"
                    type="date"
                    size="small"
                    fullWidth
                    value={fechaInicioAdelantado}
                    onChange={(e) => setFechaInicioAdelantado(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 1.5, p: 1, bgcolor: "white", borderRadius: 1 }}>
                <Typography variant="caption" display="block">
                  <strong>Precio por mes:</strong> $
                  {precioPago.toLocaleString("es-AR")}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Total a pagar:</strong> $
                  {(precioPago * mesesAdelantados).toLocaleString("es-AR")}
                </Typography>
                {clientSelected?.saldoFavor > 0 && (
                  <>
                    <Typography
                      variant="caption"
                      display="block"
                      color="success.main"
                    >
                      <strong>Saldo a favor:</strong> -$
                      {clientSelected.saldoFavor.toLocaleString("es-AR")}
                    </Typography>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ fontWeight: "bold" }}
                    >
                      <strong>Monto final:</strong> $
                      {Math.max(
                        0,
                        precioPago * mesesAdelantados -
                          clientSelected.saldoFavor,
                      ).toLocaleString("es-AR")}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* Aviso de saldo */}
          {avisoSaldo && (
            <Alert
              severity={
                avisoSaldo.includes("favor") ||
                avisoSaldo.includes("exactamente") ||
                avisoSaldo.includes("toda la deuda") ||
                avisoSaldo.includes("Cubre")
                  ? "success"
                  : avisoSaldo.includes("Restante") ||
                      avisoSaldo.includes("anterior")
                    ? "warning"
                    : "info"
              }
              sx={{ mb: 2, fontSize: "0.8rem", whiteSpace: "pre-line" }}
            >
              {avisoSaldo}
            </Alert>
          )}

          {/* Campos de pago */}
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
                <MenuItem value="transferencia">✔ Transferencia</MenuItem>
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
              onClick={resetPaymentModal}
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
              disabled={
                !nuevoPago.monto ||
                !nuevoPago.metodo ||
                !actividadPago ||
                isSubmitting
              }
            >
              {isSubmitting
                ? "Registrando..."
                : tipoPago === "adelantado"
                  ? "Pagar Adelantado"
                  : cobrarSinDeuda
                    ? "Cobrar sin Deuda"
                    : "Registrar"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* ── Modal: perfil del cliente ── */}
      <Modal open={openProfile} onClose={handleCloseProfile}>
        <Box sx={profileModalStyle}>
          {clientSelected && (
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
                {clientSelected.name} {clientSelected.lastName}
              </Typography>

              {/* Información personal */}
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
                        <strong>DNI:</strong> {clientSelected.dni}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Celular:</strong> {clientSelected.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Dirección:</strong> {clientSelected.address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Actividad:</strong>{" "}
                        {clientSelected.actividad || "No asignada"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Proporción:</strong>{" "}
                        {PROPORCIONES.find(
                          (p) => p.factor === clientSelected.proporcion,
                        )?.label || "Mes completo"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Fecha de inicio:</strong>{" "}
                        {clientSelected.fechaInicio
                          ? new Date(
                              clientSelected.fechaInicio,
                            ).toLocaleDateString("es-ES")
                          : "No especificada"}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Estado financiero */}
              <Accordion defaultExpanded>
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
                    {/* Badge de estado */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor:
                            clientSelected.estado === "Deudor"
                              ? "#ffebee"
                              : clientSelected.estado === "Al día"
                                ? "#e8f5e9"
                                : "#fff3e0",
                          borderRadius: 1,
                          border: `2px solid ${clientSelected.estado === "Deudor" ? "#ef5350" : clientSelected.estado === "Al día" ? "#66bb6a" : "#ffa726"}`,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            textAlign: "center",
                            color:
                              clientSelected.estado === "Deudor"
                                ? "#c62828"
                                : clientSelected.estado === "Al día"
                                  ? "#2e7d32"
                                  : "#ef6c00",
                          }}
                        >
                          {clientSelected.estado}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Desglose de deuda */}
                    {((clientSelected.debt || 0) > 0 ||
                      (clientSelected.deudaAnterior || 0) > 0) && (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: "#ffebee",
                            borderRadius: 1,
                            border: "2px solid #ef5350",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: "bold",
                              mb: 1,
                              color: "#c62828",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <HistoryIcon fontSize="small" /> Desglose de Deuda:
                          </Typography>
                          {(clientSelected.deudaAnterior || 0) > 0 && (
                            <Box sx={{ mb: 1, pl: 1 }}>
                              <Typography variant="body2" color="error">
                                📅 <strong>Meses anteriores:</strong> $
                                {(
                                  clientSelected.deudaAnterior || 0
                                ).toLocaleString("es-AR")}
                              </Typography>
                            </Box>
                          )}
                          {(clientSelected.debt || 0) > 0 && (
                            <Box sx={{ mb: 1, pl: 1 }}>
                              <Typography variant="body2" color="warning.main">
                                📆 <strong>Mes actual:</strong> $
                                {(clientSelected.debt || 0).toLocaleString(
                                  "es-AR",
                                )}
                              </Typography>
                            </Box>
                          )}
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ pl: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                color: "#c62828",
                                fontSize: "1rem",
                              }}
                            >
                              💰 <strong>TOTAL DEUDA:</strong> $
                              {(
                                (clientSelected.debt || 0) +
                                (clientSelected.deudaAnterior || 0)
                              ).toLocaleString("es-AR")}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {/* Saldo a favor */}
                    {clientSelected.saldoFavor > 0 && (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: "#e8f5e9",
                            borderRadius: 1,
                            border: "2px solid #66bb6a",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color: "#2e7d32",
                              fontSize: "1rem",
                            }}
                          >
                            💚 <strong>Saldo a favor:</strong> $
                            {(clientSelected.saldoFavor || 0).toLocaleString(
                              "es-AR",
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Último pago:</strong>{" "}
                        {clientSelected.ultimoPago || "Sin pagos"}
                      </Typography>
                    </Grid>

                    {clientSelected.ultimoMesFacturado && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Último mes facturado:</strong>{" "}
                          {new Date(
                            clientSelected.ultimoMesFacturado + "-02",
                          ).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                          })}
                        </Typography>
                      </Grid>
                    )}

                    {clientSelected.mesesPagadosAdelantado && (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: "#e3f2fd",
                            borderRadius: 1,
                            border: "2px solid #42a5f5",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", color: "#1565c0" }}
                          >
                            ✅ Pagado adelantado:{" "}
                            {clientSelected.mesesPagadosAdelantado} mes(es)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Cubierto hasta:{" "}
                            {new Date(
                              clientSelected.ultimoMesFacturado + "-02",
                            ).toLocaleDateString("es-AR", {
                              year: "numeric",
                              month: "long",
                            })}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Horarios */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Horarios ({clientSchedules.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {loadingSchedules ? (
                    <Typography variant="body2">Cargando...</Typography>
                  ) : clientSchedules.length > 0 ? (
                    <>
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
                          {getScheduleSummary(clientSchedules).map((s, i) => (
                            <Chip
                              key={i}
                              label={`${s.day}: ${s.hours.join(", ")}`}
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        Próximos:
                      </Typography>
                      <Box sx={{ maxHeight: 150, overflow: "auto" }}>
                        {clientSchedules
                          .filter(
                            (s) =>
                              new Date(s.date) >=
                              new Date().setHours(0, 0, 0, 0),
                          )
                          .slice(0, 5)
                          .map((s, i) => (
                            <Box
                              key={i}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: 0.5,
                                mb: 0.5,
                                bgcolor: s.attended
                                  ? "success.light"
                                  : "grey.100",
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="caption">
                                {getDayName(s.date)} {formatDate(s.date)} -{" "}
                                {s.hour}
                              </Typography>
                              <Chip
                                label={s.attended ? "✓" : "○"}
                                color={s.attended ? "success" : "default"}
                                size="small"
                                sx={{ fontSize: "0.7rem", height: 18 }}
                              />
                            </Box>
                          ))}
                      </Box>

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
                              <strong>Total:</strong> {clientSchedules.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption">
                              <strong>Asistió:</strong>{" "}
                              {clientSchedules.filter((s) => s.attended).length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption">
                              <strong>%:</strong>{" "}
                              {clientSchedules.length > 0
                                ? Math.round(
                                    (clientSchedules.filter((s) => s.attended)
                                      .length /
                                      clientSchedules.length) *
                                      100,
                                  )
                                : 0}
                              %
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin horarios programados
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </Box>
      </Modal>

      <ActivityPricesManager
        open={openPricesManager}
        onClose={handleClosePricesManager}
        onActivityUpdate={() => {
          reloadActivities();
          setIsChange(true);
        }}
      />

      <ScheduleAssignmentModal
        open={openScheduleAssignment}
        onClose={() => {
          setOpenScheduleAssignment(false);
          setClientForSchedule(null);
        }}
        client={clientForSchedule}
        onSuccess={() => setIsChange(true)}
      />
    </div>
  );
};

export default ClientsList;
