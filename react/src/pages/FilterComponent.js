// src/components/FilterComponent.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const FilterComponent = () => {
  const [residentialCollege, setResidentialCollege] = useState("");
  const [hall, setHall] = useState("");
  const [floor, setFloor] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  // Hardcoded list of residential colleges
  const residentialColleges = [
    "Butler College",
    "Forbes College",
    "Mathey College",
    "New College West",
    "Rockefeller College",
    "Whitman College",
    "Yeh College",
  ];

  // Hardcoded halls for Whitman College
  const whitmanHalls = [
    "1981 Hall",
    "Fisher Hall",
    "Lauritzen Hall",
    "Murley-Pivirotto Family Tower",
    "Wendell B Hall",
    "Wendell C Hall",
  ];

  // Hardcoded floors for Wendell B Hall
  const wendellBFloors = [
    "Ground Floor",
    "1st Floor",
    "2nd Floor",
    "3rd Floor",
    "4th Floor",
  ];

  // Hardcoded occupancies for Wendell B Hall
  const wendellBOccupancies = ["Single", "Double", "Quad"];

  const handleSubmit = () => {
    // Check if the "Residential College" field is filled out
    if (!residentialCollege) {
      setError(true); // Show error if residentialCollege is not selected
      return;
    }

    setError(false); // Reset error if residentialCollege is selected

    // Transform hall and floor names for the URL
    // const formattedHall = hall
    //   .replace(" Hall", "")
    //   .toLowerCase()
    //   .replace(/\s+/g, "-"); // Remove "Hall" and replace spaces with hyphens
    // const formattedFloor = floor.toLowerCase().replace(/\s+/g, "-"); // Replace spaces with hyphens

    // Navigate to the new URL
    // navigate(`/floorplans/${formattedHall}-${formattedFloor}`);
    navigate(`/floorplans`);
  };

  // Reset function to clear all selections
  const handleResetFilters = () => {
    setResidentialCollege("");
    setHall("");
    setFloor("");
    setOccupancy("");
    setError(false);
  };

  return (
    <div className="filter-container">
      <h1 className="filter-container-title">Welcome to TigerRooms</h1>
      <h3 className="filter-container-title">Looking for an available room?</h3>
      <div className="dropdown-container">
        <div className="dropdown-group">
          <label className="filter-label" htmlFor="residentialCollege">
            Residential College*
          </label>
          <select
            className="filter-select"
            id="residentialCollege"
            value={residentialCollege}
            onChange={(e) => setResidentialCollege(e.target.value)}
            style={{ borderColor: error ? "red" : "" }} // Highlight border if error
          >
            <option value="" className="placeholder-option">
              Select Residential College
            </option>
            {residentialColleges.map((college, idx) => (
              <option key={idx} value={college}>
                {college}
              </option>
            ))}
          </select>
          {error && (
            <p style={{ color: "red", fontSize: "0.9em" }}>
              Please select a Residential College.
            </p>
          )}
        </div>

        <div className="dropdown-group">
          <label className="filter-label" htmlFor="hall">
            Hall
          </label>
          <select
            className="filter-select"
            id="hall"
            value={hall}
            onChange={(e) => setHall(e.target.value)}
          >
            <option value="" className="placeholder-option">
              Select Hall
            </option>
            {whitmanHalls.map((hallOption, idx) => (
              <option key={idx} value={hallOption}>
                {hallOption}
              </option>
            ))}
          </select>
        </div>

        <div className="dropdown-group">
          <label className="filter-label" htmlFor="floor">
            Floor
          </label>
          <select
            className="filter-select"
            id="floor"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          >
            <option value="" className="placeholder-option">
              Select Floor
            </option>
            {wendellBFloors.map((sz, idx) => (
              <option key={idx} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>

        <div className="dropdown-group">
          <label className="filter-label" htmlFor="occupancy">
            Occupancy
          </label>
          <select
            className="filter-select"
            id="occupancy"
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value)}
          >
            <option value="" className="placeholder-option">
              Select Occupancy
            </option>
            {wendellBOccupancies.map((occ, idx) => (
              <option key={idx} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="button-container">
        <button className="filter-submit-button" onClick={handleSubmit}>
          <strong>SUBMIT</strong>
        </button>
        <button
          className="filter-reset-button"
          onClick={handleResetFilters}
          style={{ marginLeft: "10px" }}
        >
          <strong>RESET</strong>
        </button>
      </div>
    </div>
  );
};

export default FilterComponent;
