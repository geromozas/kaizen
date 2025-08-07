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
  ];

  const proporciones = [
    { label: "Mes completo", factor: 1 },
    { label: "3/4 del mes", factor: 0.75 },
    { label: "1/2 mes", factor: 0.5 },
    { label: "1/4 del mes", factor: 0.25 },
  ];

  const [newClient, setNewClient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    dni: "",
    actividad: "",
    proporcion: 1,
    debt: 0,
    lastpay: "",
  });

  const calcularDeuda = (actividadLabel, proporcion) => {
    const actividad = actividades.find((a) => a.label === actividadLabel);
    if (!actividad || proporcion == null) return 0;
    return Math.round((actividad.valor * proporcion) / 100) * 100;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedActividad =
      name === "actividad"
        ? value
        : clientSelected?.actividad || newClient.actividad;

    let updatedProporcion =
      name === "proporcion"
        ? parseFloat(value)
        : clientSelected?.proporcion || newClient.proporcion;

    const updatedDebt = calcularDeuda(updatedActividad, updatedProporcion);

    const updatedValues = {
      [name]: name === "proporcion" ? parseFloat(value) : value,
      debt: updatedDebt,
    };

    if (clientSelected) {
      setClientSelected({
        ...clientSelected,
        ...updatedValues,
      });
    } else {
      setNewClient({
        ...newClient,
        ...updatedValues,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientsRef = collection(db, "clients");

    if (clientSelected) {
      await updateDoc(doc(clientsRef, clientSelected.id), clientSelected);
    } else {
      await addDoc(clientsRef, {
        ...newClient,
        estado: "Deudor",
      });
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

      <TextField
        select
        label="Inicio del mes"
        name="proporcion"
        value={
          clientSelected?.proporcion?.toString() ||
          newClient.proporcion.toString()
        }
        onChange={handleChange}
        fullWidth
      >
        {proporciones.map((p) => (
          <MenuItem key={p.label} value={p.factor}>
            {p.label}
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
