import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isMatch, setIsMatch] = useState(true);

  // update form data when input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  useEffect(() => {
    if (formData.confirmPassword) {
      setIsMatch(formData.password === formData.confirmPassword);
    } else {
      setIsMatch(true); // Don't show error when confirm field is empty
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMatch && formData.password) {
      console.log("passwords match")
    } else {
      console.log("form validation failed")
    }
  }

  return (
    <div className=''>
      <form className='pt-12' onSubmit={handleSubmit}>
        <div className=''>
          <label htmlFor='username' className='block text-sm font-medium text-white'>
            Username</label>
          <input type="text" name="username" required
            className='text-white dark:bg-gray-700'
          />
        </div>
        <br />
        <div className=''>
          <label htmlFor='password' className='block text-sm font-medium text-white'>
            Password</label>
          <input type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className='text-white dark:bg-gray-700'
          />
        </div>
        <br />
        <div className=''>
          <label htmlFor='confirmPassword' className='block text-sm font-medium text-white'>
            Confirm Password</label>
          <input type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className='text-white dark:bg-gray-700'
          />
          {!isMatch && (
            <p className="text-red-500">Passwords do not match!</p>
          )}
        </div>

        <br />
        <div className=''>
          <label htmlFor='email' className='block text-sm font-medium text-white'>
            Email</label>
          <input type="email" name="email" required
            className='text-white dark:bg-gray-700'
          />
        </div>
        <div className='pt-6'>
          <button
            type="submit"
            disabled={!isMatch || !formData.password}
            className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}