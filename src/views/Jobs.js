import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Button,
  Paper,
  Modal,
  Backdrop,
  Fade,
  TextField,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Filter9Icon from "@mui/icons-material/Filter9";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const POLLING_INTERVAL = 30000; // Poll every 30 seconds

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    dataset: null,
  });
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "dataset") {
      setFormData({ ...formData, dataset: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.title || !formData.description || !formData.dataset) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append("user_id", formData.userId);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("file", formData.dataset);

    try {
      const response = await fetch("https://a9labsapi-13747549899.us-central1.run.app/jobs/create", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to create job.");
      }

      const data = await response.json();
      alert(`Job created successfully! Job ID: ${data.job_id}`);
      setOpenModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("https://a9labsapi-13747549899.us-central1.run.app/jobs/open",{method: "POST"});
        if (!response.ok) {
          throw new Error("Failed to fetch jobs.");
        }
        const data = await response.json();
        if (data.open_jobs) {
          setJobs(data.open_jobs);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setIsConnected(false);
      }
    };

    // Initial fetch
    fetchJobs();

    // Polling for updates
    const interval = setInterval(fetchJobs, POLLING_INTERVAL);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const handleCopyToClipboard = (job) => {
    const text = `--job_id ${job.job_id} --dataset_id ${job.dataset_id}`;
    navigator.clipboard.writeText(text);
    alert(`Copied to clipboard: ${text}`);
  };

  return (
    <Box sx={{ width: "100%", padding: "16px", color: "#FFFFFF", mt: 10 }}>
      {/* Introduction Section */}
      <Paper
        sx={{
          padding: "24px",
          backgroundColor: "#2E2E2E",
          borderRadius: "8px",
          marginBottom: "32px",
          boxShadow: 4,
        }}
        elevation={6}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "#4CAF50",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Available Jobs
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: "18px",
            lineHeight: "1.8",
            textAlign: "center",
            color: "#B0BEC5",
            marginBottom: "24px",
          }}
        >
          Explore exciting opportunities to showcase your AI expertise. Follow
          the steps below to get started, compete with others, and climb the
          leaderboard.
        </Typography>

        <Box textAlign="center">
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{
              backgroundColor: "#1565C0",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#003C8F",
              },
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: 3,
            }}
          >
            Create Training Job
          </Button>
        </Box>
        {isConnected ? (
          <Typography
            variant="body2"
            sx={{ color: "#B0BEC5", textAlign: "center" }}
          >
            Connected: Receiving real-time updates.
          </Typography>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: "red", textAlign: "center" }}
          >
            Disconnected: Trying to reconnect...
          </Typography>
        )}
      </Paper>

      {/* Flex Container for Jobs */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        {jobs.length > 0 ? (
          jobs.map((job, index) => (
            <Box
              key={index}
              sx={{
                flex: "1 1 calc(25% - 16px)",
                minWidth: "350px",
                maxWidth: "500px",
              }}
            >
              <Card
                sx={{
                  backgroundColor: "#2E2E2E",
                  color: "#FFFFFF",
                  borderRadius: 3,
                  boxShadow: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 18 }}>
                      Job: {job.job_id}
                    </Typography>
                    <Filter9Icon sx={{ color: "#FFFFF", fontSize: 32 }} />
                  </Box>
                  <Typography
                    variant="body2"
                    paragraph
                    sx={{
                      color: "#B0BEC5",
                      lineHeight: 1.5,
                      marginBottom: 2,
                    }}
                  >
                    {job.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" color="gray">
                      <strong>Created:</strong> {job.date_created}
                    </Typography>
                    <Typography variant="body2" color="gray">
                      <strong>Status:</strong> {job.status}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="gray" sx={{ mb: 1 }}>
                      <strong>Command:</strong>
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#121212",
                        borderRadius: 2,
                        padding: "8px",
                        overflowX: "auto",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#FFFFF",
                          fontFamily: "monospace",
                          whiteSpace: "nowrap",
                          flexGrow: 1,
                          fontSize: 12,
                        }}
                      >
                        --job_id {job.job_id} --dataset_id {job.dataset_id}
                      </Typography>
                      <Tooltip title="Copy Command">
                        <IconButton
                          onClick={() => handleCopyToClipboard(job)}
                          sx={{
                            marginLeft: 1,
                            backgroundColor: "#0000",
                            color: "#FFFFFF",
                            "&:hover": {
                              backgroundColor: "#1565C0",
                            },
                          }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: "#B0BEC5",
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            No open jobs available.
          </Typography>
        )}
      </Box>

      {/* Modal for Creating a Training Job */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "#2E2E2E",
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: "#FFFFFF" }}>
              Create Training Job
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                label="User ID"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  style: { color: "#FFFFFF" },
                }}
              />
              <TextField
                fullWidth
                required
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  style: { color: "#FFFFFF" },
                }}
              />
              <TextField
                fullWidth
                required
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{ mb: 2 }}
                InputProps={{
                  style: { color: "#FFFFFF" },
                }}
              />
              <Button
                variant="contained"
                component="label"
                sx={{
                  mb: 2,
                  backgroundColor: "#1565C0",
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#003C8F" },
                }}
              >
                <FileUploadIcon sx={{ mr: 1 }} />
                Upload Dataset (CSV)
                <input
                  type="file"
                  hidden
                  name="dataset"
                  accept=".csv"
                  onChange={handleChange}
                />
              </Button>
              <Typography
                variant="body2"
                sx={{ color: "#B0BEC5", fontStyle: "italic", mb: 2 }}
              >
                Hint: The dataset should be a CSV file with "instructions" and
                "response" columns.
              </Typography>

              {isSubmitting ? (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ color: "#B0BEC5", mt: 1 }}>
                    Submitting job...
                  </Typography>
                </Box>
              ) : (
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "#4CAF50",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#388E3C",
                    },
                  }}
                >
                  Submit Job
                </Button>
              )}
            </form>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Jobs;
