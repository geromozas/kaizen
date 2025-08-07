// import { Button, TextField, MenuItem } from "@mui/material";
// import { useState } from "react";
// import { db } from "../../../firebaseConfig";
// import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

// export const PatientForm = ({
//   handleClose,
//   setIsChange,
//   patientSelected,
//   setPatientSelected,
// }) => {
//   const [isUploading, setIsUploading] = useState(false);

//   const kinesio = 10000;

//   const [newPatient, setNewPatient] = useState({
//     name: "",
//     lastName: "",
//     phone: "",
//     address: "",
//     phoneHelp: "",
//     dni: "",
//     actividad: "",
//     proporcion: 1,
//     debt: 0,
//     lastpay: "",
//   });

//   const calcularDeuda = () => {};

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     let updatedActividad =
//       name === "actividad"
//         ? value
//         : patientSelected?.actividad || newPatient.actividad;

//     let updatedProporcion =
//       name === "proporcion"
//         ? parseFloat(value)
//         : patientSelected?.proporcion || newPatient.proporcion;

//     const updatedDebt = calcularDeuda(updatedActividad, updatedProporcion);

//     const updatedValues = {
//       [name]: name === "proporcion" ? parseFloat(value) : value,
//       debt: updatedDebt,
//     };

//     if (patientSelected) {
//       setPatientSelected({
//         ...patientSelected,
//         ...updatedValues,
//       });
//     } else {
//       setNewPatient({
//         ...newPatient,
//         ...updatedValues,
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const patientsRef = collection(db, "patients");

//     if (patientSelected) {
//       await updateDoc(doc(patientsRef, patientSelected.id), patientSelected);
//     } else {
//       await addDoc(patientsRef, {
//         ...newPatient,
//         estado: "Deudor",
//       });
//     }

//     setIsChange(true);
//     handleClose();
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         gap: 10,
//       }}
//     >
//       <h1>{patientSelected ? "Editar Paciente" : "Nuevo Paciente"}</h1>

//       <TextField
//         label="Nombre"
//         name="name"
//         onChange={handleChange}
//         defaultValue={patientSelected?.name}
//       />
//       <TextField
//         label="Apellido"
//         name="lastName"
//         onChange={handleChange}
//         defaultValue={patientSelected?.lastName}
//       />
//       <TextField
//         label="Celular"
//         name="phone"
//         onChange={handleChange}
//         defaultValue={patientSelected?.phone}
//       />
//       <TextField
//         label="2do Celular"
//         name="phoneHelp"
//         onChange={handleChange}
//         defaultValue={patientSelected?.phoneHelp}
//       />
//       <TextField
//         label="Dirección"
//         name="address"
//         onChange={handleChange}
//         defaultValue={patientSelected?.address}
//       />
//       <TextField
//         label="DNI"
//         name="dni"
//         onChange={handleChange}
//         defaultValue={patientSelected?.dni}
//       />

//       <p>
//         <strong>Deuda estimada:</strong> $
//         {patientSelected?.debt || newPatient.debt}
//       </p>

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-around",
//           marginTop: 20,
//         }}
//       >
//         <Button variant="contained" type="submit" disabled={isUploading}>
//           {patientSelected ? "Modificar" : "Crear"}
//         </Button>
//         <Button variant="contained" onClick={handleClose}>
//           Cancelar
//         </Button>
//       </div>
//     </form>
//   );
// };
import { Button, TextField, MenuItem } from "@mui/material";
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
  const kinesio = 10000;

  const [newPatient, setNewPatient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    dni: "",
    actividad: "",
    sessions: 1,
    debt: kinesio,
    lastpay: "",
  });

  const calcularDeuda = (sessions) => {
    return sessions * kinesio;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedSessions =
      name === "sessions"
        ? parseInt(value) || 0
        : patientSelected?.sessions || newPatient.sessions;

    const updatedDebt = calcularDeuda(updatedSessions);

    const updatedValues = {
      [name]: name === "sessions" ? parseInt(value) || 0 : value,
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
    const patientsRef = collection(db, "patients");

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
      <h1>{patientSelected ? "Editar Paciente" : "Nuevo Paciente"}</h1>

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
        label="2do Celular"
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
        label="DNI"
        name="dni"
        onChange={handleChange}
        defaultValue={patientSelected?.dni}
      />

      <TextField
        label="Cantidad de sesiones"
        name="sessions"
        type="number"
        onChange={handleChange}
        defaultValue={patientSelected?.sessions || 1}
        inputProps={{ min: 1 }}
      />

      <p>
        <strong>Deuda estimada:</strong> $
        {patientSelected?.debt || newPatient.debt}
      </p>

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
        <Button variant="contained" onClick={handleClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
