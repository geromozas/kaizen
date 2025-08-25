import { Button, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useActivities } from "../activities/useActivities";
import Swal from "sweetalert2";

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

  // Nueva función para calcular el estado basado en deuda y saldo
  const calcularEstado = (debt, saldoFavor = 0) => {
    if (saldoFavor > 0) {
      return "Saldo a favor";
    } else if (debt > 0) {
      return "Deudor";
    } else {
      return "Al día";
    }
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

    // Calcular el nuevo estado basado en la deuda
    const currentSaldoFavor =
      patientSelected?.saldoFavor || newPatient.saldoFavor || 0;
    const updatedEstado = calcularEstado(updatedDebt, currentSaldoFavor);

    const updatedValues = {
      [name]: name === "sesiones" ? parseInt(value) || 0 : value,
      debt: updatedDebt,
      estado: updatedEstado, // Actualizar también el estado
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
        // Para pacientes existentes, asegurar que el estado se actualiza
        const dataToUpdate = {
          ...patientSelected,
          estado: calcularEstado(
            patientSelected.debt,
            patientSelected.saldoFavor || 0
          ),
        };
        await updateDoc(doc(patientsRef, patientSelected.id), dataToUpdate);
        Swal.fire({
          icon: "success",
          title: "Paciente modificado",
          text: "Los datos se guardaron correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Para pacientes nuevos, calcular el estado inicial
        const estadoInicial = calcularEstado(
          newPatient.debt,
          newPatient.saldoFavor || 0
        );
        await addDoc(patientsRef, {
          ...newPatient,
          estado: estadoInicial,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Paciente creado",
        text: "El paciente fue agregado con éxito",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error al guardar paciente:", error);
      Swal.fire("Error", "Hubo un problema al guardar el alumno", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Recalcular deuda y estado cuando se carga un paciente existente
  useEffect(() => {
    if (patientSelected && activities.length > 0) {
      const debt = calcularDeuda(
        patientSelected.actividad,
        patientSelected.sesiones
      );
      const estado = calcularEstado(debt, patientSelected.saldoFavor || 0);

      if (debt !== patientSelected.debt || estado !== patientSelected.estado) {
        setPatientSelected({
          ...patientSelected,
          debt: debt,
          estado: estado, // Actualizar también el estado
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

      {/* Mostrar el estado calculado para feedback visual */}
      <p>
        <strong>Estado:</strong>{" "}
        {patientSelected?.estado ||
          calcularEstado(newPatient.debt, newPatient.saldoFavor || 0)}
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
