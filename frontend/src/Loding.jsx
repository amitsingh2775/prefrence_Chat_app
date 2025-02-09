import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
     <p  className="text-white">Hold on tight, your favorites are cooking up something awesome! 🍳🔥</p>
    </div>
  );
};

export default Loader;
