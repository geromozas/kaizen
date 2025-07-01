// import { useState } from "react";
// import { db } from "../../../firebaseConfig";
// import { useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import ProductsList from "./ProductsList";

// const Dashboard = () => {
//   const [clients, setClients] = useState([]);
//   const [isChange, setIsChange] = useState(false);

//   useEffect(() => {
//     setIsChange(false);
//     let productsCollections = collection(db, "products");
//     getDocs(productsCollections).then((res) => {
//       const newArr = res.docs.map((product) => {
//         return {
//           ...product.data(),
//           id: product.id,
//         };
//       });
//       setProducts(newArr);
//     });
//   }, [isChange]);

//   return (
//     <div style={{ marginTop: 50 }}>
//       <h1 style={{ justifySelf: "center" }}>Panel de control</h1>
//       <ProductsList products={products} setIsChange={setIsChange} />
//     </div>
//   );
// };

// export default Dashboard;
