// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white text-black px-4">

            <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-2xl mb-6">Page Not Found</p>
                <Link to="/" className="text-blue-500 underline text-lg">
                    Go back home
                </Link>
            </div>
    </div>
  );
}

export default NotFound;