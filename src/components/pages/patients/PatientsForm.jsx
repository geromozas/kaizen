import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { db } from "../../../firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

export const PatientForm = ({
  handleClose,
  setIsChange,
  patientSelected,
  setPatientSelected,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    socialWork: "",
  });

  //formik hacer
  const handleChange = (e) => {
    if (patientSelected) {
      setPatientSelected({
        ...patientSelected,
        [e.target.name]: e.target.value,
      });
    } else {
      setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
    }
  };

  //formik hacer
  const handleSubmit = async (e) => {
    e.preventDefault();

    const patientsCollection = collection(db, "patient");

    if (patientSelected) {
      let obj = {
        ...patientSelected,
      };
      updateDoc(doc(patientsCollection, patientSelected.id), obj).then(() => {
        setIsChange(true);
        handleClose();
      });
    } else {
      let obj = {
        ...newPatient,
      };
      addDoc(patientsCollection, obj).then(() => {
        setIsChange(true);
        handleClose();
      });
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alingItems: "center",
          gap: 10,
        }}
      >
        {!patientSelected ? <h1>Nuevo Paciente</h1> : <h1>Editar</h1>}

        <TextField
          label="Nombre"
          name="name"
          onChange={handleChange}
          defaultValue={patientSelected?.name}
        />
        <TextField
          label="Apellido"
          name="lastName"
          onChange={handleChange}
          defaultValue={patientSelected?.lastName}
        />
        <TextField
          label="Celular"
          name="phone"
          onChange={handleChange}
          defaultValue={patientSelected?.phone}
        />
        <TextField
          label="2do celular"
          name="phoneHelp"
          onChange={handleChange}
          defaultValue={patientSelected?.phoneHelp}
        />
        <TextField
          label="Dirección"
          name="address"
          onChange={handleChange}
          defaultValue={patientSelected?.address}
        />
        <TextField
          label="Obra Social"
          name="socialWork"
          onChange={handleChange}
          defaultValue={patientSelected?.address}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: 20,
          }}
        >
          <Button variant="contained" type="submit" disabled={isUploading}>
            {patientSelected ? "Modificar" : "Crear"}
          </Button>
          <Button variant="contained" onClick={() => handleClose()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
