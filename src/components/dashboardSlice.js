import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  projects: [],
  selectedProject: localStorage.getItem("selectedProject") || null,
  plotData: {},
  leaderboard: [],
  loading: {
    projects: true,
    plots: false,
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
      localStorage.setItem("selectedProject", action.payload);
    },
    setPlotData: (state, action) => {
      state.plotData = action.payload;
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = { ...state.loading, ...action.payload };
    },
  },
});

export const {
  setProjects,
  setSelectedProject,
  setPlotData,
  setLeaderboard,
  setLoading,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Thunks
export const fetchActiveProjects = () => async (dispatch) => {
  dispatch(setLoading({ projects: true }));
  try {
    const response = await axios.post("https://a9labsapi-13747549899.us-central1.run.app/projects/active");
    dispatch(setProjects(response.data.active_projects || []));
  } catch (error) {
    console.error("Error fetching active projects:", error);
  } finally {
    dispatch(setLoading({ projects: false }));
  }
};

export const fetchPlotData = (projectName) => async (dispatch) => {
  dispatch(setLoading({ plots: true }));
  try {
    const formData = new FormData();
    formData.append("project_name", projectName);

    const response = await axios.post("https://a9labsapi-13747549899.us-central1.run.app/projects/plots", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { grouped_plot_data, leaderboard } = response.data;
    dispatch(setPlotData(grouped_plot_data || {}));
    dispatch(setLeaderboard(leaderboard || []));
  } catch (error) {
    console.error("Error fetching plot data:", error);
  } finally {
    dispatch(setLoading({ plots: false }));
  }
};
