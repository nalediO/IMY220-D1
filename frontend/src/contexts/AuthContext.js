 import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const normalizeUser = (dataUser) => {
    return { ...dataUser, _id: dataUser._id || dataUser.id };
  };

  const login = async (email, password) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save token first
    localStorage.setItem('token', data.token);
    
    // Fetch full user profile from /api/users/:id
    const userResponse = await fetch(`http://localhost:5000/api/users/${data.user.id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch full user profile");
    }

    const fullUser = await userResponse.json();

    // Store the full user
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
    setToken(data.token);

    return { token: data.token, user: fullUser };
  } catch (error) {
    throw error;
  }
};


  const signup = async (userData) => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');

    const normalizedUser = normalizeUser(data.user);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    setToken(data.token);
    setUser(normalizedUser);

    return { token: data.token, user: normalizedUser };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
