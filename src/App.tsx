import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Home";  // Usamos la extensión .tsx para el componente
import Login from "./pages/Login"; // Usamos .tsx para Login
import Register from "./pages/Register"; // Usamos .tsx para Register
import DashboardScreen from "./pages/DashboardScreen";

export default function App() {
  return (
    <Router basename="/Frontendproyecto"> {/* Agrega el basename para GitHub Pages */}
      {/* Definición de las rutas */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
      </Routes>
    </Router>
  );
}
