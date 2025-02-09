import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const Preference = ({ setRoomID, preference, setPreference }) => {
  // console.log(roomID);
  const [loder, setloder] = useState(false);
  const handlePreferenceSubmit = (e) => {
    e.preventDefault(); // Prevent page reload on form submission

    if (preference.preferences.length > 0) {
      setloder(true);
      // Emit selected preferences to the server
      socket.emit("choose_preference", { preferences: preference.preferences });

      // Listen for room assignment from the server
      socket.on("join_room", ({ roomID }) => {
        setloder(false);
        setRoomID(roomID);
      });
    }
  };

  const handlePreferenceToggle = (label) => {
    setPreference({ preferences: [label] });
  };

  const examplePreferences = [
    { icon: <Code className="h-6 w-6" />, label: "Coding" },
    { icon: <FlaskConical className="h-6 w-6" />, label: "Science" },
    { icon: <Music className="h-6 w-6" />, label: "Music" },
    { icon: <Briefcase className="h-6 w-6" />, label: "Jobs" },
  ];

  return (
    <>
      <div className="relative min-h-screen">
        {/* Background Content */}
        <div
          className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 transition-all duration-300 ${
            loder ? "blur-md" : ""
          }`}
        >
          <div className="min-h-screen bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(0,0,0,0))]">
            <div className="min-h-screen backdrop-blur-xl bg-black/20 flex items-center justify-center">
              <div className="max-w-md w-full mx-4">
                <form onSubmit={handlePreferenceSubmit} className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 mb-4">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Join Creative Space
                    </h1>
                    <p className="text-white/70">
                      Connect with similar interest peoples
                    </p>
                  </div>
                  <div>
                    <h2 className="text-white/90 font-medium mb-4">
                      Choose your interests
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {examplePreferences.map(({ icon, label }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handlePreferenceToggle(label)}
                          className={`relative group ${
                            preference.preferences.includes(label)
                              ? "bg-gradient-to-br from-cyan-400 to-blue-500"
                              : "bg-white/10"
                          } backdrop-blur-xl rounded-2xl p-4 text-white transition-all duration-300`}
                        >
                          <div className="flex items-center gap-3">
                            {icon}
                            <span className="font-medium">{label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={preference.preferences.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500
               text-white py-4 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                  >
                    Join Chat Room
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Loader Overlay */}
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
