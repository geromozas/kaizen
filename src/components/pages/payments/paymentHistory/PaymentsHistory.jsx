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
// import {
//   Button,
//   Modal,
//   Box,
//   TextField,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   TableCell,
//   TableBody,
//   TableRow,
//   TableContainer,
//   Table,
//   TableHead,
//   Paper,
// } from "@mui/material";
// import "./PaymentsHistory.css";
// import { Timestamp } from "firebase/firestore";

// export const PaymentsHistory = () => {
//   const [pagos, setPagos] = useState([]);
//   const [filtro, setFiltro] = useState("");
//   const [openModal, setOpenModal] = useState(false);
//   const [filtroMetodo, setFiltroMetodo] = useState("");
//   const [filtroTipo, setFiltroTipo] = useState("");

//   const [nuevoPago, setNuevoPago] = useState({
//     nombre: "",
//     dni: "",
//     concepto: "",
//     metodo: "",
//     monto: "",
//     fecha: new Date().toLocaleDateString("es-AR"),
//     tipo: "", // cliente o paciente
//   });

//   const cargarPagos = async () => {
//     // Cargar pagos de clientes
//     const clientPaymentsSnap = await getDocs(collection(db, "payments"));
//     const clientPayments = clientPaymentsSnap.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       tipoPersona: "Cliente",
//       personaInfo: doc.data().alumno,
//       collection: "payments",
//     }));

//     // Cargar pagos de pacientes
//     const patientPaymentsSnap = await getDocs(
//       collection(db, "patientPayments")
//     );
//     const patientPayments = patientPaymentsSnap.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       tipoPersona: "Paciente",
//       personaInfo: doc.data().paciente,
//       collection: "patientPayments",
//     }));

//     // Combinar ambos arrays
//     const allPayments = [...clientPayments, ...patientPayments];

//     const ordenado = allPayments.sort((a, b) => {
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
//     const buscarPersona = async () => {
//       if (nuevoPago.dni.trim().length >= 5 && nuevoPago.tipo) {
//         const coleccion = nuevoPago.tipo === "cliente" ? "clients" : "patients";

//         const q = query(
//           collection(db, coleccion),
//           where("dni", "==", nuevoPago.dni.trim())
//         );
//         const snap = await getDocs(q);

//         if (!snap.empty) {
//           const persona = snap.docs[0].data();
//           setNuevoPago((prev) => ({
//             ...prev,
//             nombre: persona.name,
//           }));
//         } else {
//           setNuevoPago((prev) => ({
//             ...prev,
//             nombre: "",
//           }));
//         }
//       }
//     };
//     buscarPersona();
//   }, [nuevoPago.dni, nuevoPago.tipo]);

//   const pagosFiltrados = pagos.filter((p) => {
//     const coincideTexto =
//       p.personaInfo.name?.toLowerCase().includes(filtro.toLowerCase()) ||
//       p.personaInfo.dni.includes(filtro);

//     const coincideMetodo =
//       !filtroMetodo || p.metodo?.toLowerCase() === filtroMetodo;

//     const coincideTipo =
//       !filtroTipo || p.tipoPersona.toLowerCase() === filtroTipo;

//     return coincideTexto && coincideMetodo && coincideTipo;
//   });

//   const handleRegistrarPago = async () => {
//     const montoPagado = parseInt(nuevoPago.monto);

//     // Obtener el mes en formato YYYY-MM desde la fecha ingresada
//     const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
//     const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;
//     const fechaPago = new Date(anio, mes - 1, dia);

//     const pagoFinal = {
//       fecha: nuevoPago.fecha,
//       concepto: nuevoPago.concepto,
//       metodo: nuevoPago.metodo,
//       monto: montoPagado,
//       mes: mesPago,
//       createdAt: Timestamp.fromDate(fechaPago),
//     };

//     // Determinar colección y estructura según el tipo
//     if (nuevoPago.tipo === "cliente") {
//       pagoFinal.alumno = {
//         name: nuevoPago.nombre,
//         dni: nuevoPago.dni,
//       };
//       await addDoc(collection(db, "payments"), pagoFinal);

//       // Actualizar cliente
//       const q = query(
//         collection(db, "clients"),
//         where("dni", "==", nuevoPago.dni)
//       );
//       const snap = await getDocs(q);

//       if (!snap.empty) {
//         const clienteDoc = snap.docs[0];
//         const clienteRef = doc(db, "clients", clienteDoc.id);
//         const clienteData = clienteDoc.data();

//         const deudaActual = clienteData.debt || 30000;
//         const nuevaDeuda = Math.max(0, deudaActual - montoPagado);
//         const nuevoEstado = nuevaDeuda === 0 ? "Al día" : "Deudor";

//         await updateDoc(clienteRef, {
//           ultimoPago: nuevoPago.fecha,
//           debt: nuevaDeuda,
//           estado: nuevoEstado,
//         });
//       }
//     } else if (nuevoPago.tipo === "paciente") {
//       pagoFinal.paciente = {
//         name: nuevoPago.nombre,
//         dni: nuevoPago.dni,
//       };
//       await addDoc(collection(db, "patientPayments"), pagoFinal);

//       // Actualizar paciente
//       const q = query(
//         collection(db, "patients"),
//         where("dni", "==", nuevoPago.dni)
//       );
//       const snap = await getDocs(q);

//       if (!snap.empty) {
//         const pacienteDoc = snap.docs[0];
//         const pacienteRef = doc(db, "patients", pacienteDoc.id);
//         const pacienteData = pacienteDoc.data();

//         const deudaActual = pacienteData.debt || 30000;
//         const nuevaDeuda = Math.max(0, deudaActual - montoPagado);
//         const nuevoEstado = nuevaDeuda === 0 ? "Al día" : "Deudor";

//         await updateDoc(pacienteRef, {
//           ultimoPago: nuevoPago.fecha,
//           debt: nuevaDeuda,
//           estado: nuevoEstado,
//         });
//       }
//     } else {
//       alert("⚠ No se encontró la persona con ese DNI.");
//       return;
//     }

//     setNuevoPago({
//       nombre: "",
//       dni: "",
//       concepto: "",
//       metodo: "",
//       monto: "",
//       fecha: new Date().toLocaleDateString("es-AR"),
//       tipo: "",
//     });
//     setOpenModal(false);
//     cargarPagos();
//   };

//   const eliminarPago = async (pago) => {
//     if (!window.confirm("¿Estás seguro de eliminar este pago?")) return;

//     await deleteDoc(doc(db, pago.collection, pago.id));

//     // Actualizar deuda según el tipo
//     if (pago.tipoPersona === "Cliente") {
//       const q = query(
//         collection(db, "clients"),
//         where("dni", "==", pago.personaInfo.dni)
//       );
//       const snap = await getDocs(q);

//       if (!snap.empty) {
//         const clienteDoc = snap.docs[0];
//         const clienteRef = doc(db, "clients", clienteDoc.id);
//         const clienteData = clienteDoc.data();

//         const nuevaDeuda = (clienteData.debt || 0) + (pago.monto || 0);
//         await updateDoc(clienteRef, {
//           debt: nuevaDeuda,
//           estado: nuevaDeuda === 0 ? "Al día" : "Deudor",
//         });
//       }
//     } else if (pago.tipoPersona === "Paciente") {
//       const q = query(
//         collection(db, "patients"),
//         where("dni", "==", pago.personaInfo.dni)
//       );
//       const snap = await getDocs(q);

//       if (!snap.empty) {
//         const pacienteDoc = snap.docs[0];
//         const pacienteRef = doc(db, "patients", pacienteDoc.id);
//         const pacienteData = pacienteDoc.data();

//         const nuevaDeuda = (pacienteData.debt || 0) + (pago.monto || 0);
//         await updateDoc(pacienteRef, {
//           debt: nuevaDeuda,
//           estado: nuevaDeuda === 0 ? "Al día" : "Deudor",
//         });
//       }
//     }

//     cargarPagos();
//   };

//   return (
//     <div className="historialPagos">
//       <h2>Historial de Pagos</h2>
//       <p>Registro de todos los pagos realizados</p>
//       <div className="headerPagos">
//         <div style={{ display: "flex", marginTop: 20, gap: 20 }}>
//           <TextField
//             size="small"
//             label="Buscar por nombre o DNI"
//             variant="outlined"
//             value={filtro}
//             onChange={(e) => setFiltro(e.target.value)}
//           />

//           <FormControl size="small" sx={{ minWidth: 150 }}>
//             <InputLabel id="tipo-select-label">Tipo</InputLabel>
//             <Select
//               labelId="tipo-select-label"
//               value={filtroTipo}
//               label="Tipo"
//               onChange={(e) => setFiltroTipo(e.target.value)}
//             >
//               <MenuItem value="">Todos</MenuItem>
//               <MenuItem value="cliente">Gimnasio</MenuItem>
//               <MenuItem value="paciente">Kinesio</MenuItem>
//             </Select>
//           </FormControl>

//           <FormControl size="small" sx={{ minWidth: 180 }}>
//             <InputLabel id="metodo-select-label">Método de pago</InputLabel>
//             <Select
//               labelId="metodo-select-label"
//               value={filtroMetodo}
//               label="Método de pago"
//               onChange={(e) => setFiltroMetodo(e.target.value)}
//             >
//               <MenuItem value="">Todos los métodos</MenuItem>
//               <MenuItem value="efectivo">Efectivo</MenuItem>
//               <MenuItem value="transferencia">Transferencia</MenuItem>
//               <MenuItem value="tarjeta">Tarjeta</MenuItem>
//             </Select>
//           </FormControl>
//         </div>

//         <Button variant="contained" onClick={() => setOpenModal(true)}>
//           💲 Registrar Pago
//         </Button>
//       </div>

//       <TableContainer component={Paper} sx={{ marginTop: 2 }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>
//                 <strong>Fecha</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Tipo</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Nombre</strong>
//               </TableCell>
//               {/* <TableCell><strong>Concepto</strong></TableCell> */}
//               <TableCell>
//                 <strong>Método</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Monto</strong>
//               </TableCell>
//               <TableCell></TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {pagosFiltrados.map((pago) => (
//               <TableRow key={`${pago.collection}-${pago.id}`}>
//                 <TableCell>{pago.fecha}</TableCell>
//                 <TableCell>
//                   <span
//                     className={`tipo ${
//                       pago.tipoPersona === "Cliente" ? "Gimnasio" : "Kinesio"
//                     }`}
//                   >
//                     {pago.tipoPersona === "Cliente"
//                       ? "🏋️ Gimnasio"
//                       : "🏥 Kinesio"}
//                   </span>
//                 </TableCell>
//                 <TableCell>{pago.personaInfo.name}</TableCell>
//                 {/* <TableCell>{pago.concepto}</TableCell> */}
//                 <TableCell>{renderMetodo(pago.metodo)}</TableCell>
//                 <TableCell>${pago.monto.toLocaleString()}</TableCell>
//                 <TableCell>
//                   <Button
//                     color="error"
//                     size="small"
//                     onClick={() => eliminarPago(pago)}
//                   >
//                     🗑 Eliminar
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

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
//             label="Tipo de persona"
//             select
//             fullWidth
//             margin="dense"
//             value={nuevoPago.tipo}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, tipo: e.target.value, nombre: "" })
//             }
//           >
//             <MenuItem value="cliente">Gimnasio</MenuItem>
//             <MenuItem value="paciente">Kinesio</MenuItem>
//           </TextField>
//           <TextField
//             label="DNI"
//             fullWidth
//             margin="dense"
//             value={nuevoPago.dni}
//             onChange={(e) =>
//               setNuevoPago({ ...nuevoPago, dni: e.target.value })
//             }
//             helperText={
//               nuevoPago.tipo &&
//               `Detectado como: ${
//                 nuevoPago.tipo === "cliente" ? "Cliente" : "Paciente"
//               }`
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
//             disabled={!nuevoPago.dni || !nuevoPago.monto || !nuevoPago.tipo}
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
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Table,
  TableHead,
  Paper,
} from "@mui/material";
import "./PaymentsHistory.css";
import { Timestamp } from "firebase/firestore";

export const PaymentsHistory = () => {
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const [nuevoPago, setNuevoPago] = useState({
    nombre: "",
    dni: "",
    concepto: "",
    metodo: "",
    monto: "",
    fecha: new Date().toLocaleDateString("es-AR"),
    tipo: "", // cliente, paciente o quiropraxia
  });

  const cargarPagos = async () => {
    // Cargar pagos de clientes (gimnasio)
    const clientPaymentsSnap = await getDocs(collection(db, "payments"));
    const clientPayments = clientPaymentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipoPersona: "Cliente",
      personaInfo: doc.data().alumno,
      collection: "payments",
    }));

    // Cargar pagos de pacientes (kinesio)
    const patientPaymentsSnap = await getDocs(
      collection(db, "patientPayments")
    );
    const patientPayments = patientPaymentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipoPersona: "Paciente",
      personaInfo: doc.data().paciente,
      collection: "patientPayments",
    }));

    // Cargar pagos de quiropraxia
    const quiropraxiaPaymentsSnap = await getDocs(
      collection(db, "quiropraxiaPayments")
    );
    const quiropraxiaPayments = quiropraxiaPaymentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      tipoPersona: "Quiropraxia",
      personaInfo: doc.data().pacienteQuiro,
      collection: "quiropraxiaPayments",
    }));

    // Combinar los tres arrays
    const allPayments = [
      ...clientPayments,
      ...patientPayments,
      ...quiropraxiaPayments,
    ];

    const ordenado = allPayments.sort((a, b) => {
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
    const buscarPersona = async () => {
      if (nuevoPago.dni.trim().length >= 5 && nuevoPago.tipo) {
        let coleccion;

        if (nuevoPago.tipo === "cliente") {
          coleccion = "clients";
        } else if (nuevoPago.tipo === "paciente") {
          coleccion = "patients";
        } else if (nuevoPago.tipo === "quiropraxia") {
          coleccion = "quiropraxia";
        }

        const q = query(
          collection(db, coleccion),
          where("dni", "==", nuevoPago.dni.trim())
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const persona = snap.docs[0].data();
          setNuevoPago((prev) => ({
            ...prev,
            nombre: persona.name,
          }));
        } else {
          setNuevoPago((prev) => ({
            ...prev,
            nombre: "",
          }));
        }
      }
    };
    buscarPersona();
  }, [nuevoPago.dni, nuevoPago.tipo]);

  const pagosFiltrados = pagos.filter((p) => {
    const coincideTexto =
      p.personaInfo.name?.toLowerCase().includes(filtro.toLowerCase()) ||
      p.personaInfo.dni.includes(filtro);

    const coincideMetodo =
      !filtroMetodo || p.metodo?.toLowerCase() === filtroMetodo;

    const coincideTipo =
      !filtroTipo || p.tipoPersona.toLowerCase() === filtroTipo;

    return coincideTexto && coincideMetodo && coincideTipo;
  });

  const handleRegistrarPago = async () => {
    const montoPagado = parseInt(nuevoPago.monto);

    // Obtener el mes en formato YYYY-MM desde la fecha ingresada
    const [dia, mes, anio] = nuevoPago.fecha.split("/").map(Number);
    const mesPago = `${anio}-${String(mes).padStart(2, "0")}`;
    const fechaPago = new Date(anio, mes - 1, dia);

    const pagoFinal = {
      fecha: nuevoPago.fecha,
      concepto: nuevoPago.concepto,
      metodo: nuevoPago.metodo,
      monto: montoPagado,
      mes: mesPago,
      createdAt: Timestamp.fromDate(fechaPago),
    };

    // Determinar colección y estructura según el tipo
    if (nuevoPago.tipo === "cliente") {
      pagoFinal.alumno = {
        name: nuevoPago.nombre,
        dni: nuevoPago.dni,
      };
      await addDoc(collection(db, "payments"), pagoFinal);

      // Actualizar cliente
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
      }
    } else if (nuevoPago.tipo === "paciente") {
      pagoFinal.paciente = {
        name: nuevoPago.nombre,
        dni: nuevoPago.dni,
      };
      await addDoc(collection(db, "patientPayments"), pagoFinal);

      // Actualizar paciente
      const q = query(
        collection(db, "patients"),
        where("dni", "==", nuevoPago.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const pacienteDoc = snap.docs[0];
        const pacienteRef = doc(db, "patients", pacienteDoc.id);
        const pacienteData = pacienteDoc.data();

        const deudaActual = pacienteData.debt || 30000;
        const nuevaDeuda = Math.max(0, deudaActual - montoPagado);
        const nuevoEstado = nuevaDeuda === 0 ? "Al día" : "Deudor";

        await updateDoc(pacienteRef, {
          ultimoPago: nuevoPago.fecha,
          debt: nuevaDeuda,
          estado: nuevoEstado,
        });
      }
    } else if (nuevoPago.tipo === "quiropraxia") {
      pagoFinal.pacienteQuiro = {
        name: nuevoPago.nombre,
        dni: nuevoPago.dni,
      };
      await addDoc(collection(db, "quiropraxiaPayments"), pagoFinal);

      // Actualizar paciente de quiropraxia
      const q = query(
        collection(db, "quiropraxia"),
        where("dni", "==", nuevoPago.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const quiroDoc = snap.docs[0];
        const quiroRef = doc(db, "quiropraxia", quiroDoc.id);
        const quiroData = quiroDoc.data();

        const deudaActual = quiroData.debt || 0;
        const nuevaDeuda = Math.max(0, deudaActual - montoPagado);
        const nuevoEstado = nuevaDeuda === 0 ? "Al día" : "Deudor";

        await updateDoc(quiroRef, {
          ultimoPago: nuevoPago.fecha,
          debt: nuevaDeuda,
          estado: nuevoEstado,
        });
      }
    } else {
      alert("⚠ No se encontró la persona con ese DNI.");
      return;
    }

    setNuevoPago({
      nombre: "",
      dni: "",
      concepto: "",
      metodo: "",
      monto: "",
      fecha: new Date().toLocaleDateString("es-AR"),
      tipo: "",
    });
    setOpenModal(false);
    cargarPagos();
  };

  const eliminarPago = async (pago) => {
    if (!window.confirm("¿Estás seguro de eliminar este pago?")) return;

    await deleteDoc(doc(db, pago.collection, pago.id));

    // Actualizar deuda según el tipo
    if (pago.tipoPersona === "Cliente") {
      const q = query(
        collection(db, "clients"),
        where("dni", "==", pago.personaInfo.dni)
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
    } else if (pago.tipoPersona === "Paciente") {
      const q = query(
        collection(db, "patients"),
        where("dni", "==", pago.personaInfo.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const pacienteDoc = snap.docs[0];
        const pacienteRef = doc(db, "patients", pacienteDoc.id);
        const pacienteData = pacienteDoc.data();

        const nuevaDeuda = (pacienteData.debt || 0) + (pago.monto || 0);
        await updateDoc(pacienteRef, {
          debt: nuevaDeuda,
          estado: nuevaDeuda === 0 ? "Al día" : "Deudor",
        });
      }
    } else if (pago.tipoPersona === "Quiropraxia") {
      const q = query(
        collection(db, "quiropraxia"),
        where("dni", "==", pago.personaInfo.dni)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const quiroDoc = snap.docs[0];
        const quiroRef = doc(db, "quiropraxia", quiroDoc.id);
        const quiroData = quiroDoc.data();

        const nuevaDeuda = (quiroData.debt || 0) + (pago.monto || 0);
        await updateDoc(quiroRef, {
          debt: nuevaDeuda,
          estado: nuevaDeuda === 0 ? "Al día" : "Deudor",
        });
      }
    }

    cargarPagos();
  };

  return (
    <div className="historialPagos">
      <h2>Historial de Pagos</h2>
      <p>Registro de todos los pagos realizados</p>
      <div className="headerPagos">
        <div style={{ display: "flex", marginTop: 20, gap: 20 }}>
          <TextField
            size="small"
            label="Buscar por nombre o DNI"
            variant="outlined"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="tipo-select-label">Tipo</InputLabel>
            <Select
              labelId="tipo-select-label"
              value={filtroTipo}
              label="Tipo"
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="cliente">Gimnasio</MenuItem>
              <MenuItem value="paciente">Kinesio</MenuItem>
              <MenuItem value="quiropraxia">Quiropraxia</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="metodo-select-label">Método de pago</InputLabel>
            <Select
              labelId="metodo-select-label"
              value={filtroMetodo}
              label="Método de pago"
              onChange={(e) => setFiltroMetodo(e.target.value)}
            >
              <MenuItem value="">Todos los métodos</MenuItem>
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="tarjeta">Tarjeta</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Button variant="contained" onClick={() => setOpenModal(true)}>
          💲 Registrar Pago
        </Button>
      </div>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Fecha</strong>
              </TableCell>
              <TableCell>
                <strong>Tipo</strong>
              </TableCell>
              <TableCell>
                <strong>Nombre</strong>
              </TableCell>
              {/* <TableCell><strong>Concepto</strong></TableCell> */}
              <TableCell>
                <strong>Método</strong>
              </TableCell>
              <TableCell>
                <strong>Monto</strong>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosFiltrados.map((pago) => (
              <TableRow key={`${pago.collection}-${pago.id}`}>
                <TableCell>{pago.fecha}</TableCell>
                <TableCell>
                  <span className={`tipo ${pago.tipoPersona}`}>
                    {pago.tipoPersona === "Cliente" && "🏋️ Gimnasio"}
                    {pago.tipoPersona === "Paciente" && "🏥 Kinesio"}
                    {pago.tipoPersona === "Quiropraxia" && "🦴 Quiropraxia"}
                  </span>
                </TableCell>
                <TableCell>{pago.personaInfo.name}</TableCell>
                {/* <TableCell>{pago.concepto}</TableCell> */}
                <TableCell>{renderMetodo(pago.metodo)}</TableCell>
                <TableCell>${pago.monto.toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => eliminarPago(pago)}
                  >
                    🗑 Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            label="Tipo de persona"
            select
            fullWidth
            margin="dense"
            value={nuevoPago.tipo}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, tipo: e.target.value, nombre: "" })
            }
          >
            <MenuItem value="cliente">🏋️ Gimnasio</MenuItem>
            <MenuItem value="paciente">🏥 Kinesio</MenuItem>
            <MenuItem value="quiropraxia">🦴 Quiropraxia</MenuItem>
          </TextField>
          <TextField
            label="DNI"
            fullWidth
            margin="dense"
            value={nuevoPago.dni}
            onChange={(e) =>
              setNuevoPago({ ...nuevoPago, dni: e.target.value })
            }
            helperText={
              nuevoPago.tipo &&
              `Detectado como: ${
                nuevoPago.tipo === "cliente"
                  ? "Cliente (Gimnasio)"
                  : nuevoPago.tipo === "paciente"
                  ? "Paciente (Kinesio)"
                  : "Paciente (Quiropraxia)"
              }`
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
            disabled={!nuevoPago.dni || !nuevoPago.monto || !nuevoPago.tipo}
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
