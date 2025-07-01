// import { Button, TextField } from "@mui/material";
// import "./Clients.css";

// export const Clients = () => {
//   return (
// <div id="boxClients">
//   <div className="firtsBoxClient">
//     <div>
//       <h1>Alumnos</h1>
//       <p>Gestiona la información de tus alumnos</p>
//     </div>
//     <div>
//       <TextField
//         id="outlined-basic"
//         label="Buscar"
//         variant="outlined"
//         sx={{ marginRight: 5 }}
//       />
//       <Button variant="contained">+ Nuevo Alumno</Button>
//     </div>
//   </div>
//   <div className="secondBoxClient">
//     <h3>Lista de alumnos</h3>
//     <p>Alumnos registrados</p>
//   </div>
// </div>
//   );
// };
import { useState } from "react";
import { db } from "../../../firebaseConfig";
import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { TextField } from "@mui/material";
import ClientsList from "./ClientsList";
import "./Clients.css";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
    setIsChange(false);
    let clientsCollections = collection(db, "clients");
    getDocs(clientsCollections).then((res) => {
      const newArr = res.docs.map((client) => {
        return {
          ...client.data(),
          id: client.id,
        };
      });
      setClients(newArr);
    });
  }, [isChange]);

  return (
    <div id="boxClients">
      <div className="firtsBoxClient">
        <div>
          <h1>Alumnos</h1>
          <p>Gestiona la información de tus alumnos</p>
        </div>
      </div>
      <div className="secondBoxClient">
        <ClientsList clients={clients} setIsChange={setIsChange} />
      </div>
    </div>
  );
};

export default Clients;
