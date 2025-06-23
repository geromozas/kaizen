import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { db, uploadFile } from "../../../firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

const ProductForm = ({
  handleClose,
  setIsChange,
  productSelected,
  setProductSelected,
}) => {
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  // const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    description_small: "",
    category: "",
    stock: "",
    unit_price: "",
    image: "",
  });
  const [file, setFile] = useState(null);
  // const [pdfFile, setPdfFile] = useState(null);

  const handleImage = async () => {
    setIsUploading(true);
    let url = await uploadFile(file);

    if (productSelected) {
      setProductSelected({
        ...productSelected,
        image: url,
      });
    } else {
      setNewProduct({ ...newProduct, image: url });
    }
    setIsImageUploaded(true);
    setIsUploading(false);
  };

  // const handlePdf = async () => {
  //   setIsUploading(true);
  //   try {
  //     let url = await uploadFile(pdfFile);

  //     if (productSelected) {
  //       setProductSelected({
  //         ...productSelected,
  //         pdf: url,
  //       });
  //     } else {
  //       setNewProduct((prev) => ({ ...prev, pdf: url }));
  //     }

  //     setIsPdfUploaded(true);
  //   } catch (error) {
  //     console.log("Error al subir el PDF:", error);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  //formik hacer
  const handleChange = (e) => {
    if (productSelected) {
      setProductSelected({
        ...productSelected,
        [e.target.name]: e.target.value,
      });
    } else {
      setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    }
  };

  //formik hacer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading)
      return alert("Por favor, espere a que se suban los archivos.");

    const productsCollection = collection(db, "products");

    //
    // let pdfUrl = productSelected?.pdf || "";
    // if (pdfFile) {
    //   try {
    //     setIsUploading(true);
    //     pdfUrl = await uploadFile(pdfFile);
    //     setIsPdfUploaded(true);
    //   } catch (error) {
    //     console.log("Error al subir el PDF: ", error);
    //   } finally {
    //     setIsUploading(false);
    //   }
    // }

    if (productSelected) {
      let obj = {
        ...productSelected,
        unit_price: +productSelected.unit_price,
        // pdf: pdfUrl,
      };
      updateDoc(doc(productsCollection, productSelected.id), obj).then(() => {
        setIsChange(true);
        handleClose();
      });
    } else {
      let obj = {
        ...newProduct,
        unit_price: +newProduct.unit_price,
        // pdf: pdfUrl,
      };
      addDoc(productsCollection, obj).then(() => {
        setIsChange(true);
        handleClose();
      });
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alingItems: "center",
          gap: 10,
        }}
      >
        {!productSelected ? <h1>Nuevo Producto</h1> : <h1>Editar</h1>}

        <TextField
          label="Nombre"
          name="title"
          onChange={handleChange}
          defaultValue={productSelected?.title}
        />
        <TextField
          label="Descripción"
          name="description"
          onChange={handleChange}
          defaultValue={productSelected?.description}
        />
        {/* <TextField
          label="Descripción corta"
          name="description_small"
          onChange={handleChange}
          defaultValue={productSelected?.description_small}
        /> */}
        <TextField
          label="Categoria"
          name="category"
          onChange={handleChange}
          defaultValue={productSelected?.category}
        />
        <TextField
          label="Stock"
          name="stock"
          onChange={handleChange}
          defaultValue={productSelected?.stock}
        />
        <TextField
          label="Precio"
          name="unit_price"
          onChange={handleChange}
          defaultValue={productSelected?.unit_price}
        />
        <h4>Imagen</h4>
        <TextField type="file" onChange={(e) => setFile(e.target.files[0])} />
        {file && (
          <Button onClick={handleImage} type="button">
            Cargar imagen
          </Button>
        )}
        {isImageUploaded && (
          <p style={{ color: "green" }}>✅ Imagen subida correctamente</p>
        )}
        {productSelected?.image && (
          <a
            href={productSelected.image}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 8,
              color: "#27548A",
            }}
          >
            Ver imagen actual
          </a>
        )}
        {/* <h4>Pdf</h4>
        <TextField
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            setPdfFile(e.target.files[0]);
            setIsPdfUploaded(false);
          }}
        />
        {pdfFile && (
          <Button onClick={handlePdf} type="button">
            Cargar PDF
          </Button>
        )}
        {isPdfUploaded && (
          <p style={{ color: "green" }}>✅ PDF subido correctamente</p>
        )}
        {productSelected?.pdf && (
          <a
            href={productSelected.pdf}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 8,
              color: "#d1a4ac",
            }}
          >
            Ver PDF actual
          </a>
        )} */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: 20,
          }}
        >
          <Button variant="contained" type="submit" disabled={isUploading}>
            {productSelected ? "Modificar" : "Crear"}
          </Button>

          <Button variant="contained" onClick={() => handleClose()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
