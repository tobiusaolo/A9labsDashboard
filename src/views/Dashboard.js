import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const generateColor = (index) => {
  const hue = (index * 137.508) % 360; // Golden angle for color diversity
  return `hsl(${hue}, 70%, 50%)`;
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectStatus, setSelectedProjectStatus] = useState("Initializing");
  const [plotData, setPlotData] = useState({
    loss: {},
    epoch: {},
    globalStep: {},
    learningRate: {},
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProjectsPage, setCurrentProjectsPage] = useState(1);
  const [currentLeaderboardPage, setCurrentLeaderboardPage] = useState(1);
  const websocketRef = useRef(null);
  const projectsPerPage = 3;
  const leaderboardPerPage = 5;

  const createGraphOptions = (title, plotDataForMetric) => {
    const miners = Object.keys(plotDataForMetric);

    const datasets = miners.map((miner, index) => ({
      label: miner,
      data: plotDataForMetric[miner],
      borderColor: generateColor(index),
      backgroundColor: generateColor(index) + "33",
      fill: false,
      tension: 0.4,
    }));

    return {
      labels: Array.from(
        { length: Math.max(...miners.map((miner) => plotDataForMetric[miner].length)) },
        (_, i) => i + 1
      ),
      datasets: datasets,
    };
  };

  const connectWebSocketForPlots = (projectName, isInitialLoad = false) => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    const ws = new WebSocket(`wss://a9labsapi-1048667232204.us-central1.run.app/ws/projects/${projectName}/plots`);
    websocketRef.current = ws;
    

    ws.onopen = () => {
      console.log(`WebSocket connected for project: ${projectName}`);
      if (isInitialLoad) {
        setSelectedProjectStatus("Running");
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket plot data received:", data);

        const minerPlotData = data.plot_data.reduce((acc, dataPoint) => {
          const miner = dataPoint.miner || "Unknown";
          if (!acc[miner]) acc[miner] = [];
          if (!isNaN(dataPoint["train/loss"])) acc[miner].push(dataPoint);
          return acc;
        }, {});

        const processedPlotData = {
          loss: {},
          epoch: {},
          globalStep: {},
          learningRate: {},
        };

        Object.keys(minerPlotData).forEach((miner) => {
          processedPlotData.loss[miner] = minerPlotData[miner].map((d) => d["train/loss"] || 0);
          processedPlotData.epoch[miner] = minerPlotData[miner].map((d) => d["train/epoch"] || 0);
          processedPlotData.globalStep[miner] = minerPlotData[miner].map((d) => d["train/global_step"] || 0);
          processedPlotData.learningRate[miner] = minerPlotData[miner].map((d) => d["train/learning_rate"] || 0);
        });

        setPlotData(processedPlotData);
        setLeaderboard(data.leaderboard);
      } catch (err) {
        console.error("Error parsing WebSocket plot data:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error for plots:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection for plots closed");
    };
  };

  useEffect(() => {
    const connectWebSocketForProjects = () => {
      const ws = new WebSocket("wss://a9labsapi-1048667232204.us-central1.run.app/ws/projects/active");
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket for projects connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket projects data received:", data);

          const transformedProjects = (data.active_projects || []).map((project) => {
            const activeRuns = project.active_runs || [];
            const numberOfParticipants = activeRuns.length;

            const longestDuration = activeRuns.reduce((max, run) => {
              const duration = new Date() - new Date(run.started_at);
              return duration > max ? duration : max;
            }, 0);

            const earliestStartTime = activeRuns.reduce((earliest, run) => {
              const startTime = new Date(run.started_at);
              return startTime < earliest ? startTime : earliest;
            }, new Date());

            return {
              name: project.name,
              created_at: project.created_at || "N/A",
              numberOfParticipants,
              duration: longestDuration
                ? new Date(longestDuration).toISOString().substr(11, 8)
                : "N/A",
              start_time: earliestStartTime.toISOString(),
            };
          });

          setProjects(transformedProjects);

          // Automatically select and load the first project on initial load
          if (transformedProjects.length > 0 && !selectedProject) {
            const mostRecentProject = transformedProjects[0].name;
            setSelectedProject(mostRecentProject);
            connectWebSocketForPlots(mostRecentProject, true);
          }

          setLoading(false);
        } catch (err) {
          console.error("Error parsing WebSocket projects data:", err);
          setLoading(false);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error for projects:", error);
        setLoading(false);
      };

      ws.onclose = () => {
        console.log("WebSocket for projects closed");
      };
    };

    connectWebSocketForProjects();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const handleProjectsPageChange = (_, page) => {
    setCurrentProjectsPage(page);
  };

  const handleLeaderboardPageChange = (_, page) => {
    setCurrentLeaderboardPage(page);
  };

  const handleViewProject = (projectName) => {
    setSelectedProject(projectName);
    setSelectedProjectStatus("Running");
    connectWebSocketForPlots(projectName);
  };

  const paginatedProjects = projects.slice(
    (currentProjectsPage - 1) * projectsPerPage,
    currentProjectsPage * projectsPerPage
  );

  const paginatedLeaderboard = leaderboard.slice(
    (currentLeaderboardPage - 1) * leaderboardPerPage,
    currentLeaderboardPage * leaderboardPerPage
  );

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 2,
        color: "#FFFFFF",
        background: "#121212",
        minHeight: "100vh",
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              backgroundColor: "#2E2E2E",
              borderRadius: 2,
              p: 2,
              mb: 2,
              mt: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "#FFFFFF" }}>
              Training Project: {selectedProject || "Select a Project"}
            </Typography>
            <Typography variant="body1" sx={{ color: "#4CAF50" }}>
              Status: {selectedProjectStatus}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 3,
              mt: 5,
              mb: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: "#2E2E2E",
                borderRadius: 2,
                p: 3,
                boxShadow: 3,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#FFFFFF" }}>
                Running Projects
              </Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: "#1E1E1E", mb: 2 }}>
                <Table aria-label="running projects table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#4CAF50" }}>Project Name</TableCell>
                      <TableCell sx={{ color: "#4CAF50" }}>Date Created</TableCell>
                      <TableCell sx={{ color: "#4CAF50" }}>Participants</TableCell>
                      <TableCell sx={{ color: "#4CAF50" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedProjects.map((project, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: "#FFFFFF" }}>{project.name}</TableCell>
                        <TableCell sx={{ color: "#FFFFFF" }}>{project.created_at}</TableCell>
                        <TableCell sx={{ color: "#FFFFFF" }}>{project.numberOfParticipants}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewProject(project.name)}
                            sx={{
                              backgroundColor: "#4CAF50",
                              color: "#FFFFFF",
                              textTransform: "none",
                              "&:hover": {
                                backgroundColor: "#388E3C",
                              },
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Pagination
                count={Math.ceil(projects.length / projectsPerPage)}
                page={currentProjectsPage}
                onChange={handleProjectsPageChange}
                sx={{ display: "flex", justifyContent: "center" }}
              />
            </Box>

            <Box
              sx={{
                backgroundColor: "#2E2E2E",
                borderRadius: 2,
                p: 3,
                boxShadow: 3,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#FFFFFF" }}>
                Leaderboard
              </Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: "#1E1E1E", mb: 2 }}>
                <Table aria-label="leaderboard table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#4CAF50" }}>Miner</TableCell>
                      <TableCell sx={{ color: "#4CAF50" }}>Train Loss</TableCell>
                      <TableCell sx={{ color: "#4CAF50" }}>Steps Completed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLeaderboard.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: "#FFFFFF" }}>{entry.miner}</TableCell>
                        <TableCell sx={{ color: "#FFFFFF" }}>{entry.train_loss || "N/A"}</TableCell>
                        <TableCell sx={{ color: "#FFFFFF" }}>{entry.steps_completed || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Pagination
                count={Math.ceil(leaderboard.length / leaderboardPerPage)}
                page={currentLeaderboardPage}
                onChange={handleLeaderboardPageChange}
                sx={{ display: "flex", justifyContent: "center" }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap:2,
            }}
          >
            {[
              { title: "Train/Loss", dataKey: "loss" },
              { title: "Tain/Epoch", dataKey: "epoch" },
              { title: "Train/Global Step", dataKey: "globalStep" },
              { title: "Train/Learning Rate", dataKey: "learningRate" },
            ].map((graph, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "#2E2E2E",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: 3,
                  height: "300px",
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: "#FFFFFF" }}>
                  {graph.title}
                </Typography>
                {Object.keys(plotData[graph.dataKey]).length > 0 ? (
                  <Line
                    data={createGraphOptions(graph.title, plotData[graph.dataKey])}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            color: "#FFFFFF",
                          },
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: "#FFFFFF" },
                          title: {
                            display: true,
                            text: "Steps",
                            color: "#FFFFFF",
                          },
                        },
                        y: {
                          ticks: { color: "#FFFFFF" },
                          title: {
                            display: true,
                            text: graph.title,
                            color: "#FFFFFF",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    No data available
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Dashboard;