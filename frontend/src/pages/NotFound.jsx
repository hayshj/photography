// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-black text-white px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-6">Page Not Found</p>
      <Link to="/" className="text-blue-500 underline text-lg">
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;