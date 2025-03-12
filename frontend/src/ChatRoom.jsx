import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { LogOut } from "lucide-react";
import { BsEmojiSmile } from "react-icons/bs"; 
import Message from "./components/Message";
import toast from "react-hot-toast";
import socket from "./socket";
import EmojiPicker from "emoji-picker-react"; 

const ChatRoom = ({ roomID, setRoomID }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState(0);
  const userId = sessionStorage.getItem("userId");
  const [pref, setPref] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    socket.emit("join_room", { roomID });
    const getPref = sessionStorage.getItem("preference");
    setPref(getPref);

    if (!sessionStorage.getItem(`profileImage_${userId}`)) {
      const profileImage = `https://avatar.iran.liara.run/public?user=${userId}×tamp=${Date.now()}`;
      sessionStorage.setItem(`profileImage_${userId}`, profileImage);
    }

    socket.on("receive_message", ({ sender, message, timestamp, id, reactions = {} }) => {
      const isDeletedForMe = sessionStorage.getItem(`deleted_for_me_${userId}_${id}`);
      if (!isDeletedForMe) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === id)) return prev;
          return [...prev, { sender, message, timestamp: new Date(timestamp), id, reactions }];
        });
      }
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

    socket.on("message_deleted_for_me", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      sessionStorage.setItem(`deleted_for_me_${userId}_${messageId}`, "true");
    });

    socket.on("message_deleted_for_everyone", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      sessionStorage.removeItem(`deleted_for_me_${userId}_${messageId}`);
    });

    socket.on("error", ({ message }) => toast.error(message));

    return () => {
      socket.off("receive_message");
      socket.off("room_update");
      socket.off("reaction_added");
      socket.off("message_deleted_for_me");
      socket.off("message_deleted_for_everyone");
      socket.off("error");
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
      setShowEmojiPicker(false); // Close emoji picker on send
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
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(`deleted_for_me_${userId}_`)) sessionStorage.removeItem(key);
    });
    setPref("");
  };

  const getProfileImage = (sender) =>
    sessionStorage.getItem(`profileImage_${sender}`) || "https://avatar.iran.liara.run/public";

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    textareaRef.current.focus(); // Keep focus on textarea
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">
                    {pref} Warriors
                  </h1>
                  <p className="text-white/70 text-xs sm:text-sm md:text-base">
                    {roomUsers} users in room
                  </p>
                </div>
                <button
                  onClick={exitHandler}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
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
            {/* Input Form with Emoji Picker */}
            <form onSubmit={handleSendMessage} className="mt-4 sm:mt-6 relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white hover:text-cyan-400"
                >
                  <BsEmojiSmile className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70 resize-none overflow-hidden text-sm sm:text-base"
                  rows={1}
                  style={{ minHeight: "1.5em", maxHeight: "6em" }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
                <button
                  type="submit"
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-cyan-500 text-white rounded-full hover:bg-cyan-400 transition-all"
                >
                  <FaPaperPlane className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-0 z-10">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;