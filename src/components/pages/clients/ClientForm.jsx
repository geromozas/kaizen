// import { Button, TextField, MenuItem } from "@mui/material";
// import { useState, useEffect } from "react";
// import { db } from "../../../firebaseConfig";
// import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
// import { useActivities } from "../activities/useActivities";

// export const ClientForm = ({
//   handleClose,
//   setIsChange,
//   clientSelected,
//   setClientSelected,
// }) => {
//   const [isUploading, setIsUploading] = useState(false);
//   const { activities, loading: activitiesLoading } = useActivities();

//   const proporciones = [
//     { label: "Mes completo", factor: 1 },
//     { label: "3/4 del mes", factor: 0.75 },
//     { label: "1/2 mes", factor: 0.5 },
//     { label: "1/4 del mes", factor: 0.25 },
//   ];

//   const [newClient, setNewClient] = useState({
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

//   const calcularDeuda = (actividadLabel, proporcion) => {
//     const actividad = activities.find((a) => a.label === actividadLabel);
//     if (!actividad || proporcion == null) return 0;
//     return Math.round((actividad.valor * proporcion) / 100) * 100;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     let updatedActividad =
//       name === "actividad"
//         ? value
//         : clientSelected?.actividad || newClient.actividad;

//     let updatedProporcion =
//       name === "proporcion"
//         ? parseFloat(value)
//         : clientSelected?.proporcion || newClient.proporcion;

//     const updatedDebt = calcularDeuda(updatedActividad, updatedProporcion);

//     const updatedValues = {
//       [name]: name === "proporcion" ? parseFloat(value) : value,
//       debt: updatedDebt,
//     };

//     if (clientSelected) {
//       setClientSelected({
//         ...clientSelected,
//         ...updatedValues,
//       });
//     } else {
//       setNewClient({
//         ...newClient,
//         ...updatedValues,
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsUploading(true);

//     try {
//       const clientsRef = collection(db, "clients");

//       if (clientSelected) {
//         await updateDoc(doc(clientsRef, clientSelected.id), clientSelected);
//       } else {
//         await addDoc(clientsRef, {
//           ...newClient,
//           estado: "Deudor",
//         });
//       }

//       setIsChange(true);
//       handleClose();
//     } catch (error) {
//       console.error("Error al guardar cliente:", error);
//       alert("Error al guardar el cliente");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // Recalcular deuda cuando se carga un cliente existente
//   useEffect(() => {
//     if (clientSelected && activities.length > 0) {
//       const debt = calcularDeuda(
//         clientSelected.actividad,
//         clientSelected.proporcion
//       );
//       if (debt !== clientSelected.debt) {
//         setClientSelected({
//           ...clientSelected,
//           debt: debt,
//         });
//       }
//     }
//   }, [clientSelected, activities]);

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
//       <h1>{clientSelected ? "Editar Alumno" : "Nuevo Alumno"}</h1>

//       <TextField
//         label="Nombre"
//         name="name"
//         onChange={handleChange}
//         defaultValue={clientSelected?.name}
//         required
//       />
//       <TextField
//         label="Apellido"
//         name="lastName"
//         onChange={handleChange}
//         defaultValue={clientSelected?.lastName}
//         required
//       />
//       <TextField
//         label="Celular"
//         name="phone"
//         onChange={handleChange}
//         defaultValue={clientSelected?.phone}
//         required
//       />
//       <TextField
//         label="2do Celular"
//         name="phoneHelp"
//         onChange={handleChange}
//         defaultValue={clientSelected?.phoneHelp}
//       />
//       <TextField
//         label="Dirección"
//         name="address"
//         onChange={handleChange}
//         defaultValue={clientSelected?.address}
//       />
//       <TextField
//         label="DNI"
//         name="dni"
//         onChange={handleChange}
//         defaultValue={clientSelected?.dni}
//         required
//       />

//       <TextField
//         select
//         label="Actividad"
//         name="actividad"
//         value={clientSelected?.actividad || newClient.actividad}
//         onChange={handleChange}
//         fullWidth
//         required
//         disabled={activitiesLoading}
//       >
//         {activitiesLoading ? (
//           <MenuItem disabled>Cargando actividades...</MenuItem>
//         ) : (
//           activities.map((actividad) => (
//             <MenuItem key={actividad.id} value={actividad.label}>
//               {actividad.label} - ${actividad.valor.toLocaleString()}
//             </MenuItem>
//           ))
//         )}
//       </TextField>

//       <TextField
//         select
//         label="Inicio del mes"
//         name="proporcion"
//         value={
//           clientSelected?.proporcion?.toString() ||
//           newClient.proporcion.toString()
//         }
//         onChange={handleChange}
//         fullWidth
//         required
//       >
//         {proporciones.map((p) => (
//           <MenuItem key={p.label} value={p.factor}>
//             {p.label}
//           </MenuItem>
//         ))}
//       </TextField>

//       <p>
//         <strong>Deuda estimada:</strong> $
//         {(clientSelected?.debt || newClient.debt).toLocaleString()}
//       </p>

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-around",
//           marginTop: 20,
//         }}
//       >
//         <Button
//           variant="contained"
//           type="submit"
//           disabled={isUploading || activitiesLoading}
//         >
//           {isUploading
//             ? "Guardando..."
//             : clientSelected
//             ? "Modificar"
//             : "Crear"}
//         </Button>
//         <Button variant="contained" onClick={handleClose}>
//           Cancelar
//         </Button>
//       </div>
//     </form>
//   );
// };
import { Button, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useActivities } from "../activities/useActivities";

export const ClientForm = ({
  handleClose,
  setIsChange,
  clientSelected,
  setClientSelected,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { activities, loading: activitiesLoading } = useActivities();

  const proporciones = [
    { label: "Mes completo", factor: 1 },
    { label: "3/4 del mes", factor: 0.75 },
    { label: "1/2 mes", factor: 0.5 },
    { label: "1/4 del mes", factor: 0.25 },
  ];

  const [newClient, setNewClient] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    phoneHelp: "",
    dni: "",
    actividad: "",
    proporcion: 1,
    debt: 0,
    lastpay: "",
  });

  const calcularDeuda = (actividadLabel, proporcion) => {
    const actividad = activities.find((a) => a.label === actividadLabel);
    if (!actividad || proporcion == null) return 0;
    return Math.round((actividad.valor * proporcion) / 100) * 100;
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
        : clientSelected?.actividad || newClient.actividad;

    let updatedProporcion =
      name === "proporcion"
        ? parseFloat(value)
        : clientSelected?.proporcion || newClient.proporcion;

    const updatedDebt = calcularDeuda(updatedActividad, updatedProporcion);

    // Calcular el nuevo estado basado en la deuda
    const currentSaldoFavor =
      clientSelected?.saldoFavor || newClient.saldoFavor || 0;
    const updatedEstado = calcularEstado(updatedDebt, currentSaldoFavor);

    const updatedValues = {
      [name]: name === "proporcion" ? parseFloat(value) : value,
      debt: updatedDebt,
      estado: updatedEstado, // Actualizar también el estado
    };

    if (clientSelected) {
      setClientSelected({
        ...clientSelected,
        ...updatedValues,
      });
    } else {
      setNewClient({
        ...newClient,
        ...updatedValues,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const clientsRef = collection(db, "clients");

      if (clientSelected) {
        // Para clientes existentes, asegurar que el estado se actualiza
        const dataToUpdate = {
          ...clientSelected,
          estado: calcularEstado(
            clientSelected.debt,
            clientSelected.saldoFavor || 0
          ),
        };
        await updateDoc(doc(clientsRef, clientSelected.id), dataToUpdate);
      } else {
        // Para clientes nuevos, calcular el estado inicial
        const estadoInicial = calcularEstado(
          newClient.debt,
          newClient.saldoFavor || 0
        );
        await addDoc(clientsRef, {
          ...newClient,
          estado: estadoInicial,
        });
      }

      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Error al guardar el cliente");
    } finally {
      setIsUploading(false);
    }
  };

  // Recalcular deuda y estado cuando se carga un cliente existente
  useEffect(() => {
    if (clientSelected && activities.length > 0) {
      const debt = calcularDeuda(
        clientSelected.actividad,
        clientSelected.proporcion
      );
      const estado = calcularEstado(debt, clientSelected.saldoFavor || 0);

      if (debt !== clientSelected.debt || estado !== clientSelected.estado) {
        setClientSelected({
          ...clientSelected,
          debt: debt,
          estado: estado, // Actualizar también el estado
        });
      }
    }
  }, [clientSelected, activities]);

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
      <h1>{clientSelected ? "Editar Alumno" : "Nuevo Alumno"}</h1>

      <TextField
        label="Nombre"
        name="name"
        onChange={handleChange}
        defaultValue={clientSelected?.name}
        required
      />
      <TextField
        label="Apellido"
        name="lastName"
        onChange={handleChange}
        defaultValue={clientSelected?.lastName}
        required
      />
      <TextField
        label="Celular"
        name="phone"
        onChange={handleChange}
        defaultValue={clientSelected?.phone}
        required
      />
      <TextField
        label="2do Celular"
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
      <TextField
        label="DNI"
        name="dni"
        onChange={handleChange}
        defaultValue={clientSelected?.dni}
        required
      />

      <TextField
        select
        label="Actividad"
        name="actividad"
        value={clientSelected?.actividad || newClient.actividad}
        onChange={handleChange}
        fullWidth
        required
        disabled={activitiesLoading}
      >
        {activitiesLoading ? (
          <MenuItem disabled>Cargando actividades...</MenuItem>
        ) : (
          activities.map((actividad) => (
            <MenuItem key={actividad.id} value={actividad.label}>
              {actividad.label} - ${actividad.valor.toLocaleString()}
            </MenuItem>
          ))
        )}
      </TextField>

      <TextField
        select
        label="Inicio del mes"
        name="proporcion"
        value={
          clientSelected?.proporcion?.toString() ||
          newClient.proporcion.toString()
        }
        onChange={handleChange}
        fullWidth
        required
      >
        {proporciones.map((p) => (
          <MenuItem key={p.label} value={p.factor}>
            {p.label}
          </MenuItem>
        ))}
      </TextField>

      <p>
        <strong>Deuda estimada:</strong> $
        {(clientSelected?.debt || newClient.debt).toLocaleString()}
      </p>

      {/* Mostrar el estado calculado para feedback visual */}
      <p>
        <strong>Estado:</strong>{" "}
        {clientSelected?.estado ||
          calcularEstado(newClient.debt, newClient.saldoFavor || 0)}
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
            : clientSelected
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
