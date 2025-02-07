import React, { useEffect, useState } from "react";
import { FaPaperPlane, FaSignOutAlt, FaUsers, FaSun, FaMoon } from "react-icons/fa"; // FontAwesome icons
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Backend server URL

const App = () => {
  const [preference, setPreference] = useState("");
  const [roomID, setRoomID] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [userID, setUserID] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(true); 

  useEffect(() => {
    setUserID(socket.id);

    socket.on("join_room", ({ roomID, users }) => {
      setRoomID(roomID);
      setMatchedUsers(users);
    });

    socket.on("receive_message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

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
      setMessages((prev) => [...prev, { sender: socket.id, message }]);
      setMessage("");
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div
      className={`h-screen ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } flex flex-col lg:flex-row`}
    >
      {!roomID ? (
        <div
          className={`m-auto ${
            isDarkTheme ? "bg-gray-800" : "bg-white"
          } rounded-lg p-6 shadow-lg max-w-md w-full`}
        >
          <h2 className="text-2xl font-semibold mb-4 text-center">Choose Preference</h2>
          <input
            type="text"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            placeholder="Enter your preference"
            className={`w-full p-3 mb-4 border ${
              isDarkTheme ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-200 text-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 ${
              isDarkTheme ? "focus:ring-gray-400" : "focus:ring-gray-600"
            }`}
          />
          <button
            onClick={handlePreferenceSubmit}
            className={`w-full ${
              isDarkTheme ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"
            } text-white py-3 px-4 rounded-lg`}
          >
            Submit Preference
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row w-full">
          {/* Sidebar */}
          <div
            className={`w-full lg:w-1/4 ${
              isDarkTheme ? "bg-gray-800" : "bg-gray-200"
            } p-4 overflow-y-auto`}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaUsers /> Chats ({matchedUsers.length})
            </h2>
            <ul>
              {matchedUsers.length > 0 ? (
                matchedUsers.map((user, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 p-2 hover:${
                      isDarkTheme ? "bg-gray-700" : "bg-gray-300"
                    } rounded-lg mb-2`}
                  >
                    <div
                      className={`w-8 h-8 ${
                        isDarkTheme ? "bg-gray-600" : "bg-gray-400"
                      } rounded-full flex items-center justify-center`}
                    >
                      {user[0].toUpperCase()}
                    </div>
                    <span>{user}</span>
                  </li>
                ))
              ) : (
                <li>No users in the room yet</li>
              )}
            </ul>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div
              className={`p-4 border-b ${
                isDarkTheme ? "border-gray-700" : "border-gray-300"
              } flex justify-between items-center`}
            >
              <h2 className="text-lg font-semibold">Room ID: {roomID}</h2>
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className={`text-lg ${
                    isDarkTheme ? "text-yellow-400" : "text-gray-600"
                  }`}
                >
                  {isDarkTheme ? <FaSun /> : <FaMoon />}
                </button>
                <button
                  onClick={() => setRoomID(null)}
                  className={`text-lg flex items-center gap-2 ${
                    isDarkTheme ? "text-gray-400 hover:text-red-500" : "text-gray-800 hover:text-red-600"
                  }`}
                >
                  <FaSignOutAlt /> Leave Room
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg max-w-md ${
                      msg.sender === socket.id
                        ? "self-end bg-blue-500 text-white"
                        : "self-start bg-gray-300 text-gray-900"
                    }`}
                  >
                    <span className="block font-bold text-sm">
                      {msg.sender === socket.id ? "You" : msg.sender}
                    </span>
                    {msg.message}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No messages yet</p>
              )}
            </div>
            <div
              className={`p-4 border-t ${
                isDarkTheme ? "border-gray-700" : "border-gray-300"
              } flex gap-2`}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className={`flex-1 p-3 rounded-lg ${
                  isDarkTheme
                    ? "bg-gray-800 text-white placeholder-gray-400 focus:ring-gray-400"
                    : "bg-gray-200 text-gray-900 placeholder-gray-600 focus:ring-gray-600"
                } focus:outline-none`}
              />
              <button
                onClick={handleSendMessage}
                className={`p-3 rounded-lg ${
                  isDarkTheme ? "bg-blue-500 hover:bg-blue-400" : "bg-gray-400 hover:bg-gray-500"
                } text-white flex items-center gap-2`}
              >
                <FaPaperPlane /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
