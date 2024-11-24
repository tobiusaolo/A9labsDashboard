import React, { useState } from "react";
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  Typography,
  ListItemText,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import {
  Menu as MenuIcon,
  History as HistoryIcon,
  Work as JobsIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";

const drawerWidth = 240;
const collapsedWidth = 70;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon /> },
  { text: "Jobs", icon: <JobsIcon /> },
  { text: "History", icon: <HistoryIcon /> },
];

const Sidebar = ({ setActiveView }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed state

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: isCollapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#1E1E1E",
          color: "#FFFFFF",
          transition: "width 0.3s ease-in-out",
          overflowX: "hidden",
          mt:4,
        },
      }}
    >
      {/* Toolbar with Toggle Button */}
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: isCollapsed ? "center" : "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box
          component="img"
          src="/path/to/logo.png" // Replace with your logo file path
          alt="Logo"
          sx={{
            height: "40px",
            cursor: "pointer",
            display: isCollapsed ? "none" : "block",
            transition: "opacity 0.3s ease-in-out",
          }}
          onClick={() => setActiveView("Dashboard")}
        />
        <Typography
          variant="h6"
          noWrap
          sx={{
            opacity: isCollapsed ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => setActiveView("Dashboard")}
        >
          INTELLECT-1
        </Typography>
        <IconButton
          onClick={toggleSidebar}
          sx={{
            color: "#FFFFFF",
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Menu List */}
      <List>
        {menuItems.map((item, index) => (
          <Tooltip
            title={item.text}
            placement="right"
            disableHoverListener={!isCollapsed}
            key={index}
          >
            <ListItem
              button
              onClick={() => setActiveView(item.text)}
              sx={{
                "&:hover": {
                  backgroundColor: "#333333",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#FFFFFF", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: isCollapsed ? 0 : 1,
                  transition: "opacity 0.3s ease-in-out",
                }}
              />
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
