// Script para inicializar las actividades en Firebase
// Ejecuta este código una vez para crear las actividades iniciales en la base de datos

import { db } from "../../../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const initializeActivities = async () => {
  try {
    // Verificar si ya existen actividades
    const activitiesRef = collection(db, "activities");
    const snapshot = await getDocs(activitiesRef);
    
    if (!snapshot.empty) {
      console.log("Las actividades ya están inicializadas");
      return;
    }

    // Actividades por defecto incluyendo Quiropraxia
    const defaultActivities = [
      { label: "1 vez por semana", valor: 10000 },
      { label: "2 veces por semana", valor: 15000 },
      { label: "3 veces por semana", valor: 20000 },
      { label: "Quiropraxia", valor: 8000 }
    ];

    // Agregar cada actividad a Firebase
    for (const activity of defaultActivities) {
      await addDoc(activitiesRef, activity);
      console.log(`Actividad creada: ${activity.label} - $${activity.valor}`);
    }

    console.log("Actividades inicializadas correctamente");
  } catch (error) {
    console.error("Error inicializando actividades