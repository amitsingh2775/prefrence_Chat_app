// socket.js
import io from "socket.io-client";

const userID = sessionStorage.getItem("userId") || `user_${Math.random().toString(36).slice(2, 11)}`;
sessionStorage.setItem("userId", userID);

const socket = io("http://localhost:8000", {
  query: { userID },
});

export default socket;
