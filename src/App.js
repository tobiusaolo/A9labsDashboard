import React, { useState } from "react";
import { CssBaseline, Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import AppBar from "./components/AppBar";
import Dashboard from "./views/Dashboard";
import Jobs from "./views/Jobs";
import History from "./views/History";

const App = () => {
  const [activeView, setActiveView] = useState("Dashboard");

  const renderView = () => {
    switch (activeView) {
      case "Jobs":
        return <Jobs />;
      case "History":
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <Sidebar setActiveView={setActiveView} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          backgroundColor: "#1E1E1E",
        }}
      >
        <AppBar />
        <Box sx={{ p: 3 }}>{renderView()}</Box>
      </Box>
    </Box>
  );
};

export default App;
