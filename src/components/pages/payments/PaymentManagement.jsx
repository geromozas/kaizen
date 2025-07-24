import { useState } from "react";
import AccountStatus from "./accountStatus/AccountStatus.jsx";
import { PaymentsHistory } from "./paymentHistory/PaymentsHistory.jsx";
import { Button } from "@mui/material";

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState("estado");

  return (
    <div className="gestion-container">
      <h1>Gestión de Pagos</h1>
      <p>Registra y consulta los pagos de los alumnos</p>
      <div
        className="tabs-container"
        style={{ marginTop: 10, marginBottom: 10 }}
      >
        <Button
          sx={{ marginRight: 5 }}
          variant="outlined"
          className={activeTab === "estado" ? "tab active" : "tab"}
          onClick={() => setActiveTab("estado")}
        >
          Estado de Cuenta
        </Button>
        <Button
          variant="outlined"
          className={activeTab === "historial" ? "tab active" : "tab"}
          onClick={() => setActiveTab("historial")}
        >
          Historial de Pagos
        </Button>
      </div>

      <hr />

      {activeTab === "estado" && <AccountStatus />}
      {activeTab === "historial" && <PaymentsHistory />}
    </div>
  );
};

export default PaymentManagement;
