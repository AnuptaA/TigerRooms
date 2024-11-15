import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";

const FloorPlans = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  // Retrieve query params from URL using useLocation
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Get query parameters, defaulting to empty string if not found
  const resCollege = searchParams.get("resco");
  const hall = searchParams.get("hall");
  const floor = searchParams.get("floor");
  const occupancy = searchParams.get("occupancy");
  const minSquareFootage = searchParams.get("minSquareFootage");
  const [availabilityInfo, setAvailabilityInfo] = useState([]);

  // Fetch unique halls and floors from the backend
  useEffect(() => {
    // Build the query string dynamically based on available params
    let queryString = "";

    if (resCollege) queryString += `resco=${encodeURIComponent(resCollege)}&`;
    if (hall) queryString += `hall=${encodeURIComponent(hall)}&`;
    if (floor) queryString += `floor=${encodeURIComponent(floor)}&`;
    if (occupancy) queryString += `occupancy=${encodeURIComponent(occupancy)}&`;
    if (minSquareFootage)
      queryString += `minSquareFootage=${encodeURIComponent(
        minSquareFootage
      )}&`;

    // Remove the trailing "&" if there's one
    if (queryString.endsWith("&")) queryString = queryString.slice(0, -1);

    fetch(`${apiUrl}/api/floorplans${queryString ? `?${queryString}` : ""}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAvailabilityInfo(data);
      })
      .catch((error) => console.error("Error fetching floor plans:", error));
  }, [apiUrl, resCollege, hall, floor, occupancy, minSquareFootage]);

  return (
    <div>
      <h1 className="results-page-title">
        Showing results for all floor plans
      </h1>
      <h1 className="res-college-title">
        {/* Adding ternary comparator to handle case where resco isn't provided */}
        {resCollege === null ? "All Residential Colleges" : resCollege}
      </h1>
      <AvailabilityTable availabilityInfo={availabilityInfo} />
    </div>
  );
};

const AvailabilityTable = ({ availabilityInfo }) => {
  // Determine the maximum number of floors to set the number of rows
  const maxFloors =
    availabilityInfo.length > 0
      ? Math.max(...availabilityInfo.map((info) => info.floors.length))
      : 0;

  // check if the response is not empty
  if (availabilityInfo.length === 0) {
    return (
      <div>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <h2 className="res-college-title">
          No results matched your parameters
        </h2>
        <img id="lockup" src="/misc/PU_lockup.png" alt="lockup" />
      </div>
    );
  }

  // Helper function to generate URL-friendly links
  const generateLink = (hall, floor) => {
    let hallPrefix = hall.toLowerCase().replace(/\s+/g, "-");
    if (hallPrefix.endsWith("-hall")) {
      hallPrefix = hallPrefix.replace(/-hall$/, ""); // Remove "-hall" suffix
    }
    const floorPrefix = floor.toLowerCase().replace(/\s+/g, "-");
    return `../floorplans/${hallPrefix}-${floorPrefix}`;
  };

  return (
    <div className="table-container">
      <table className="availability-table">
        <thead>
          <tr>
            {availabilityInfo.map((info, index) => (
              <th key={index}>{info.hall}</th>
            ))}
          </tr>
        </thead>
        <tbody className="floorplan-table">
          {[...Array(maxFloors)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {availabilityInfo.map((info, colIndex) => (
                <td key={colIndex}>
                  {info.floors[rowIndex] ? (
                    <a href={generateLink(info.hall, info.floors[rowIndex])}>
                      {info.floors[rowIndex]}
                    </a>
                  ) : (
                    ""
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FloorPlans;
