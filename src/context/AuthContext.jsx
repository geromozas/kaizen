import { useEffect, useState } from "react";
import { createContext } from "react";
//


export const AuthContext = createContext();

const AuthContextComponent = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || {}
  );
  const [isLogged, setIsLogged] = useState(
    JSON.parse(localStorage.getItem("isLogged")) || false
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    const storedLogged = JSON.parse(localStorage.getItem("isLogged"));

    if (storedUser && storedLogged) {
      setUser(storedUser);
      setIsLogged(true);
    }

    setLoading(false);
  }, []);

  const handleLogin = (userLogged) => {
    setUser(userLogged);
    setIsLogged(true);
    localStorage.setItem("userInfo", JSON.stringify(userLogged));
    localStorage.setItem("isLogged", JSON.stringify(true));
  };

  const logoutContext = () => {
    setUser({});
    setIsLogged(false);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isLogged");
  };

  let data = {
    user,
    isLogged,
    loading,
    handleLogin,
    logoutContext,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export default AuthContextComponent;

// import { useEffect, useState, createContext } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// // import { auth, db } from "../firebaseConfig";
// import { db, auth } from "../firebaseConfig.js";

// export const AuthContext = createContext();

// const AuthContextComponent = ({ children }) => {
//   const [user, setUser] = useState(
//     JSON.parse(localStorage.getItem("userInfo")) || {}
//   );
//   const [isLogged, setIsLogged] = useState(
//     JSON.parse(localStorage.getItem("isLogged")) || false
//   );
//   const [loading, setLoading] = useState(true);

//   // Escucha cambios de sesión en Firebase
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         // Buscar los datos del usuario en Firestore
//         const docRef = doc(db, "users", firebaseUser.uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const fullUser = {
//             uid: firebaseUser.uid,
//             email: firebaseUser.email,
//             ...docSnap.data(), // Agrega name, rol, etc.
//           };

//           setUser(fullUser);
//           setIsLogged(true);
//           localStorage.setItem("userInfo", JSON.stringify(fullUser));
//           localStorage.setItem("isLogged", JSON.stringify(true));
//         } else {
//           console.log("No se encontraron datos del usuario en Firestore.");
//         }
//       } else {
//         // Usuario deslogueado
//         setUser({});
//         setIsLogged(false);
//         localStorage.removeItem("userInfo");
//         localStorage.removeItem("isLogged");
//       }

//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const logoutContext = () => {
//     setUser({});
//     setIsLogged(false);
//     localStorage.removeItem("userInfo");
//     localStorage.removeItem("isLogged");
//   };

//   const data = {
//     user,
//     isLogged,
//     loading,
//     logoutContext,
//   };

//   return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
// };

// export default AuthContextComponent;
