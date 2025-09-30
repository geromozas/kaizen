import React, { useMemo } from "react";
import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useActivities } from "../activities/useActivities";

const ActivityStats = ({ clients = [] }) => {
  const { activities = [] } = useActivities();

  const stats = useMemo(() => {
    // Filtrar solo clientes activos (no inactivos)
    const activeClients = clients.filter(
      (client) => client.estado !== "Inactivo"
    );

    // Agrupar por actividad
    const activityGroups = {};

    activeClients.forEach((client) => {
      const actividad = client.actividad || "Sin asignar";

      if (!activityGroups[actividad]) {
        activityGroups[actividad] = {
          total: 0,
          alDia: 0,
          deudores: 0,
          saldoFavor: 0,
        };
      }

      activityGroups[actividad].total++;

      if (client.estado === "Al día" || client.saldoFavor > 0) {
        activityGroups[actividad].alDia++;
      } else if (client.estado === "Deudor") {
        activityGroups[actividad].deudores++;
      }

      if (client.saldoFavor > 0) {
        activityGroups[actividad].saldoFavor++;
      }
    });

    // Calcular totales generales
    const totalActivos = activeClients.length;
    const totalInactivos = clients.filter(
      (c) => c.estado === "Inactivo"
    ).length;
    const totalGeneral = clients.length;

    return {
      activityGroups,
      totalActivos,
      totalInactivos,
      totalGeneral,
    };
  }, [clients, activities]);

  const getActivityColor = (actividad) => {
    const activity = activities.find((a) => a.label === actividad);
    // Colores por defecto basados en el nombre si no hay configuración específica
    const colorMap = {
      gimnasio: "#1976d2",
      entrenamiento: "#2e7d32",
      funcional: "#f57c00",
      crossfit: "#d32f2f",
      pilates: "#7b1fa2",
      yoga: "#388e3c",
    };

    const lowerActividad = actividad.toLowerCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (lowerActividad.includes(key)) {
        return color;
      }
    }

    return "#616161"; // Color por defecto
  };

  const getStatusColor = (total, alDia) => {
    const percentage = (alDia / total) * 100;
    if (percentage >= 80) return "#4caf50"; // Verde
    if (percentage >= 60) return "#ff9800"; // Naranja
    return "#f44336"; // Rojo
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Estadísticas generales */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Resumen General
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "success.main" }}
              >
                {stats.totalActivos}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Activos
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "warning.main" }}
              >
                {stats.totalInactivos}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Inactivos
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {stats.totalGeneral}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "info.main" }}
              >
                {Object.keys(stats.activityGroups).length}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Actividades
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Estadísticas por actividad */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TrendingUpIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Personas Activas por Actividad
          </Typography>
        </Box>

        {Object.keys(stats.activityGroups).length === 0 ? (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            No hay clientes activos registrados
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {Object.entries(stats.activityGroups)
              .sort(([, a], [, b]) => b.total - a.total) // Ordenar por cantidad descendente
              .map(([actividad, data]) => {
                const percentage = ((data.alDia / data.total) * 100).toFixed(0);
                return (
                  <Grid item xs={12} sm={6} md={4} key={actividad}>
                    <Card
                      sx={{
                        height: "100%",
                        border: `2px solid ${getActivityColor(actividad)}`,
                        "&:hover": {
                          boxShadow: 3,
                          transform: "translateY(-2px)",
                          transition: "all 0.2s ease-in-out",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: "bold",
                              color: getActivityColor(actividad),
                              fontSize: "0.9rem",
                            }}
                          >
                            {actividad}
                          </Typography>
                          <Chip
                            label={data.total}
                            size="small"
                            sx={{
                              backgroundColor: getActivityColor(actividad),
                              color: "white",
                              fontWeight: "bold",
                              minWidth: "40px",
                            }}
                          />
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Grid container spacing={1} sx={{ fontSize: "0.8rem" }}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  color: "success.main",
                                  fontSize: "1.2rem",
                                }}
                              >
                                {data.alDia}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Al día
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={6}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  color: "error.main",
                                  fontSize: "1.2rem",
                                }}
                              >
                                {data.deudores}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Deudores
                              </Typography>
                            </Box>
                          </Grid>

                          {data.saldoFavor > 0 && (
                            <Grid item xs={12}>
                              <Box sx={{ textAlign: "center", mt: 0.5 }}>
                                <Typography variant="caption" color="info.main">
                                  {data.saldoFavor} con saldo a favor
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>

                        {/* Barra de progreso visual */}
                        <Box sx={{ mt: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="caption" color="textSecondary">
                              Estado de pagos
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "bold",
                                color: getStatusColor(data.total, data.alDia),
                              }}
                            >
                              {percentage}%
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              width: "100%",
                              height: 6,
                              backgroundColor: "grey.200",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${percentage}%`,
                                height: "100%",
                                backgroundColor: getStatusColor(
                                  data.total,
                                  data.alDia
                                ),
                                transition: "width 0.3s ease-in-out",
                              }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default ActivityStats;
