import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import PatientsList from "./PatientsList";
import "./Patients.css";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
    setIsChange(false);
    let patientsCollection = collection(db, "patients");
    getDocs(patientsCollection).then((res) => {
      const newArr = res.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setPatients(newArr);
    });
  }, [isChange]);

  return (
    <div id="boxClients">
      <div className="firtsBoxClient">
        <div>
          <h1>Pacientes</h1>
          <p>Gestiona la información de tus pacientes</p>
        </div>
      </div>
      <div className="secondBoxClient">
        <PatientsList patients={patients} setIsChange={setIsChange} />
      </div>
    </div>
  );
};

export default Patients;
