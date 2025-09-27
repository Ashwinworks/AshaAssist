import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[80vh]">
      <div className="bg-white/80 rounded-3xl shadow-2xl p-10 max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-lg">Welcome to <span className="text-indigo-600">AshaAssist</span></h1>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
          AshaAssist is a digital bridge connecting patients, ASHA workers, Anganwadis, and PHCs for better healthcare outreach.
        </p>
        <div className="flex space-x-6">
          <Link to="/login" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition">Login</Link>
          <Link to="/register" className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-700 rounded-xl font-semibold shadow-lg hover:bg-blue-50 hover:scale-105 transition">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;