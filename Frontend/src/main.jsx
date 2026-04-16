import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { UserContextProvider } from "./util/UserContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";


// This block correctly sets the API url for development vs. production
if (import.meta.env.DEV) {
  console.log("Running in development mode");
  // In development, all API requests will go to the proxy path '/api'
  axios.defaults.baseURL = "/api";
} else {
  console.log("Running in production mode");
  // In production, this will use your actual deployed server URL
  axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
}

// This ensures cookies are sent with every request
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <UserContextProvider>
      <App />
    </UserContextProvider>
  </Router>
);