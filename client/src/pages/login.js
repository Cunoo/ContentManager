import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function LoginPage() {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/login', formData);
      login(response.data.user);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
          <label htmlFor='login' className='block text-sm font-medium text-white'>
            Username or Email
          </label>
          <input 
            type="text" 
            name="login" 
            value={formData.login}
            onChange={handleChange}
            required
            className='text-white dark:bg-gray-700'
            placeholder="Enter your username or email"
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

        <div className="pt-8">
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded-md"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </div>
        
        <div className="pt-8">
          <Link to="/register">
            <button 
              type="button" 
              className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
            >
              Register
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;