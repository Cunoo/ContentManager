// login.js
import React, { useState } from 'react';

import {Link } from 'react-router-dom';



function LoginPage() {
    return (
      <div className=''>
        <form className='pt-12'>
          <div className=''>
            <label htmlFor='username' className='block text-sm font-medium text-white'>
              Username</label>
            <input type="text" name="username" required
              className='  text-green-900   dark:bg-gray-700 '
            >
            </input>
          </div>
          <br></br>
          <div className=''>
            <label htmlFor='password' className='block text-sm font-medium text-white'>
              Password</label>
            <input type="text" name="password" required
              className='  text-green-900   dark:bg-gray-700 '
            >
            </input>
          </div>

          <div className="pt-8">
            <button type="submit"
              className="
              bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
            >Log in</button>
          </div>
          <div className="pt-8">
            <Link to="/Register">
              <button 
                type="button" 
                className="
                text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
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