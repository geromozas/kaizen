import HomeIcon from "@mui/icons-material/Home";
import StoreIcon from "@mui/icons-material/Store";
import GroupIcon from "@mui/icons-material/Group";

export const menuItems = [
  {
    id: "home",
    path: "/",
    title: "Inicio",
    Icon: HomeIcon,
  },
  {
    id: "aboutMe",
    path: "/about-me",
    title: "Sobre nosotros",
    Icon: GroupIcon,
  },
  {
    id: "products",
    path: "/shop",
    title: "Productos",
    Icon: StoreIcon,
  },
];
