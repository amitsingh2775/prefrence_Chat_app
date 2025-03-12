import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Preference from "./Preference";
import ChatRoom from "./ChatRoom";
import LandingPage from "./pages/Landing";

// Wrapper component for LandingPage to handle navigation
const LandingPageWrapper = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/preference"); // Navigate to Preference page
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
};

// Wrapper component for Preference to handle navigation
const PreferenceWrapper = ({ setRoomID, preference, setPreference }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/"); // Navigate back to Landing page
  };

  return <Preference setRoomID={setRoomID} preference={preference} setPreference={setPreference} onBack={handleBack} />;
};

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
      toast.success(`Joined Room: ${roomID}`);
    } else {
      sessionStorage.removeItem("roomID");
    }
  }, [roomID]);

  return (
    <Router>
      <div>
        <Toaster position="top-right" reverseOrder={false} />
        {roomID ? (
          <ChatRoom roomID={roomID} setRoomID={setRoomID} />
        ) : (
          <Routes>
            <Route path="/" element={<LandingPageWrapper />} />
            <Route 
              path="/preference" 
              element={<PreferenceWrapper setRoomID={setRoomID} preference={preference} setPreference={setPreference} />} 
            />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;