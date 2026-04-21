import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainSite from './components/MainSite';
import AdminApp from './admin/AdminApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainSite />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
