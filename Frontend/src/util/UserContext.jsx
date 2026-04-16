import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import io from "socket.io-client";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleUrlChange = () => {
      // Your logic to run when there is a change in the URL
      console.log("URL has changed:", window.location.href);
    };
    window.addEventListener("popstate", handleUrlChange);
    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        setUser(userInfo);
      } catch (error) {
        console.error("Error parsing userInfo:", error);
      }
    } else {
      const temp = window.location.href.split("/");
      const url = temp.pop();
      console.log("url", url);
      if (url !== "about_us" && url !== "#why-skill-swap" && url !== "" && url !== "discover" && url !== "register") {
        navigate("/login");
      }
    }
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [window.location.href]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:8000');
      newSocket.emit('setup', user);
      newSocket.on('connected', () => console.log('Connected to socket'));
      newSocket.on('notification', (data) => {
        toast.info(data.message);
      });
      setSocket(newSocket);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  return <UserContext.Provider value={{ user, setUser, socket }}>{children}</UserContext.Provider>;
};

const useUser = () => {
  return useContext(UserContext);
};

export { UserContextProvider, useUser };
