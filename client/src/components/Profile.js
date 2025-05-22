import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">User Profile</h2>
      <div className="space-y-3">
        <div className="border-b border-gray-600 pb-2">
          <p className="text-gray-300">
            <strong className="text-white">Username:</strong> {currentUser.username}
          </p>
        </div>
        <div className="border-b border-gray-600 pb-2">
          <p className="text-gray-300">
            <strong className="text-white">Email:</strong> {currentUser.email}
          </p>
        </div>
        <div className="border-b border-gray-600 pb-2">
          <p className="text-gray-300">
            <strong className="text-white">Account created:</strong> {' '}
            {new Date(currentUser.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;