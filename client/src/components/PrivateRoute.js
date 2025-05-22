import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="text-white text-lg">Loading...</div>
        </div>
    );
}

return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;