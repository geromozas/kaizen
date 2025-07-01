import { Button, TextField } from "@mui/material";
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

  const [newClient, setNewClient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
  });

  //formik hacer
  const handleChange = (e) => {
    if (clientSelected) {
      setClientSelected({
        ...clientSelected,
        [e.target.name]: e.target.value,
      });
    } else {
      setNewClient({ ...newClient, [e.target.name]: e.target.value });
    }
  };

  //formik hacer
  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientsCollection = collection(db, "clients");

    if (clientSelected) {
      let obj = {
        ...clientSelected,
      };
      updateDoc(doc(clientsCollection, clientSelected.id), obj).then(() => {
        setIsChange(true);
        handleClose();
      });
    } else {
      let obj = {
        ...newClient,
      };
      addDoc(clientsCollection, obj).then(() => {
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
        {!clientSelected ? <h1>Nuevo Alumno</h1> : <h1>Editar</h1>}

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
          label="2do celular"
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

          <Button variant="contained" onClick={() => handleClose()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
