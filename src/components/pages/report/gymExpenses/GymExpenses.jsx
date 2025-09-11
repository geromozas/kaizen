// import { useState, useEffect } from "react";
// import "./GymExpenses.css";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   updateDoc,
//   doc,
//   Timestamp,
// } from "firebase/firestore";
// import { db } from "../../../../firebaseConfig";

// const GymExpenses = ({ onGastosChange, selectedDate }) => {
//   const [expenses, setExpenses] = useState([]);
//   const [form, setForm] = useState({ concept: "", amount: "" });
//   const [editId, setEditId] = useState(null);

//   const expensesRef = collection(db, "gastos");

//   const fetchExpenses = async () => {
//     const snapshot = await getDocs(expensesRef);
//     const [year, month] = selectedDate.split("-").map(Number);

//     const data = snapshot.docs
//       .map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }))
//       .filter((item) => {
//         const createdAt = item.createdAt?.toDate?.() || item.createdAt;
//         if (!createdAt) return false;
//         const date = new Date(createdAt);
//         return date.getFullYear() === year && date.getMonth() + 1 === month;
//       });

//     setExpenses(data);
//   };

//   useEffect(() => {
//     fetchExpenses();
//   }, [selectedDate]);

//   useEffect(() => {
//     const total = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
//     if (onGastosChange) onGastosChange(total);
//   }, [expenses, onGastosChange]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAdd = async () => {
//     if (!form.concept || !form.amount) return;
//     const amount = parseFloat(form.amount);

//     // Usar la fecha del mes seleccionado en lugar del momento actual
//     const [year, month] = selectedDate.split("-").map(Number);
//     const dateForExpense = new Date(year, month - 1, 1); // Primer día del mes seleccionado

//     if (editId) {
//       const docRef = doc(db, "gastos", editId);
//       await updateDoc(docRef, { concept: form.concept, amount });
//       setEditId(null);
//     } else {
//       await addDoc(expensesRef, {
//         concept: form.concept,
//         amount,
//         createdAt: Timestamp.fromDate(dateForExpense),
//       });
//     }

//     setForm({ concept: "", amount: "" });
//     fetchExpenses();
//   };

//   const handleEdit = (exp) => {
//     setForm({ concept: exp.concept, amount: exp.amount });
//     setEditId(exp.id);
//   };

//   const handleDelete = async (id) => {
//     await deleteDoc(doc(db, "gastos", id));
//     fetchExpenses();
//   };

//   const total = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

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
//         <button onClick={handleAdd}>{editId ? "Actualizar" : "Agregar"}</button>
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
//           {expenses.map((exp) => (
//             <tr key={exp.id}>
//               <td>{exp.concept}</td>
//               <td className="amount-red">
//                 ${parseFloat(exp.amount).toLocaleString("es-AR")}
//               </td>
//               <td>
//                 <EditIcon className="icon" onClick={() => handleEdit(exp)} />
//                 <DeleteIcon
//                   className="icon"
//                   onClick={() => handleDelete(exp.id)}
//                 />
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
import { TextField, MenuItem } from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";

const GymExpenses = ({ onGastosChange, selectedDate }) => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    concept: "",
    amount: "",
    paymentMethod: "efectivo",
  });
  const [editId, setEditId] = useState(null);

  const expensesRef = collection(db, "gastos");

  // Opciones de métodos de pago
  const paymentMethods = [
    { value: "efectivo", label: "Efectivo" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "transferencia", label: "Transferencia" },
  ];

  const fetchExpenses = async () => {
    const snapshot = await getDocs(expensesRef);
    const [year, month] = selectedDate.split("-").map(Number);

    const data = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((item) => {
        const createdAt = item.createdAt?.toDate?.() || item.createdAt;
        if (!createdAt) return false;
        const date = new Date(createdAt);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });

    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedDate]);

  useEffect(() => {
    const total = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    if (onGastosChange) onGastosChange(total);
  }, [expenses, onGastosChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!form.concept || !form.amount) return;
    const amount = parseFloat(form.amount);

    // Usar la fecha del mes seleccionado en lugar del momento actual
    const [year, month] = selectedDate.split("-").map(Number);
    const dateForExpense = new Date(year, month - 1, 1); // Primer día del mes seleccionado

    if (editId) {
      const docRef = doc(db, "gastos", editId);
      await updateDoc(docRef, {
        concept: form.concept,
        amount,
        paymentMethod: form.paymentMethod,
      });
      setEditId(null);
    } else {
      await addDoc(expensesRef, {
        concept: form.concept,
        amount,
        paymentMethod: form.paymentMethod,
        createdAt: Timestamp.fromDate(dateForExpense),
      });
    }

    setForm({ concept: "", amount: "", paymentMethod: "efectivo" });
    fetchExpenses();
  };

  const handleEdit = (exp) => {
    setForm({
      concept: exp.concept,
      amount: exp.amount,
      paymentMethod: exp.paymentMethod || "efectivo",
    });
    setEditId(exp.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "gastos", id));
    fetchExpenses();
  };

  // Función para obtener el ícono según el método de pago
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "efectivo":
        return "💵";
      case "tarjeta":
        return "💳";
      case "transferencia":
        return "🏦";
      default:
        return "💵";
    }
  };

  const total = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

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
        <TextField
          select
          name="paymentMethod"
          label="Método de Pago"
          value={form.paymentMethod}
          onChange={handleChange}
          style={{ minWidth: "150px", marginLeft: "10px" }}
        >
          {paymentMethods.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <button onClick={handleAdd}>{editId ? "Actualizar" : "Agregar"}</button>
      </div>

      <table className="expense-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Método de Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="scrollable-body">
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.concept}</td>
              <td className="amount-red">
                ${parseFloat(exp.amount).toLocaleString("es-AR")}
              </td>
              <td>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  {getPaymentMethodIcon(exp.paymentMethod)}
                  {paymentMethods.find((m) => m.value === exp.paymentMethod)
                    ?.label || "Efectivo"}
                </span>
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
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default GymExpenses;
