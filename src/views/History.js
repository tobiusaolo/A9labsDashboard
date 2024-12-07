import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LeaderboardIcon from "@mui/icons-material/Leaderboard"; // Corrected import
import InsightsIcon from "@mui/icons-material/Insights";

const History = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Update fetch to handle potential JSON parsing errors
        const response = await fetch("https://a9labsapi-13747549899.us-central1.run.app/projects/completed", { 
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        // Check if the response is successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Safely parse the response
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.error('Received response:', text);
          throw new Error('Invalid JSON response');
        }

        // Validate the data structure
        if (!data || !Array.isArray(data.completed_projects)) {
          throw new Error('Invalid data format');
        }

        setProjects(data.completed_projects);
        setError(null);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError(error.message || 'An unexpected error occurred');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Render error state
  if (error) {
    return (
      <Box sx={{ width: "100%", padding: "16px", mt: 5 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render empty state
  if (projects.length === 0) {
    return (
      <Box sx={{ width: "100%", padding: "16px", mt: 5 }}>
        <Typography variant="h6" color="textSecondary" align="center">
          No completed projects found
        </Typography>
      </Box>
    );
  }

  // Main render for projects
  return (
    <Box sx={{ width: "100%", padding: "16px", mt: 10 }}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ color: "#FFFFFF" }}>
          Recent Projects
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 3, color: "#FFFFFF" }}>
          Explore the details of our past projects, including datasets, descriptions, and leaderboards.
        </Typography>
      </Box>

      {projects.map((project, index) => (
        <Accordion key={index} sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${index}-content`}
            id={`panel-${index}-header`}
            sx={{
              backgroundColor: "#2E2E2E",
              color: "#FFFFFF",
              "&:hover": { backgroundColor: "#3C3C3C" },
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <InsightsIcon sx={{ color: "#4CAF50" }} />
              <Typography variant="h6">
                {project.project_name || `Project ${index + 1}`}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}>
            <Card
              sx={{
                backgroundColor: "#2E2E2E",
                borderRadius: 3,
                boxShadow: 4,
                padding: 2,
                marginBottom: 2,
              }}
            >
              <CardContent>
                <Typography variant="body1" paragraph>
                  <strong>Dataset:</strong> {project.datasets_used?.join(", ") || "Unknown"}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Best Miner:</strong> {project.best_miner || "None"} (
                  <em>Train Loss:</em>{" "}
                  {project.leaderboard?.[0]?.train_loss !== null
                    ? project.leaderboard[0].train_loss.toFixed(2)
                    : "N/A"}
                  )
                </Typography>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Typography
              variant="h6"
              sx={{ marginBottom: 1, display: "flex", alignItems: "center" }}
            >
              <LeaderboardIcon sx={{ marginRight: 1 }} />
              Leaderboard
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ backgroundColor: "#121212", color: "#FFFFFF" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#4CAF50" }}>Rank</TableCell>
                    <TableCell sx={{ color: "#4CAF50" }}>Name</TableCell>
                    <TableCell sx={{ color: "#4CAF50" }}>Train Loss</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {project.leaderboard?.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#FFFFFF" }}>{entry.rank}</TableCell>
                      <TableCell sx={{ color: "#FFFFFF" }}>{entry.miner}</TableCell>
                      <TableCell sx={{ color: "#FFFFFF" }}>
                        {entry.train_loss !== null ? entry.train_loss.toFixed(2) : "N/A"}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: "#FFFFFF" }}>
                        No leaderboard data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default History;