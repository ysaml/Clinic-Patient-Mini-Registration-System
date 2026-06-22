import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/UseAuth';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const loadPatients = async () => {
    const res = await apiClient.get('/patients');
    setPatients(res.data);
  };

  useEffect(() => {
    apiClient.get('/patients').then((res) => {
      setPatients(res.data);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient record?')) return;
    await apiClient.delete(`/patients/${id}`);
    loadPatients();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <Link to="/patients/new">+ Add Patient</Link>
      <table>
        <thead>
          <tr><th>Name</th><th>Birth Date</th><th>Gender</th><th>Contact</th><th>Address</th><th></th></tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td>{[p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')}</td>
              <td>{new Date(p.birthDate).toLocaleDateString()}</td>
              <td>{p.gender}</td>
              <td>{p.contactNumber}</td>
              <td>{p.address}</td>
              <td>
                <Link to={`/patients/${p.id}/edit`}>Edit</Link>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}