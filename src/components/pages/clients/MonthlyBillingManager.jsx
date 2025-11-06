// import {
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Typography,
//   Box,
//   Alert,
//   LinearProgress,
//   List,
//   ListItem,
//   ListItemText,
//   Chip,
//   Checkbox,
//   TextField,
//   InputAdornment,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   IconButton,
//   Collapse,
//   Tooltip,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import SearchIcon from "@mui/icons-material/Search";
// import EditIcon from "@mui/icons-material/Edit";
// import CheckIcon from "@mui/icons-material/Check";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import InfoIcon from "@mui/icons-material/Info";
// import { useState } from "react";
// import { db } from "../../../firebaseConfig";
// import {
//   collection,
//   getDocs,
//   doc,
//   updateDoc,
//   writeBatch,
//   Timestamp,
// } from "firebase/firestore";
// import Swal from "sweetalert2";

// const MonthlyBillingManager = ({ activities, setIsChange }) => {
//   const [open, setOpen] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [previewData, setPreviewData] = useState(null);
//   const [selectedClients, setSelectedClients] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [editingPrices, setEditingPrices] = useState({});
//   const [customPrices, setCustomPrices] = useState({});
//   const [showExcluded, setShowExcluded] = useState(false);
//   const [mesAFacturar, setMesAFacturar] = useState("actual"); // "actual" o "siguiente"

//   const calcularCuotaCliente = (client, activities, useCustomPrice = false) => {
//     if (useCustomPrice && customPrices[client.id] !== undefined) {
//       return customPrices[client.id];
//     }

//     const actividad = activities.find((a) => a.label === client.actividad);
//     if (!actividad) return 0;
//     return Math.round((actividad.valor * (client.proporcion || 1)) / 100) * 100;
//   };

//   const getMesActual = () => {
//     const now = new Date();
//     const mes = now.getMonth() + 1;
//     const anio = now.getFullYear();
//     return `${anio}-${String(mes).padStart(2, "0")}`;
//   };

//   const getMesSiguiente = (mesBase) => {
//     const [anio, mes] = mesBase.split("-").map(Number);
//     let nuevoMes = mes + 1;
//     let nuevoAnio = anio;

//     if (nuevoMes > 12) {
//       nuevoMes = 1;
//       nuevoAnio++;
//     }

//     return `${nuevoAnio}-${String(nuevoMes).padStart(2, "0")}`;
//   };

//   const getMesParaFacturar = () => {
//     const mesActual = getMesActual();
//     return mesAFacturar === "siguiente"
//       ? getMesSiguiente(mesActual)
//       : mesActual;
//   };

//   const formatearMesLegible = (mesStr) => {
//     const [anio, mes] = mesStr.split("-");
//     const fecha = new Date(parseInt(anio), parseInt(mes) - 1, 15);
//     return fecha.toLocaleDateString("es-AR", {
//       year: "numeric",
//       month: "long",
//     });
//   };

//   const clienteTieneMesPagadoAdelantado = (client, mesAVerificar) => {
//     // Si tiene último mes facturado y es igual o posterior al mes que queremos facturar
//     if (client.ultimoMesFacturado) {
//       const [anioFacturado, mesFacturado] = client.ultimoMesFacturado
//         .split("-")
//         .map(Number);
//       const [anioVerificar, mesVerificar] = mesAVerificar
//         .split("-")
//         .map(Number);

//       const fechaFacturada = new Date(anioFacturado, mesFacturado - 1);
//       const fechaVerificar = new Date(anioVerificar, mesVerificar - 1);

//       // Si la fecha facturada es mayor o igual a la que queremos facturar, ya está pagado
//       return fechaFacturada >= fechaVerificar;
//     }

//     return false;
//   };

//   const generarPreview = async () => {
//     setIsProcessing(true);
//     try {
//       const clientsRef = collection(db, "clients");
//       const clientsSnap = await getDocs(clientsRef);

//       const mesParaFacturar = getMesParaFacturar();
//       const clientesAFacturar = [];
//       const clientesExcluidos = [];
//       const selected = {};
//       const prices = {};

//       clientsSnap.docs.forEach((docSnap) => {
//         const client = { id: docSnap.id, ...docSnap.data() };

//         if (client.estado === "Inactivo") {
//           clientesExcluidos.push({
//             ...client,
//             razon: "Cliente inactivo",
//           });
//           return;
//         }

//         // Verificar si ya tiene el mes pagado adelantado
//         if (clienteTieneMesPagadoAdelantado(client, mesParaFacturar)) {
//           clientesExcluidos.push({
//             ...client,
//             razon: `Ya tiene facturado ${formatearMesLegible(
//               client.ultimoMesFacturado
//             )}`,
//           });
//           return;
//         }

//         if (!client.actividad) {
//           clientesExcluidos.push({
//             ...client,
//             razon: "Sin actividad asignada",
//           });
//           return;
//         }

//         const cuota = calcularCuotaCliente(client, activities);

//         // Para el mes siguiente, no consideramos deuda anterior (empezamos limpio)
//         // Para el mes actual, sí sumamos la deuda que ya tienen
//         let deudaAnteriorTotal = 0;
//         if (mesAFacturar === "actual") {
//           deudaAnteriorTotal = (client.debt || 0) + (client.deudaAnterior || 0);
//         }

//         clientesAFacturar.push({
//           ...client,
//           cuotaAFacturar: cuota,
//           deudaAnteriorTotal: deudaAnteriorTotal,
//           totalConDeuda: cuota + deudaAnteriorTotal,
//         });

//         selected[client.id] = true;
//         prices[client.id] = cuota;
//       });

//       setSelectedClients(selected);
//       setCustomPrices(prices);
//       setPreviewData({
//         clientesAFacturar,
//         clientesExcluidos,
//         totalAFacturar: clientesAFacturar.reduce(
//           (sum, c) => sum + c.cuotaAFacturar,
//           0
//         ),
//         mesFacturacion: mesParaFacturar,
//       });
//     } catch (error) {
//       console.error("Error al generar preview:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "No se pudo generar el preview de facturación",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleOpen = async () => {
//     setOpen(true);
//     await generarPreview();
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setPreviewData(null);
//     setSelectedClients({});
//     setSearchTerm("");
//     setEditingPrices({});
//     setCustomPrices({});
//     setShowExcluded(false);
//     setMesAFacturar("actual"); // Reset al cerrar
//   };

//   const toggleClientSelection = (clientId) => {
//     setSelectedClients((prev) => ({
//       ...prev,
//       [clientId]: !prev[clientId],
//     }));
//   };

//   const toggleSelectAll = () => {
//     const allSelected = Object.values(selectedClients).every((v) => v);
//     const newSelection = {};
//     previewData.clientesAFacturar.forEach((client) => {
//       newSelection[client.id] = !allSelected;
//     });
//     setSelectedClients(newSelection);
//   };

//   const handleEditPrice = (clientId) => {
//     setEditingPrices((prev) => ({
//       ...prev,
//       [clientId]: true,
//     }));
//   };

//   const handleSavePrice = (clientId) => {
//     setEditingPrices((prev) => ({
//       ...prev,
//       [clientId]: false,
//     }));
//   };

//   const handleCancelEdit = (clientId) => {
//     const client = previewData.clientesAFacturar.find((c) => c.id === clientId);
//     setCustomPrices((prev) => ({
//       ...prev,
//       [clientId]: calcularCuotaCliente(client, activities, false),
//     }));
//     setEditingPrices((prev) => ({
//       ...prev,
//       [clientId]: false,
//     }));
//   };

//   const handlePriceChange = (clientId, newPrice) => {
//     const price = parseInt(newPrice) || 0;
//     setCustomPrices((prev) => ({
//       ...prev,
//       [clientId]: price,
//     }));
//   };

//   const getClientesSeleccionados = () => {
//     if (!previewData) return [];
//     return previewData.clientesAFacturar.filter(
//       (client) => selectedClients[client.id]
//     );
//   };

//   const getTotalSeleccionados = () => {
//     return getClientesSeleccionados().reduce(
//       (sum, c) => sum + (customPrices[c.id] || c.cuotaAFacturar),
//       0
//     );
//   };

//   const ejecutarFacturacionMensual = async () => {
//     const clientesSeleccionados = getClientesSeleccionados();

//     if (clientesSeleccionados.length === 0) {
//       Swal.fire({
//         icon: "warning",
//         title: "Sin clientes seleccionados",
//         text: "Debes seleccionar al menos un cliente para facturar",
//       });
//       return;
//     }

//     const totalSeleccionado = getTotalSeleccionados();
//     const mesParaFacturar = getMesParaFacturar();

//     const result = await Swal.fire({
//       title: "¿Confirmar facturación?",
//       html: `
//         <p>Se facturarán <strong>${
//           clientesSeleccionados.length
//         }</strong> clientes</p>
//         <p>Total nuevas cuotas: <strong>${totalSeleccionado.toLocaleString(
//           "es-AR"
//         )}</strong></p>
//         <p>Mes a facturar: <strong>${formatearMesLegible(
//           mesParaFacturar
//         )}</strong></p>
//         ${
//           mesAFacturar === "actual"
//             ? '<p style="color: #f57c00;"><strong>⚠️ Este es el mes actual</strong></p>'
//             : '<p style="color: #1976d2;"><strong>📅 Facturando mes siguiente (adelantado)</strong></p>'
//         }
//       `,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Sí, facturar",
//       cancelButtonText: "Cancelar",
//       confirmButtonColor: "#2196f3",
//     });

//     if (!result.isConfirmed) return;

//     setIsProcessing(true);

//     try {
//       const batch = writeBatch(db);
//       const fechaFacturacion = new Date();

//       let procesados = 0;
//       let errores = 0;

//       for (const client of clientesSeleccionados) {
//         try {
//           const clientRef = doc(db, "clients", client.id);
//           const cuotaNueva = customPrices[client.id] || client.cuotaAFacturar;

//           // Obtener valores actuales
//           const deudaActual = client.debt || 0;
//           const deudaAnterior = client.deudaAnterior || 0;
//           const saldoFavor = client.saldoFavor || 0;

//           let nuevaDeuda = 0;
//           let nuevaDeudaAnterior = 0;
//           let nuevoSaldoFavor = 0;
//           let nuevoEstado = "";

//           if (mesAFacturar === "actual") {
//             // LÓGICA PARA MES ACTUAL: Suma deudas anteriores

//             // Si tiene deuda actual, pasa a ser deuda anterior
//             if (deudaActual > 0) {
//               nuevaDeudaAnterior = deudaAnterior + deudaActual;
//             } else {
//               nuevaDeudaAnterior = deudaAnterior;
//             }

//             // Aplicar saldo a favor si existe
//             if (saldoFavor > 0) {
//               if (saldoFavor >= cuotaNueva) {
//                 nuevoSaldoFavor = saldoFavor - cuotaNueva;
//                 nuevaDeuda = 0;
//                 nuevoEstado = "Al día";
//               } else {
//                 nuevaDeuda = cuotaNueva - saldoFavor;
//                 nuevoSaldoFavor = 0;
//                 nuevoEstado = "Deudor";
//               }
//             } else {
//               nuevaDeuda = cuotaNueva;
//               nuevoEstado = "Deudor";
//             }
//           } else {
//             // LÓGICA PARA MES SIGUIENTE: No arrastramos deudas, facturamos limpio

//             // La deuda anterior se mantiene
//             nuevaDeudaAnterior = deudaAnterior + deudaActual;

//             // Aplicar saldo a favor si existe
//             if (saldoFavor > 0) {
//               if (saldoFavor >= cuotaNueva) {
//                 nuevoSaldoFavor = saldoFavor - cuotaNueva;
//                 nuevaDeuda = 0;
//                 nuevoEstado = nuevaDeudaAnterior > 0 ? "Deudor" : "Al día";
//               } else {
//                 nuevaDeuda = cuotaNueva - saldoFavor;
//                 nuevoSaldoFavor = 0;
//                 nuevoEstado = "Deudor";
//               }
//             } else {
//               nuevaDeuda = cuotaNueva;
//               nuevoEstado = "Deudor";
//             }
//           }

//           const updateData = {
//             debt: nuevaDeuda,
//             deudaAnterior: nuevaDeudaAnterior,
//             saldoFavor: nuevoSaldoFavor,
//             estado: nuevoEstado,
//             ultimoMesFacturado: mesParaFacturar,
//             fechaUltimaFacturacion: Timestamp.fromDate(fechaFacturacion),
//           };

//           batch.update(clientRef, updateData);
//           procesados++;
//         } catch (error) {
//           console.error(`Error al procesar cliente ${client.name}:`, error);
//           errores++;
//         }
//       }

//       await batch.commit();

//       setIsChange(true);
//       handleClose();

//       Swal.fire({
//         icon: "success",
//         title: "Facturación completada",
//         html: `
//           <p>✅ Clientes facturados: <strong>${procesados}</strong></p>
//           ${errores > 0 ? `<p>⚠️ Errores: <strong>${errores}</strong></p>` : ""}
//           <p>Total facturado: <strong>${totalSeleccionado.toLocaleString(
//             "es-AR"
//           )}</strong></p>
//           <p>Mes: <strong>${formatearMesLegible(mesParaFacturar)}</strong></p>
//         `,
//         timer: 4000,
//       });
//     } catch (error) {
//       console.error("Error en facturación mensual:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Hubo un error al procesar la facturación mensual",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const filteredClientes = previewData
//     ? previewData.clientesAFacturar.filter((client) =>
//         `${client.name} ${client.lastName}`
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase())
//       )
//     : [];

//   return (
//     <>
//       <Button
//         variant="outlined"
//         startIcon={<CalendarMonthIcon />}
//         onClick={handleOpen}
//         size="small"
//         color="primary"
//       >
//         Facturar Mes
//       </Button>

//       <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
//         <DialogTitle>Facturación Mensual Automática</DialogTitle>

//         <DialogContent>
//           {isProcessing && <LinearProgress sx={{ mb: 2 }} />}

//           {previewData && (
//             <>
//               {/* Selector de mes a facturar */}
//               <Box
//                 sx={{ mb: 2, p: 2, bgcolor: "primary.light", borderRadius: 1 }}
//               >
//                 <Typography
//                   variant="subtitle2"
//                   sx={{ mb: 1, fontWeight: "bold" }}
//                 >
//                   Selecciona el mes a facturar:
//                 </Typography>
//                 <RadioGroup
//                   value={mesAFacturar}
//                   onChange={(e) => {
//                     setMesAFacturar(e.target.value);
//                     generarPreview(); // Regenerar preview al cambiar
//                   }}
//                   row
//                 >
//                   <FormControlLabel
//                     value="actual"
//                     control={<Radio />}
//                     label={`Mes Actual (${formatearMesLegible(
//                       getMesActual()
//                     )})`}
//                   />
//                   <FormControlLabel
//                     value="siguiente"
//                     control={<Radio />}
//                     label={`Mes Siguiente (${formatearMesLegible(
//                       getMesSiguiente(getMesActual())
//                     )})`}
//                   />
//                 </RadioGroup>
//               </Box>

//               <Alert severity="info" sx={{ mb: 2 }}>
//                 <Typography variant="body2">
//                   <strong>Mes a facturar:</strong>{" "}
//                   {formatearMesLegible(previewData.mesFacturacion)}
//                 </Typography>
//                 {mesAFacturar === "siguiente" && (
//                   <Typography
//                     variant="caption"
//                     display="block"
//                     sx={{ mt: 0.5 }}
//                   >
//                     ℹ️ Las deudas anteriores se mantendrán separadas de la nueva
//                     cuota
//                   </Typography>
//                 )}
//               </Alert>

//               {previewData.clientesAFacturar.length > 0 && (
//                 <Box sx={{ mb: 3 }}>
//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       mb: 1,
//                     }}
//                   >
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                       <Typography variant="h6">Clientes a facturar</Typography>
//                       <Chip
//                         label={`${getClientesSeleccionados().length}/${
//                           previewData.clientesAFacturar.length
//                         }`}
//                         color="primary"
//                         size="small"
//                       />
//                     </Box>
//                     <Button size="small" onClick={toggleSelectAll}>
//                       {Object.values(selectedClients).every((v) => v)
//                         ? "Deseleccionar todos"
//                         : "Seleccionar todos"}
//                     </Button>
//                   </Box>

//                   <TextField
//                     fullWidth
//                     size="small"
//                     placeholder="Buscar cliente..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     sx={{ mb: 2 }}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <SearchIcon />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />

//                   <Box
//                     sx={{
//                       maxHeight: 400,
//                       overflow: "auto",
//                       border: "1px solid #e0e0e0",
//                       borderRadius: 1,
//                     }}
//                   >
//                     <Table size="small" stickyHeader>
//                       <TableHead>
//                         <TableRow>
//                           <TableCell padding="checkbox">
//                             <Checkbox
//                               checked={Object.values(selectedClients).every(
//                                 (v) => v
//                               )}
//                               onChange={toggleSelectAll}
//                               size="small"
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <strong>Cliente</strong>
//                           </TableCell>
//                           <TableCell>
//                             <strong>Actividad</strong>
//                           </TableCell>
//                           {mesAFacturar === "actual" && (
//                             <TableCell align="right">
//                               <Tooltip
//                                 title="Deuda acumulada de meses anteriores"
//                                 arrow
//                               >
//                                 <span>
//                                   <strong>Deuda Anterior</strong>
//                                 </span>
//                               </Tooltip>
//                             </TableCell>
//                           )}
//                           <TableCell align="right">
//                             <strong>Nueva Cuota</strong>
//                           </TableCell>
//                           {mesAFacturar === "actual" && (
//                             <TableCell align="right">
//                               <strong>Total Deuda</strong>
//                             </TableCell>
//                           )}
//                           <TableCell align="center">
//                             <strong>Acciones</strong>
//                           </TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {filteredClientes.map((client) => (
//                           <TableRow
//                             key={client.id}
//                             sx={{
//                               bgcolor: selectedClients[client.id]
//                                 ? "primary.light"
//                                 : "inherit",
//                             }}
//                           >
//                             <TableCell padding="checkbox">
//                               <Checkbox
//                                 checked={selectedClients[client.id] || false}
//                                 onChange={() =>
//                                   toggleClientSelection(client.id)
//                                 }
//                                 size="small"
//                               />
//                             </TableCell>
//                             <TableCell>
//                               {client.name} {client.lastName}
//                               {client.saldoFavor > 0 && (
//                                 <Chip
//                                   label={`Saldo: ${client.saldoFavor.toLocaleString(
//                                     "es-AR"
//                                   )}`}
//                                   size="small"
//                                   color="success"
//                                   sx={{ ml: 1, fontSize: "0.7rem" }}
//                                 />
//                               )}
//                             </TableCell>
//                             <TableCell>{client.actividad}</TableCell>
//                             {mesAFacturar === "actual" && (
//                               <TableCell align="right">
//                                 <Typography
//                                   variant="body2"
//                                   color={
//                                     client.deudaAnteriorTotal > 0
//                                       ? "error"
//                                       : "text.secondary"
//                                   }
//                                   sx={{
//                                     fontWeight:
//                                       client.deudaAnteriorTotal > 0
//                                         ? "bold"
//                                         : "normal",
//                                   }}
//                                 >
//                                   $
//                                   {client.deudaAnteriorTotal.toLocaleString(
//                                     "es-AR"
//                                   )}
//                                 </Typography>
//                               </TableCell>
//                             )}
//                             <TableCell align="right">
//                               {editingPrices[client.id] ? (
//                                 <Box
//                                   sx={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: 0.5,
//                                   }}
//                                 >
//                                   <TextField
//                                     size="small"
//                                     type="number"
//                                     value={customPrices[client.id]}
//                                     onChange={(e) =>
//                                       handlePriceChange(
//                                         client.id,
//                                         e.target.value
//                                       )
//                                     }
//                                     sx={{ width: 100 }}
//                                     InputProps={{
//                                       startAdornment: (
//                                         <Typography variant="body2">
//                                           $
//                                         </Typography>
//                                       ),
//                                     }}
//                                   />
//                                   <IconButton
//                                     size="small"
//                                     onClick={() => handleSavePrice(client.id)}
//                                     color="success"
//                                   >
//                                     <CheckIcon fontSize="small" />
//                                   </IconButton>
//                                   <IconButton
//                                     size="small"
//                                     onClick={() => handleCancelEdit(client.id)}
//                                     color="error"
//                                   >
//                                     <CloseIcon fontSize="small" />
//                                   </IconButton>
//                                 </Box>
//                               ) : (
//                                 <Typography
//                                   variant="body2"
//                                   sx={{ fontWeight: "bold" }}
//                                 >
//                                   $
//                                   {(
//                                     customPrices[client.id] ||
//                                     client.cuotaAFacturar
//                                   ).toLocaleString("es-AR")}
//                                 </Typography>
//                               )}
//                             </TableCell>
//                             {mesAFacturar === "actual" && (
//                               <TableCell align="right">
//                                 <Typography
//                                   variant="body2"
//                                   color="error"
//                                   sx={{ fontWeight: "bold" }}
//                                 >
//                                   $
//                                   {(
//                                     (customPrices[client.id] ||
//                                       client.cuotaAFacturar) +
//                                     client.deudaAnteriorTotal
//                                   ).toLocaleString("es-AR")}
//                                 </Typography>
//                               </TableCell>
//                             )}
//                             <TableCell align="center">
//                               {!editingPrices[client.id] && (
//                                 <IconButton
//                                   size="small"
//                                   onClick={() => handleEditPrice(client.id)}
//                                   title="Editar precio"
//                                 >
//                                   <EditIcon fontSize="small" />
//                                 </IconButton>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </Box>

//                   <Box
//                     sx={{
//                       mt: 2,
//                       p: 2,
//                       bgcolor: "primary.light",
//                       borderRadius: 1,
//                     }}
//                   >
//                     <Typography variant="h6" color="primary.contrastText">
//                       Total nuevas cuotas: $
//                       {getTotalSeleccionados().toLocaleString("es-AR")}
//                     </Typography>
//                     <Typography
//                       variant="caption"
//                       color="primary.contrastText"
//                       sx={{ opacity: 0.8 }}
//                     >
//                       {getClientesSeleccionados().length} clientes seleccionados
//                     </Typography>
//                   </Box>
//                 </Box>
//               )}

//               {previewData.clientesExcluidos.length > 0 && (
//                 <Box>
//                   <Button
//                     onClick={() => setShowExcluded(!showExcluded)}
//                     startIcon={
//                       showExcluded ? <ExpandLessIcon /> : <ExpandMoreIcon />
//                     }
//                     sx={{ mb: 1 }}
//                   >
//                     Clientes excluidos ({previewData.clientesExcluidos.length})
//                   </Button>

//                   <Collapse in={showExcluded}>
//                     <Box
//                       sx={{
//                         maxHeight: 200,
//                         overflow: "auto",
//                         border: "1px solid #e0e0e0",
//                         borderRadius: 1,
//                         p: 1,
//                       }}
//                     >
//                       <List dense>
//                         {previewData.clientesExcluidos.map((client) => (
//                           <ListItem
//                             key={client.id}
//                             sx={{
//                               bgcolor: "grey.100",
//                               mb: 0.5,
//                               borderRadius: 1,
//                             }}
//                           >
//                             <ListItemText
//                               primary={`${client.name} ${client.lastName}`}
//                               secondary={client.razon}
//                             />
//                           </ListItem>
//                         ))}
//                       </List>
//                     </Box>
//                   </Collapse>
//                 </Box>
//               )}
//             </>
//           )}
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={handleClose} disabled={isProcessing}>
//             Cancelar
//           </Button>
//           <Button
//             onClick={ejecutarFacturacionMensual}
//             variant="contained"
//             disabled={
//               isProcessing ||
//               !previewData ||
//               getClientesSeleccionados().length === 0
//             }
//           >
//             Confirmar Facturación
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default MonthlyBillingManager;
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Checkbox,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Grid,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";

const MonthlyBillingManager = ({ activities, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [selectedClients, setSelectedClients] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPrices, setEditingPrices] = useState({});
  const [customPrices, setCustomPrices] = useState({});
  const [showExcluded, setShowExcluded] = useState(false);
  const [mesAFacturar, setMesAFacturar] = useState("actual"); // "actual" o "siguiente"
  const [showPriceUpdate, setShowPriceUpdate] = useState(false);
  const [updatedActivities, setUpdatedActivities] = useState([]);
  const [editingActivityPrices, setEditingActivityPrices] = useState({});

  const calcularCuotaCliente = (
    client,
    activitiesList,
    useCustomPrice = false
  ) => {
    if (useCustomPrice && customPrices[client.id] !== undefined) {
      return customPrices[client.id];
    }

    const actividad = activitiesList.find((a) => a.label === client.actividad);
    if (!actividad) return 0;
    return Math.round((actividad.valor * (client.proporcion || 1)) / 100) * 100;
  };

  const handleActivityPriceChange = (activityId, newPrice) => {
    const price = parseInt(newPrice) || 0;
    setEditingActivityPrices((prev) => ({
      ...prev,
      [activityId]: price,
    }));

    // Actualizar la lista de actividades con el nuevo precio
    setUpdatedActivities((prev) =>
      prev.map((act) =>
        act.id === activityId ? { ...act, valor: price } : act
      )
    );
  };

  const handleApplyActivityPrices = async () => {
    setIsProcessing(true);
    try {
      const batch = writeBatch(db);

      // Actualizar precios en Firebase
      updatedActivities.forEach((activity) => {
        const activityRef = doc(db, "activities", activity.id);
        batch.update(activityRef, {
          valor: activity.valor,
        });
      });

      await batch.commit();

      // Regenerar preview con nuevos precios
      await generarPreview();

      setShowPriceUpdate(false);

      Swal.fire({
        icon: "success",
        title: "Precios actualizados",
        text: "Los precios de las actividades fueron actualizados exitosamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al actualizar precios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al actualizar los precios",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMesActual = () => {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();
    return `${anio}-${String(mes).padStart(2, "0")}`;
  };

  const getMesSiguiente = (mesBase) => {
    const [anio, mes] = mesBase.split("-").map(Number);
    let nuevoMes = mes + 1;
    let nuevoAnio = anio;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAnio++;
    }

    return `${nuevoAnio}-${String(nuevoMes).padStart(2, "0")}`;
  };

  const getMesParaFacturar = () => {
    const mesActual = getMesActual();
    return mesAFacturar === "siguiente"
      ? getMesSiguiente(mesActual)
      : mesActual;
  };

  const formatearMesLegible = (mesStr) => {
    const [anio, mes] = mesStr.split("-");
    const fecha = new Date(parseInt(anio), parseInt(mes) - 1, 15);
    return fecha.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
    });
  };

  const clienteTieneMesPagadoAdelantado = (client, mesAVerificar) => {
    // Si tiene último mes facturado y es igual o posterior al mes que queremos facturar
    if (client.ultimoMesFacturado) {
      const [anioFacturado, mesFacturado] = client.ultimoMesFacturado
        .split("-")
        .map(Number);
      const [anioVerificar, mesVerificar] = mesAVerificar
        .split("-")
        .map(Number);

      const fechaFacturada = new Date(anioFacturado, mesFacturado - 1);
      const fechaVerificar = new Date(anioVerificar, mesVerificar - 1);

      // Si la fecha facturada es mayor o igual a la que queremos facturar, ya está pagado
      return fechaFacturada >= fechaVerificar;
    }

    return false;
  };

  const generarPreview = async () => {
    setIsProcessing(true);
    try {
      const clientsRef = collection(db, "clients");
      const clientsSnap = await getDocs(clientsRef);

      const mesParaFacturar = getMesParaFacturar();
      const clientesAFacturar = [];
      const clientesExcluidos = [];
      const selected = {};
      const prices = {};

      // Usar actividades actualizadas si existen, sino las originales
      const activitiesList =
        updatedActivities.length > 0 ? updatedActivities : activities;

      clientsSnap.docs.forEach((docSnap) => {
        const client = { id: docSnap.id, ...docSnap.data() };

        if (client.estado === "Inactivo") {
          clientesExcluidos.push({
            ...client,
            razon: "Cliente inactivo",
          });
          return;
        }

        // Verificar si ya tiene el mes pagado adelantado
        if (clienteTieneMesPagadoAdelantado(client, mesParaFacturar)) {
          clientesExcluidos.push({
            ...client,
            razon: `Ya tiene facturado ${formatearMesLegible(
              client.ultimoMesFacturado
            )}`,
          });
          return;
        }

        if (!client.actividad) {
          clientesExcluidos.push({
            ...client,
            razon: "Sin actividad asignada",
          });
          return;
        }

        const cuota = calcularCuotaCliente(client, activitiesList);

        // Para el mes siguiente, no consideramos deuda anterior (empezamos limpio)
        // Para el mes actual, sí sumamos la deuda que ya tienen
        let deudaAnteriorTotal = 0;
        if (mesAFacturar === "actual") {
          deudaAnteriorTotal = (client.debt || 0) + (client.deudaAnterior || 0);
        }

        clientesAFacturar.push({
          ...client,
          cuotaAFacturar: cuota,
          deudaAnteriorTotal: deudaAnteriorTotal,
          totalConDeuda: cuota + deudaAnteriorTotal,
        });

        selected[client.id] = true;
        prices[client.id] = cuota;
      });

      setSelectedClients(selected);
      setCustomPrices(prices);
      setPreviewData({
        clientesAFacturar,
        clientesExcluidos,
        totalAFacturar: clientesAFacturar.reduce(
          (sum, c) => sum + c.cuotaAFacturar,
          0
        ),
        mesFacturacion: mesParaFacturar,
      });
    } catch (error) {
      console.error("Error al generar preview:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el preview de facturación",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    // Inicializar precios editables de actividades
    const activityPrices = {};
    activities.forEach((activity) => {
      activityPrices[activity.id] = activity.valor;
    });
    setEditingActivityPrices(activityPrices);
    setUpdatedActivities([...activities]);
    await generarPreview();
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewData(null);
    setSelectedClients({});
    setSearchTerm("");
    setEditingPrices({});
    setCustomPrices({});
    setShowExcluded(false);
    setMesAFacturar("actual");
    setShowPriceUpdate(false);
    setUpdatedActivities([]);
    setEditingActivityPrices({});
  };

  const toggleClientSelection = (clientId) => {
    setSelectedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = Object.values(selectedClients).every((v) => v);
    const newSelection = {};
    previewData.clientesAFacturar.forEach((client) => {
      newSelection[client.id] = !allSelected;
    });
    setSelectedClients(newSelection);
  };

  const handleEditPrice = (clientId) => {
    setEditingPrices((prev) => ({
      ...prev,
      [clientId]: true,
    }));
  };

  const handleSavePrice = (clientId) => {
    setEditingPrices((prev) => ({
      ...prev,
      [clientId]: false,
    }));
  };

  const handleCancelEdit = (clientId) => {
    const client = previewData.clientesAFacturar.find((c) => c.id === clientId);
    setCustomPrices((prev) => ({
      ...prev,
      [clientId]: calcularCuotaCliente(client, activities, false),
    }));
    setEditingPrices((prev) => ({
      ...prev,
      [clientId]: false,
    }));
  };

  const handlePriceChange = (clientId, newPrice) => {
    const price = parseInt(newPrice) || 0;
    setCustomPrices((prev) => ({
      ...prev,
      [clientId]: price,
    }));
  };

  const getClientesSeleccionados = () => {
    if (!previewData) return [];
    return previewData.clientesAFacturar.filter(
      (client) => selectedClients[client.id]
    );
  };

  const getTotalSeleccionados = () => {
    return getClientesSeleccionados().reduce(
      (sum, c) => sum + (customPrices[c.id] || c.cuotaAFacturar),
      0
    );
  };

  const ejecutarFacturacionMensual = async () => {
    const clientesSeleccionados = getClientesSeleccionados();

    if (clientesSeleccionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin clientes seleccionados",
        text: "Debes seleccionar al menos un cliente para facturar",
      });
      return;
    }

    const totalSeleccionado = getTotalSeleccionados();
    const mesParaFacturar = getMesParaFacturar();

    const result = await Swal.fire({
      title: "¿Confirmar facturación?",
      html: `
        <p>Se facturarán <strong>${
          clientesSeleccionados.length
        }</strong> clientes</p>
        <p>Total nuevas cuotas: <strong>${totalSeleccionado.toLocaleString(
          "es-AR"
        )}</strong></p>
        <p>Mes a facturar: <strong>${formatearMesLegible(
          mesParaFacturar
        )}</strong></p>
        ${
          mesAFacturar === "actual"
            ? '<p style="color: #f57c00;"><strong>⚠️ Este es el mes actual</strong></p>'
            : '<p style="color: #1976d2;"><strong>📅 Facturando mes siguiente (adelantado)</strong></p>'
        }
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, facturar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2196f3",
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      const fechaFacturacion = new Date();

      let procesados = 0;
      let errores = 0;

      for (const client of clientesSeleccionados) {
        try {
          const clientRef = doc(db, "clients", client.id);
          const cuotaNueva = customPrices[client.id] || client.cuotaAFacturar;

          // Obtener valores actuales
          const deudaActual = client.debt || 0;
          const deudaAnterior = client.deudaAnterior || 0;
          const saldoFavor = client.saldoFavor || 0;

          let nuevaDeuda = 0;
          let nuevaDeudaAnterior = 0;
          let nuevoSaldoFavor = 0;
          let nuevoEstado = "";

          if (mesAFacturar === "actual") {
            // LÓGICA PARA MES ACTUAL: Suma deudas anteriores

            // Si tiene deuda actual, pasa a ser deuda anterior
            if (deudaActual > 0) {
              nuevaDeudaAnterior = deudaAnterior + deudaActual;
            } else {
              nuevaDeudaAnterior = deudaAnterior;
            }

            // Aplicar saldo a favor si existe
            if (saldoFavor > 0) {
              if (saldoFavor >= cuotaNueva) {
                nuevoSaldoFavor = saldoFavor - cuotaNueva;
                nuevaDeuda = 0;
                nuevoEstado = "Al día";
              } else {
                nuevaDeuda = cuotaNueva - saldoFavor;
                nuevoSaldoFavor = 0;
                nuevoEstado = "Deudor";
              }
            } else {
              nuevaDeuda = cuotaNueva;
              nuevoEstado = "Deudor";
            }
          } else {
            // LÓGICA PARA MES SIGUIENTE: No arrastramos deudas, facturamos limpio

            // La deuda anterior se mantiene
            nuevaDeudaAnterior = deudaAnterior + deudaActual;

            // Aplicar saldo a favor si existe
            if (saldoFavor > 0) {
              if (saldoFavor >= cuotaNueva) {
                nuevoSaldoFavor = saldoFavor - cuotaNueva;
                nuevaDeuda = 0;
                nuevoEstado = nuevaDeudaAnterior > 0 ? "Deudor" : "Al día";
              } else {
                nuevaDeuda = cuotaNueva - saldoFavor;
                nuevoSaldoFavor = 0;
                nuevoEstado = "Deudor";
              }
            } else {
              nuevaDeuda = cuotaNueva;
              nuevoEstado = "Deudor";
            }
          }

          const updateData = {
            debt: nuevaDeuda,
            deudaAnterior: nuevaDeudaAnterior,
            saldoFavor: nuevoSaldoFavor,
            estado: nuevoEstado,
            ultimoMesFacturado: mesParaFacturar,
            fechaUltimaFacturacion: Timestamp.fromDate(fechaFacturacion),
          };

          batch.update(clientRef, updateData);
          procesados++;
        } catch (error) {
          console.error(`Error al procesar cliente ${client.name}:`, error);
          errores++;
        }
      }

      await batch.commit();

      setIsChange(true);
      handleClose();

      Swal.fire({
        icon: "success",
        title: "Facturación completada",
        html: `
          <p>✅ Clientes facturados: <strong>${procesados}</strong></p>
          ${errores > 0 ? `<p>⚠️ Errores: <strong>${errores}</strong></p>` : ""}
          <p>Total facturado: <strong>${totalSeleccionado.toLocaleString(
            "es-AR"
          )}</strong></p>
          <p>Mes: <strong>${formatearMesLegible(mesParaFacturar)}</strong></p>
        `,
        timer: 4000,
      });
    } catch (error) {
      console.error("Error en facturación mensual:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar la facturación mensual",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredClientes = previewData
    ? previewData.clientesAFacturar.filter((client) =>
        `${client.name} ${client.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarMonthIcon />}
        onClick={handleOpen}
        size="small"
        color="primary"
      >
        Facturar Mes
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Facturación Mensual Automática</DialogTitle>

        <DialogContent>
          {isProcessing && <LinearProgress sx={{ mb: 2 }} />}

          {previewData && (
            <>
              {/* Sección de actualización de precios de actividades */}
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowPriceUpdate(!showPriceUpdate)}
                  startIcon={<SettingsIcon />}
                  fullWidth
                  sx={{ mb: showPriceUpdate ? 2 : 0 }}
                >
                  {showPriceUpdate
                    ? "Ocultar"
                    : "Actualizar Precios de Actividades"}
                </Button>

                <Collapse in={showPriceUpdate}>
                  <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    >
                      Precios Actuales de Actividades
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2, fontSize: "0.85rem" }}>
                      Actualiza aquí los precios si hubo aumentos. Los cambios
                      se aplicarán a la facturación y se guardarán
                      permanentemente.
                    </Alert>

                    <Grid container spacing={2}>
                      {updatedActivities.map((activity) => (
                        <Grid item xs={12} sm={6} key={activity.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TextField
                              label={activity.label}
                              type="number"
                              size="small"
                              fullWidth
                              value={
                                editingActivityPrices[activity.id] ||
                                activity.valor
                              }
                              onChange={(e) =>
                                handleActivityPriceChange(
                                  activity.id,
                                  e.target.value
                                )
                              }
                              InputProps={{
                                startAdornment: (
                                  <Typography variant="body2" sx={{ mr: 0.5 }}>
                                    $
                                  </Typography>
                                ),
                              }}
                            />
                            {editingActivityPrices[activity.id] !==
                              activity.valor && (
                              <Chip
                                label="Modificado"
                                size="small"
                                color="warning"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const activityPrices = {};
                          activities.forEach((activity) => {
                            activityPrices[activity.id] = activity.valor;
                          });
                          setEditingActivityPrices(activityPrices);
                          setUpdatedActivities([...activities]);
                        }}
                      >
                        Restablecer
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleApplyActivityPrices}
                        disabled={isProcessing}
                      >
                        Aplicar y Regenerar
                      </Button>
                    </Box>
                  </Paper>
                </Collapse>
              </Box>

              {/* Selector de mes a facturar */}
              <Box
                sx={{ mb: 2, p: 2, bgcolor: "primary.light", borderRadius: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  Selecciona el mes a facturar:
                </Typography>
                <RadioGroup
                  value={mesAFacturar}
                  onChange={(e) => {
                    setMesAFacturar(e.target.value);
                    generarPreview(); // Regenerar preview al cambiar
                  }}
                  row
                >
                  <FormControlLabel
                    value="actual"
                    control={<Radio />}
                    label={`Mes Actual (${formatearMesLegible(
                      getMesActual()
                    )})`}
                  />
                  <FormControlLabel
                    value="siguiente"
                    control={<Radio />}
                    label={`Mes Siguiente (${formatearMesLegible(
                      getMesSiguiente(getMesActual())
                    )})`}
                  />
                </RadioGroup>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Mes a facturar:</strong>{" "}
                  {formatearMesLegible(previewData.mesFacturacion)}
                </Typography>
                {mesAFacturar === "siguiente" && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    ℹ️ Las deudas anteriores se mantendrán separadas de la nueva
                    cuota
                  </Typography>
                )}
              </Alert>

              {previewData.clientesAFacturar.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6">Clientes a facturar</Typography>
                      <Chip
                        label={`${getClientesSeleccionados().length}/${
                          previewData.clientesAFacturar.length
                        }`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Button size="small" onClick={toggleSelectAll}>
                      {Object.values(selectedClients).every((v) => v)
                        ? "Deseleccionar todos"
                        : "Seleccionar todos"}
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box
                    sx={{
                      maxHeight: 400,
                      overflow: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={Object.values(selectedClients).every(
                                (v) => v
                              )}
                              onChange={toggleSelectAll}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <strong>Cliente</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Actividad</strong>
                          </TableCell>
                          {mesAFacturar === "actual" && (
                            <TableCell align="right">
                              <Tooltip
                                title="Deuda acumulada de meses anteriores"
                                arrow
                              >
                                <span>
                                  <strong>Deuda Anterior</strong>
                                </span>
                              </Tooltip>
                            </TableCell>
                          )}
                          <TableCell align="right">
                            <strong>Nueva Cuota</strong>
                          </TableCell>
                          {mesAFacturar === "actual" && (
                            <TableCell align="right">
                              <strong>Total Deuda</strong>
                            </TableCell>
                          )}
                          <TableCell align="center">
                            <strong>Acciones</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredClientes.map((client) => (
                          <TableRow
                            key={client.id}
                            sx={{
                              bgcolor: selectedClients[client.id]
                                ? "primary.light"
                                : "inherit",
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedClients[client.id] || false}
                                onChange={() =>
                                  toggleClientSelection(client.id)
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {client.name} {client.lastName}
                              {client.saldoFavor > 0 && (
                                <Chip
                                  label={`Saldo: ${client.saldoFavor.toLocaleString(
                                    "es-AR"
                                  )}`}
                                  size="small"
                                  color="success"
                                  sx={{ ml: 1, fontSize: "0.7rem" }}
                                />
                              )}
                            </TableCell>
                            <TableCell>{client.actividad}</TableCell>
                            {mesAFacturar === "actual" && (
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  color={
                                    client.deudaAnteriorTotal > 0
                                      ? "error"
                                      : "text.secondary"
                                  }
                                  sx={{
                                    fontWeight:
                                      client.deudaAnteriorTotal > 0
                                        ? "bold"
                                        : "normal",
                                  }}
                                >
                                  $
                                  {client.deudaAnteriorTotal.toLocaleString(
                                    "es-AR"
                                  )}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell align="right">
                              {editingPrices[client.id] ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={customPrices[client.id]}
                                    onChange={(e) =>
                                      handlePriceChange(
                                        client.id,
                                        e.target.value
                                      )
                                    }
                                    sx={{ width: 100 }}
                                    InputProps={{
                                      startAdornment: (
                                        <Typography variant="body2">
                                          $
                                        </Typography>
                                      ),
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSavePrice(client.id)}
                                    color="success"
                                  >
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCancelEdit(client.id)}
                                    color="error"
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  $
                                  {(
                                    customPrices[client.id] ||
                                    client.cuotaAFacturar
                                  ).toLocaleString("es-AR")}
                                </Typography>
                              )}
                            </TableCell>
                            {mesAFacturar === "actual" && (
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  color="error"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  $
                                  {(
                                    (customPrices[client.id] ||
                                      client.cuotaAFacturar) +
                                    client.deudaAnteriorTotal
                                  ).toLocaleString("es-AR")}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell align="center">
                              {!editingPrices[client.id] && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditPrice(client.id)}
                                  title="Editar precio"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "primary.light",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h6" color="primary.contrastText">
                      Total nuevas cuotas: $
                      {getTotalSeleccionados().toLocaleString("es-AR")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="primary.contrastText"
                      sx={{ opacity: 0.8 }}
                    >
                      {getClientesSeleccionados().length} clientes seleccionados
                    </Typography>
                  </Box>
                </Box>
              )}

              {previewData.clientesExcluidos.length > 0 && (
                <Box>
                  <Button
                    onClick={() => setShowExcluded(!showExcluded)}
                    startIcon={
                      showExcluded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    sx={{ mb: 1 }}
                  >
                    Clientes excluidos ({previewData.clientesExcluidos.length})
                  </Button>

                  <Collapse in={showExcluded}>
                    <Box
                      sx={{
                        maxHeight: 200,
                        overflow: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <List dense>
                        {previewData.clientesExcluidos.map((client) => (
                          <ListItem
                            key={client.id}
                            sx={{
                              bgcolor: "grey.100",
                              mb: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            <ListItemText
                              primary={`${client.name} ${client.lastName}`}
                              secondary={client.razon}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Collapse>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            onClick={ejecutarFacturacionMensual}
            variant="contained"
            disabled={
              isProcessing ||
              !previewData ||
              getClientesSeleccionados().length === 0
            }
          >
            Confirmar Facturación
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MonthlyBillingManager;
