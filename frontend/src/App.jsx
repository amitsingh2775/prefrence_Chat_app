import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Backend server URL

const App = () => {
  const [preference, setPreference] = useState("");
  const [roomID, setRoomID] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);

  useEffect(() => {
    // Listen for room assignment
    socket.on("join_room", ({ roomID, users }) => {
      setRoomID(roomID);
      setMatchedUsers(users);
    });

    // Listen for incoming messages
    socket.on("receive_message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    // Cleanup on component unmount
    return () => {
      socket.off("join_room");
      socket.off("receive_message");
    };
  }, []);

  const handlePreferenceSubmit = () => {
    if (preference) {
      socket.emit("choose_preference", { preference });
    }
  };

  const handleSendMessage = () => {
    if (roomID && message) {
      socket.emit("send_message", { roomID, message });
      setMessages((prev) => [...prev, { sender: "You", message }]);
      setMessage(""); // Clear message input
    }
  };

  return (
    <div>
    {!roomID ? (
      <div>
        <h2>Choose Preference</h2>
        <input
          type="text"
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          placeholder="Enter your preference"
        />
        <button onClick={handlePreferenceSubmit}>Submit Preference</button>
      </div>
    ) : (
      <div>
        <h2>Room ID: {roomID}</h2>
        <h3>Users in Room:</h3>
        <ul>
          {matchedUsers.length > 0 ? (
            matchedUsers.map((user, index) => <li key={index}>{user}</li>)
          ) : (
            <li>No users in the room yet</li>
          )}
        </ul>
        <div>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index}>
                {msg.sender}: {msg.message}
              </div>
            ))
          ) : (
            <p>No messages yet</p>
          )}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    )}
  </div>
  
  );
};

export default App;
