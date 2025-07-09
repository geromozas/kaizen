import { useState, useEffect } from "react";
import "./Calendar.css";
import { Button } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import NewScheduleModal from "../NewScheduleModal/NewScheduleModal";
import { deleteDoc, doc } from "firebase/firestore";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [editSchedule, setEditSchedule] = useState(null);

  const loadSchedules = async () => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const q = query(collection(db, "schedules"), where("date", "==", dateStr));
    const res = await getDocs(q);
    const horarios = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSchedules(horarios);
  };

  const loadClients = async () => {
    const snap = await getDocs(collection(db, "clients"));
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setClients(list);
  };

  useEffect(() => {
    loadSchedules();
    loadClients();
  }, [selectedDate]);

  const handlePreviousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Estás seguro de eliminar este horario?");
    if (!confirm) return;
    await deleteDoc(doc(db, "schedules", id));
    loadSchedules();
  };

  const handleEdit = (schedule) => {
    setEditSchedule(schedule);
    setModalOpen(true);
  };

  const formattedDate = selectedDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedDateNumeric = selectedDate.toLocaleDateString("es-ES");
  const formattedDay = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
  });

  return (
    <div id="boxPatients">
      <div className="firtsBoxPatients">
        <div>
          <h1>Calendario / Turnos</h1>
          <p>Organiza los turnos y registra la asistencia por horario</p>
        </div>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          + Nuevo Horario
        </Button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div style={{ padding: 10 }} className="secondBoxPatients">
          <h2>Calendario</h2>
          <p>Selecciona una fecha para ver o programar horarios</p>
          <hr />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 10,
            }}
          >
            <Button onClick={handlePreviousDay} variant="contained">
              ←
            </Button>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "5px 10px",
                borderRadius: 5,
              }}
            >
              {formattedDate}
            </div>
            <Button onClick={handleNextDay} variant="contained">
              →
            </Button>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4>Resumen</h4>
            <p>
              <strong>Fecha: </strong>
              {formattedDateNumeric}
            </p>
            <p>
              <strong>Día: </strong>
              {formattedDay}
            </p>
            <p>
              <strong>Horarios programados: </strong>
              {schedules.length}
            </p>
            <p>
              <strong>Total alumnos: </strong>
              {schedules.reduce((acc, s) => acc + s.clients.length, 0)}
            </p>
          </div>
        </div>

        <div style={{ padding: 10 }} className="thirdBoxPatients">
          <h2>Horarios del Día</h2>
          <p>
            {formattedDay} {formattedDateNumeric}
          </p>
          <hr />
          {schedules.length === 0 ? (
            <p>No hay horarios programados para este día</p>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                style={{
                  border: "1px solid #ccc",
                  margin: "10px",
                  padding: "10px",
                }}
              >
                <h4>{schedule.hour}</h4>
                <p>{schedule.clients.length} alumnos</p>
                <ul>
                  {schedule.clients.map((id) => {
                    const alumno = clients.find((c) => c.id === id);
                    return (
                      <li key={id} style={{ listStyle: "none" }}>
                        {alumno ? `${alumno.name} ${alumno.lastName}` : id}
                      </li>
                    );
                  })}
                </ul>
                <div>
                  <Button
                    onClick={() => handleEdit(schedule)}
                    variant="outlined"
                    style={{ marginRight: "5px" }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(schedule.id)}
                    variant="outlined"
                    color="error"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NewScheduleModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditSchedule(null);
        }}
        selectedDate={selectedDate}
        refresh={loadSchedules}
        editData={editSchedule}
      />
    </div>
  );
};

export default Calendar;
