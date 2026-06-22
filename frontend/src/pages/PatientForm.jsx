import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';

export default function PatientForm() {
  const { id } = useParams(); // undefined when creating, set when editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', birthDate: '', gender: '', contactNumber: '', address: ''
  });

  useEffect(() => {
    if (id) {
      apiClient.get(`/patients/${id}`).then((res) => {
        setForm({ ...res.data, birthDate: res.data.birthDate.split('T')[0] });
      });
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      await apiClient.put(`/patients/${id}`, form);
    } else {
      await apiClient.post('/patients', form);
    }
    navigate('/patients');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditMode ? 'Edit Patient' : 'Add Patient'}</h2>
      <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required />
      <input name="middleName" value={form.middleName} onChange={handleChange} placeholder="Middle Name" />
      <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />
      <input name="birthDate" type="date" value={form.birthDate} onChange={handleChange} required />
      <select name="gender" value={form.gender} onChange={handleChange} required>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact Number" required />
      <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
      <button type="submit">Save</button>
    </form>
  );
}