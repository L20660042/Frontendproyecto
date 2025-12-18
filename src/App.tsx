import { Routes, Route, Navigate } from "react-router-dom";

function Login() {
  return <div style={{ padding: 24 }}>Login (placeholder)</div>;
}
function Home() {
  return <div style={{ padding: 24 }}>Home (placeholder)</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
