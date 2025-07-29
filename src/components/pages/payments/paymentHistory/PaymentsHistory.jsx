// import { useEffect, useState } from "react";
// import {
//   collection,
//   getDocs,
//   addDoc,
//   query,
//   where,
//   updateDoc,
//   doc,
//   deleteDoc,
// } from "firebase/firestore";
// import { db } from "../../../../firebaseConfig";
// import { Button, Modal, Box, TextField, MenuItem } from "@mui/material";
// import "./PaymentsHistory.css";

// export const PaymentsHistory = () => {
//   const [pagos, setPagos] = useState([]);
//   const [filtro, setFiltro] = useState("");
//   const [openModal, setOpenModal] = useState(false);

//   const [nuevoPago, setNuevoPago] = useState({
//     nombre: "",
//     dni: "",
//     concepto: "",
//     metodo: "",
//     monto: "",
//     fecha: new Date().toLocaleDateString("es-AR"),
//   });

//   const cargarPagos = async () => {
//     const snap = await getDocs(collection(db, "payments"));
//     const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//     const ordenado = lista.sort((a, b) => {
//       const [d1, m1, y1] = a.fecha.split("/").map(Number);
//       const [d2, m2, y2] = b.fecha.split("/").map(Number);
//       return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
//     });

//     setPagos(ordenado);
//   };

//   useEffect(() => {
//     cargarPagos();
//   }, []);

//   useEffect(() => {
//     const buscarCliente = async () => {
//       if (nuevoPago.dni.trim().length >= 5) {
//         const q = query(
//           collection(db, "clients"),
//           where("dni", "==", nuevoPago.dni.trim())
//         );
//         const snap = await getDocs(q);
//         if (!snap.empty) {
//           const cliente = snap.docs[0].data();
//           setNuevoPago((prev) => ({
//             ...prev,
//             nombre: cliente.name,
//           }));
//         }
//       }
//     };
//     buscarCliente();
//   }, [nuevoPago.dni]);

//   const pagosFiltrados = pagos.filter(
//     (p) =>
//       p.alumno.name?.toLowerCase().includes(filtro.toLowerCase()) ||
//       p.alumno.dni.includes(filtro)
//   );

//   const handleRegistrarPago = async () => {
//     const montoPagado = parseInt(nuevoPago.monto);

//     const pagoFinal = {
//       fecha: nuevoPago.fecha,
//       concepto: nuevoPago.concepto,
//       metodo: nuevoPago.metodo,
//       monto: montoPagado,
//       alumno: {
//         name: nuevoPago.nombre,
//         dni: nuevoPago.dni,
//       },
//     };

//     await addDoc(collection(db, "payments"), pagoFinal);

//     const q = query(
//       collection(db, "clients"),
//       where("dni", "==", nuevoPago.dni)
//     );
//     const snap = await getDocs(q);

//     if (!snap.empty) {
//       const clienteDoc = snap.docs[0];
//       const clienteRef = doc(db, "clients", clienteDoc.id);
//       const clienteData = clienteDoc.data();

//       const deudaActual = clienteData.debt || 30000;
//       const nuevaDeuda = Math.max(0, deudaActual - montoPagado);
//       const nuevoEstado = nuevaDeuda === 0 ? "Al día" : "Deudor";

//       await updateDoc(clienteRef, {
//         ultimoPago: nuevoPago.fecha,
//         debt: nuevaDeuda,
//         estado: nuevoEstado,
//       });
//     } else {
//       alert("⚠ No se encontró ningún cliente con ese DNI.");
//     }

//     setNuevoPago({
//       nombre: "",
//       dni: "",
//       concepto: "",
//       metodo: "",
//       monto: "",
//       fecha: new Date().toLocaleDateString("es-AR"),
//     });
//     setOpenModal(false);
//     cargarPagos();
//   };

//   const eliminarPago = async (pago) => {
//     if (!window.confirm("¿Estás seguro de eliminar este pago?")) return;

//     await deleteDoc(doc(db, "payments", pago.id));

//     const q = query(
//       collection(db, "clients"),
//       where("dni", "==", pago.alumno.dni)
//     );
//     const snap = await getDocs(q);

//     if (!snap.empty) {
//       const clienteDoc = snap.docs[0];
//       const clienteRef = doc(db, "clients", clienteDoc.id);
//       const clienteData = clienteDoc.data();

//       const nuevaDeuda = (clienteData.debt || 0) + (pago.monto || 0);
//       await updateDoc(clienteRef, {
//         debt: nuevaDeuda,
//         estado: nuevaDeuda === 0 ? "Al día" : "Deudor",
//       });
//     }

//     cargarPagos();
//   };

//   return (
//     <div className="historialPagos">
//       <h2>Historial de Pagos</h2>
//       <p>Registro de todos los pagos realizados</p>
//       <div className="headerPagos">
//         <input
//           type="text"
//           placeholder="Buscar alumno..."
//           value={filtro}
//           onChange={(e) => setFiltro(e.target.value)}
//         />
//         <Button variant="contained" onClick={() => setOpenModal(true)}>
//           💲 Registrar Pago
//         </Button>
//       </div>

//       <table>
//         <thead>
//           <tr>
//             <th>Fecha</th>
//             <th>Alumno</th>
//             <th>Concepto</th>
//             <th>Método</th>
//             <th>Monto</th>
//             <th></th>
//           </tr>
//         </thead>
//         <tbody>
//           {pagosFiltrados.map((pago) => (
//             <tr key={pago.id}>
//               <td>{pago.fecha}</td>
//               <td>{pago.alumno.name}</td>
//               <td>{pago.concepto}</td>
//               <td>{renderMetodo(pago.metodo)}</td>
//               <td>${pago.monto.toLocaleString()}</td>
//               <td>
//                 <Button
//                   color="error"
//                   size="small"
//                   onClick={() => eliminarPago(pago)}
//                 >
//                   🗑 Eliminar
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <Modal open={openModal} onClose={() => setOpenModal(false)}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 400,
//             bgcolor: "white",
//             borderRadius: 2,
//             boxShadow: 24,
//             p: 4,
//           }}
//         >
//           <h3>Registrar Nuevo Pago</h3>
//           <TextField
//             label="DNI"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.dni}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, dni: e.target.value })
//             }
//           />
//           <TextField
//             label="Nombre"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.nombre}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, nombre: e.target.value })
//             }
//           />
//           <TextField
//             label="Concepto"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.concepto}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, concepto: e.target.value })
//             }
//           />
//           <TextField
//             label="Método de pago"
//             select
//             fullWidth
//             margin="dense"
//             value={nuevoPago.metodo}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, metodo: e.target.value })
//             }
//           >
//             <MenuItem value="efectivo">Efectivo</MenuItem>
//             <MenuItem value="transferencia">Transferencia</MenuItem>
//             <MenuItem value="tarjeta">Tarjeta</MenuItem>
//           </TextField>
//           <TextField
//             label="Monto"
//             type="number"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.monto}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, monto: e.target.value })
//             }
//           />

//           <Button
//             variant="contained"
//             color="primary"
//             fullWidth
//             sx={{ mt: 2 }}
//             onClick={handleRegistrarPago}
//           >
//             Registrar
//           </Button>
//         </Box>
//       </Modal>
//     </div>
//   );
// };

// const renderMetodo = (metodo) => {
//   switch (metodo?.toLowerCase()) {
//     case "efectivo":
//       return "💵 Efectivo";
//     case "transferencia":
//       return "✔ Transferencia";
//     case "tarjeta":
//       return "💳 Tarjeta";
//     default:
//       return metodo;
//   }
// };
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { Button, Modal, Box, TextField, MenuItem } from "@mui/material";
import "./PaymentsHistory.css";
import { Timestamp } from "firebase/firestore";

export const PaymentsHistory = () => {
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [nuevoPago, setNuevoPago] = useState({
    nombre: "",
    dni: "",
    concepto: "",
    metodo: "",
    monto: "",
    fecha: new Date().toLocaleDateString("es-AR"),
  });

  const cargarPagos = async () => {
    const snap = await getDocs(collection(db, "payments"));
    const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const ordenado = lista.sort((a, b) => {
      const [d1, m1, y1] = a.fecha.split("/").map(Number);
      const [d2, m2, y2] = b.fecha.split("/").map(Number);
      return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
    });

    setPagos(ordenado);
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  useEffect(() => {
    const buscarCliente = async () => {
      if (nuevoPago.dni.trim().length >= 5) {
        const q = query(
          collection(db, "clients"),
          where("dni", "==", nuevoPago.dni.trim())
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const cliente = snap.docs[0].data();
          setNuevoPago((prev) => ({
            ...prev,
            nombre: cliente.name,
          }));
        }
      }
    };
    buscarCliente();
  }, [nuevoPago.dni]);

  const pagosFiltrados = pagos.filter(
    (p) =>
      p.alumno.name?.toLowerCase().includes(filtro.toLowerCase()) ||
      p.alumno.dni.includes(filtro)
  );

  const handleRegistrarPago = async () => {
    const montoPagado = parseInt(nuevoPago.monto);

    // Obtener el mes en formato YYYY-MM desde la fecha ingresada (tipo string DD/MM/YYYY)
    const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
    const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;

    // Crear objeto Date desde la fecha ingresada para el createdAt
    const fechaPago = new Date(anio, mes - 1, dia);

    const pagoFinal = {
      fecha: nuevoPago.fecha,
      concepto: nuevoPago.concepto,
      metodo: nuevoPago.metodo,
      monto: montoPagado,
      mes: mesPago,
      createdAt: Timestamp.fromDate(fechaPago), // ← LÍNEA AGREGADA
      alumno: {
        name: nuevoPago.nombre,
        dni: nuevoPago.dni,
      },
    };

    await addDoc(collection(db, "payments"), pagoFinal);

    const q = query(
      collection(db, "clients"),
      where("dni", "==", nuevoPago.dni)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const clienteDoc = snap.docs[0];
      const clienteRef = doc(db, "clients", clienteDoc.id);
      const clienteData = clienteDoc.data();

      const deudaActual = clienteData.debt || 30000;
      const nuevaDeuda = Math.max(0, deudaActual - montoPagado);
      const nuevoEstado = nuevaDeuda === 0 ? "Al día" : "Deudor";

      await updateDoc(clienteRef, {
        ultimoPago: nuevoPago.fecha,
        debt: nuevaDeuda,
        estado: nuevoEstado,
      });
    } else {
      alert("⚠ No se encontró ningún cliente con ese DNI.");
    }

    setNuevoPago({
      nombre: "",
      dni: "",
      concepto: "",
      metodo: "",
      monto: "",
      fecha: new Date().toLocaleDateString("es-AR"),
    });
    setOpenModal(false);
    cargarPagos();
  };

  const eliminarPago = async (pago) => {
    if (!window.confirm("¿Estás seguro de eliminar este pago?")) return;

    await deleteDoc(doc(db, "payments", pago.id));

    const q = query(
      collection(db, "clients"),
      where("dni", "==", pago.alumno.dni)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const clienteDoc = snap.docs[0];
      const clienteRef = doc(db, "clients", clienteDoc.id);
      const clienteData = clienteDoc.data();

      const nuevaDeuda = (clienteData.debt || 0) + (pago.monto || 0);
      await updateDoc(clienteRef, {
        debt: nuevaDeuda,
        estado: nuevaDeuda === 0 ? "Al día" : "Deudor",
      });
    }

    cargarPagos();
  };

  return (
    <div className="historialPagos">
      <h2>Historial de Pagos</h2>
      <p>Registro de todos los pagos realizados</p>
      <div className="headerPagos">
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          💲 Registrar Pago
        </Button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Alumno</th>
            <th>Concepto</th>
            <th>Método</th>
            <th>Monto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pagosFiltrados.map((pago) => (
            <tr key={pago.id}>
              <td>{pago.fecha}</td>
              <td>{pago.alumno.name}</td>
              <td>{pago.concepto}</td>
              <td>{renderMetodo(pago.metodo)}</td>
              <td>${pago.monto.toLocaleString()}</td>
              <td>
                <Button
                  color="error"
                  size="small"
                  onClick={() => eliminarPago(pago)}
                >
                  🗑 Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <h3>Registrar Nuevo Pago</h3>
          <TextField
            label="DNI"
            fullWidth
            margin="dense"
            value={nuevoPago.dni}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, dni: e.target.value })
            }
          />
          <TextField
            label="Nombre"
            fullWidth
            margin="dense"
            value={nuevoPago.nombre}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, nombre: e.target.value })
            }
          />
          <TextField
            label="Concepto"
            fullWidth
            margin="dense"
            value={nuevoPago.concepto}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, concepto: e.target.value })
            }
          />
          <TextField
            label="Método de pago"
            select
            fullWidth
            margin="dense"
            value={nuevoPago.metodo}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, metodo: e.target.value })
            }
          >
            <MenuItem value="efectivo">Efectivo</MenuItem>
            <MenuItem value="transferencia">Transferencia</MenuItem>
            <MenuItem value="tarjeta">Tarjeta</MenuItem>
          </TextField>
          <TextField
            label="Monto"
            type="number"
            fullWidth
            margin="dense"
            value={nuevoPago.monto}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, monto: e.target.value })
            }
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleRegistrarPago}
            disabled={!nuevoPago.dni || !nuevoPago.monto}
          >
            Registrar
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

const renderMetodo = (metodo) => {
  switch (metodo?.toLowerCase()) {
    case "efectivo":
      return "💵 Efectivo";
    case "transferencia":
      return "✔ Transferencia";
    case "tarjeta":
      return "💳 Tarjeta";
    default:
      return metodo;
  }
};
