import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import { IconButton } from "@mui/material";
import "./Footer.css";

const Footer = () => {
  return (
    <div id="boxFooter">
      <div className="boxFooterUno">
        <div className="subBoxFooter">
          <img
            className="imgFooter"
            src="https://firebasestorage.googleapis.com/v0/b/pagina-web-b1102.firebasestorage.app/o/logo-gm-dev.png?alt=media&token=eb911fb1-e48d-47aa-a213-7554018bcdad"
            alt="logo-gm"
          />
          <p className="textFooter">Desarrollando ideas, creando futuro.</p>
        </div>
        <div className="subBoxFooter">
          <h4 style={{ color: "#27548A" }}>Enlaces Rápidos</h4>
          <ul style={{ listStyleType: "none" }}>
            <a href="/" style={{ color: "white" }}>
              <li>Inicio</li>
            </a>
            <a href="/about-me" style={{ color: "white" }}>
              <li>Sobre Nosotros</li>
            </a>
            <a href="/shop" style={{ color: "white" }}>
              <li>Productos</li>
            </a>
          </ul>
        </div>
        <div style={{ color: "white" }} className="subBoxFooter">
          <h4 style={{ color: "#27548A" }}>Contacto</h4>
          <div>
            <a href="mailto:mozasgeronimo@gmail.com" style={{ color: "white" }}>
              <IconButton>
                <EmailIcon />
              </IconButton>
              mozasgeronimo@gmail.com
            </a>
          </div>
          <div>
            <a
              href="https://wa.me/5493416041873?text=Hola%2C%20te%20contacto%20desde%20tu%20web..."
              style={{ color: "white" }}
            >
              <IconButton>
                <WhatsAppIcon />
              </IconButton>
              +54 9 341 604-1873
            </a>
          </div>
          <div>
            <a
              href="https://www.instagram.com/geromzoas/"
              style={{ color: "white" }}
            >
              <IconButton>
                <InstagramIcon />
              </IconButton>
              geromozas
            </a>
          </div>
        </div>
      </div>
      <hr style={{ marginTop: 20, marginBottom: 20 }} />
      <div className="boxCopyright">
        <p style={{ color: "white", opacity: "0.5" }}>
          © 2025 Geronimo Mozas. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Footer;
