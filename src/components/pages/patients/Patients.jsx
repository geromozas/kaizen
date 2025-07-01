import { useState } from "react";
import { db } from "../../../firebaseConfig";
import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { PatientsList } from "./PatientsList";

const Clients = () => {
  const [patients, setPatients] = useState([]);
  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
    setIsChange(false);
    let patientsCollections = collection(db, "patients");
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
    <div id="boxPatients">
      <div className="firtsBoxPatients">
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

export default Clients;
