import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { LogOut } from "lucide-react";
import Message from "./components/Message";
import toast from "react-hot-toast";
import socket from "./socket";

const ChatRoom = ({ roomID, setRoomID }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState(0);
  const userId = sessionStorage.getItem("userId");
  const [pref, setPref] = useState("");
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    socket.emit("join_room", { roomID });
    const getPref = sessionStorage.getItem("preference");
    setPref(getPref);

    if (!sessionStorage.getItem(`profileImage_${userId}`)) {
      const profileImage = `https://avatar.iran.liara.run/public?user=${userId}&timestamp=${Date.now()}`;
      sessionStorage.setItem(`profileImage_${userId}`, profileImage);
    }

    socket.on("receive_message", ({ sender, message, timestamp, id, reactions = {} }) => {
      setMessages((prev) => [...prev, { sender, message, timestamp: new Date(timestamp), id, reactions }]);
    });

    socket.on("room_update", (event) => {
      toast.success(event.message);
      setRoomUsers(event.users);
    });

    socket.on("reaction_added", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, reactions } : msg))
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("room_update");
      socket.off("reaction_added");
    };
  }, [roomID, userId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (roomID && message.trim()) {
      socket.emit("send_message", { roomID, message });
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const exitHandler = () => {
    setRoomID(null);
    socket.emit("leave_room", { roomID });
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem(`profileImage_${userId}`);
    sessionStorage.removeItem("preference");
    setPref("");
  };

  const getProfileImage = (sender) => {
    return sessionStorage.getItem(`profileImage_${sender}`) || "https://avatar.iran.liara.run/public";
  };

  return (
    <div
      className="min-h-screen bg-black"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=2000')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "multiply",
      }}
    >
      <div className="min-h-screen backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-4 py-8 flex gap-6">
          <div className="hidden md:flex flex-col gap-6 items-center py-8">
            <button
              onClick={exitHandler}
              className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <LogOut className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="flex-1 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-white">{pref} Warriors</h1>
                  <p className="text-white/70 text-md">{roomUsers} users in room</p>
                </div>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="h-[60vh] overflow-y-auto space-y-6 pr-4"
              style={{ scrollbarWidth: "none" }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === userId ? "justify-end" : "justify-start"} items-start gap-2`}
                >
                  {msg.sender !== userId && (
                    <img
                      src={getProfileImage(msg.sender)}
                      alt="Profile"
                      className="w-8 h-8 rounded-full mt-1"
                    />
                  )}
                  <Message
                    message={msg}
                    userId={userId}
                    roomID={roomID}
                    isSender={msg.sender === userId}
                    setMessages={setMessages}
                  />
                  {msg.sender === userId && (
                    <img
                      src={getProfileImage(msg.sender)}
                      alt="Profile"
                      className="w-8 h-8 rounded-full mt-1"
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="mt-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex gap-2 items-center">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70 resize-none overflow-hidden"
                  rows={1}
                  style={{ minHeight: "1.5em", maxHeight: "6em" }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
                <button type="submit" className="p-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-400">
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;