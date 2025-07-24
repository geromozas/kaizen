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
  OutlinedInput,
  FormGroup,
  FormControlLabel,
  TextField,
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
  const [searchTerm, setSearchTerm] = useState("");

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
      setSelectedClients(
        editData.clients.map((c) =>
          typeof c === "string" ? { id: c, attended: false } : c
        )
      );
    } else {
      setSelectedHour("");
      setSelectedClients([]);
    }
  }, [editData]);

  const handleSave = async () => {
    if (!selectedHour || selectedClients.length === 0) return;

    const data = {
      date: selectedDate.toISOString().split("T")[0],
      hour: selectedHour,
      clients: selectedClients.map((id) => ({
        id,
        attended: false,
      })),
    };

    if (editData) {
      await setDoc(doc(db, "schedules", editData.id), data);
    } else {
      await addDoc(collection(db, "schedules"), data);
    }

    onClose();
    setSelectedHour("");
    setSelectedClients([]);
    setSearchTerm("");
    refresh();
  };

  // Filtrado de clientes por nombre o apellido
  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.lastName} ${client.dni}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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

        <TextField
          fullWidth
          margin="dense"
          label="Buscar cliente"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormGroup>
          {filteredClients.map((client) => (
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
        <Button onClick={onClose} style={{ color: "green" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          style={{ backgroundColor: "green" }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewScheduleModal;
