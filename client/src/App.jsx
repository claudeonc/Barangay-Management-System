import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Documents from './pages/Documents';
import Households from './pages/Households';
import Personnel from './pages/Personnel';
import Logs from './pages/Logs';
import PrintDocument from './pages/PrintDocument';
import Login from './pages/Login';
import { DialogProvider } from './context/DialogContext';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('bms_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  return (
    <DialogProvider>
      <Routes>
        <Route path="/" element={<Login />} />
      
      <Route path="/admin" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="residents" element={<Residents />} />
        <Route path="households" element={<Households />} />
        <Route path="documents" element={<Documents />} />
        <Route path="personnel" element={<Personnel />} />
        <Route path="logs" element={<Logs />} />
      </Route>

      <Route path="/admin/print/:id" element={
        <PrivateRoute>
          <PrintDocument />
        </PrivateRoute>
      } />

        <Route path="*" element={<div className="p-24 text-4xl font-black">404 - Page Not Found</div>} />
      </Routes>
    </DialogProvider>
  );
}

export default App;
