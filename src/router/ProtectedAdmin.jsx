import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdmin = () => {
  const { user } = useContext(AuthContext);
  const rolAdmin = import.meta.env.VITE_ROL_ADMIM;
  return <>{user.rol === rolAdmin ? <Outlet /> : <Navigate to="/" />}</>;
};

export default ProtectedAdmin;
