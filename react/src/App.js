import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FloorPlans from './pages/FloorPlans';  // The page listing all floor plans
import WendellB3rdFloor from './pages/WendellB3rdFloor';  // The detailed view of Wendell B 3rd floor
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/floorplans" element={<FloorPlans />} />
        <Route path="/floorplans/wendell-b-3rd-floor" element={<WendellB3rdFloor />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
