import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import "./Home.css";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useContext(AuthContext);
  console.log(user.name);
  return (
    <div id="boxHome">
      <div className="homeTitle">
        <h1>Sistema de Gestión Kaizen</h1>
        {/* <h4>Bienvenido {user.name}</h4> */}
      </div>
      <div className="boxSections">
        <Card sx={{ width: 275 }}>
          <CardContent>
            <Typography gutterBottom sx={{ fontSize: 20 }}>
              Alumnos
            </Typography>
            <hr />
            <Typography
              variant="h8"
              component="div"
              sx={{ height: 70, marginTop: 5 }}
            >
              Gestiona la información de tus alumnos
            </Typography>
          </CardContent>
          <CardActions>
            <Link to={"/clients"}>
              <Button size="small" variant="contained" color="primary">
                VER
              </Button>
            </Link>
          </CardActions>
        </Card>

        <Card sx={{ width: 275 }}>
          <CardContent>
            <Typography gutterBottom sx={{ fontSize: 20 }}>
              Pacientes Kinesio
            </Typography>
            <hr />
            <Typography
              variant="h8"
              component="div"
              sx={{ height: 70, marginTop: 5 }}
            >
              Gestiona la información de tus pacientes
            </Typography>
          </CardContent>
          <CardActions>
            <Link to={"/patients"}>
              <Button size="small" variant="contained" color="primary">
                VER
              </Button>
            </Link>
          </CardActions>
        </Card>
        <Card sx={{ width: 275 }}>
          <CardContent>
            <Typography gutterBottom sx={{ fontSize: 20 }}>
              Calendario / Turnos
            </Typography>
            <hr />
            <Typography
              variant="h8"
              component="div"
              sx={{ height: 70, marginTop: 5 }}
            >
              Organiza los turnos de una hora y asigna alumnos a cada horario.
            </Typography>
          </CardContent>
          <CardActions>
            <Link to={"/calendar"}>
              <Button size="small" variant="contained" color="primary">
                VER
              </Button>
            </Link>
          </CardActions>
        </Card>
        <Card sx={{ width: 275 }}>
          <CardContent>
            <Typography gutterBottom sx={{ fontSize: 20 }}>
              Pagos
            </Typography>
            <hr />
            <Typography
              variant="h8"
              component="div"
              sx={{ height: 70, marginTop: 5 }}
            >
              Registra pagos y visualiza deudas.
            </Typography>
          </CardContent>
          <CardActions>
            <Link to={"/payments"}>
              <Button size="small" variant="contained" color="primary">
                VER
              </Button>
            </Link>
          </CardActions>
        </Card>
        <Card sx={{ width: 275 }}>
          <CardContent>
            <Typography gutterBottom sx={{ fontSize: 20 }}>
              Reporte
            </Typography>
            <hr />
            <Typography
              variant="h8"
              component="div"
              sx={{ height: 70, marginTop: 5 }}
            >
              Genera reportes mensuales para analizar el rendimiento de tu
              negocio.
            </Typography>
          </CardContent>
          <CardActions>
            <Link to={"/report"}>
              <Button size="small" variant="contained" color="primary">
                VER
              </Button>
            </Link>
          </CardActions>
        </Card>
      </div>
    </div>
  );
};

export default Home;
