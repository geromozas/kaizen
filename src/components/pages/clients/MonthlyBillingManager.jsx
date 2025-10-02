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
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
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

  // Función para calcular la cuota del cliente
  const calcularCuotaCliente = (client, activities) => {
    const actividad = activities.find((a) => a.label === client.actividad);
    if (!actividad) return 0;
    return Math.round((actividad.valor * (client.proporcion || 1)) / 100) * 100;
  };

  // Función para obtener el mes/año actual
  const getMesActual = () => {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();
    return `${anio}-${String(mes).padStart(2, "0")}`;
  };

  // Función para verificar si ya se facturó este mes
  const yaSeFacturoEsteMes = (client) => {
    const mesActual = getMesActual();
    return client.ultimoMesFacturado === mesActual;
  };

  // Preview de clientes a facturar
  const generarPreview = async () => {
    setIsProcessing(true);
    try {
      const clientsRef = collection(db, "clients");
      const clientsSnap = await getDocs(clientsRef);

      const clientesAFacturar = [];
      const clientesExcluidos = [];

      clientsSnap.docs.forEach((docSnap) => {
        const client = { id: docSnap.id, ...docSnap.data() };

        // Excluir si está inactivo
        if (client.estado === "Inactivo") {
          clientesExcluidos.push({
            ...client,
            razon: "Cliente inactivo",
          });
          return;
        }

        // Excluir si ya se facturó este mes
        if (yaSeFacturoEsteMes(client)) {
          clientesExcluidos.push({
            ...client,
            razon: "Ya facturado este mes",
          });
          return;
        }

        // Excluir si no tiene actividad asignada
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
      });

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
  };

  // Función principal de facturación mensual
  const ejecutarFacturacionMensual = async () => {
    if (!previewData || previewData.clientesAFacturar.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin clientes para facturar",
        text: "No hay clientes activos pendientes de facturación",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Confirmar facturación?",
      html: `
        <p>Se facturarán <strong>${
          previewData.clientesAFacturar.length
        }</strong> clientes</p>
        <p>Total: <strong>$${previewData.totalAFacturar.toLocaleString(
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

      for (const client of previewData.clientesAFacturar) {
        try {
          const clientRef = doc(db, "clients", client.id);
          const cuota = client.cuotaAFacturar;

          // Calcular nueva deuda
          let nuevaDeuda = client.debt || 0;
          let deudaAnterior = client.deudaAnterior || 0;
          let saldoFavor = client.saldoFavor || 0;

          if (saldoFavor > 0) {
            // Si tiene saldo a favor, descontarlo de la nueva cuota
            if (saldoFavor >= cuota) {
              saldoFavor -= cuota;
              nuevaDeuda = 0;
            } else {
              nuevaDeuda = cuota - saldoFavor;
              saldoFavor = 0;
            }
          } else {
            // Si tenía deuda anterior, pasarla a deudaAnterior
            if (nuevaDeuda > 0) {
              deudaAnterior += nuevaDeuda;
            }
            nuevaDeuda = cuota;
          }

          // Determinar nuevo estado
          let nuevoEstado;
          if (saldoFavor > 0) {
            nuevoEstado = "Al día";
          } else if (nuevaDeuda > 0) {
            nuevoEstado = "Deudor";
          } else {
            nuevoEstado = "Al día";
          }

          // Actualizar cliente
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

      // Ejecutar el batch
      await batch.commit();

      // Actualizar la vista
      setIsChange(true);
      handleClose();

      // Mostrar resultado
      Swal.fire({
        icon: "success",
        title: "Facturación completada",
        html: `
          <p>✅ Clientes facturados: <strong>${procesados}</strong></p>
          ${errores > 0 ? `<p>⚠️ Errores: <strong>${errores}</strong></p>` : ""}
          <p>Total facturado: <strong>$${previewData.totalAFacturar.toLocaleString(
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
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Clientes a facturar
                    <Chip
                      label={previewData.clientesAFacturar.length}
                      color="primary"
                      size="small"
                    />
                  </Typography>

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
                      {previewData.clientesAFacturar.map((client) => (
                        <ListItem
                          key={client.id}
                          sx={{ bgcolor: "grey.50", mb: 0.5, borderRadius: 1 }}
                        >
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
                                  $
                                  {client.cuotaAFacturar.toLocaleString(
                                    "es-AR"
                                  )}
                                </Typography>
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
                      {previewData.totalAFacturar.toLocaleString("es-AR")}
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
              previewData.clientesAFacturar.length === 0
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
