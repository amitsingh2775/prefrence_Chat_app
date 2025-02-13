import React, { useEffect, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Sparkles, LogOut } from "lucide-react";
import toast from 'react-hot-toast';
import socket from "./socket";

const ChatRoom = ({ roomID, setRoomID }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  //const [onlineUsers, setOnlineUsers] = useState(0);
  const [roomUsers, setRoomUsers] = useState(0);

  const userPreference = { name: "User1", preferences: ["Art", "Music"] };

  useEffect(() => {
    if (roomID) {
      socket.emit("join_room", { roomID });
    }

    socket.on("receive_message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message, timestamp: new Date() }]);
    });



    socket.on("room_update", (event) => {
      toast.success(event.message)
      setRoomUsers(event.users);
    });

    return () => {
      socket.off("receive_message");

      socket.off("room_update");
    };
  }, [roomID]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (roomID && message) {
      socket.emit("send_message", { roomID, message });
      setMessages((prev) => [...prev, { sender: "You", message, timestamp: new Date() }]);
      setMessage("");
    }
  };

  const exitHandler = () => {
    setRoomID(null);
    socket.emit("leave_room", { roomID });
    sessionStorage.removeItem("userId");
  };

  return (
    <div className="min-h-screen bg-black" style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=2000')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundBlendMode: "multiply",
    }}>
      <div className="min-h-screen backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-4 py-8 flex gap-6">
          <div className="hidden md:flex flex-col gap-6 items-center py-8">
            <button onClick={exitHandler} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer group" aria-label="Log Out">
              <LogOut className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="flex-1 max-w-4xl mx-auto">
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-2xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Creative Space</h1>
                    <p className="text-white/70 text-md mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-[ping_2.5s_linear_infinite]"></span>
                      {roomUsers} users in room
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {userPreference.preferences.map((pref) => (
                    <span key={pref} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[60vh] overflow-y-auto space-y-6 pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
  {messages
    .filter((msg) => msg.sender !== sessionStorage.getItem("userId")) 
    .map((msg, index) => (
      <div key={index} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[80%] backdrop-blur-xl rounded-3xl px-6 py-4 ${msg.sender === "You" ? "bg-gradient-to-br from-cyan-500/40 to-blue-500/40 text-white" : "bg-white/10 text-white"}`}>
          {msg.sender !== "You" && <p className="text-sm font-medium mb-1 text-white/80">{msg.sender}</p>}
          <p className="text-sm leading-relaxed">{msg.message}</p>
          <p className="text-[10px] mt-2 opacity-50">
            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    ))}
</div>


            <div className="mt-6">
              <form onSubmit={handleSendMessage} className="relative">
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4">
                  <div className="flex gap-2">
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message" className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70" />
                    <button type="submit" className="p-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-400">
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
