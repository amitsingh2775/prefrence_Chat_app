import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-white text-sm sm:text-base">
        Some wait for you, so please wait! 🍳🔥
      </p>
    </div>
  );
};

export default Loader;