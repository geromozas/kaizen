import { useState } from "react";
import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import "./Quiropraxia.css";
import QuiropraxiaList from "./QuiropraxiaList";
import { db } from "../../../firebaseConfig";

const Quiropraxia = () => {
  const [patients, setPatients] = useState([]);
  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
    setIsChange(false);
    let patientsCollections = collection(db, "quiropraxia");
    getDocs(patientsCollections).then((res) => {
      const newArr = res.docs.map((patient) => {
        return {
          ...patient.data(),
          id: patient.id,
        };
      });
      setPatients(newArr);
    });
  }, [isChange]);

  return (
    <div id="boxQuiropraxia">
      <div className="firtsBoxQuiropraxia">
        <div>
          <h1>Pacientes de Quiropraxia</h1>
          <p>Gestiona la información de tus pacientes</p>
        </div>
      </div>
      <div className="secondBoxQuiropraxia">
        <QuiropraxiaList patients={patients || []} setIsChange={setIsChange} />
      </div>
    </div>
  );
};

export default Quiropraxia;
