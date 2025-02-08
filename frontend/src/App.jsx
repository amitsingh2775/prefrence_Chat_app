import React, { useState, useEffect } from "react";
import Preference from "./Preference";
import ChatRoom from "./ChatRoom";

const App = () => {
  const [roomID, setRoomID] = useState(null);
  const [preference, setPreference] = useState({ name: "", preferences: [] });

  // Restore room state from sessionStorage on mount
  useEffect(() => {
    const storedRoomID = sessionStorage.getItem("roomID");
    if (storedRoomID) {
      setRoomID(storedRoomID);
    }
  }, []);

  // Sync roomID changes to sessionStorage
  useEffect(() => {
    if (roomID) {
      sessionStorage.setItem("roomID", roomID);
    } else {
      sessionStorage.removeItem("roomID"); // Clean up when leaving room
    }
  }, [roomID]);

  return (
    <div>
      {!roomID ? (
        <Preference setRoomID={setRoomID} preference={preference} setPreference={setPreference} />
      ) : (
        <ChatRoom roomID={roomID} setRoomID={setRoomID} />
      )}
    </div>
  );
};

export default App;