// import { useState, useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import { TextField, Button, Paper, Box, Typography } from "@mui/material";
// import LockIcon from "@mui/icons-material/Lock";

// const ProtectedReport = ({ children }) => {
//   const [isReportAuthenticated, setIsReportAuthenticated] = useState(false);
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // Contraseña para acceder a reportes (puedes cambiarla por una variable de entorno)
//   const REPORT_PASSWORD = import.meta.env.VITE_REPORT_PASSWORD || "admin123";

//   // Verificar si ya está autenticado en sessionStorage
//   useEffect(() => {
//     const reportAuth = sessionStorage.getItem("reportAuthenticated");
//     if (reportAuth === "true") {
//       setIsReportAuthenticated(true);
//     }
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     // Simular un pequeño delay para mejor UX
//     setTimeout(() => {
//       if (password === REPORT_PASSWORD) {
//         setIsReportAuthenticated(true);
//         sessionStorage.setItem("reportAuthenticated", "true");
//         setError("");
//       } else {
//         setError("Contraseña incorrecta");
//         setPassword("");
//       }
//       setIsLoading(false);
//     }, 500);
//   };

//   const handleLogout = () => {
//     setIsReportAuthenticated(false);
//     sessionStorage.removeItem("reportAuthenticated");
//     setPassword("");
//   };

//   // Si ya está autenticado, mostrar el contenido con opción de cerrar sesión
//   if (isReportAuthenticated) {
//     return (
//       <div>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "10px",
//             padding: "10px 0",
//           }}
//         >
//           <div></div>
//           <Button
//             variant="outlined"
//             size="small"
//             onClick={handleLogout}
//             style={{ fontSize: "12px" }}
//           >
//             Cerrar acceso a reportes
//           </Button>
//         </div>
//         {children}
//       </div>
//     );
//   }

//   // Mostrar formulario de autenticación para reportes
//   return (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "60vh",
//         padding: 2,
//       }}
//     >
//       <Paper
//         elevation={3}
//         sx={{
//           padding: 4,
//           maxWidth: 400,
//           width: "100%",
//           textAlign: "center",
//         }}
//       >
//         <LockIcon
//           sx={{
//             fontSize: 48,
//             color: "primary.main",
//             marginBottom: 2,
//           }}
//         />

//         <Typography variant="h5" gutterBottom>
//           Acceso a Reportes
//         </Typography>

//         <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
//           Esta sección requiere autenticación adicional
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           <TextField
//             type="password"
//             label="Contraseña de Reportes"
//             variant="outlined"
//             fullWidth
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             error={!!error}
//             helperText={error}
//             sx={{ mb: 3 }}
//             autoFocus
//             disabled={isLoading}
//           />

//           <Button
//             type="submit"
//             variant="contained"
//             fullWidth
//             disabled={isLoading || !password.trim()}
//             sx={{ height: 48 }}
//           >
//             {isLoading ? "Verificando..." : "Acceder"}
//           </Button>
//         </form>

//         <Typography
//           variant="caption"
//           color="textSecondary"
//           sx={{ mt: 2, display: "block" }}
//         >
//           Contacta al administrador si no tienes acceso
//         </Typography>
//       </Paper>
//     </Box>
//   );
// };

// export default ProtectedReport;
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { TextField, Button, Paper, Box, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

const ProtectedReport = ({ children }) => {
  const [isReportAuthenticated, setIsReportAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Contraseña para acceder a reportes
  const REPORT_PASSWORD =
    import.meta.env.VITE_REPORT_PASSWORD || "reportes2024";

  // Debug temporal - remover después de probar
  console.log("Environment check:", {
    hasEnvVar: !!import.meta.env.VITE_REPORT_PASSWORD,
    password: REPORT_PASSWORD,
    mode: import.meta.env.MODE,
  });

  // Verificar si ya está autenticado en sessionStorage
  useEffect(() => {
    const reportAuth = sessionStorage.getItem("reportAuthenticated");
    if (reportAuth === "true") {
      setIsReportAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
      if (password === REPORT_PASSWORD) {
        setIsReportAuthenticated(true);
        sessionStorage.setItem("reportAuthenticated", "true");
        setError("");
      } else {
        setError("Contraseña incorrecta");
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsReportAuthenticated(false);
    sessionStorage.removeItem("reportAuthenticated");
    setPassword("");
  };

  // Si ya está autenticado, mostrar el contenido con opción de cerrar sesión
  if (isReportAuthenticated) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            padding: "10px 0",
          }}
        >
          <div></div>
          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            style={{ fontSize: "12px" }}
          >
            Cerrar acceso a reportes
          </Button>
        </div>
        {children}
      </div>
    );
  }

  // Mostrar formulario de autenticación para reportes
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
        }}
      >
        <LockIcon
          sx={{
            fontSize: 48,
            color: "primary.main",
            marginBottom: 2,
          }}
        />

        <Typography variant="h5" gutterBottom>
          Acceso a Reportes
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Esta sección requiere autenticación adicional
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            type="password"
            label="Contraseña de Reportes"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 3 }}
            autoFocus
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading || !password.trim()}
            sx={{ height: 48 }}
          >
            {isLoading ? "Verificando..." : "Acceder"}
          </Button>
        </form>

        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 2, display: "block" }}
        >
          Contacta al administrador si no tienes acceso
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProtectedReport;
