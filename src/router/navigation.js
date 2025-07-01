import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import PaymentIcon from "@mui/icons-material/Payment";
import AssessmentIcon from "@mui/icons-material/Assessment";

export const menuItems = [
  {
    id: "home",
    path: "/",
    title: "Inicio",
    Icon: HomeIcon,
  },
  {
    id: "clients",
    path: "/clients",
    title: "Alumnos",
    Icon: GroupIcon,
  },
  {
    id: "patients",
    path: "/patients",
    title: "Pacientes",
    Icon: GroupIcon,
  },
  {
    id: "calendar",
    path: "/calendar",
    title: "Calendario / Turnos",
    Icon: CalendarMonthIcon,
  },
  {
    id: "payments",
    path: "/payments",
    title: "Pagos",
    Icon: PaymentIcon,
  },
  {
    id: "report",
    path: "/report",
    title: "Reportes",
    Icon: AssessmentIcon,
  },
];
