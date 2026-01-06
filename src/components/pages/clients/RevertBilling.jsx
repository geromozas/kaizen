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
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import Swal from "sweetalert2";

const RevertBilling = ({ setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const analizarFacturacion = async () => {
    setIsProcessing(true);
    try {
      const clientsRef = collection(db, "clients");
      const clientsSnap = await getDocs(clientsRef);

      const clientesFacturados = [];

      clientsSnap.docs.forEach((docSnap) => {
        const client = { id: docSnap.id, ...docSnap.data() };

        // Verificar si tiene ultimoMesFacturado
        if (client.ultimoMesFacturado) {
          clientesFacturados.push({
            ...client,
            deudaTotal: (client.debt || 0) + (client.deudaAnterior || 0),
          });
        }
      });

      setPreviewData({
        clientesFacturados,
        total: clientesFacturados.length,
      });
    } catch (error) {
      console.error("Error al analizar facturación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo analizar la facturación",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await analizarFacturacion();
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewData(null);
  };

  const revertirFacturacion = async () => {
    if (!previewData || previewData.clientesFacturados.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin facturaciones",
        text: "No hay facturaciones para revertir",
      });
      return;
    }

    const result = await Swal.fire({
      title: "⚠️ ¿Revertir facturación?",
      html: `
        <p><strong>Se revertirán ${previewData.clientesFacturados.length} clientes</strong></p>
        <p style="color: #f57c00;">Esta acción SOLO eliminará los marcadores de facturación</p>
        <p style="color: #666;">NO modificará las deudas actuales</p>
        <p style="color: #d32f2f;"><strong>⚠️ Esto te permitirá facturar de nuevo</strong></p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, revertir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f57c00",
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      let procesados = 0;

      for (const client of previewData.clientesFacturados) {
        try {
          const clientRef = doc(db, "clients", client.id);

          // SOLO eliminar los marcadores de facturación
          // NO tocar debt, deudaAnterior ni saldoFavor
          const updateData = {
            ultimoMesFacturado: null,
            fechaUltimaFacturacion: null,
            mesesPagadosAdelantado: null,
          };

          batch.update(clientRef, updateData);
          procesados++;
        } catch (error) {
          console.error(`Error al revertir cliente ${client.name}:`, error);
        }
      }

      await batch.commit();

      setIsChange(true);
      handleClose();

      Swal.fire({
        icon: "success",
        title: "Reversión completada",
        html: `
          <p>✅ <strong>${procesados}</strong> clientes revertidos</p>
          <p>Ahora puedes volver a facturar</p>
          <p style="color: #666; font-size: 0.9em;">Las deudas se mantuvieron intactas</p>
        `,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error en reversión:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al revertir la facturación",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<RestoreIcon />}
        onClick={handleOpen}
        size="small"
        color="warning"
        sx={{ ml: 1 }}
      >
        Revertir Facturación
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <RestoreIcon color="warning" />
            <Typography variant="h6">Revertir Facturación</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isProcessing && <LinearProgress sx={{ mb: 2 }} />}

          <Alert severity="info" sx={{ mb: 2 }}>
            Esta herramienta elimina los marcadores de facturación para permitir
            facturar nuevamente. <strong>Las deudas NO se modifican.</strong>
          </Alert>

          {previewData && (
            <>
              <Box sx={{ mb: 2, p: 2, bgcolor: "#fff3e0", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Resumen
                </Typography>
                <Typography variant="body2">
                  <strong>Clientes facturados:</strong>{" "}
                  {previewData.clientesFacturados.length}
                </Typography>
              </Box>

              {previewData.clientesFacturados.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    Vista previa (primeros 10):
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
                      {previewData.clientesFacturados
                        .slice(0, 10)
                        .map((client) => (
                          <ListItem
                            key={client.id}
                            sx={{
                              bgcolor: "#fff3e0",
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
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold" }}
                              >
                                {client.name} {client.lastName}
                              </Typography>
                              <Chip
                                label={client.estado}
                                size="small"
                                color={
                                  client.estado === "Deudor"
                                    ? "error"
                                    : client.estado === "Al día"
                                    ? "success"
                                    : "default"
                                }
                                sx={{ fontSize: "0.7rem" }}
                              />
                            </Box>
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" display="block">
                                Mes actual: $
                                {(client.debt || 0).toLocaleString("es-AR")} |
                                Anterior: $
                                {(client.deudaAnterior || 0).toLocaleString(
                                  "es-AR"
                                )}
                              </Typography>
                              {client.ultimoMesFacturado && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  Facturado: {client.ultimoMesFacturado}
                                </Typography>
                              )}
                            </Box>
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">
                  No hay facturaciones para revertir
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isProcessing}>
            Cancelar
          </Button>
          {previewData && previewData.clientesFacturados.length > 0 && (
            <Button
              onClick={revertirFacturacion}
              variant="contained"
              color="warning"
              disabled={isProcessing}
            >
              Ejecutar Reversión
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RevertBilling;
