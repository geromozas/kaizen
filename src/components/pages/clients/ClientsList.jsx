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

import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { useActivities } from "../activities/useActivities";
import { db } from "../../../firebaseConfig";
import { ClientForm } from "./ClientForm";
import { ActivityPricesManager } from "../activities/ActivityPricesManager";
import { Timestamp } from "firebase/firestore";
import Swal from "sweetalert2";
import ActivityStats from "../activities/ActivityStats";
import MonthlyBillingManager from "./MonthlyBillingManager";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { ScheduleAssignmentModal } from "./ScheduleAssignmentModal ";

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
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 500,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
  overflow: "auto",
};

const daysOfWeek = [
  { key: "sunday", label: "Dom", value: 0 },
  { key: "monday", label: "Lun", value: 1 },
  { key: "tuesday", label: "Mar", value: 2 },
  { key: "wednesday", label: "Mié", value: 3 },
  { key: "thursday", label: "Jue", value: 4 },
  { key: "friday", label: "Vie", value: 5 },
  { key: "saturday", label: "Sáb", value: 6 },
];

const ClientsList = ({ clients = [], setIsChange }) => {
  const [openForm, setOpenForm] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPricesManager, setOpenPricesManager] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [clientSelected, setClientSelected] = useState(null);
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSchedules, setClientSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [avisoSaldo, setAvisoSaldo] = useState("");

  const [tipoPago, setTipoPago] = useState("normal");
  const [mesesAdelantados, setMesesAdelantados] = useState(1);
  const [fechaInicioAdelantado, setFechaInicioAdelantado] = useState("");
  const [cobrarSinDeuda, setCobrarSinDeuda] = useState(false);

  const [openScheduleAssignment, setOpenScheduleAssignment] = useState(false);
  const [clientForSchedule, setClientForSchedule] = useState(null);

  const [nuevoPago, setNuevoPago] = useState({
    concepto: "",
    metodo: "",
    monto: "",
    fecha: new Date().toLocaleDateString("es-AR"),
    hora: new Date().toLocaleTimeString("es-AR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  const { activities = [], reloadActivities } = useActivities();

  const handleCloseForm = () => setOpenForm(false);
  const handleCloseProfile = () => {
    setOpenProfile(false);
    setClientSchedules([]);
  };

  const handleClosePricesManager = () => setOpenPricesManager(false);

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setClientSelected(null);
    setTipoPago("normal");
    setMesesAdelantados(1);
    setFechaInicioAdelantado("");
    setCobrarSinDeuda(false);
    setNuevoPago({
      concepto: "",
      metodo: "",
      monto: "",
      fecha: new Date().toLocaleDateString("es-AR"),
      hora: new Date().toLocaleTimeString("es-AR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setAvisoSaldo("");
  };

  const handleOpenForm = (client) => {
    setClientSelected(client);
    setOpenForm(true);
  };

  const getPrecioCuotaCliente = (client) => {
    const actividad = activities.find((a) => a.label === client.actividad);
    if (!actividad) return 0;
    return Math.round((actividad.valor * (client.proporcion || 1)) / 100) * 100;
  };

  const calcularFechaInicioAdelantado = (client) => {
    const hoy = new Date();
    const ultimoMesFacturado = client.ultimoMesFacturado;

    if (ultimoMesFacturado) {
      const [anio, mes] = ultimoMesFacturado.split("-").map(Number);
      const siguienteMes = new Date(anio, mes, 1);
      return siguienteMes.toISOString().split("T")[0];
    } else {
      const mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return mesActual.toISOString().split("T")[0];
    }
  };

  const handleOpenPaymentModal = (client) => {
    setClientSelected(client);
    setCobrarSinDeuda(false);

    let aviso = "";
    const deudaTotal = (client.debt || 0) + (client.deudaAnterior || 0);

    if (client.saldoFavor > 0) {
      aviso = `💚 Saldo a favor: $${client.saldoFavor.toLocaleString("es-AR")}`;
    } else if (deudaTotal > 0) {
      if (client.deudaAnterior && client.deudaAnterior > 0) {
        aviso = `💰 Deuda total: $${deudaTotal.toLocaleString(
          "es-AR"
        )} (Meses anteriores: $${client.deudaAnterior.toLocaleString(
          "es-AR"
        )} + Mes actual: $${(client.debt || 0).toLocaleString("es-AR")})`;
      } else {
        aviso = `💰 Deuda mes actual: $${(client.debt || 0).toLocaleString(
          "es-AR"
        )}`;
      }
    } else {
      aviso = "✅ Al día - Sin deudas";
    }
    setAvisoSaldo(aviso);

    const conceptoPrecargado = client.actividad
      ? `${client.actividad}`
      : "Pago de clase";

    const fechaInicio = calcularFechaInicioAdelantado(client);
    setFechaInicioAdelantado(fechaInicio);

    setNuevoPago({
      concepto: conceptoPrecargado,
      metodo: "",
      monto: "",
      fecha: new Date().toLocaleDateString("es-AR"),
      hora: new Date().toLocaleTimeString("es-AR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setOpenPaymentModal(true);
  };

  const handleOpenProfile = async (client) => {
    setClientSelected(client);
    setLoadingSchedules(true);

    try {
      const schedulesRef = collection(db, "schedules");
      const schedulesSnap = await getDocs(schedulesRef);

      const clientSchedulesList = [];

      schedulesSnap.docs.forEach((doc) => {
        const scheduleData = doc.data();
        const clientInSchedule = scheduleData.clients?.find(
          (c) => c.id === client.id
        );

        if (clientInSchedule) {
          clientSchedulesList.push({
            id: doc.id,
            date: scheduleData.date,
            hour: scheduleData.hour,
            attended: clientInSchedule.attended || false,
          });
        }
      });

      clientSchedulesList.sort((a, b) => {
        if (a.date === b.date) {
          return a.hour.localeCompare(b.hour);
        }
        return a.date.localeCompare(b.date);
      });

      setClientSchedules(clientSchedulesList);
    } catch (error) {
      console.error("Error al cargar horarios del cliente:", error);
    } finally {
      setLoadingSchedules(false);
    }

    setOpenProfile(true);
  };

  const handleOpenPricesManager = () => {
    setOpenPricesManager(true);
  };

  const handleActivityUpdate = () => {
    reloadActivities();
    setIsChange(true);
  };

  useEffect(() => {
    if (clientSelected && nuevoPago.monto) {
      const monto = parseInt(nuevoPago.monto);
      if (isNaN(monto) || monto <= 0) return;

      let avisoDetallado = "";
      const saldoFavorActual = clientSelected.saldoFavor || 0;
      const deudaActual = clientSelected.debt || 0;
      const deudaAnterior = clientSelected.deudaAnterior || 0;
      const deudaTotal = deudaActual + deudaAnterior;
      const precioCuota = getPrecioCuotaCliente(clientSelected);

      if (tipoPago === "adelantado") {
        const montoTotal = precioCuota * mesesAdelantados;
        let montoAPagar = montoTotal;

        if (saldoFavorActual > 0) {
          if (saldoFavorActual >= montoTotal) {
            avisoDetallado = `✅ El saldo a favor ($${saldoFavorActual.toLocaleString(
              "es-AR"
            )}) cubre los ${mesesAdelantados} mes(es). Sobrante: $${(
              saldoFavorActual - montoTotal
            ).toLocaleString("es-AR")}`;
          } else {
            montoAPagar = montoTotal - saldoFavorActual;
            avisoDetallado = `💰 Total: $${montoTotal.toLocaleString(
              "es-AR"
            )} - Saldo: $${saldoFavorActual.toLocaleString(
              "es-AR"
            )} = A pagar: $${montoAPagar.toLocaleString("es-AR")}`;
          }
        } else {
          avisoDetallado = `📅 ${mesesAdelantados} mes(es) x $${precioCuota.toLocaleString(
            "es-AR"
          )} = $${montoTotal.toLocaleString("es-AR")}`;
        }

        if (monto !== montoAPagar && montoAPagar > 0) {
          avisoDetallado += `\n💡 Sugerido: $${montoAPagar.toLocaleString(
            "es-AR"
          )}`;
        }
      } else {
        if (cobrarSinDeuda) {
          if (monto >= deudaTotal) {
            const sobrante = monto - deudaTotal;
            avisoDetallado = `✅ Se cobrará sin deuda. Cliente quedará "Al día"${
              sobrante > 0
                ? ` con $${sobrante.toLocaleString("es-AR")} a favor`
                : ""
            }`;
          } else {
            const diferencia = deudaTotal - monto;
            avisoDetallado = `✅ Se cobrará sin deuda. Cliente quedará "Al día" (se le descuenta $${diferencia.toLocaleString(
              "es-AR"
            )})`;
          }
        } else {
          if (saldoFavorActual > 0) {
            const nuevoSaldoFavor = saldoFavorActual + monto;
            avisoDetallado = `💚 Nuevo saldo a favor: $${nuevoSaldoFavor.toLocaleString(
              "es-AR"
            )}`;
          } else if (deudaTotal > 0) {
            if (monto > deudaTotal) {
              const saldoFavor = monto - deudaTotal;
              avisoDetallado = `🎉 Cubre toda la deuda ($${deudaTotal.toLocaleString(
                "es-AR"
              )}) + $${saldoFavor.toLocaleString("es-AR")} a favor`;
            } else if (monto === deudaTotal) {
              avisoDetallado = `✅ Cubre exactamente toda la deuda ($${deudaTotal.toLocaleString(
                "es-AR"
              )})`;
            } else {
              const deudaRestante = deudaTotal - monto;

              if (deudaAnterior > 0) {
                if (monto >= deudaAnterior) {
                  const sobrante = monto - deudaAnterior;
                  avisoDetallado = `✅ Cubre deuda anterior completa ($${deudaAnterior.toLocaleString(
                    "es-AR"
                  )}) + $${sobrante.toLocaleString(
                    "es-AR"
                  )} de mes actual. Restante: $${deudaRestante.toLocaleString(
                    "es-AR"
                  )}`;
                } else {
                  const nuevaDeudaAnterior = deudaAnterior - monto;
                  avisoDetallado = `⚠️ Se aplica a deuda anterior. Nueva deuda anterior: $${nuevaDeudaAnterior.toLocaleString(
                    "es-AR"
                  )}. Total restante: $${deudaRestante.toLocaleString(
                    "es-AR"
                  )}`;
                }
              } else {
                avisoDetallado = `⚠️ Cubre $${monto.toLocaleString(
                  "es-AR"
                )} de deuda. Restante: $${deudaRestante.toLocaleString(
                  "es-AR"
                )}`;
              }
            }
          } else {
            avisoDetallado = `💚 Generará saldo a favor de $${monto.toLocaleString(
              "es-AR"
            )}`;
          }
        }
      }

      setAvisoSaldo(avisoDetallado);
    }
  }, [
    nuevoPago.monto,
    clientSelected,
    tipoPago,
    mesesAdelantados,
    cobrarSinDeuda,
  ]);

  const handleRegistrarPago = async () => {
    if (!clientSelected || !nuevoPago.monto || !nuevoPago.metodo) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Complete todos los campos obligatorios.",
      });
      return;
    }

    const montoPagado = parseInt(nuevoPago.monto);
    const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
    const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;
    const fechaPago = new Date(anio, mes - 1, dia);

    if (tipoPago === "adelantado") {
      const precioCuota = getPrecioCuotaCliente(clientSelected);
      const montoTotalNecesario = precioCuota * mesesAdelantados;
      const saldoFavorActual = clientSelected.saldoFavor || 0;

      let montoFaltante = montoTotalNecesario - saldoFavorActual;
      if (montoFaltante < 0) montoFaltante = 0;

      if (
        saldoFavorActual < montoTotalNecesario &&
        montoPagado < montoFaltante
      ) {
        Swal.fire({
          icon: "warning",
          title: "Monto insuficiente",
          text: `Para ${mesesAdelantados} mes(es) necesitas pagar al menos $${montoFaltante.toLocaleString(
            "es-AR"
          )} (considerando saldo a favor de $${saldoFavorActual.toLocaleString(
            "es-AR"
          )})`,
        });
        return;
      }

      let saldoTotal = saldoFavorActual + montoPagado;
      let nuevoSaldoFavor = 0;

      if (saldoTotal >= montoTotalNecesario) {
        nuevoSaldoFavor = saldoTotal - montoTotalNecesario;
      }

      const fechaInicio = new Date(fechaInicioAdelantado);
      const ultimoMesPagado = new Date(
        fechaInicio.getFullYear(),
        fechaInicio.getMonth() + mesesAdelantados - 1,
        1
      );
      const ultimoMesFacturado = `${ultimoMesPagado.getFullYear()}-${String(
        ultimoMesPagado.getMonth() + 1
      ).padStart(2, "0")}`;

      const pagoFinal = {
        fecha: nuevoPago.fecha,
        hora: nuevoPago.hora,
        concepto: `${nuevoPago.concepto} - ${mesesAdelantados} mes(es) adelantado(s)`,
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

      const updateData = {
        ultimoPago: nuevoPago.fecha,
        debt: 0,
        deudaAnterior: 0,
        saldoFavor: nuevoSaldoFavor,
        estado: "Al día",
        ultimoMesFacturado: ultimoMesFacturado,
        mesesPagadosAdelantado: mesesAdelantados,
      };

      try {
        await addDoc(collection(db, "payments"), pagoFinal);
        const clientRef = doc(db, "clients", clientSelected.id);
        await updateDoc(clientRef, updateData);

        handleClosePaymentModal();
        setIsChange(true);

        Swal.fire({
          icon: "success",
          title: "Pago adelantado registrado",
          html: `
            <p>✅ ${mesesAdelantados} mes(es) pagado(s)</p>
            <p>📅 Cobertura hasta: ${new Date(
              ultimoMesFacturado + "-01"
            ).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
            })}</p>
            ${
              nuevoSaldoFavor > 0
                ? `<p>💚 Saldo a favor: $${nuevoSaldoFavor.toLocaleString(
                    "es-AR"
                  )}</p>`
                : ""
            }
          `,
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al registrar pago adelantado:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al registrar el pago adelantado",
        });
      }
    } else {
      const pagoFinal = {
        fecha: nuevoPago.fecha,
        hora: nuevoPago.hora,
        concepto: nuevoPago.concepto || "Pago de clase",
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

      const deudaActual = clientSelected.debt || 0;
      const saldoFavorActual = clientSelected.saldoFavor || 0;
      const deudaAnterior = clientSelected.deudaAnterior || 0;
      const deudaTotal = deudaActual + deudaAnterior;

      let nuevaDeuda = 0;
      let nuevoSaldoFavor = 0;
      let nuevoEstado = "Al día";
      let nuevaDeudaAnterior = 0;

      if (cobrarSinDeuda) {
        nuevaDeuda = 0;
        nuevaDeudaAnterior = 0;

        if (montoPagado > deudaTotal) {
          nuevoSaldoFavor = montoPagado - deudaTotal;
        } else {
          nuevoSaldoFavor = 0;
        }

        nuevoEstado = "Al día";
      } else {
        if (saldoFavorActual > 0) {
          nuevoSaldoFavor = saldoFavorActual + montoPagado;
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
            nuevoSaldoFavor = 0;

            if (montoPagado >= deudaAnterior) {
              const sobrante = montoPagado - deudaAnterior;
              nuevaDeudaAnterior = 0;
              nuevaDeuda = deudaActual - sobrante;
            } else {
              nuevaDeudaAnterior = deudaAnterior - montoPagado;
              nuevaDeuda = deudaActual;
            }

            nuevoEstado = "Deudor";
          }
        } else {
          nuevoSaldoFavor = montoPagado;
          nuevaDeuda = 0;
          nuevaDeudaAnterior = 0;
          nuevoEstado = "Al día";
        }
      }

      const updateData = {
        ultimoPago: nuevoPago.fecha,
        debt: nuevaDeuda,
        deudaAnterior: nuevaDeudaAnterior,
        saldoFavor: nuevoSaldoFavor,
        estado: nuevoEstado,
      };

      try {
        await addDoc(collection(db, "payments"), pagoFinal);
        const clientRef = doc(db, "clients", clientSelected.id);
        await updateDoc(clientRef, updateData);

        handleClosePaymentModal();
        setIsChange(true);

        Swal.fire({
          icon: "success",
          title: cobrarSinDeuda
            ? "Pago sin deuda registrado"
            : "Pago registrado",
          text: cobrarSinDeuda
            ? "El pago fue aceptado sin generar deuda ✅"
            : "El pago fue registrado exitosamente ✅",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al registrar pago:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al registrar el pago",
        });
      }
    }
  };

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

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const dayValue = date.getDay();
    return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getScheduleSummary = (schedules) => {
    const summary = {};

    schedules.forEach((schedule) => {
      const date = new Date(schedule.date);
      const dayValue = date.getDay();
      const dayName = getDayName(schedule.date);

      if (!summary[dayValue]) {
        summary[dayValue] = {
          day: dayName,
          hours: new Set(),
        };
      }

      summary[dayValue].hours.add(schedule.hour);
    });

    return Object.values(summary).map((item) => ({
      day: item.day,
      hours: Array.from(item.hours).sort(),
    }));
  };

  const filteredClients = Array.isArray(clients)
    ? clients.filter((client) => {
        const matchesActividad = actividadFilter
          ? client.actividad === actividadFilter
          : true;
        const matchesSearch = `${client.name || ""} ${client.lastName || ""} ${
          client.dni || ""
        }`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesActividad && matchesSearch;
      })
    : [];

  const handleOpenScheduleAssignment = (client) => {
    setClientForSchedule(client);
    setOpenScheduleAssignment(true);
  };

  const handleCloseScheduleAssignment = () => {
    setOpenScheduleAssignment(false);
    setClientForSchedule(null);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <ActivityStats
        clients={clients}
        title="Resumen de Alumnos"
        entityLabel="alumnos"
      />
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
            {Array.isArray(activities) &&
              activities.map((actividad) => (
                <MenuItem key={actividad.id} value={actividad.label}>
                  {actividad.label}
                </MenuItem>
              ))}
          </Select>
          <MonthlyBillingManager
            activities={activities}
            setIsChange={setIsChange}
          />
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleOpenPricesManager}
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

      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="tabla de alumnos"
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Nombre
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Apellido
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                DNI
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Celular
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Actividad
              </TableCell>
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
                            (client.estado === "Inactivo" ? 0 : deudaTotal) > 0
                              ? "error.main"
                              : "success.main",
                          fontWeight: "bold",
                          fontSize: "0.875rem",
                        }}
                      >
                        $
                        {client.estado === "Inactivo"
                          ? 0
                          : deudaTotal.toLocaleString("es-AR")}
                      </Typography>
                      {tieneDeudaAnterior && client.estado !== "Inactivo" && (
                        <Tooltip
                          title={`Deuda anterior: ${client.deudaAnterior.toLocaleString(
                            "es-AR"
                          )} | Mes actual: ${(client.debt || 0).toLocaleString(
                            "es-AR"
                          )}`}
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
                      onClick={() => handleOpenScheduleAssignment(client)}
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

      <Modal open={openForm} onClose={handleCloseForm}>
        <Box
          sx={{ ...modalStyle, width: "90vw", maxWidth: 600, height: "85vh" }}
        >
          <ClientForm
            handleClose={handleCloseForm}
            setIsChange={setIsChange}
            clientSelected={clientSelected}
            setClientSelected={setClientSelected}
          />
        </Box>
      </Modal>

      <Modal open={openPaymentModal} onClose={handleClosePaymentModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 1, fontSize: "1.1rem" }}>
            Registrar Pago
          </Typography>
          {clientSelected && (
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              {clientSelected.name} {clientSelected.lastName} - DNI:{" "}
              {clientSelected.dni}
            </Typography>
          )}

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

          {tipoPago === "normal" &&
            clientSelected &&
            (clientSelected.debt || 0) + (clientSelected.deudaAnterior || 0) >
              0 && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
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
                        deuda total (útil para descuentos o reserva de lugar)
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            )}

          {tipoPago === "adelantado" && clientSelected && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, fontWeight: "bold" }}
              >
                Configuración de Pago Adelantado
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Cantidad de meses"
                    type="number"
                    size="small"
                    fullWidth
                    value={mesesAdelantados}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0 && val <= 12) {
                        setMesesAdelantados(val);
                      }
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
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 1.5, p: 1, bgcolor: "white", borderRadius: 1 }}>
                <Typography variant="caption" display="block">
                  <strong>Precio por mes:</strong> $
                  {getPrecioCuotaCliente(clientSelected).toLocaleString(
                    "es-AR"
                  )}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Total a pagar:</strong> $
                  {(
                    getPrecioCuotaCliente(clientSelected) * mesesAdelantados
                  ).toLocaleString("es-AR")}
                </Typography>
                {clientSelected.saldoFavor > 0 && (
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
                        getPrecioCuotaCliente(clientSelected) *
                          mesesAdelantados -
                          clientSelected.saldoFavor
                      ).toLocaleString("es-AR")}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}

          {avisoSaldo && (
            <Alert
              severity={
                avisoSaldo.includes("favor") ||
                avisoSaldo.includes("exactamente") ||
                avisoSaldo.includes("toda la deuda") ||
                avisoSaldo.includes("cubre") ||
                avisoSaldo.includes("condonan")
                  ? "success"
                  : avisoSaldo.includes("Restante") ||
                    avisoSaldo.includes("anterior")
                  ? "warning"
                  : "info"
              }
              sx={{ mb: 2, fontSize: "0.8rem" }}
            >
              {avisoSaldo}
            </Alert>
          )}

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
                <MenuItem value="transferencia">✔ Transfer.</MenuItem>
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
              onClick={handleClosePaymentModal}
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
              disabled={!nuevoPago.monto || !nuevoPago.metodo}
            >
              {tipoPago === "adelantado"
                ? "Pagar Adelantado"
                : cobrarSinDeuda
                ? "Cobrar sin Deuda"
                : "Registrar"}
            </Button>
          </Box>
        </Box>
      </Modal>

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
                        <strong>Fecha de inicio:</strong>{" "}
                        {clientSelected.fechaInicio
                          ? new Date(
                              clientSelected.fechaInicio
                            ).toLocaleDateString("es-ES")
                          : "No especificada"}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

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
                          border: `2px solid ${
                            clientSelected.estado === "Deudor"
                              ? "#ef5350"
                              : clientSelected.estado === "Al día"
                              ? "#66bb6a"
                              : "#ffa726"
                          }`,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            color:
                              clientSelected.estado === "Deudor"
                                ? "#c62828"
                                : clientSelected.estado === "Al día"
                                ? "#2e7d32"
                                : "#ef6c00",
                            textAlign: "center",
                          }}
                        >
                          {clientSelected.estado}
                        </Typography>
                      </Box>
                    </Grid>

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
                            <HistoryIcon fontSize="small" />
                            Desglose de Deuda:
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
                                  "es-AR"
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
                              "es-AR"
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
                            clientSelected.ultimoMesFacturado + "-01"
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
                              clientSelected.ultimoMesFacturado + "-01"
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
                          {getScheduleSummary(clientSchedules).map(
                            (summary, index) => (
                              <Chip
                                key={index}
                                label={`${summary.day}: ${summary.hours.join(
                                  ", "
                                )}`}
                                variant="outlined"
                                size="small"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            )
                          )}
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
                            (schedule) =>
                              new Date(schedule.date) >=
                              new Date().setHours(0, 0, 0, 0)
                          )
                          .slice(0, 5)
                          .map((schedule, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: 0.5,
                                mb: 0.5,
                                bgcolor: schedule.attended
                                  ? "success.light"
                                  : "grey.100",
                                borderRadius: 1,
                                fontSize: "0.75rem",
                              }}
                            >
                              <Box>
                                <Typography variant="caption">
                                  {getDayName(schedule.date)}{" "}
                                  {formatDate(schedule.date)} - {schedule.hour}
                                </Typography>
                              </Box>
                              <Chip
                                label={schedule.attended ? "✓" : "○"}
                                color={
                                  schedule.attended ? "success" : "default"
                                }
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
                                      100
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
        onActivityUpdate={handleActivityUpdate}
      />
      <ScheduleAssignmentModal
        open={openScheduleAssignment}
        onClose={handleCloseScheduleAssignment}
        client={clientForSchedule}
        onSuccess={() => {
          setIsChange(true);
        }}
      />
    </div>
  );
};

export default ClientsList;
