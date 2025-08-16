// import Table from "@mui/material/Table";
// import TableBody from "@mui/material/TableBody";
// import TableCell from "@mui/material/TableCell";
// import TableContainer from "@mui/material/TableContainer";
// import TableHead from "@mui/material/TableHead";
// import TableRow from "@mui/material/TableRow";
// import Paper from "@mui/material/Paper";
// import {
//   Button,
//   IconButton,
//   TextField,
//   MenuItem,
//   Select,
//   Typography,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import SettingsIcon from "@mui/icons-material/Settings";

// import { deleteDoc, doc } from "firebase/firestore";
// import Box from "@mui/material/Box";
// import Modal from "@mui/material/Modal";
// import { useState } from "react";
// import { useActivities } from "../activities/useActivities";
// import { db } from "../../../firebaseConfig";
// import { ClientForm } from "./ClientForm";
// import { ActivityPricesManager } from "../activities/ActivityPricesManager";

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 500,
//   bgcolor: "background.paper",
//   border: "2px solid #000",
//   borderRadius: 5,
//   boxShadow: 24,
//   p: 4,
// };

// const ClientsList = ({ clients = [], setIsChange }) => {
//   const [openForm, setOpenForm] = useState(false);
//   const [openProfile, setOpenProfile] = useState(false);
//   const [openPricesManager, setOpenPricesManager] = useState(false);
//   const [clientSelected, setClientSelected] = useState(null);
//   const [actividadFilter, setActividadFilter] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const { activities = [], reloadActivities } = useActivities();

//   const handleCloseForm = () => setOpenForm(false);
//   const handleCloseProfile = () => setOpenProfile(false);
//   const handleClosePricesManager = () => setOpenPricesManager(false);

//   const handleOpenForm = (client) => {
//     setClientSelected(client);
//     setOpenForm(true);
//   };

//   const handleOpenProfile = (client) => {
//     setClientSelected(client);
//     setOpenProfile(true);
//   };

//   const handleOpenPricesManager = () => {
//     setOpenPricesManager(true);
//   };

//   const handleActivityUpdate = () => {
//     reloadActivities();
//     setIsChange(true); // Para refrescar la lista de clientes también
//   };

//   const deleteClient = (id) => {
//     if (confirm("¿Estás seguro de que quieres eliminar este alumno?")) {
//       deleteDoc(doc(db, "clients", id));
//       alert("Alumno borrado");
//       setIsChange(true);
//     }
//   };

//   // Verificación de seguridad para evitar el error de filter
//   const filteredClients = Array.isArray(clients)
//     ? clients.filter((client) => {
//         const matchesActividad = actividadFilter
//           ? client.actividad === actividadFilter
//           : true;
//         const matchesSearch = `${client.name || ""} ${client.lastName || ""} ${
//           client.dni || ""
//         }`
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());
//         return matchesActividad && matchesSearch;
//       })
//     : [];

//   return (
//     <div style={{ marginTop: 30 }}>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 15,
//         }}
//       >
//         <div style={{ marginLeft: 10 }}>
//           <h2>Lista de alumnos</h2>
//           <p>Alumnos registrados</p>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <TextField
//             label="Buscar por nombre o DNI"
//             variant="outlined"
//             size="small"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Select
//             displayEmpty
//             size="small"
//             value={actividadFilter}
//             onChange={(e) => setActividadFilter(e.target.value)}
//             sx={{ width: 200 }}
//           >
//             <MenuItem value="">Todas las actividades</MenuItem>
//             {Array.isArray(activities) &&
//               activities.map((actividad) => (
//                 <MenuItem key={actividad.id} value={actividad.label}>
//                   {actividad.label}
//                 </MenuItem>
//               ))}
//           </Select>
//           <Button
//             variant="outlined"
//             startIcon={<SettingsIcon />}
//             onClick={handleOpenPricesManager}
//           >
//             Gestionar Precios
//           </Button>
//           <Button variant="contained" onClick={() => handleOpenForm(null)}>
//             + Nuevo alumno
//           </Button>
//         </div>
//       </div>

//       <TableContainer component={Paper}>
//         <Table sx={{ minWidth: 650 }} aria-label="tabla de alumnos">
//           <TableHead>
//             <TableRow>
//               <TableCell style={{ fontWeight: "bold" }}>Nombre</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Apellido</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>DNI</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Celular</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>2do Celular</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Dirección</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Actividad</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Deuda</TableCell>
//               <TableCell style={{ fontWeight: "bold" }}>Acciones</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredClients.map((client) => (
//               <TableRow key={client.id}>
//                 <TableCell
//                   style={{
//                     color:
//                       client.estado === "Deudor"
//                         ? "red"
//                         : client.estado === "Inactivo"
//                         ? "goldenrod"
//                         : "green",
//                     fontWeight: "bold",
//                     cursor: "pointer",
//                   }}
//                   onClick={() => handleOpenProfile(client)}
//                 >
//                   {client.name}
//                 </TableCell>
//                 <TableCell
//                   style={{ cursor: "pointer" }}
//                   onClick={() => handleOpenProfile(client)}
//                 >
//                   {client.lastName}
//                 </TableCell>
//                 <TableCell>{client.dni}</TableCell>
//                 <TableCell>{client.phone}</TableCell>
//                 <TableCell>{client.phoneHelp}</TableCell>
//                 <TableCell>{client.address}</TableCell>
//                 <TableCell>{client.actividad || "No asignada"}</TableCell>

//                 <TableCell
//                   style={{
//                     color:
//                       (client.estado === "Inactivo" ? 0 : client.debt || 0) > 0
//                         ? "red"
//                         : "green",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   $
//                   {client.estado === "Inactivo"
//                     ? 0
//                     : (client.debt || 0).toLocaleString()}
//                 </TableCell>
//                 <TableCell>
//                   <IconButton onClick={() => handleOpenForm(client)}>
//                     <EditIcon />
//                   </IconButton>
//                   <IconButton onClick={() => deleteClient(client.id)}>
//                     <DeleteIcon />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Modal de edición */}
//       <Modal open={openForm} onClose={handleCloseForm}>
//         <Box sx={{ ...style, width: 800, height: 750 }}>
//           <ClientForm
//             handleClose={handleCloseForm}
//             setIsChange={setIsChange}
//             clientSelected={clientSelected}
//             setClientSelected={setClientSelected}
//           />
//         </Box>
//       </Modal>

//       {/* Modal de perfil */}
//       <Modal open={openProfile} onClose={handleCloseProfile}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 400,
//             bgcolor: "background.paper",
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2,
//           }}
//         >
//           {clientSelected && (
//             <>
//               <Typography
//                 variant="h5"
//                 gutterBottom
//                 sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}
//               >
//                 Perfil de {clientSelected.name} {clientSelected.lastName}
//               </Typography>

//               <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//                 <Typography>
//                   <strong>DNI:</strong> {clientSelected.dni}
//                 </Typography>
//                 <Typography>
//                   <strong>Celular:</strong> {clientSelected.phone}
//                 </Typography>
//                 <Typography>
//                   <strong>2do Celular:</strong>{" "}
//                   {clientSelected.phoneHelp || "N/A"}
//                 </Typography>
//                 <Typography>
//                   <strong>Dirección:</strong> {clientSelected.address}
//                 </Typography>
//                 <Typography>
//                   <strong>Actividad:</strong>{" "}
//                   {clientSelected.actividad || "No asignada"}
//                 </Typography>
//                 <Typography>
//                   <strong>Estado:</strong> {clientSelected.estado}
//                 </Typography>
//                 <Typography
//                   color={clientSelected.debt > 0 ? "error" : "success.main"}
//                 >
//                   <strong>Deuda:</strong> $
//                   {(clientSelected.debt || 0).toLocaleString()}
//                 </Typography>
//                 <Typography>
//                   <strong>Último pago:</strong>{" "}
//                   {clientSelected.ultimoPago || "Sin pagos"}
//                 </Typography>
//               </Box>
//             </>
//           )}
//         </Box>
//       </Modal>

//       {/* Modal de gestión de precios */}
//       <ActivityPricesManager
//         open={openPricesManager}
//         onClose={handleClosePricesManager}
//         onActivityUpdate={handleActivityUpdate}
//       />
//     </div>
//   );
// };

// export default ClientsList;
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Button,
  IconButton,
  TextField,
  MenuItem,
  Select,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Modal from "@mui/material/Modal";
import { useState, useEffect } from "react";
import { useActivities } from "../activities/useActivities";
import { db } from "../../../firebaseConfig";
import { ClientForm } from "./ClientForm";
import { ActivityPricesManager } from "../activities/ActivityPricesManager";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};

const daysOfWeek = [
  { key: "sunday", label: "Domingo", value: 0 },
  { key: "monday", label: "Lunes", value: 1 },
  { key: "tuesday", label: "Martes", value: 2 },
  { key: "wednesday", label: "Miércoles", value: 3 },
  { key: "thursday", label: "Jueves", value: 4 },
  { key: "friday", label: "Viernes", value: 5 },
  { key: "saturday", label: "Sábado", value: 6 },
];

const ClientsList = ({ clients = [], setIsChange }) => {
  const [openForm, setOpenForm] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPricesManager, setOpenPricesManager] = useState(false);
  const [clientSelected, setClientSelected] = useState(null);
  const [actividadFilter, setActividadFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSchedules, setClientSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const { activities = [], reloadActivities } = useActivities();

  const handleCloseForm = () => setOpenForm(false);
  const handleCloseProfile = () => {
    setOpenProfile(false);
    setClientSchedules([]);
  };
  const handleClosePricesManager = () => setOpenPricesManager(false);

  const handleOpenForm = (client) => {
    setClientSelected(client);
    setOpenForm(true);
  };

  const handleOpenProfile = async (client) => {
    setClientSelected(client);
    setLoadingSchedules(true);

    try {
      // Obtener los horarios donde aparece este cliente
      const schedulesRef = collection(db, "schedules");
      const schedulesSnap = await getDocs(schedulesRef);

      const clientSchedulesList = [];

      schedulesSnap.docs.forEach((doc) => {
        const scheduleData = doc.data();
        const clientInSchedule = scheduleData.clients?.find(
          (c) => c.id === client.id
        );

        if (clientInSchedule) {
          clientSchedulesList.push({
            id: doc.id,
            date: scheduleData.date,
            hour: scheduleData.hour,
            attended: clientInSchedule.attended || false,
          });
        }
      });

      // Ordenar por fecha y hora
      clientSchedulesList.sort((a, b) => {
        if (a.date === b.date) {
          return a.hour.localeCompare(b.hour);
        }
        return a.date.localeCompare(b.date);
      });

      setClientSchedules(clientSchedulesList);
    } catch (error) {
      console.error("Error al cargar horarios del cliente:", error);
    } finally {
      setLoadingSchedules(false);
    }

    setOpenProfile(true);
  };

  const handleOpenPricesManager = () => {
    setOpenPricesManager(true);
  };

  const handleActivityUpdate = () => {
    reloadActivities();
    setIsChange(true); // Para refrescar la lista de clientes también
  };

  const deleteClient = (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este alumno?")) {
      deleteDoc(doc(db, "clients", id));
      alert("Alumno borrado");
      setIsChange(true);
    }
  };

  // Función para obtener el nombre del día de la semana
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const dayValue = date.getDay();
    return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Agrupar horarios por día de la semana para mostrar resumen
  const getScheduleSummary = (schedules) => {
    const summary = {};

    schedules.forEach((schedule) => {
      const date = new Date(schedule.date);
      const dayValue = date.getDay();
      const dayName = getDayName(schedule.date);

      if (!summary[dayValue]) {
        summary[dayValue] = {
          day: dayName,
          hours: new Set(),
        };
      }

      summary[dayValue].hours.add(schedule.hour);
    });

    return Object.values(summary).map((item) => ({
      day: item.day,
      hours: Array.from(item.hours).sort(),
    }));
  };

  // Verificación de seguridad para evitar el error de filter
  const filteredClients = Array.isArray(clients)
    ? clients.filter((client) => {
        const matchesActividad = actividadFilter
          ? client.actividad === actividadFilter
          : true;
        const matchesSearch = `${client.name || ""} ${client.lastName || ""} ${
          client.dni || ""
        }`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesActividad && matchesSearch;
      })
    : [];

  return (
    <div style={{ marginTop: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <div style={{ marginLeft: 10 }}>
          <h2>Lista de alumnos</h2>
          <p>Alumnos registrados</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TextField
            label="Buscar por nombre o DNI"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            displayEmpty
            size="small"
            value={actividadFilter}
            onChange={(e) => setActividadFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Todas las actividades</MenuItem>
            {Array.isArray(activities) &&
              activities.map((actividad) => (
                <MenuItem key={actividad.id} value={actividad.label}>
                  {actividad.label}
                </MenuItem>
              ))}
          </Select>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleOpenPricesManager}
          >
            Gestionar Precios
          </Button>
          <Button variant="contained" onClick={() => handleOpenForm(null)}>
            + Nuevo alumno
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla de alumnos">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Apellido</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>DNI</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Celular</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>2do Celular</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Dirección</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Actividad</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Deuda</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell
                  style={{
                    color:
                      client.estado === "Deudor"
                        ? "red"
                        : client.estado === "Inactivo"
                        ? "goldenrod"
                        : "green",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOpenProfile(client)}
                >
                  {client.name}
                </TableCell>
                <TableCell
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOpenProfile(client)}
                >
                  {client.lastName}
                </TableCell>
                <TableCell>{client.dni}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.phoneHelp}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>{client.actividad || "No asignada"}</TableCell>

                <TableCell
                  style={{
                    color:
                      (client.estado === "Inactivo" ? 0 : client.debt || 0) > 0
                        ? "red"
                        : "green",
                    fontWeight: "bold",
                  }}
                >
                  $
                  {client.estado === "Inactivo"
                    ? 0
                    : (client.debt || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenForm(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteClient(client.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de edición */}
      <Modal open={openForm} onClose={handleCloseForm}>
        <Box sx={{ ...style, width: 800, height: 750 }}>
          <ClientForm
            handleClose={handleCloseForm}
            setIsChange={setIsChange}
            clientSelected={clientSelected}
            setClientSelected={setClientSelected}
          />
        </Box>
      </Modal>

      {/* Modal de perfil */}
      <Modal open={openProfile} onClose={handleCloseProfile}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {clientSelected && (
            <>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}
              >
                Perfil de {clientSelected.name} {clientSelected.lastName}
              </Typography>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}
              >
                <Typography>
                  <strong>DNI:</strong> {clientSelected.dni}
                </Typography>
                <Typography>
                  <strong>Celular:</strong> {clientSelected.phone}
                </Typography>
                <Typography>
                  <strong>2do Celular:</strong>{" "}
                  {clientSelected.phoneHelp || "N/A"}
                </Typography>
                <Typography>
                  <strong>Dirección:</strong> {clientSelected.address}
                </Typography>
                <Typography>
                  <strong>Actividad:</strong>{" "}
                  {clientSelected.actividad || "No asignada"}
                </Typography>
                <Typography>
                  <strong>Estado:</strong> {clientSelected.estado}
                </Typography>
                <Typography
                  color={clientSelected.debt > 0 ? "error" : "success.main"}
                >
                  <strong>Deuda:</strong> $
                  {(clientSelected.debt || 0).toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Último pago:</strong>{" "}
                  {clientSelected.ultimoPago || "Sin pagos"}
                </Typography>
              </Box>

              {/* Sección de Horarios */}
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <AccessTimeIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Horarios Programados
                  </Typography>
                </Box>

                {loadingSchedules ? (
                  <Typography>Cargando horarios...</Typography>
                ) : clientSchedules.length > 0 ? (
                  <>
                    {/* Resumen por día de la semana */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, color: "text.secondary" }}
                      >
                        Horarios habituales:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {getScheduleSummary(clientSchedules).map(
                          (summary, index) => (
                            <Chip
                              key={index}
                              label={`${summary.day}: ${summary.hours.join(
                                ", "
                              )}`}
                              variant="outlined"
                              size="small"
                              color="primary"
                            />
                          )
                        )}
                      </Box>
                    </Box>

                    {/* Lista detallada de horarios próximos */}
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      Próximos horarios programados:
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                      {clientSchedules
                        .filter(
                          (schedule) =>
                            new Date(schedule.date) >=
                            new Date().setHours(0, 0, 0, 0)
                        )
                        .slice(0, 10)
                        .map((schedule, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 1,
                              mb: 1,
                              bgcolor: schedule.attended
                                ? "success.light"
                                : "grey.100",
                              borderRadius: 1,
                              border: schedule.attended
                                ? "1px solid green"
                                : "1px solid #e0e0e0",
                            }}
                          >
                            <Box>
                              <Typography variant="body2">
                                <strong>{getDayName(schedule.date)}</strong>{" "}
                                {formatDate(schedule.date)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Hora: {schedule.hour}
                              </Typography>
                            </Box>
                            <Chip
                              label={
                                schedule.attended ? "Asistió" : "Programado"
                              }
                              color={schedule.attended ? "success" : "default"}
                              size="small"
                            />
                          </Box>
                        ))}
                    </Box>

                    {/* Estadísticas de asistencia */}
                    <Box
                      sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Estadísticas:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Typography variant="body2">
                          <strong>Total horarios:</strong>{" "}
                          {clientSchedules.length}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Asistencias:</strong>{" "}
                          {clientSchedules.filter((s) => s.attended).length}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Asistencia:</strong>{" "}
                          {clientSchedules.length > 0
                            ? Math.round(
                                (clientSchedules.filter((s) => s.attended)
                                  .length /
                                  clientSchedules.length) *
                                  100
                              )
                            : 0}
                          %
                        </Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Typography color="text.secondary">
                    No tiene horarios programados
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Modal de gestión de precios */}
      <ActivityPricesManager
        open={openPricesManager}
        onClose={handleClosePricesManager}
        onActivityUpdate={handleActivityUpdate}
      />
    </div>
  );
};

export default ClientsList;
