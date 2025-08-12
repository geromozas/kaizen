import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const activitiesRef = collection(db, "activities");
      const snapshot = await getDocs(activitiesRef);
      const activitiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivities(activitiesData);
    } catch (err) {
      console.error("Error loading activities:", err);
      setError("Error al cargar las actividades");
      // Fallback a actividades por defecto si hay error
      setActivities([
        { id: "1", label: "1 vez por semana", valor: 10000 },
        { id: "2", label: "2 veces por semana", valor: 15000 },
        { id: "3", label: "3 veces por semana", valor: 20000 },
        { id: "4", label: "Quiropraxia", valor: 8000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return {
    activities,
    loading,
    error,
    reloadActivities: loadActivities,
  };
};
