// src/FloorPlans.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const FloorPlans = () => {
    console.log("hello");
  return (
    <div>
      <h1 style={{ textAlign: 'center', color: 'orange' }}>Floor Plans</h1>
      <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'center' }}>
        <li>
          {/* Link to the Wendell B 3rd Floor plan */}
          <Link to="/floorplans/wendell-3rd-floor" style={{ textDecoration: 'none', color: 'blue' }}>
            <h3>Wendell Hall - 3rd Floor</h3>
          </Link>
        </li>
        {/* Add more floor plans as needed */}
      </ul>
    </div>
  );
};

export default FloorPlans;
