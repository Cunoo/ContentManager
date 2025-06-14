// src/App.js
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useContext } from 'react'; // Fixed: Added useContext import
import { AuthProvider, AuthContext } from './context/AuthContext';

import LoginPage from './pages/login';
import RegisterForm from './pages/RegisterForm';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';
import Calendar from './pages/calendar';

function Header() {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" height={'10px'}/>
      
      <Link to="/">
        <button
          className="absolute top-0 left-16 m-4 px-8 padding-8 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
        >
          Home
        </button>
      </Link>
      
      {/* Only show Calendar button if user is logged in */}
      {currentUser && (
        <Link to="/calendar">
          <button
            className="absolute top-0 m-4 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
          >
            Calendar
          </button>
        </Link>
      )}

      {currentUser ? (
        <div className="absolute top-0 right-0 m-4 flex gap-2">
          <Link to="/profile">
            <button className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800">
              Profile
            </button>
          </Link>
          <button 
            onClick={logout}
            className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link to="/login">
          <button
            className="absolute top-0 right-0 m-4 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
          >
            Sign in
          </button>
        </Link>
      )}
    </header>
  );
}

function Home() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="text-center p-8">
      <h1 className="text-4xl font-bold text-white mb-4">
        Your only content manager that you need
      </h1>
      
      
      {!currentUser ? (
        <div className="space-x-4">
          <Link to="/register">
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md">
              Register Now
            </button>
          </Link>
          <Link to="/login">
            <button className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800">
              Login
            </button>
          </Link>
        </div>
      ) : (
        <div>
          <h3 className="text-2xl text-green-400 mb-4">
            Welcome back, {currentUser.username}!
          </h3>
          <div className="space-x-4">
            <Link to="/profile">
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md">
                View Your Profile
              </button>
            </Link>
            <Link to="/calendar">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
                Open Calendar
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterForm/>} />
            {/* Protected Calendar Route */}
            <Route path="/calendar" element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;