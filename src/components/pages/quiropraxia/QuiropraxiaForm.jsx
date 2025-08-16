import { Button, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useActivities } from "../activities/useActivities";

export const QuiropraxiaForm = ({
  handleClose,
  setIsChange,
  patientSelected,
  setPatientSelected,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { activities, loading: activitiesLoading } = useActivities();

  // Removido las proporciones, ahora usaremos cantidad de sesiones

  const [newPatient, setNewPatient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    dni: "",
    actividad: "",
    sesiones: 1, // Cantidad de sesiones en lugar de proporción
    debt: 0,
    lastpay: "",
    condition: "", // Condición médica específica para quiropraxia
    treatment: "", // Tratamiento actual
  });

  const calcularDeuda = (actividadLabel, sesiones) => {
    const actividad = activities.find((a) => a.label === actividadLabel);
    if (!actividad || sesiones == null || sesiones <= 0) return 0;
    return actividad.valor * sesiones;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedActividad =
      name === "actividad"
        ? value
        : patientSelected?.actividad || newPatient.actividad;

    let updatedSesiones =
      name === "sesiones"
        ? parseInt(value) || 0
        : patientSelected?.sesiones || newPatient.sesiones;

    const updatedDebt = calcularDeuda(updatedActividad, updatedSesiones);

    const updatedValues = {
      [name]: name === "sesiones" ? parseInt(value) || 0 : value,
      debt: updatedDebt,
    };

    if (patientSelected) {
      setPatientSelected({
        ...patientSelected,
        ...updatedValues,
      });
    } else {
      setNewPatient({
        ...newPatient,
        ...updatedValues,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const patientsRef = collection(db, "quiropraxia");

      if (patientSelected) {
        await updateDoc(doc(patientsRef, patientSelected.id), patientSelected);
      } else {
        await addDoc(patientsRef, {
          ...newPatient,
          estado: "Deudor",
        });
      }

      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error al guardar paciente:", error);
      alert("Error al guardar el paciente");
    } finally {
      setIsUploading(false);
    }
  };

  // Recalcular deuda cuando se carga un paciente existente
  useEffect(() => {
    if (patientSelected && activities.length > 0) {
      const debt = calcularDeuda(
        patientSelected.actividad,
        patientSelected.sesiones
      );
      if (debt !== patientSelected.debt) {
        setPatientSelected({
          ...patientSelected,
          debt: debt,
        });
      }
    }
  }, [patientSelected, activities]);

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
      <h1>{patientSelected ? "Editar Paciente" : "Nuevo Paciente"}</h1>

      <TextField
        label="Nombre"
        name="name"
        onChange={handleChange}
        defaultValue={patientSelected?.name}
        required
      />
      <TextField
        label="Apellido"
        name="lastName"
        onChange={handleChange}
        defaultValue={patientSelected?.lastName}
        required
      />
      <TextField
        label="Celular"
        name="phone"
        onChange={handleChange}
        defaultValue={patientSelected?.phone}
        required
      />

      <TextField
        label="Dirección"
        name="address"
        onChange={handleChange}
        defaultValue={patientSelected?.address}
      />
      <TextField
        label="DNI"
        name="dni"
        onChange={handleChange}
        defaultValue={patientSelected?.dni}
        required
      />

      <TextField
        label="Condición Médica"
        name="condition"
        onChange={handleChange}
        defaultValue={patientSelected?.condition}
        multiline
        rows={2}
        placeholder="Ej: Dolor de espalda baja, Ciática, etc."
      />

      <TextField
        label="Tratamiento"
        name="treatment"
        onChange={handleChange}
        defaultValue={patientSelected?.treatment}
        multiline
        rows={2}
        placeholder="Ej: Ajustes vertebrales, terapia manual, etc."
      />

      <TextField
        select
        label="Servicio"
        name="actividad"
        value={patientSelected?.actividad || newPatient.actividad}
        onChange={handleChange}
        fullWidth
        required
        disabled={activitiesLoading}
      >
        {activitiesLoading ? (
          <MenuItem disabled>Cargando servicios...</MenuItem>
        ) : (
          activities.map((actividad) => (
            <MenuItem key={actividad.id} value={actividad.label}>
              {actividad.label} - ${actividad.valor.toLocaleString()}
            </MenuItem>
          ))
        )}
      </TextField>

      <TextField
        label="Cantidad de Sesiones"
        name="sesiones"
        type="number"
        value={patientSelected?.sesiones || newPatient.sesiones}
        onChange={handleChange}
        fullWidth
        required
        inputProps={{ min: 1, step: 1 }}
        helperText="Número de sesiones programadas"
      />

      <p>
        <strong>Deuda estimada:</strong> $
        {(patientSelected?.debt || newPatient.debt).toLocaleString()}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: 20,
        }}
      >
        <Button
          variant="contained"
          type="submit"
          disabled={isUploading || activitiesLoading}
        >
          {isUploading
            ? "Guardando..."
            : patientSelected
            ? "Modificar"
            : "Crear"}
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
