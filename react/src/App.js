import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FloorPlans from './pages/FloorPlans';  // The page listing all floor plans
import FilterComponent from './pages/FilterComponent';
import WendellB3rdFloor from './pages/WendellB3rdFloor';  // The detailed view of Wendell B 3rd floor
import UploadPDFs from './pages/UploadPDFs';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/floorplans" element={<FloorPlans />} />
        <Route path="/" element={<FilterComponent />} />
        <Route path="/floorplans/wendell-b-3rd-floor" element={<WendellB3rdFloor />} />
        <Route path="/upload-pdfs" element={<UploadPDFs />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
