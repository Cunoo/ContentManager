import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

useEffect(() => {
    // Check if user is stored in localStorage
    const user = localStorage.getItem('user');
    if (user) {
        try {
            setCurrentUser(JSON.parse(user));
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
        }
    }
    setLoading(false);
}, []);

const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
};

const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
};

return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
        {!loading && children}
    </AuthContext.Provider>
);
};
