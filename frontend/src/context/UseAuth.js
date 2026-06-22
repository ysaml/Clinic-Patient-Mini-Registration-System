import { useContext } from 'react';
import { AuthContext } from './AuthContext';
// Miles B: split the useAuth for Fast Refresh compliance
export function useAuth() {
  return useContext(AuthContext);
}