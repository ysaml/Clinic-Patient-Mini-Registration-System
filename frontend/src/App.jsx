import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import PatientList from './pages/PatientList';
import PatientForm from './pages/PatientForm';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/patients" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patients" element={
            <ProtectedRoute><PatientList /></ProtectedRoute>
          } />
          <Route path="/patients/new" element={
            <ProtectedRoute><PatientForm /></ProtectedRoute>
          } />
          <Route path="/patients/:id/edit" element={
            <ProtectedRoute><PatientForm /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}