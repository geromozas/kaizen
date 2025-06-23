import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../../../firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import ProductForm from "./ProductForm";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 675,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};

const ProductsList = ({ products, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [productSelected, setProductSelected] = useState(null);

  const handleClose = () => {
    setOpen(false);
  };

  const deleteProduct = (id) => {
    deleteDoc(doc(db, "products", id));
    console.log("el pruducto con el id " + id + " se ha borrado");
    alert("Producto borrado");

    setIsChange(true);
  };

  const handleOpen = (product) => {
    setProductSelected(product);
    setOpen(true);
  };

  return (
    <div style={{ marginTop: 30 }}>
      <Button
        variant="contained"
        style={{ marginBottom: 20 }}
        onClick={() => handleOpen(null)}
      >
        Agregar Producto
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                ID
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                TITULO
              </TableCell>
              {/* <TableCell align="left" style={{ fontWeight: "bold" }}>
                DESCRIPCIÓN CORTA
              </TableCell> */}
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                DESCRIPCIÓN
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                PRECIO
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                CATEGORIA
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                STOCK
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                IMAGEN
              </TableCell>
              <TableCell align="left" style={{ fontWeight: "bold" }}>
                ACCIONES
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row" align="left">
                  {product.id}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {product.title}
                </TableCell>
                {/* <TableCell component="th" scope="row" align="left">
                  {product.description_small}
                </TableCell> */}
                <TableCell
                  component="th"
                  scope="row"
                  width="600px"
                  align="left"
                >
                  {product.description}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  ${product.unit_price}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {product.category}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  {product.stock}
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  <img
                    src={product.image}
                    alt=""
                    style={{ width: 100, height: 100, borderRadius: 10 }}
                    align="left"
                  />
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  <IconButton onClick={() => handleOpen(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteProduct(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <ProductForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            productSelected={productSelected}
            setProductSelected={setProductSelected}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default ProductsList;
