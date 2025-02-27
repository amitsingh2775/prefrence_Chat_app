import React, { useState, useRef } from "react";
import Picker from "emoji-picker-react";
import socket from "../socket";
import { MoreVertical } from "lucide-react";

function Message({ message, userId, roomID, isSender, setMessages }) {
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = useRef(null);

  const handleMouseDown = () => {
    timerRef.current = setTimeout(() => setShowPicker(true), 500);
  };

  const handleMouseUp = () => {
    clearTimeout(timerRef.current);
  };

  const handleMenuClick = () => {
    setShowPicker(!showPicker);
  };

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;

    setMessages((prevMessages) =>
      prevMessages.map((m) =>
        m.id === message.id
          ? {
              ...m,
              reactions: {
                ...Object.fromEntries(
                  Object.entries(m.reactions || {}).map(([e, users]) => [
                    e,
                    users.filter((u) => u !== userId),
                  ])
                ),
                [emoji]: [...(m.reactions[emoji] || []).filter((u) => u !== userId), userId],
              },
            }
          : m
      )
    );

    socket.emit("add_reaction", { messageId: message.id, userId, emoji, roomId: roomID });
    setShowPicker(false);
  };

  return (
    <div className="relative flex items-start gap-2">
      {/* Message Bubble */}
      <div
        className={`max-w-[80%] backdrop-blur-xl rounded-3xl px-4 py-2 ${
          isSender ? "bg-cyan-500/40 text-white" : "bg-white/10 text-white"
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
      >
        {/* Username for non-sender */}
        {!isSender && (
          <p
            className="text-sm font-medium mb-1 text-white/80"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {message.sender}
          </p>
        )}

        {/* Message Text */}
        <p className="text-sm leading-relaxed">{message.message}</p>

        {/* Timestamp */}
        <p className="text-[10px] mt-2 opacity-50">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Three Dots Menu */}
      <button
        className="absolute top-2 right-2 text-white/70 hover:text-white"
        onClick={handleMenuClick}
      >
        <MoreVertical size={20} />
      </button>

      {/* Reactions */}
      <div className="flex flex-wrap gap-2 mt-1">
        {Object.entries(message.reactions || {}).map(
          ([emoji, users]) =>
            users.length > 0 && (
              <span key={emoji} className="text-sm text-white">
                {emoji} {users.length}
              </span>
            )
        )}
      </div>

      {/* Emoji Picker */}
      {showPicker && (
        <div className="absolute z-10 mt-2">
          <Picker onEmojiClick={handleEmojiClick} width={300} height={400} />
          <button onClick={() => setShowPicker(false)} className="mt-2 text-white">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default Message;