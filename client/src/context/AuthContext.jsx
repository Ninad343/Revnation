import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rn_token') || null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Session validation error:', err.message);
      localStorage.removeItem('rn_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('rn_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('rn_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Registration successful! Welcome to RevNation.');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('rn_token');
    setToken(null);
    setUser(null);
    toast.info('Logged out from RevNation');
  };

  const addVehicle = async (vehicleData) => {
    try {
      const res = await api.post('/auth/vehicles', vehicleData);
      if (res.data.success) {
        setUser((prev) => ({
          ...prev,
          vehicles: res.data.vehicles,
          activeVehicle: res.data.activeVehicle
        }));
        toast.success(`${vehicleData.year} ${vehicleData.make} ${vehicleData.model} added to My Garage!`);
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add vehicle');
      return { success: false, error: err.message };
    }
  };

  const setActiveVehicle = async (vehicleId) => {
    try {
      const res = await api.put('/auth/vehicles/active', { vehicleId });
      if (res.data.success) {
        setUser((prev) => ({
          ...prev,
          activeVehicle: res.data.activeVehicle
        }));
        toast.success(res.data.message);
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to switch active vehicle');
      return { success: false, error: err.message };
    }
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      const res = await api.delete(`/auth/vehicles/${vehicleId}`);
      if (res.data.success) {
        setUser((prev) => ({
          ...prev,
          vehicles: res.data.vehicles,
          activeVehicle: res.data.activeVehicle
        }));
        toast.info('Vehicle removed from garage');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove vehicle');
      return { success: false, error: err.message };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const res = await api.post('/auth/addresses', addressData);
      if (res.data.success) {
        setUser((prev) => ({ ...prev, addresses: res.data.addresses }));
        toast.success('Address saved successfully');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
      return { success: false, error: err.message };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const res = await api.delete(`/auth/addresses/${addressId}`);
      if (res.data.success) {
        setUser((prev) => ({ ...prev, addresses: res.data.addresses }));
        toast.info('Address removed');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove address');
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isSeller: user?.role === 'SELLER',
        isAdmin: user?.role === 'ADMIN',
        activeVehicle: user?.activeVehicle,
        login,
        register,
        logout,
        addVehicle,
        setActiveVehicle,
        deleteVehicle,
        addAddress,
        deleteAddress,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
