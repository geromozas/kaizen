import { Route, Routes } from "react-router-dom";
import { routes } from "./routes.js";
import Login from "../components/pages/login/Login.jsx";
// import Register from "../components/pages/register/Register.jsx";
import ForgotPassword from "../components/pages/forgotPassword/ForgotPassword.jsx";
import Layout from "../components/layout/Layout.jsx";
import ProtectedAdmin from "./ProtectedAdmin.jsx";

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<ProtectedAdmin />}>
        <Route element={<Layout />}>
          {routes.map(({ id, path, Element }) => (
            <Route key={id} path={path} element={<Element />} />
          ))}
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="*" element={<h1>Not found</h1>} />
    </Routes>
  );
};

export default AppRouter;
