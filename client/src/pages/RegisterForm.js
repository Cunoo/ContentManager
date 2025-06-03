import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isMatch, setIsMatch] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Update form data when input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    if (formData.confirmPassword) {
      setIsMatch(formData.password === formData.confirmPassword);
    } else {
      setIsMatch(true); // Don't show error when confirm field is empty
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { username, email, password } = formData;
      const response = await axios.post('http://127.0.0.1:5000/api/register', {
        username,
        email,
        password
      });
      
      // After successful registration, log the user in
      login(response.data.user);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=''>
      <form className='pt-12' onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className=''>
          <label htmlFor='username' className='block text-sm font-medium text-white'>
            Username
          </label>
          <input 
            type="text" 
            name="username" 
            value={formData.username}
            onChange={handleChange}
            required
            className='text-white dark:bg-gray-700'
          />
        </div>
        <br />
        
        <div className=''>
          <label htmlFor='email' className='block text-sm font-medium text-white'>
            Email
          </label>
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required
            className='text-white dark:bg-gray-700'
          />
        </div>
        <br />
        
        <div className=''>
          <label htmlFor='password' className='block text-sm font-medium text-white'>
            Password
          </label>
          <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className='text-white dark:bg-gray-700'
          />
        </div>
        <br />
        
        <div className=''>
          <label htmlFor='confirmPassword' className='block text-sm font-medium text-white'>
            Confirm Password
          </label>
          <input 
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className='text-white dark:bg-gray-700'
          />
          {!isMatch && (
            <p className="text-red-500 mt-1">Passwords do not match!</p>
          )}
        </div>

        <div className='pt-6'>
          <button
            type="submit"
            disabled={!isMatch || !formData.password || isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-medium py-2 px-6 rounded-md"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
        
        <div className="pt-4">
          <Link to="/login">
            <button 
              type="button" 
              className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
            >
              Already have an account? Login
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}