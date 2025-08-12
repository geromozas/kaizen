import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const ActivityPricesManager = ({ open, onClose, onActivityUpdate }) => {
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({ label: "", valor: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadActivities();
    }
  }, [open]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const activitiesRef = collection(db, "activities");
      const snapshot = await getDocs(activitiesRef);
      const activitiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error loading activities:", error);
      alert("Error al cargar las actividades");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!newActivity.label || !newActivity.valor) {
      alert("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const activitiesRef = collection(db, "activities");
      await addDoc(activitiesRef, {
        label: newActivity.label,
        valor: parseInt(newActivity.valor),
      });

      setNewActivity({ label: "", valor: "" });
      setShowAddForm(false);
      loadActivities();
      onActivityUpdate?.();
      alert("Actividad agregada exitosamente");
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Error al guardar la actividad");
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = async () => {
    if (!editingActivity.label || !editingActivity.valor) {
      alert("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const activityRef = doc(db, "activities", editingActivity.id);
      await updateDoc(activityRef, {
        label: editingActivity.label,
        valor: parseInt(editingActivity.valor),
      });

      setEditingActivity(null);
      loadActivities();
      onActivityUpdate?.();
      alert("Actividad actualizada exitosamente");
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Error al actualizar la actividad");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta actividad?")) {
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, "activities", id));
      loadActivities();
      onActivityUpdate?.();
      alert("Actividad eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Error al eliminar la actividad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Gestión de Actividades y Precios</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setShowAddForm(true)}
            disabled={loading}
          >
            Nueva Actividad
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Formulario para nueva actividad */}
        {showAddForm && (
          <Box sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Nueva Actividad
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Nombre de la actividad"
                value={newActivity.label}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, label: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Precio"
                type="number"
                value={newActivity.valor}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, valor: e.target.value })
                }
                sx={{ width: 150 }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSaveActivity}
                disabled={loading}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowAddForm(false);
                  setNewActivity({ label: "", valor: "" });
                }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Lista de actividades */}
        <Typography variant="h6" gutterBottom>
          Actividades Existentes
        </Typography>

        {loading ? (
          <Typography>Cargando...</Typography>
        ) : (
          <List>
            {activities.map((activity) => (
              <ListItem
                key={activity.id}
                sx={{ border: "1px solid #eee", mb: 1, borderRadius: 1 }}
              >
                {editingActivity?.id === activity.id ? (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      value={editingActivity.label}
                      onChange={(e) =>
                        setEditingActivity({
                          ...editingActivity,
                          label: e.target.value,
                        })
                      }
                      fullWidth
                    />
                    <TextField
                      type="number"
                      value={editingActivity.valor}
                      onChange={(e) =>
                        setEditingActivity({
                          ...editingActivity,
                          valor: e.target.value,
                        })
                      }
                      sx={{ width: 120 }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleEditActivity}
                      disabled={loading}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setEditingActivity(null)}
                    >
                      Cancelar
                    </Button>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={activity.label}
                      secondary={`$${activity.valor}`}
                    />
                    <IconButton
                      onClick={() => setEditingActivity(activity)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteActivity(activity.id)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
