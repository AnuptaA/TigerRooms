import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";

const FloorPlans = () => {
  // Retrieve query params from URL using useLocation
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Get query parameters, defaulting to empty string if not found
  const resCollege = searchParams.get("resco");
  const hall = searchParams.get("hall");
  const floor = searchParams.get("floor");
  const occupancy = searchParams.get("occupancy");
  const minSquareFootage = searchParams.get("minSquareFootage");

  const resCollegeForCookie = searchParams.get("resco") || "";
  const hallForCookie = searchParams.get("hall") || "";
  const floorForCookie = searchParams.get("floor") || "";
  const occupancyForCookie = searchParams.get("occupancy") || "";
  const minSquareFootageForCookie = searchParams.get("minSquareFootage") || "";

  const [availabilityInfo, setAvailabilityInfo] = useState([]);

  useEffect(() => {
    // Set cookies
    document.cookie = `resco=${resCollegeForCookie}; path=/;`;
    document.cookie = `hall=${hallForCookie}; path=/;`;
    document.cookie = `floor=${floorForCookie}; path=/;`;
    document.cookie = `occupancy=${occupancyForCookie}; path=/;`;
    document.cookie = `minSquareFootage=${minSquareFootageForCookie}; path=/;`;
  }, [
    resCollegeForCookie,
    hallForCookie,
    floorForCookie,
    occupancyForCookie,
    minSquareFootageForCookie,
  ]);

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

    fetch(`/api/floorplans${queryString ? `?${queryString}` : ""}`)
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
  }, [resCollege, hall, floor, occupancy, minSquareFootage]);

  return (
    <div>
      <h1 className="results-page-title">
        Showing results for all floor plans
      </h1>
      <h1 className="res-college-title">
        {/* Adding ternary comparator to handle case where resco isn't provided */}
        {resCollege === null ? "All Residential Colleges" : resCollege}
      </h1>
      <AvailabilityTable availabilityInfo={availabilityInfo} occupancy={occupancy || ""} minSquareFootage={minSquareFootage || 0} />
    </div>
  );
};

const AvailabilityTable = ({ availabilityInfo, occupancy, minSquareFootage }) => {
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
  const generateLink = (resco, hall, floor) => {
    let floorNum = floor[0];
    return `../floorplans/hallfloor?resco=${resco}&hall=${hall}&floor=${floorNum}`;
  };

  return (
    <div className="table-container-results">
      <table className="availability-table-all">
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
                    <a
                      href={generateLink(
                        "Whitman",
                        info.hall,
                        info.floors[rowIndex]
                      )}
                    >
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
