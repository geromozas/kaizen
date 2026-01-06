import { useState } from "react";
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
  Chip,
  Paper,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import Swal from "sweetalert2";

const FixClientData = () => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [hasRunFix, setHasRunFix] = useState(false);

  const calcularEstadoCorrecto = (debt, deudaAnterior, saldoFavor) => {
    const deudaTotal = (debt || 0) + (deudaAnterior || 0);

    // SI TIENE DEUDA (debt o deudaAnterior), debe ser DEUDOR
    if (deudaTotal > 0) {
      return "Deudor";
    } else if (saldoFavor > 0) {
      return "Saldo a favor";
    } else {
      return "Al día";
    }
  };
  const analizarClientes = async () => {
    setIsProcessing(true);
    try {
      const clientsRef = collection(db, "clients");
      const clientsSnap = await getDocs(clientsRef);

      const clientesConProblemas = [];
      const clientesCorrectos = [];

      clientsSnap.docs.forEach((docSnap) => {
        const client = { id: docSnap.id, ...docSnap.data() };

        const debt = client.debt || 0;
        const deudaAnterior = client.deudaAnterior || 0;
        const saldoFavor = client.saldoFavor || 0;
        const estadoActual = client.estado;
        const deudaTotal = debt + deudaAnterior;

        const estadoCorrecto = calcularEstadoCorrecto(
          debt,
          deudaAnterior,
          saldoFavor
        );

        const tieneProblema =
          estadoActual !== estadoCorrecto ||
          (estadoActual === "Inactivo" && deudaTotal > 0);

        if (tieneProblema) {
          clientesConProblemas.push({
            ...client,
            estadoActual,
            estadoCorrecto,
            deudaTotal,
            problema:
              estadoActual === "Inactivo" && deudaTotal > 0
                ? "Inactivo con deuda"
                : "Estado incorrecto",
          });
        } else {
          clientesCorrectos.push(client);
        }
      });

      setPreviewData({
        clientesConProblemas,
        clientesCorrectos,
        total: clientsSnap.docs.length,
      });
    } catch (error) {
      console.error("Error al analizar clientes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo analizar los datos de clientes",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    setHasRunFix(false);
    await analizarClientes();
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewData(null);
  };

  const ejecutarCorreccion = async () => {
    if (!previewData || previewData.clientesConProblemas.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin problemas",
        text: "No hay clientes que necesiten corrección",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Confirmar corrección?",
      html: `
        <p>Se corregirán <strong>${previewData.clientesConProblemas.length}</strong> clientes</p>
        <p style="color: #f57c00;"><strong>⚠️ Esta acción actualizará los estados en Firebase</strong></p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, corregir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2196f3",
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      let procesados = 0;
      let errores = 0;

      for (const client of previewData.clientesConProblemas) {
        try {
          const clientRef = doc(db, "clients", client.id);
          batch.update(clientRef, {
            estado: client.estadoCorrecto,
          });
          procesados++;
        } catch (error) {
          console.error(`Error al corregir cliente ${client.name}:`, error);
          errores++;
        }
      }

      await batch.commit();
      setHasRunFix(true);

      Swal.fire({
        icon: "success",
        title: "Corrección completada",
        html: `
          <p>✅ Clientes corregidos: <strong>${procesados}</strong></p>
          ${errores > 0 ? `<p>⚠️ Errores: <strong>${errores}</strong></p>` : ""}
          <p style="color: #4caf50;">Los estados ahora reflejan correctamente las deudas</p>
        `,
        timer: 4000,
      });

      await analizarClientes();
    } catch (error) {
      console.error("Error en corrección de datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al corregir los datos",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<BuildIcon />}
        onClick={handleOpen}
        size="small"
        color="warning"
        sx={{ ml: 1 }}
      >
        Corregir Datos
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BuildIcon />
            <Typography variant="h6">
              Corrección de Estados de Clientes
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isProcessing && <LinearProgress sx={{ mb: 2 }} />}

          <Alert severity="info" sx={{ mb: 2 }}>
            Esta herramienta corrige los estados de los clientes que no
            coinciden con sus deudas reales.
          </Alert>

          {previewData && (
            <>
              <Box sx={{ mb: 3 }}>
                <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", mb: 2 }}
                  >
                    Resumen del Análisis
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Chip
                      label={`Total: ${previewData.total}`}
                      color="default"
                    />
                    <Chip
                      label={`Con problemas: ${previewData.clientesConProblemas.length}`}
                      color={
                        previewData.clientesConProblemas.length > 0
                          ? "error"
                          : "default"
                      }
                    />
                    <Chip
                      label={`Correctos: ${previewData.clientesCorrectos.length}`}
                      color="success"
                    />
                  </Box>
                </Paper>
              </Box>

              {previewData.clientesConProblemas.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", mb: 1, color: "error.main" }}
                  >
                    Clientes que necesitan corrección:
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 400,
                      overflow: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <List dense>
                      {previewData.clientesConProblemas.map((client) => (
                        <ListItem
                          key={client.id}
                          sx={{
                            bgcolor: "#ffebee",
                            mb: 1,
                            borderRadius: 1,
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "bold" }}
                            >
                              {client.name} {client.lastName}
                            </Typography>
                            <Chip
                              label={client.problema}
                              size="small"
                              color="error"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          </Box>
                          <Box sx={{ mt: 1, width: "100%" }}>
                            <Typography variant="caption" display="block">
                              <strong>Deuda mes actual:</strong> $
                              {(client.debt || 0).toLocaleString("es-AR")}
                            </Typography>
                            <Typography variant="caption" display="block">
                              <strong>Deuda anterior:</strong> $
                              {(client.deudaAnterior || 0).toLocaleString(
                                "es-AR"
                              )}
                            </Typography>
                            <Typography variant="caption" display="block">
                              <strong>Deuda total:</strong> $
                              {client.deudaTotal.toLocaleString("es-AR")}
                            </Typography>
                            {client.saldoFavor > 0 && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="success.main"
                              >
                                <strong>Saldo a favor:</strong> $
                                {client.saldoFavor.toLocaleString("es-AR")}
                              </Typography>
                            )}
                            <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
                              <Chip
                                label={`Actual: ${client.estadoActual}`}
                                size="small"
                                color="error"
                                sx={{ fontSize: "0.7rem" }}
                              />
                              <Chip
                                label={`Correcto: ${client.estadoCorrecto}`}
                                size="small"
                                color="success"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              ) : (
                <Alert severity="success">
                  {hasRunFix
                    ? "✅ Corrección completada. Todos los clientes tienen estados correctos."
                    : "✅ Todos los clientes tienen estados correctos. No se necesita corrección."}
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isProcessing}>
            Cerrar
          </Button>
          {previewData &&
            previewData.clientesConProblemas.length > 0 &&
            !hasRunFix && (
              <Button
                onClick={ejecutarCorreccion}
                variant="contained"
                color="warning"
                disabled={isProcessing}
              >
                Ejecutar Corrección
              </Button>
            )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FixClientData;
