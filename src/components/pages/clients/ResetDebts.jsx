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
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import Swal from "sweetalert2";

const ResetDebts = ({ setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const analizarClientes = async () => {
    setIsProcessing(true);
    try {
      const clientsRef = collection(db, "clients");
      const clientsSnap = await getDocs(clientsRef);

      const clientesConDeuda = [];
      const clientesSinDeuda = [];

      clientsSnap.docs.forEach((docSnap) => {
        const client = { id: docSnap.id, ...docSnap.data() };
        const deudaTotal = (client.debt || 0) + (client.deudaAnterior || 0);

        if (deudaTotal > 0) {
          clientesConDeuda.push({
            ...client,
            deudaTotal,
          });
        } else {
          clientesSinDeuda.push(client);
        }
      });

      setPreviewData({
        clientesConDeuda,
        clientesSinDeuda,
        total: clientsSnap.docs.length,
      });
    } catch (error) {
      console.error("Error al analizar clientes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo analizar los clientes",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await analizarClientes();
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewData(null);
  };

  const limpiarDeudas = async () => {
    if (!previewData || previewData.clientesConDeuda.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin deudas",
        text: "No hay clientes con deudas para limpiar",
      });
      return;
    }

    const result = await Swal.fire({
      title: "🗑️ ¿Limpiar TODAS las deudas?",
      html: `
        <p><strong>Se limpiarán ${previewData.clientesConDeuda.length} clientes</strong></p>
        <p style="color: #d32f2f; font-weight: bold;">⚠️ ESTA ACCIÓN ES IRREVERSIBLE</p>
        <p style="color: #666;">Esto pondrá:</p>
        <ul style="text-align: left; color: #666;">
          <li>debt = 0</li>
          <li>deudaAnterior = 0</li>
          <li>estado = "Al día"</li>
          <li>Eliminará ultimoMesFacturado</li>
        </ul>
        <p style="color: #f57c00;"><strong>Después de esto podrás facturar enero limpio</strong></p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, LIMPIAR TODO",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d32f2f",
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      let procesados = 0;

      for (const client of previewData.clientesConDeuda) {
        try {
          const clientRef = doc(db, "clients", client.id);

          // Calcular estado correcto considerando saldo a favor
          let nuevoEstado = "Al día";
          if (client.saldoFavor > 0) {
            nuevoEstado = "Saldo a favor";
          }

          const updateData = {
            debt: 0,
            deudaAnterior: 0,
            estado: nuevoEstado,
            ultimoMesFacturado: null,
            fechaUltimaFacturacion: null,
            mesesPagadosAdelantado: null,
          };

          batch.update(clientRef, updateData);
          procesados++;
        } catch (error) {
          console.error(`Error al limpiar cliente ${client.name}:`, error);
        }
      }

      await batch.commit();

      setIsChange(true);
      handleClose();

      Swal.fire({
        icon: "success",
        title: "Deudas limpiadas",
        html: `
          <p>✅ <strong>${procesados}</strong> clientes limpiados</p>
          <p>Todos empiezan enero con deuda = 0</p>
          <p style="color: #4caf50;">Ahora puedes facturar enero limpio</p>
        `,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al limpiar deudas:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al limpiar las deudas",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CleaningServicesIcon />}
        onClick={handleOpen}
        size="small"
        color="error"
        sx={{ ml: 1 }}
      >
        Limpiar Deudas
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CleaningServicesIcon color="error" />
            <Typography variant="h6">Limpiar Todas las Deudas</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isProcessing && <LinearProgress sx={{ mb: 2 }} />}

          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>⚠️ ATENCIÓN:</strong> Esta acción eliminará TODAS las deudas
            de TODOS los clientes. Es útil para empezar un mes limpio.
          </Alert>

          {previewData && (
            <>
              <Box sx={{ mb: 2, p: 2, bgcolor: "#ffebee", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Resumen
                </Typography>
                <Typography variant="body2">
                  <strong>Total clientes:</strong> {previewData.total}
                </Typography>
                <Typography variant="body2">
                  <strong>Con deudas:</strong>{" "}
                  {previewData.clientesConDeuda.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Sin deudas:</strong>{" "}
                  {previewData.clientesSinDeuda.length}
                </Typography>
              </Box>

              {previewData.clientesConDeuda.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: "bold", color: "error.main" }}
                  >
                    Clientes con deudas (se limpiarán):
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
                      {previewData.clientesConDeuda.map((client) => (
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
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {client.name} {client.lastName}
                            </Typography>
                            <Chip
                              label={`$${client.deudaTotal.toLocaleString(
                                "es-AR"
                              )}`}
                              size="small"
                              color="error"
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
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              ) : (
                <Alert severity="success">
                  ✅ No hay clientes con deudas para limpiar
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isProcessing}>
            Cancelar
          </Button>
          {previewData && previewData.clientesConDeuda.length > 0 && (
            <Button
              onClick={limpiarDeudas}
              variant="contained"
              color="error"
              disabled={isProcessing}
            >
              LIMPIAR TODO
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResetDebts;
