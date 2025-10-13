import React from "react";
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Home";  // Usamos la extensión .tsx para el componente
import Login from "./pages/Login"; // Usamos .tsx para Login
import Register from "./pages/Register"; // Usamos .tsx para Register

export default function App() {
  return (
    <Router>
      {/* Definición de las rutas */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
