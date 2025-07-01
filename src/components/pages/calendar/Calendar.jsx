import "./Calendar.css";

const Calendar = () => {
  return (
    <div id="boxPatients">
      <div className="firtsBoxPatients">
        <div>
          <h1>Calendario / Turnos</h1>
          <p>Organiza los turnos y registra la asistencia por horario</p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div style={{ padding: 10 }} className="secondBoxPatients">
          <h2>Calendario</h2>
          <p>Selecciona una fecha para ver o programar horarios</p>
        </div>
        <div style={{ padding: 10 }} className="secondBoxPatients">
          <h2>Horarios del Día</h2>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
