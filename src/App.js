import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage'; // Import your homepage
import Signup from './Signup'; // Import the login page
import Login from './Login'; // Import the login page

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the homepage */}
        <Route path="/" element={<HomePage />} />
        
        {/* Route for the login page */}
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;