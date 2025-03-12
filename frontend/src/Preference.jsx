import React, { useState } from "react";
import socket from "./socket";
import Loader from "./Loding";
import {
  Sparkles,
  Briefcase,
  FlaskConical,
  Music,
  Sticker,
  Palette,
  Code,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const Preference = ({ setRoomID, preference, setPreference, onBack }) => {
  const [loder, setLoder] = useState(false);

  const handlePreferenceSubmit = (e) => {
    e.preventDefault();
    if (preference.preferences.length > 0) {
      setLoder(true);
      socket.emit("choose_preference", { preference: preference.preferences });
      socket.on("join_room", ({ roomID }) => {
        setLoder(false);
        setRoomID(roomID);
      });
    }
  };

  const handlePreferenceToggle = (label) => {
    setPreference({ preferences: [label] });
    console.log({ preferences: [label] });
    sessionStorage.setItem("preference", label);
  };

  const examplePreferences = [
    { icon: <Code className="h-5 w-5 sm:h-6 sm:w-6" />, label: "Coding" },
    { icon: <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6" />, label: "Science" },
    { icon: <Music className="h-5 w-5 sm:h-6 sm:w-6" />, label: "Music" },
    { icon: <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />, label: "Jobs" },
  ];

  return (
    <>
      <div className="relative min-h-screen">
        {/* Background Content */}
        <div
          className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 transition-all duration-300 ${loder ? "blur-md" : ""}`}
        >
          <div className="min-h-screen bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(0,0,0,0))]">
            <div className="min-h-screen backdrop-blur-xl bg-black/20 flex items-center justify-center">
              <div className="w-[90%] sm:max-w-md mx-2 sm:mx-4">
                <button
                  onClick={onBack}
                  className="mb-6 text-white flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
                <form onSubmit={handlePreferenceSubmit} className="space-y-6 sm:space-y-8">
                  <div className="text-center">
                    <div className="inline-flex p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 mb-3 sm:mb-4">
                      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      Join Creative Space
                    </h1>
                    <p className="text-white/70 text-sm sm:text-base">
                      Connect with similar interest peoples
                    </p>
                  </div>
                  <div>
                    <h2 className="text-white/90 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                      Choose your interests
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {examplePreferences.map(({ icon, label }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handlePreferenceToggle(label)}
                          className={`relative group ${
                            preference.preferences.includes(label)
                              ? "bg-gradient-to-br from-cyan-400 to-blue-500"
                              : "bg-white/10"
                          } backdrop-blur-xl rounded-2xl p-3 sm:p-4 text-white transition-all duration-300`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            {icon}
                            <span className="font-medium text-sm sm:text-base">{label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={preference.preferences.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 sm:py-4 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    Join Chat Room
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

       
        {loder && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
            <Loader />
          </div>
        )}
      </div>
    </>
  );
};

export default Preference;