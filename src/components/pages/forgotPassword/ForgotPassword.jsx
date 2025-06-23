import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";

import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../firebaseConfig";
import * as Yup from "yup";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const { handleSubmit, handleChange, errors } = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: async (data) => {
      try {
        console.log("Mail para recuperación de contraseña enviado con exito");
        const res = await forgotPassword(data);
        console.log(res);
        navigate("/login");
      } catch (error) {
        console.log(error);
      }
    },
    validateOnChange: false,
    validationSchema: Yup.object({
      email: Yup.string().required("Campo obligatorio").email("Email invalido"),
    }),
  });

  console.log(errors);

  return (
    <div>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "40px",
          // backgroundColor: theme.palette.secondary.main,
        }}
      >
        <Typography variant="h5" color={"primary"}>
          ¿Olvidaste tu contraseña?
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid
            container
            rowSpacing={2}
            // alignItems="center"
            justifyContent={"center"}
          >
            <Grid item xs={10} md={12}>
              <TextField
                onChange={handleChange}
                error={errors.email ? true : false}
                helperText={errors.email}
                type="text"
                variant="outlined"
                label="Email"
                fullWidth
                name="email"
              />
            </Grid>
            <Grid item xs={10} md={12}>
              <Button type="submit" variant="contained" fullWidth>
                Recuperar
              </Button>
            </Grid>
            <Grid item xs={10} md={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Regresar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  );
};

export default ForgotPassword;
