import Calendar from "../components/pages/calendar/Calendar.jsx";
import Clients from "../components/pages/clients/Clients.jsx";
import Home from "../components/pages/home/Home.jsx";
import Patients from "../components/pages/patients/Patients.jsx";
import { Payments } from "../components/pages/payments/Payments.jsx";
import Report from "../components/pages/report/Report.jsx";

export const routes = [
  {
    id: "home",
    path: "/",
    Element: Home,
  },
  {
    id: "clients",
    path: "/clients",
    Element: Clients,
  },
  {
    id: "patients",
    path: "/patients",
    Element: Patients,
  },
  {
    id: "calendar",
    path: "/calendar",
    Element: Calendar,
  },
  {
    id: "payments",
    path: "/payments",
    Element: Payments,
  },
  {
    id: "report",
    path: "/report",
    Element: Report,
  },
];
