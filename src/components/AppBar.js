import React from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import logo from "../assets/logo.png";
import  discord from "../assets/icons8-discord-100.png"
import slack from "../assets/icons8-slack-24.png"
import x from "../assets/icons8-x-50.png"


const AppBar = () => {
  return (
    <MuiAppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#1E1E1E",
        mb:5
      }}
    >
      <Toolbar>
        {/* Logo Section */}
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            height: "80px",
            width: "80px",
            marginRight: "16px",
          }}
        />
        {/* Title Section */}
        <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontSize:35 }}>
          A9LABS
        </Typography>

        {/* Social Media Icons */}
        <IconButton
        color="inherit"
        href="https://discord.com"
        target="_blank"
        sx={{ padding: "8px" }}
      >
        <Box
          component="img"
          src={discord}
          alt="Discord"
          sx={{
            height: "24px",
            width: "24px",
          }}
        />
      </IconButton>
        <IconButton color="inherit" href="https://twitter.com" target="_blank">
        <Box
        component="img"
        src={x}
        alt="X"
        sx={{
          color: "#ffff",
          height: "24px",
          width: "24px",
        }}
      />
        </IconButton>
        <IconButton color="inherit" href="https://slack.com" target="_blank">
          <Box
          component="img"
          src={slack}
          alt="Slack"
          sx={{
            height: "24px",
            width: "24px",
          }}
        />
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
