/**
 * FixClientData.jsx
 * Corrige clientes cuyo ultimoMesFacturado quedó menor al fechaFinCobertura
 * de su pago adelantado (bug de timezone en cálculo de fecha).
 * Lógica: solo sube el mes, nunca lo baja. Una vez ejecutado, podés removerlo.
 */
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
  ListItemText,
  Chip,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import Swal from "sweetalert2";

const formatMes = (mesStr) => {
  if (!mesStr) return "—";
  const [anio, mes] = mesStr.split("-");
  return new Date(parseInt(anio), parseInt(mes) - 1, 15).toLocaleDateString(
    "es-AR",
    { year: "numeric", month: "long" },
  );
};

const FixClientData = () => {
  const [open, setOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [clientesConError, setClientesConError] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalyzed(false);
    setClientesConError([]);
    try {
      const [clientsSnap, paymentsSnap] = await Promise.all([
        getDocs(collection(db, "clients")),
        getDocs(collection(db, "payments")),
      ]);

      const payments = paymentsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Calcular el fechaFinCobertura más alto por cliente (solo pagos adelantados)
      const coberturaPorCliente = {};
      payments.forEach((p) => {
        if (p.tipoPago !== "adelantado") return;
        const clientId = p.alumno?.id;
        const fin = p.fechaFinCobertura; // "YYYY-MM"
        if (!clientId || !fin) return;
        if (
          !coberturaPorCliente[clientId] ||
          fin > coberturaPorCliente[clientId]
        ) {
          coberturaPorCliente[clientId] = fin;
        }
      });

      const errores = [];
      clientsSnap.docs.forEach((docSnap) => {
        const client = { id: docSnap.id, ...docSnap.data() };
        const coberturaReal = coberturaPorCliente[client.id];
        if (!coberturaReal) return; // sin pagos adelantados → ok

        const mesActual = client.ultimoMesFacturado || "";
        // Error solo si el mes guardado es MENOR al fin de cobertura real
        if (mesActual < coberturaReal) {
          errores.push({
            id: client.id,
            name: `${client.name} ${client.lastName}`,
            ultimoMesActual: mesActual,
            ultimoMesCorrecto: coberturaReal,
          });
        }
      });

      setClientesConError(errores);
      setAnalyzed(true);
    } catch (error) {
      console.error("Error analizando:", error);
      Swal.fire({
        icon: "error",
        title: "Error al analizar",
        text: error.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFix = async () => {
    const result = await Swal.fire({
      title: "¿Corregir datos?",
      html: `Se actualizará <strong>ultimoMesFacturado</strong> en ${clientesConError.length} cliente(s).`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, corregir",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    setIsFixing(true);
    try {
      const batch = writeBatch(db);
      clientesConError.forEach(({ id, ultimoMesCorrecto }) => {
        batch.update(doc(db, "clients", id), {
          ultimoMesFacturado: ultimoMesCorrecto,
        });
      });
      await batch.commit();
      Swal.fire({
        icon: "success",
        title: "¡Datos corregidos!",
        timer: 2500,
        showConfirmButton: false,
      });
      setClientesConError([]);
      setAnalyzed(false);
      setOpen(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al corregir",
        text: error.message,
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        startIcon={<BuildIcon />}
        onClick={() => {
          setOpen(true);
          handleAnalyze();
        }}
      >
        Corregir Datos
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>🔧 Corrección de Datos de Clientes</DialogTitle>
        <DialogContent>
          {(isAnalyzing || isFixing) && <LinearProgress sx={{ mb: 2 }} />}
          <Alert severity="info" sx={{ mb: 2 }}>
            Detecta clientes cuyo <strong>último mes facturado</strong> es menor
            al mes de fin de cobertura de sus pagos adelantados. Solo corrige
            hacia adelante, nunca retrocede.
          </Alert>

          {analyzed &&
            !isAnalyzing &&
            (clientesConError.length === 0 ? (
              <Alert severity="success">
                ✅ Sin errores. Todos los datos son correctos.
              </Alert>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <strong>{clientesConError.length}</strong> cliente(s) con mes
                  facturado menor al fin de cobertura de su pago adelantado:
                </Alert>
                <List dense>
                  {clientesConError.map((c) => (
                    <ListItem
                      key={c.id}
                      sx={{ bgcolor: "#fff3e0", mb: 0.5, borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={<strong>{c.name}</strong>}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="error">
                              ❌ Actual: {formatMes(c.ultimoMesActual)}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="success.main">
                              ✅ Correcto: {formatMes(c.ultimoMesCorrecto)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip label="Corregir" color="warning" size="small" />
                    </ListItem>
                  ))}
                </List>
              </>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isFixing}>
            Cerrar
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || isFixing}
            variant="outlined"
          >
            Re-analizar
          </Button>
          {analyzed && clientesConError.length > 0 && (
            <Button
              onClick={handleFix}
              variant="contained"
              color="warning"
              disabled={isFixing}
            >
              Corregir {clientesConError.length} cliente(s)
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FixClientData;
