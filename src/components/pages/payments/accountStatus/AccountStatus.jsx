// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../../../firebaseConfig";
// import "./AccountStatus.css";

// const AccountStatus = () => {
//   const [clients, setClients] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       const clientSnap = await getDocs(collection(db, "clients"));
//       const clientsData = clientSnap.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setClients(clientsData);
//     };

//     fetchData();
//   }, []);

//   const filteredClients = clients.filter(
//     (client) =>
//       `${client.name} ${client.lastName}`
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       client.dni?.toString().includes(searchTerm)
//   );

//   return (
//     <div className="accountStatus">
//       <h2>Estado de Cuenta</h2>
//       <p>Visualiza quién está al día y quién debe</p>

//       <input
//         type="text"
//         placeholder="Buscar alumno por nombre o DNI..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="searchInput"
//       />

//       <table className="accountTable">
//         <thead>
//           <tr>
//             <th>Alumno</th>
//             <th>Estado</th>
//             <th>Último Pago</th>
//             <th>Deuda</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredClients.map((client) => (
//             <tr key={client.id}>
//               <td>
//                 {client.name} {client.lastName}
//               </td>
//               <td>
//                 {client.estado === "Al día" ? (
//                   <span className="status ok">Al día</span>
//                 ) : (
//                   <span className="status debt">Deudor</span>
//                 )}
//               </td>
//               <td>{client.ultimoPago || "Sin pagos"}</td>
//               <td>${(client.debt || 0).toLocaleString("es-AR")}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AccountStatus;
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import "./AccountStatus.css";
import { Button } from "@mui/material";

const AccountStatus = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    const clientSnap = await getDocs(collection(db, "clients"));
    const clientsData = clientSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClients(clientsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleInactivo = async (client) => {
    const nuevoEstado =
      client.estado === "Inactivo"
        ? client.debt > 0
          ? "Deudor"
          : "Al día"
        : "Inactivo";

    await updateDoc(doc(db, "clients", client.id), { estado: nuevoEstado });
    fetchData();
  };

  const filteredClients = clients.filter(
    (client) =>
      `${client.name} ${client.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      client.dni?.toString().includes(searchTerm)
  );

  return (
    <div className="accountStatus">
      <h2>Estado de Cuenta</h2>
      <p>Visualiza quién está al día, quién debe o está inactivo</p>

      <input
        type="text"
        placeholder="Buscar alumno por nombre o DNI..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="searchInput"
      />

      <table className="accountTable">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Estado</th>
            <th>Último Pago</th>
            <th>Deuda</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client) => (
            <tr key={client.id}>
              <td>
                {client.name} {client.lastName}
              </td>
              <td>
                <span
                  className={`status ${
                    client.estado === "Al día"
                      ? "ok"
                      : client.estado === "Inactivo"
                      ? "inactive"
                      : "debt"
                  }`}
                >
                  {client.estado}
                </span>
              </td>
              <td>{client.ultimoPago || "Sin pagos"}</td>
              <td>
                $
                {client.estado === "Inactivo"
                  ? 0
                  : (client.debt || 0).toLocaleString("es-AR")}
              </td>
              <td>
                <Button
                  variant="outlined"
                  className="btn-inactivo"
                  onClick={() => toggleInactivo(client)}
                >
                  {client.estado === "Inactivo" ? "Activar" : "Marcar Inactivo"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountStatus;
