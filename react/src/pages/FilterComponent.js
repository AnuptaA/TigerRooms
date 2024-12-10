import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const FilterComponent = ({ username, adminStatus, adminToggle }) => {
  const [residentialCollege, setResidentialCollege] = useState("");
  const [hall, setHall] = useState("");
  const [floor, setFloor] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [minSquareFootage, setMinSquareFootage] = useState(""); // New state for square footage filter
  const [error, setError] = useState(false);
  const [squareFootageError, setSquareFootageError] = useState("");

  const navigate = useNavigate();

  // Hardcoded list of residential colleges
  const residentialColleges = [
    "Butler",
    "Forbes",
    "Mathey",
    "Ncw",
    "Rocky",
    "Whitman",
    "Yeh",
  ];

  const collegeHalls = {
    Butler: [
      "Yoseloff",
      "Bogle",
      "1976",
      "1967",
      "Bloomberg",
      "Wilf",
      "Scully",
    ],
    Forbes: ["Main", "Annex"],
    Mathey: ["Blair", "Campbell", "Edwards", "Hamilton", "Joline", "Little"],
    Ncw: ["Addy", "Kanji", "Kwanza-Jones", "Jose-Feliciano"],
    Rocky: ["Buyers", "Campbell", "Holder", "Witherspoon"],
    Whitman: [
      "1981",
      "Fisher",
      "Lauritzen",
      "Murley-Pivirotto",
      "Wendell-B",
      "Wendell-C",
      "Baker-E",
      "Baker-S",
    ],
    Yeh: ["Fu", "Grousbeck", "Hariri", "Mannion"],
  };

  // Hardcoded floors for Wendell B Hall
  const wendellBFloors = [0, 1, 2, 3, 4];

  // Hardcoded occupancies for Wendell B Hall
  const wendellBOccupancies = [1, 2, 3, 4];

  // Function to get cookies by key
  const getCookie = (key) => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.split("=");
      if (cookieKey === key) {
        return decodeURIComponent(cookieValue || ""); // Decode the cookie value
      }
    }
    return ""; // Return empty string if cookie key doesn't exist
  };

  // Initialize state from cookies if they exist
  useEffect(() => {
    setResidentialCollege(getCookie("residentialCollege") || "");
    setHall(getCookie("hall") || "");
    setFloor(getCookie("floor") || "");
    setOccupancy(getCookie("occupancy") || "");
    setMinSquareFootage(getCookie("minSquareFootage") || "");
  }, []);

  // Save filter values to cookies
  const saveFiltersToCookies = () => {
    document.cookie = `residentialCollege=${encodeURIComponent(
      residentialCollege
    )}; path=/; max-age=604800`; // 7 days expiration
    document.cookie = `hall=${encodeURIComponent(
      hall
    )}; path=/; max-age=604800`;
    document.cookie = `floor=${encodeURIComponent(
      floor
    )}; path=/; max-age=604800`;
    document.cookie = `occupancy=${encodeURIComponent(
      occupancy
    )}; path=/; max-age=604800`;
    document.cookie = `minSquareFootage=${encodeURIComponent(
      minSquareFootage
    )}; path=/; max-age=604800`;
  };

  const removeCookie = (key) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const handleSubmit = () => {
    // Check if the "Residential College" field is filled out
    if (!residentialCollege) {
      setError(true); // Show error if residentialCollege is not selected
      return;
    }

    // Ensure hall is part of the selected residential college
    if (
      residentialCollege &&
      hall &&
      !collegeHalls[residentialCollege].includes(hall)
    ) {
      setError(true); // Show error if the selected hall is not valid for this residential college
      return;
    }

    setError(false); // Reset error if residentialCollege is selected
    setSquareFootageError(""); // Reset square footage error if valid

    // Save filters to cookies
    saveFiltersToCookies();

    // Build URL path based on filled fields
    let url = "/floorplans?";
    url += `resco=${encodeURIComponent(residentialCollege)}`;

    // Create an array to hold query parameters
    let queryParams = [];

    // Add query parameters conditionally based on their presence
    if (hall) {
      queryParams.push(`hall=${encodeURIComponent(hall)}`);
    }
    if (floor) {
      queryParams.push(`floor=${encodeURIComponent(floor)}`);
    }
    if (occupancy) {
      queryParams.push(`occupancy=${encodeURIComponent(occupancy)}`);
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
  };

  // Reset function to clear all selections and cookies
  const handleResetFilters = () => {
    setResidentialCollege("");
    setHall("");
    setFloor("");
    setOccupancy("");
    setMinSquareFootage(0); // Reset square footage filter
    setError(false);
    setSquareFootageError(""); // Reset square footage error

    // Remove cookies
    removeCookie("residentialCollege");
    removeCookie("hall");
    removeCookie("floor");
    removeCookie("occupancy");
    removeCookie("minSquareFootage");
  };

  const handleResidentialCollegeChange = (e) => {
    const selectedCollege = e.target.value;
    setResidentialCollege(selectedCollege);
    
    // Reset the hall to empty if the new residential college doesn't include the previous hall
    if (selectedCollege && !collegeHalls[selectedCollege].includes(hall)) {
      setHall(""); // Reset hall
    }
  };

  return !adminStatus || adminToggle ? (
    <div className="filter-container">
      <h1 className="filter-container-title">
        {adminStatus && !adminToggle
          ? `Welcome admin, ${username}.` // If adminStatus is true
          : `Welcome to TigerRooms, ${username}!`}
      </h1>
      <br></br>
      <h3 className="filter-container-subtitle">
        Looking to save an available room or review a room?
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
            onChange={handleResidentialCollegeChange}
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
            id="squareFootage"
            value={minSquareFootage}
            onChange={(e) => {
              const value = e.target.value;
              // Ensure the input value is a non-negative integer
              if (
                !value.includes("-") && // Check for negative numbers
                !value.includes("e") && // Check for 'e' (scientific notation)
                !value.includes(".") && // Check for decimals
                !value.includes(" ") && // Check for whitespace
                Number.isInteger(Number(value)) && // Ensure it's an integer
                Number(value) >= 0
              ) {
                setMinSquareFootage(value);
                setSquareFootageError(""); // Clear error if input is valid
              } else {
                setSquareFootageError("Please enter a valid positive integer.");
              }
            }}
            className="filter-select"
            placeholder="0"
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

      <h3 className="cookie-recommendation">
        For the best user experience, we recommend that you activate your
        browser cookies.
      </h3>
    </div>
  ) : (
    navigate("/upload-pdfs")
  );
};

export default FilterComponent;
