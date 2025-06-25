import "./Footer.css";

const Footer = () => {
  return (
    <div id="boxFooter">
      <div className="boxFooterUno">
        <div className="subBoxFooter">
          <img
            className="imgFooter"
            src="https://res.cloudinary.com/ddmvo0ert/image/upload/v1750732501/kaizen/logo-kaizen-2.png"
            alt="logo-gm"
          />
        </div>
        <div className="subBoxFooter">
          <h4 style={{ color: "#5CB338" }}>Enlaces Rápidos</h4>
          <ul style={{ listStyleType: "none" }}>
            <a href="/" style={{ color: "white" }}>
              <li>Inicio</li>
            </a>
            <a href="/clients" style={{ color: "white" }}>
              <li>Alumnos</li>
            </a>
            <a href="/calendar" style={{ color: "white" }}>
              <li>Calendario</li>
            </a>
            <a href="/payments" style={{ color: "white" }}>
              <li>Pagos</li>
            </a>
            <a href="/report" style={{ color: "white" }}>
              <li>Reporte</li>
            </a>
          </ul>
        </div>
      </div>
      <hr style={{ marginTop: 20, marginBottom: 20 }} />
      <div className="boxCopyright">
        <p style={{ color: "white", opacity: "0.5" }}>
          © 2025 Kaizen. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Footer;
