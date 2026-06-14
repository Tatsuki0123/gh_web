import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Setup from './pages/Setup';
import Canvas from './pages/Canvas';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/setup" replace />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/canvas" element={<Canvas />} />
      </Routes>
    </BrowserRouter>
  );
}
