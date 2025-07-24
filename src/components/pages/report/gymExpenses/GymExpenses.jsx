// import { useState } from "react";
// import "./GymExpenses.css";
// import { FaTrash, FaEdit } from "react-icons/fa";

// const GymExpenses = () => {
//   const [expenses, setExpenses] = useState([]);
//   const [form, setForm] = useState({ concept: "", amount: "" });
//   const [editIndex, setEditIndex] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAdd = () => {
//     if (!form.concept || !form.amount) return;
//     const amount = parseInt(form.amount);

//     if (editIndex !== null) {
//       const updated = [...expenses];
//       updated[editIndex] = { concept: form.concept, amount };
//       setExpenses(updated);
//       setEditIndex(null);
//     } else {
//       setExpenses((prev) => [...prev, { concept: form.concept, amount }]);
//     }

//     setForm({ concept: "", amount: "" });
//   };

//   const handleEdit = (index) => {
//     setEditIndex(index);
//     setForm(expenses[index]);
//   };

//   const handleDelete = (index) => {
//     setExpenses((prev) => prev.filter((_, i) => i !== index));
//   };

//   const total = expenses.reduce((acc, e) => acc + e.amount, 0);

//   return (
//     <div className="expenses-container">
//       <h2>Gastos del Mes</h2>
//       <p>Servicios y gastos operativos</p>

//       <div className="expense-form">
//         <input
//           type="text"
//           name="concept"
//           placeholder="Concepto (ej. Luz, Agua)"
//           value={form.concept}
//           onChange={handleChange}
//         />
//         <input
//           type="number"
//           name="amount"
//           placeholder="Monto"
//           value={form.amount}
//           onChange={handleChange}
//         />
//         <button onClick={handleAdd}>
//           {editIndex !== null ? "Actualizar" : "Agregar"}
//         </button>
//       </div>

//       <table className="expense-table">
//         <thead>
//           <tr>
//             <th>Concepto</th>
//             <th>Monto</th>
//             <th>Acciones</th>
//           </tr>
//         </thead>
//         <tbody className="scrollable-body">
//           {expenses.map((exp, idx) => (
//             <tr key={idx}>
//               <td>{exp.concept}</td>
//               <td className="amount-red">
//                 ${exp.amount.toLocaleString("es-AR")}
//               </td>
//               <td>
//                 <FaEdit className="icon" onClick={() => handleEdit(idx)} />
//                 <FaTrash className="icon" onClick={() => handleDelete(idx)} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//         <tfoot>
//           <tr>
//             <td>
//               <strong>Total Gastos</strong>
//             </td>
//             <td className="amount-red">
//               <strong>${total.toLocaleString("es-AR")}</strong>
//             </td>
//             <td></td>
//           </tr>
//         </tfoot>
//       </table>
//     </div>
//   );
// };

// export default GymExpenses;
import { useState, useEffect } from "react";
import "./GymExpenses.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
// adaptá el path

const GymExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ concept: "", amount: "" });
  const [editId, setEditId] = useState(null);

  const expensesRef = collection(db, "gastos"); // coleccion "gastos" en firestore

  const fetchExpenses = async () => {
    const snapshot = await getDocs(expensesRef);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!form.concept || !form.amount) return;
    const amount = parseInt(form.amount);

    if (editId) {
      const docRef = doc(db, "gastos", editId);
      await updateDoc(docRef, { concept: form.concept, amount });
      setEditId(null);
    } else {
      await addDoc(expensesRef, { concept: form.concept, amount });
    }

    setForm({ concept: "", amount: "" });
    fetchExpenses();
  };

  const handleEdit = (exp) => {
    setForm({ concept: exp.concept, amount: exp.amount });
    setEditId(exp.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "gastos", id));
    fetchExpenses();
  };

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="expenses-container">
      <h2>Gastos del Mes</h2>
      <p>Servicios y gastos operativos</p>

      <div className="expense-form">
        <input
          type="text"
          name="concept"
          placeholder="Concepto (ej. Luz, Agua)"
          value={form.concept}
          onChange={handleChange}
        />
        <input
          type="number"
          name="amount"
          placeholder="Monto"
          value={form.amount}
          onChange={handleChange}
        />
        <button onClick={handleAdd}>{editId ? "Actualizar" : "Agregar"}</button>
      </div>

      <table className="expense-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="scrollable-body">
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.concept}</td>
              <td className="amount-red">
                ${exp.amount.toLocaleString("es-AR")}
              </td>
              <td>
                <EditIcon className="icon" onClick={() => handleEdit(exp)} />
                <DeleteIcon
                  className="icon"
                  onClick={() => handleDelete(exp.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <strong>Total Gastos</strong>
            </td>
            <td className="amount-red">
              <strong>${total.toLocaleString("es-AR")}</strong>
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default GymExpenses;
