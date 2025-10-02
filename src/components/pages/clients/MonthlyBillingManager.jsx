import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Checkbox,
  TextField,
  InputAdornment,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";

const MonthlyBillingManager = ({ activities, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [selectedClients, setSelectedClients] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const calcularCuotaCliente = (client, activities) => {
    const actividad = activities.find((a) => a.label === client.actividad);
    if (!actividad) return 0;
    return Math.round((actividad.valor * (client.proporcion || 1)) / 100) * 100;
  };

  const getMesActual = () => {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();
    return `${anio}-${String(mes).padStart(2, "0")}`;
  };

  const yaSeFacturoEsteMes = (client) => {
    const mesActual = getMesActual();
    return client.ultimoMesFacturado === mesActual;
  };

  const generarPreview = async () => {
    setIsProcessing(true);
    try {
      const clientsRef = collection(db, "clients");
      const clientsSnap = await getDocs(clientsRef);

      const clientesAFacturar = [];
      const clientesExcluidos = [];
      const selected = {};

      clientsSnap.docs.forEach((docSnap) => {
        const client = { id: docSnap.id, ...docSnap.data() };

        if (client.estado === "Inactivo") {
          clientesExcluidos.push({
            ...client,
            razon: "Cliente inactivo",
          });
          return;
        }

        if (yaSeFacturoEsteMes(client)) {
          clientesExcluidos.push({
            ...client,
            razon: "Ya facturado este mes",
          });
          return;
        }

        if (!client.actividad) {
          clientesExcluidos.push({
            ...client,
            razon: "Sin actividad asignada",
          });
          return;
        }

        const cuota = calcularCuotaCliente(client, activities);

        clientesAFacturar.push({
          ...client,
          cuotaAFacturar: cuota,
        });

        selected[client.id] = true; // Por defecto todos seleccionados
      });

      setSelectedClients(selected);
      setPreviewData({
        clientesAFacturar,
        clientesExcluidos,
        totalAFacturar: clientesAFacturar.reduce(
          (sum, c) => sum + c.cuotaAFacturar,
          0
        ),
        mesFacturacion: getMesActual(),
      });
    } catch (error) {
      console.error("Error al generar preview:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el preview de facturación",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await generarPreview();
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewData(null);
    setSelectedClients({});
    setSearchTerm("");
  };

  const toggleClientSelection = (clientId) => {
    setSelectedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = Object.values(selectedClients).every((v) => v);
    const newSelection = {};
    previewData.clientesAFacturar.forEach((client) => {
      newSelection[client.id] = !allSelected;
    });
    setSelectedClients(newSelection);
  };

  const getClientesSeleccionados = () => {
    if (!previewData) return [];
    return previewData.clientesAFacturar.filter(
      (client) => selectedClients[client.id]
    );
  };

  const getTotalSeleccionados = () => {
    return getClientesSeleccionados().reduce(
      (sum, c) => sum + c.cuotaAFacturar,
      0
    );
  };

  const ejecutarFacturacionMensual = async () => {
    const clientesSeleccionados = getClientesSeleccionados();

    if (clientesSeleccionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin clientes seleccionados",
        text: "Debes seleccionar al menos un cliente para facturar",
      });
      return;
    }

    const totalSeleccionado = getTotalSeleccionados();

    const result = await Swal.fire({
      title: "¿Confirmar facturación?",
      html: `
        <p>Se facturarán <strong>${
          clientesSeleccionados.length
        }</strong> clientes</p>
        <p>Total: <strong>$${totalSeleccionado.toLocaleString(
          "es-AR"
        )}</strong></p>
        <p>Mes: <strong>${(() => {
          const [anio, mes] = previewData.mesFacturacion.split("-");
          const fecha = new Date(parseInt(anio), parseInt(mes) - 1, 15);
          return fecha.toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
          });
        })()}</strong></p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, facturar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2196f3",
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      const mesActual = getMesActual();
      const fechaFacturacion = new Date();

      let procesados = 0;
      let errores = 0;

      for (const client of clientesSeleccionados) {
        try {
          const clientRef = doc(db, "clients", client.id);
          const cuota = client.cuotaAFacturar;

          let nuevaDeuda = client.debt || 0;
          let deudaAnterior = client.deudaAnterior || 0;
          let saldoFavor = client.saldoFavor || 0;

          if (saldoFavor > 0) {
            if (saldoFavor >= cuota) {
              saldoFavor -= cuota;
              nuevaDeuda = 0;
            } else {
              nuevaDeuda = cuota - saldoFavor;
              saldoFavor = 0;
            }
          } else {
            if (nuevaDeuda > 0) {
              deudaAnterior += nuevaDeuda;
            }
            nuevaDeuda = cuota;
          }

          let nuevoEstado;
          if (saldoFavor > 0) {
            nuevoEstado = "Al día";
          } else if (nuevaDeuda > 0) {
            nuevoEstado = "Deudor";
          } else {
            nuevoEstado = "Al día";
          }

          const updateData = {
            debt: nuevaDeuda,
            deudaAnterior: deudaAnterior,
            saldoFavor: saldoFavor,
            estado: nuevoEstado,
            ultimoMesFacturado: mesActual,
            fechaUltimaFacturacion: Timestamp.fromDate(fechaFacturacion),
          };

          batch.update(clientRef, updateData);
          procesados++;
        } catch (error) {
          console.error(`Error al procesar cliente ${client.name}:`, error);
          errores++;
        }
      }

      await batch.commit();

      setIsChange(true);
      handleClose();

      Swal.fire({
        icon: "success",
        title: "Facturación completada",
        html: `
          <p>✅ Clientes facturados: <strong>${procesados}</strong></p>
          ${errores > 0 ? `<p>⚠️ Errores: <strong>${errores}</strong></p>` : ""}
          <p>Total facturado: <strong>$${totalSeleccionado.toLocaleString(
            "es-AR"
          )}</strong></p>
        `,
        timer: 4000,
      });
    } catch (error) {
      console.error("Error en facturación mensual:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar la facturación mensual",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredClientes = previewData
    ? previewData.clientesAFacturar.filter((client) =>
        `${client.name} ${client.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarMonthIcon />}
        onClick={handleOpen}
        size="small"
        color="primary"
      >
        Facturar Mes
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Facturación Mensual Automática</DialogTitle>

        <DialogContent>
          {isProcessing && <LinearProgress sx={{ mb: 2 }} />}

          {previewData && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Mes a facturar:</strong>{" "}
                  {(() => {
                    const [anio, mes] = previewData.mesFacturacion.split("-");
                    const fecha = new Date(
                      parseInt(anio),
                      parseInt(mes) - 1,
                      15
                    );
                    return fecha.toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                    });
                  })()}
                </Typography>
              </Alert>

              {previewData.clientesAFacturar.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6">Clientes a facturar</Typography>
                      <Chip
                        label={`${getClientesSeleccionados().length}/${
                          previewData.clientesAFacturar.length
                        }`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Button size="small" onClick={toggleSelectAll}>
                      {Object.values(selectedClients).every((v) => v)
                        ? "Deseleccionar todos"
                        : "Seleccionar todos"}
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box
                    sx={{
                      maxHeight: 300,
                      overflow: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <List dense>
                      {filteredClientes.map((client) => (
                        <ListItem
                          key={client.id}
                          sx={{
                            bgcolor: selectedClients[client.id]
                              ? "primary.light"
                              : "grey.50",
                            mb: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                          }}
                          onClick={() => toggleClientSelection(client.id)}
                        >
                          <Checkbox
                            checked={selectedClients[client.id] || false}
                            size="small"
                          />
                          <ListItemText
                            primary={`${client.name} ${client.lastName}`}
                            secondary={
                              <>
                                <Typography component="span" variant="body2">
                                  {client.actividad} -
                                </Typography>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="primary"
                                  sx={{ fontWeight: "bold", ml: 0.5 }}
                                >
                                  Nueva cuota: $
                                  {client.cuotaAFacturar.toLocaleString(
                                    "es-AR"
                                  )}
                                </Typography>
                                {client.debt > 0 && (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="error"
                                    sx={{ ml: 1 }}
                                  >
                                    + Deuda actual: $
                                    {client.debt.toLocaleString("es-AR")}
                                  </Typography>
                                )}
                                {client.saldoFavor > 0 && (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="success.main"
                                    sx={{ ml: 1 }}
                                  >
                                    (Saldo a favor: $
                                    {client.saldoFavor.toLocaleString("es-AR")})
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "primary.light",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h6" color="primary.contrastText">
                      Total a facturar: $
                      {getTotalSeleccionados().toLocaleString("es-AR")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="primary.contrastText"
                      sx={{ opacity: 0.8 }}
                    >
                      {getClientesSeleccionados().length} clientes seleccionados
                    </Typography>
                  </Box>
                </Box>
              )}

              {previewData.clientesExcluidos.length > 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Clientes excluidos
                    <Chip
                      label={previewData.clientesExcluidos.length}
                      color="default"
                      size="small"
                    />
                  </Typography>

                  <Box
                    sx={{
                      maxHeight: 200,
                      overflow: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <List dense>
                      {previewData.clientesExcluidos.map((client) => (
                        <ListItem
                          key={client.id}
                          sx={{ bgcolor: "grey.100", mb: 0.5, borderRadius: 1 }}
                        >
                          <ListItemText
                            primary={`${client.name} ${client.lastName}`}
                            secondary={client.razon}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            onClick={ejecutarFacturacionMensual}
            variant="contained"
            disabled={
              isProcessing ||
              !previewData ||
              getClientesSeleccionados().length === 0
            }
          >
            Confirmar Facturación
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MonthlyBillingManager;
