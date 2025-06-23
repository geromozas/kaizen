import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "@mui/material";
import theme from "./theme/theme.js";
import AuthContextComponent from "./context/AuthContext.jsx";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthContextComponent>
          <AppRouter />
        </AuthContextComponent>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
