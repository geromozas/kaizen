import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  // ListItemText,
  OutlinedInput,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const availableHours = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const NewScheduleModal = ({
  open,
  onClose,
  selectedDate,
  refresh,
  editData,
}) => {
  const [clients, setClients] = useState([]);
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      const clientsSnap = await getDocs(collection(db, "clients"));
      const clientsData = clientsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientsData);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (editData) {
      setSelectedHour(editData.hour);
      setSelectedClients(editData.clients);
    }
  }, [editData]);

  const handleSave = async () => {
    if (!selectedHour || selectedClients.length === 0) return;

    const data = {
      date: selectedDate.toISOString().split("T")[0],
      hour: selectedHour,
      clients: selectedClients,
    };

    if (editData) {
      await setDoc(doc(db, "schedules", editData.id), data); // actualiza
    } else {
      await addDoc(collection(db, "schedules"), data); // nuevo
    }

    onClose();
    setSelectedHour("");
    setSelectedClients([]);
    refresh();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar Nuevo Horario</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Seleccionar hora</InputLabel>
          <Select
            value={selectedHour}
            onChange={(e) => setSelectedHour(e.target.value)}
            input={<OutlinedInput label="Seleccionar hora" />}
          >
            {availableHours.map((hour) => (
              <MenuItem key={hour} value={hour}>
                {hour}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormGroup>
          {clients.map((client) => (
            <FormControlLabel
              key={client.id}
              control={
                <Checkbox
                  checked={selectedClients.includes(client.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedClients([...selectedClients, client.id]);
                    } else {
                      setSelectedClients(
                        selectedClients.filter((id) => id !== client.id)
                      );
                    }
                  }}
                />
              }
              label={`${client.name} ${client.lastName}`}
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewScheduleModal;
