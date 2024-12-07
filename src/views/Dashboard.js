import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchActiveProjects,
  fetchPlotData,
  setSelectedProject,
} from "../components/dashboardSlice";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Grid,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import BuildIcon from "@mui/icons-material/Build";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import CircularProgress from "@mui/material/CircularProgress";

Chart.register(...registerables);

const generateColor = (index) => {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const calculateOptimalXScale = (dataLength) => {
  if (dataLength <= 5) return 1;
  if (dataLength <= 20) return 2;
  if (dataLength <= 50) return 5;
  return 10;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    projects,
    selectedProject,
    plotData,
    leaderboard,
    loading,
  } = useSelector((state) => state.dashboard);

  const [leaderboardExpanded, setLeaderboardExpanded] = useState(true);
  const [projectSearch, setProjectSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("");

  useEffect(() => {
    // Initial fetch when component mounts
    dispatch(fetchActiveProjects());

    // Set up an interval to refresh the active projects every 60 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchActiveProjects());
      if (selectedProject) {
        dispatch(fetchPlotData(selectedProject));
      }
    }, 60000); // 60 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [dispatch, selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchPlotData(selectedProject));
    }
  }, [dispatch, selectedProject]);

  const createGraphOptions = (metric, data) => {
    const miners = Object.keys(data);
    const labels = data[miners[0]]?.x || [];
    const optimalStep = calculateOptimalXScale(labels.length);
    const filteredLabels = labels.filter((_, index) => index % optimalStep === 0);

    return {
      labels: filteredLabels,
      datasets: miners.map((miner, index) => ({
        label: miner,
        data: data[miner]?.y || [],
        borderColor: generateColor(index),
        backgroundColor: generateColor(index) + "33",
        fill: false,
        tension: 0.4,
      })),
    };
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (!sortColumn) return 0;
    if (sortColumn === "train_loss") return a.train_loss - b.train_loss;
    if (sortColumn === "steps_completed") return a.steps_completed - b.steps_completed;
    return 0;
  });

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#121212",
        minHeight: "100vh",
        color: "#FFFFFF",
        gap: 3,
        p: 3,
      }}
    >
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Left Section (Graphs - 75%) */}
        <Grid item xs={12} md={9}>
          <Box sx={{ backgroundColor: "#1E1E1E", p: 2, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: "16px", mb: 8 }}>
              Training Project: {selectedProject || "None"}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 3,
              }}
            >
              {Object.keys(plotData).map((metric, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "#2E2E2E",
                    p: 2,
                    borderRadius: 2,
                    position: "relative",
                    height: "320px",
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1, fontSize: "12px" }}>
                    {metric.toUpperCase()} - {metric === "loss" ? "Training Loss Over Steps" : "Metric Over Steps"}
                  </Typography>
                  {loading.plots && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                      }}
                    >
                      <CircularProgress size={12} />
                    </Box>
                  )}
                  <Line
                    data={createGraphOptions(metric, plotData[metric])}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: { color: "#FFFFFF", usePointStyle: true },
                        },
                        tooltip: {
                          callbacks: {
                            label: (tooltipItem) => {
                              return `Value: ${tooltipItem.raw}`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: "#FFFFFF" },
                          title: { display: true, text: "Steps", color: "#FFFFFF" },
                        },
                        y: {
                          ticks: { color: "#FFFFFF" },
                          title: { display: true, text: metric, color: "#FFFFFF" },
                        },
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Right Section (25%) */}
        <Grid item xs={12} md={3}>
          {/* Active Projects */}
          <Box sx={{ backgroundColor: "#1E1E1E", p: 2, borderRadius: 2, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#2E2E2E",
                borderRadius: 2,
                p: 1,
                mb: 2,
              }}
            >
              <SearchIcon sx={{ color: "#4CAF50", mr: 1 }} />
              <InputBase
                placeholder="Search Projects..."
                sx={{ color: "#FFFFFF", flex: 1 }}
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
            </Box>
            <Typography variant="h6" gutterBottom sx={{ fontSize: "12px" }}>
              Current Running Projects
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "#2E2E2E",
                maxHeight: "200px",
                overflow: "auto",
                borderRadius: 2,
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#4CAF50", width: "60%", fontSize: "12px" }}>Project Name</TableCell>
                    <TableCell sx={{ color: "#4CAF50", width: "40%", fontSize: "12px" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.map((project, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "#383838" },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "#FFFFFF",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "12px",
                        }}
                      >
                        {project.name}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<BuildIcon />}
                          onClick={() => dispatch(setSelectedProject(project.name))}
                          sx={{ backgroundColor: "#4CAF50", "&:hover": { backgroundColor: "#388E3C" } }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Leaderboard */}
          <Box sx={{ backgroundColor: "#1E1E1E", p: 2, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: "12px" }}>
                Leaderboard
              </Typography>
              <IconButton
                onClick={() => setLeaderboardExpanded((prev) => !prev)}
                sx={{ color: "#FFFFFF" }}
              >
                {leaderboardExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={leaderboardExpanded}>
              <TableContainer
                component={Paper}
                sx={{
                  backgroundColor: "#2E2E2E",
                  maxHeight: "200px",
                  overflow: "auto",
                  borderRadius: 2,
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ color: "#4CAF50", cursor: "pointer", width: "50%", fontSize: "12px" }}
                        onClick={() => setSortColumn("rank")}
                      >
                        Rank <SortIcon />
                      </TableCell>
                      <TableCell sx={{ color: "#4CAF50", cursor: "pointer", width: "50%", fontSize: "12px" }}>
                        Miner <SortIcon />
                      </TableCell>
                      <TableCell
                        sx={{ color: "#4CAF50", cursor: "pointer", width: "50%", fontSize: "12px" }}
                        onClick={() => setSortColumn("train_loss")}
                      >
                        Train Loss<SortIcon />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedLeaderboard.map((entry, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": { backgroundColor: "#383838" },
                        }}
                      >
                        <TableCell sx={{ color: "#FFFFFF", fontSize: "12px" }}>
                          {entry.rank || 0}
                        </TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontSize: "12px" }}>
                          {entry.miner || 0}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#FFFFFF",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "12px",
                          }}
                        >
                          {entry.train_loss || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
