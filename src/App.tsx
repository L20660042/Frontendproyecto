import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; // Usamos .tsx para Login
import Register from "./pages/Register"; // Usamos .tsx para Register


export default function App() {
  return (
    <Router basename="/Frontendproyecto"> {/* Agrega el basename para GitHub Pages */}
      {/* Definición de las rutas */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
