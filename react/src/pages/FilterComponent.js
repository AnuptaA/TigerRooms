import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const FilterComponent = () => {
  const [residentialCollege, setResidentialCollege] = useState("");
  const [hall, setHall] = useState("");
  const [floor, setFloor] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [minSquareFootage, setMinSquareFootage] = useState(0); // New state for square footage filter
  const [error, setError] = useState(false);
  const [squareFootageError, setSquareFootageError] = useState("");

  const navigate = useNavigate();

  // Hardcoded list of residential colleges
  const residentialColleges = [
    "Butler College",
    "Forbes College",
    "Mathey College",
    "NCW",
    "Rockefeller College",
    "Whitman College",
    "Yeh College",
  ];

  const collegeHalls = {
    "Butler College": [
      "Yoseloff Hall",
      "Bogle Hall",
      "1976 Hall",
      "1967 Hall",
      "Bloomberg Hall",
      "Wilf Hall",
      "Scully Hall",
    ],
    "Forbes College": ["Main", "Annex"],
    "Mathey College": [
      "Blair Hall",
      "Campbell Hall",
      "Edwards Hall",
      "Hamilton Hall",
      "Joline Hall",
      "Little Hall",
    ],
    NCW: [
      "Addy Hall",
      "Kanji Hall",
      "Kwanza Jones Hall",
      "Jose Feliciano Hall",
    ],
    "Rockefeller College": [
      "Buyers Hall",
      "Campbell Hall",
      "Holder Hall",
      "Witherspoon Hall",
    ],
    "Whitman College": [
      "1981 Hall",
      "Fisher Hall",
      "Lauritzen Hall",
      "Murley-Pivirotto Family Tower",
      "Wendell B Hall",
      "Wendell C Hall",
    ],
    "Yeh College": ["Fu Hall", "Grousbeck Hall", "Hariri Hall", "Mannion Hall"],
  };

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

    if (minSquareFootage < 0 || isNaN(minSquareFootage)) {
      setSquareFootageError(
        "Please enter a valid positive integer for square footage."
      );
      return;
    }

    setError(false); // Reset error if residentialCollege is selected
    setSquareFootageError(""); // Reset square footage error if valid

    // Build URL path based on filled fields
    let url = "/floorplans?";
    url += `resco=${encodeURIComponent(
      residentialCollege.toLowerCase().replace(" college", "")
    )}`;

    // Create an array to hold query parameters
    let queryParams = [];

    // Add query parameters conditionally based on their presence
    if (hall) {
      queryParams.push(
        `hall=${encodeURIComponent(
          hall.toLowerCase().replace(" hall", "").replace(/\s+/g, "-")
        )}`
      );
    }
    if (floor) {
      queryParams.push(
        `floor=${encodeURIComponent(floor.toLowerCase().replace(/\s+/g, "-"))}`
      );
    }
    if (occupancy) {
      queryParams.push(
        `occupancy=${encodeURIComponent(occupancy.toLowerCase())}`
      );
    }
    if (minSquareFootage) {
      queryParams.push(
        `minSquareFootage=${encodeURIComponent(minSquareFootage)}`
      );
    }

    // Append the query parameters to the base URL
    if (queryParams.length > 0) {
      url += "&" + queryParams.join("&");
    }

    // Navigate to the constructed URL
    navigate(url);

    // navigate(`/floorplans`);
  };

  // Reset function to clear all selections
  const handleResetFilters = () => {
    setResidentialCollege("");
    setHall("");
    setFloor("");
    setOccupancy("");
    setMinSquareFootage(0); // Reset square footage filter
    setError(false);
    setSquareFootageError(""); // Reset square footage error
  };

  return (
    <div className="filter-container">
      <h1 className="filter-container-title">Welcome to TigerRooms</h1>
      <br></br>
      <h3 className="filter-container-subtitle">
        Looking for an available room?
      </h3>
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
            <p className="error-message">
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
            disabled={!residentialCollege} // Disable until Residential College is selected
          >
            <option value="" className="placeholder-option">
              Select Hall
            </option>
            {residentialCollege &&
              collegeHalls[residentialCollege].map((hallOption, idx) => (
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
            disabled={!hall} // Disable until Hall is selected
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

        <div className="dropdown-group">
          <label className="filter-label" htmlFor="squareFootage">
            Minimum Square Footage
          </label>
          <input
            type="number"
            id="squareFootage"
            min="0"
            // step="1" // Enforce integer input
            value={minSquareFootage}
            onChange={(e) => {
              const value = e.target.value;
              // Ensure the input value is a positive integer
              if (
                value === "" ||
                (Number.isInteger(Number(value)) && Number(value) >= 0)
              ) {
                setMinSquareFootage(value);
                setSquareFootageError(""); // Clear error if input is valid
              } else {
                setSquareFootageError("Please enter a valid positive integer.");
              }
            }}
            className="filter-select"
            placeholder="Enter min sqft"
          />
          {squareFootageError && (
            <p className="error-message">{squareFootageError}</p>
          )}
        </div>
      </div>

      <div className="button-container">
        <button className="filter-submit-button" onClick={handleSubmit}>
          <strong>SUBMIT</strong>
        </button>
        <button className="filter-reset-button" onClick={handleResetFilters}>
          <strong>RESET</strong>
        </button>
      </div>
    </div>
  );
};

export default FilterComponent;
