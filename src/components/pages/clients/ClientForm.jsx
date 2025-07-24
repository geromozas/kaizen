import { Button, TextField, MenuItem } from "@mui/material";
import { useState } from "react";
import { db } from "../../../firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

export const ClientForm = ({
  handleClose,
  setIsChange,
  clientSelected,
  setClientSelected,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const actividades = [
    { label: "1 vez por semana", valor: 10000 },
    { label: "2 veces por semana", valor: 15000 },
    { label: "3 veces por semana", valor: 20000 },
    { label: "4 veces por semana", valor: 25000 },
    { label: "5 veces por semana", valor: 30000 },
  ];

  const [newClient, setNewClient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    dni: "",
    actividad: "",
    debt: 0,
    lastpay: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "actividad") {
      const selected = actividades.find((a) => a.label === value);
      const updatedDebt = selected ? selected.valor : 0;

      if (clientSelected) {
        setClientSelected({
          ...clientSelected,
          actividad: value,
          debt: updatedDebt,
        });
      } else {
        setNewClient({
          ...newClient,
          actividad: value,
          debt: updatedDebt,
        });
      }
    } else {
      if (clientSelected) {
        setClientSelected({
          ...clientSelected,
          [name]: value,
        });
      } else {
        setNewClient({
          ...newClient,
          [name]: value,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientsRef = collection(db, "clients");

    if (clientSelected) {
      await updateDoc(doc(clientsRef, clientSelected.id), clientSelected);
    } else {
      await addDoc(clientsRef, newClient);
    }

    setIsChange(true);
    handleClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <h1>{clientSelected ? "Editar Alumno" : "Nuevo Alumno"}</h1>

      <TextField
        label="Nombre"
        name="name"
        onChange={handleChange}
        defaultValue={clientSelected?.name}
      />
      <TextField
        label="Apellido"
        name="lastName"
        onChange={handleChange}
        defaultValue={clientSelected?.lastName}
      />
      <TextField
        label="Celular"
        name="phone"
        onChange={handleChange}
        defaultValue={clientSelected?.phone}
      />
      <TextField
        label="2do Celular"
        name="phoneHelp"
        onChange={handleChange}
        defaultValue={clientSelected?.phoneHelp}
      />
      <TextField
        label="Dirección"
        name="address"
        onChange={handleChange}
        defaultValue={clientSelected?.address}
      />
      <TextField
        label="DNI"
        name="dni"
        onChange={handleChange}
        defaultValue={clientSelected?.dni}
      />

      <TextField
        select
        label="Actividad"
        name="actividad"
        value={clientSelected?.actividad || newClient.actividad}
        onChange={handleChange}
        fullWidth
      >
        {actividades.map((actividad) => (
          <MenuItem key={actividad.label} value={actividad.label}>
            {actividad.label} - ${actividad.valor}
          </MenuItem>
        ))}
      </TextField>

      <p>
        <strong>Deuda estimada:</strong> $
        {clientSelected?.debt || newClient.debt}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: 20,
        }}
      >
        <Button variant="contained" type="submit" disabled={isUploading}>
          {clientSelected ? "Modificar" : "Crear"}
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
