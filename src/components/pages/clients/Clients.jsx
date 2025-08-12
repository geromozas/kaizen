import { useState } from "react";
import { db } from "../../../firebaseConfig";
import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
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
        <ClientsList clients={clients || []} setIsChange={setIsChange} />
      </div>
    </div>
  );
};

export default Clients;
