import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import History from '@/pages/History';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}><Route element={<Layout />}><Route path="/" element={<EmployeeDashboard />} /><Route path="/history" element={<History />} /></Route></Route>
          <Route element={<ProtectedRoute requireAdmin={true} />}><Route element={<Layout />}><Route path="/admin" element={<AdminDashboard />} /></Route></Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}