import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { menuItems } from "../../../router/navigation.js";
import { logOut } from "../../../firebaseConfig.js";
import { AuthContext } from "../../../context/AuthContext.jsx";
import "./Navbar.css";

const drawerWidth = 200;

function Navbar(props) {
  const { logoutContext, user, isLogged } = useContext(AuthContext);
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // const rolAdmin = import.meta.env.VITE_ROL_ADMIM;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogOut = () => {
    logOut();
    logoutContext();
    navigate("/login");
  };

  const drawer = (
    <div>
      <Toolbar />

      <List>
        {menuItems.map(({ id, path, title, Icon }) => {
          return (
            <Link key={id} to={path}>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <Icon sx={{ color: "black" }} />
                  </ListItemIcon>
                  <ListItemText primary={title} sx={{ color: "black" }} />
                </ListItemButton>
              </ListItem>
            </Link>
          );
        })}

        {isLogged ? (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogOut}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: "black" }} />
              </ListItemIcon>
              <ListItemText primary={"Cerrar sesion"} sx={{ color: "black" }} />
            </ListItemButton>
          </ListItem>
        ) : (
          <Link to={"/login"}>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <LoginIcon sx={{ color: "black" }} />
                </ListItemIcon>
                <ListItemText
                  primary={"Iniciar sesión"}
                  sx={{ color: "black" }}
                />
              </ListItemButton>
            </ListItem>
          </Link>
        )}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
          backgroundColor: "primary",
        }}
      >
        <Toolbar
          sx={{
            gap: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Link to="/" style={{ color: "black" }}>
            <img
              style={{ width: 100, padding: "5px", borderRadius: "10px" }}
              src="https://res.cloudinary.com/ddmvo0ert/image/upload/v1750732501/kaizen/logo-kaizen-2.png"
              alt=""
            />
          </Link>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="nav" aria-label="mailbox folders">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          anchor={"right"}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#5CB338",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          width: "100%",
          minHeight: "100vh",
          px: 2,
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
}

export default Navbar;
