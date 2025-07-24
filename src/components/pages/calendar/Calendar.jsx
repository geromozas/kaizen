import { useState, useEffect } from "react";
import "./Calendar.css";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import NewScheduleModal from "../NewScheduleModal/NewScheduleModal";

const availableHours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [editSchedule, setEditSchedule] = useState(null);
  const [viewMode, setViewMode] = useState("day");

  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - start.getDay() + 1); // lunes
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const loadSchedules = async () => {
    const q = query(collection(db, "schedules"));
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

  const handleAttendanceToggle = async (scheduleId, clientId) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const updatedClients = schedule.clients.map((client) => {
      if (client.id === clientId) {
        return { ...client, attended: !client.attended };
      }
      return client;
    });

    await updateDoc(doc(db, "schedules", scheduleId), {
      clients: updatedClients,
    });

    loadSchedules();
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

  const weekDates = getWeekDates(selectedDate);

  const getSchedulesByDayHour = (dateStr, hour) =>
    schedules.filter((s) => s.date === dateStr && s.hour === hour);

  const formatDate = (date) =>
    date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });

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
              {
                schedules.filter(
                  (s) => s.date === selectedDate.toISOString().split("T")[0]
                ).length
              }
            </p>
            <p>
              <strong>Total alumnos: </strong>
              {schedules
                .filter(
                  (s) => s.date === selectedDate.toISOString().split("T")[0]
                )
                .reduce((acc, s) => acc + s.clients.length, 0)}
            </p>
          </div>
        </div>

        <div style={{ padding: 10 }} className="thirdBoxPatients">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>
              {viewMode === "day"
                ? "Horarios del Día"
                : "Horarios de la Semana"}
            </h2>
            <Button variant="contained" onClick={() => setModalOpen(true)}>
              + Nuevo Horario
            </Button>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <Button
              variant={viewMode === "day" ? "contained" : "outlined"}
              onClick={() => setViewMode("day")}
            >
              Día
            </Button>
            <Button
              variant={viewMode === "week" ? "contained" : "outlined"}
              onClick={() => setViewMode("week")}
            >
              Semana
            </Button>
          </div>

          {viewMode === "day" ? (
            <>
              <p>
                {formattedDay} {formattedDateNumeric}
              </p>
              <hr />
              {schedules.filter(
                (s) => s.date === selectedDate.toISOString().split("T")[0]
              ).length === 0 ? (
                <p style={{ textAlign: "center", marginTop: 60 }}>
                  No hay horarios programados para este día
                </p>
              ) : (
                schedules
                  .filter(
                    (s) => s.date === selectedDate.toISOString().split("T")[0]
                  )
                  .map((schedule) => (
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
                        {schedule.clients.map((clientObj) => {
                          const alumno = clients.find(
                            (c) => c.id === clientObj.id
                          );
                          return (
                            <li
                              key={clientObj.id}
                              style={{ listStyle: "none" }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={clientObj.attended}
                                    onChange={() =>
                                      handleAttendanceToggle(
                                        schedule.id,
                                        clientObj.id
                                      )
                                    }
                                  />
                                }
                                label={
                                  typeof alumno?.name === "string" &&
                                  typeof alumno?.lastName === "string"
                                    ? `${alumno.name} ${alumno.lastName}`
                                    : String(
                                        clientObj?.id ?? "Alumno desconocido"
                                      )
                                }
                              />
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
            </>
          ) : (
            <>
              <p>
                Semana del {formatDate(weekDates[0])} al{" "}
                {formatDate(weekDates[6])}
              </p>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: 8 }}>
                      Hora
                    </th>
                    {weekDates.map((date, idx) => (
                      <th
                        key={idx}
                        style={{ border: "1px solid #ddd", padding: 8 }}
                      >
                        {date.toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {availableHours.map((hour) => (
                    <tr key={hour}>
                      <td style={{ border: "1px solid #ddd", padding: 8 }}>
                        {hour}
                      </td>
                      {weekDates.map((date) => {
                        const dateStr = date.toISOString().split("T")[0];
                        const matches = getSchedulesByDayHour(dateStr, hour);
                        const total = matches.reduce(
                          (acc, s) => acc + s.clients.length,
                          0
                        );
                        return (
                          <td
                            key={dateStr + hour}
                            style={{
                              border: "1px solid #ddd",
                              padding: 8,
                              textAlign: "center",
                              color: total > 0 ? "green" : "#999",
                            }}
                          >
                            {total > 0 ? `👥 ${total}` : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
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
