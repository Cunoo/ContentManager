import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useState } from 'react';

import LoginPage from './login';
import RegisterForm from './pages/RegisterForm';
function Header() {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" height={'10px'}/>
      
      <Link to="/Home">
        <button
          className=" absolute top-0 m-4
            text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
        >
          Home
        </button>
      </Link>


      <Link to="/login">
        <button
          className="absolute top-0 right-0 m-4 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
        >
          Sign in
        </button>
      </Link>

    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Header/>
        <Routes>
          <Route path="/" element={App} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Register" element={<RegisterForm/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;