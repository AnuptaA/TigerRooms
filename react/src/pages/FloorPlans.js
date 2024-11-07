import React, { useState, useEffect } from "react";
import "../App.css";

const FloorPlans = () => {
  const PORT = 4000;
  const [availabilityInfo, setAvailabilityInfo] = useState([]);

  // Fetch unique halls and floors from the backend
  useEffect(() => {
    console.log("Fetching floor plans data...");
    fetch(`http://127.0.0.1:${PORT}/api/floorplans`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched floor plans:", data); // Debugging line
        setAvailabilityInfo(data);
      })
      .catch((error) => console.error("Error fetching floor plans:", error));
  }, []);

  return (
    <div>
      <h1 className="results-page-title">
        Showing results for all floor plans
      </h1>
      <h1 className="res-college-title">Whitman College</h1>
      <AvailabilityTable availabilityInfo={availabilityInfo} />
    </div>
  );
};

const AvailabilityTable = ({ availabilityInfo }) => {
  console.log("Availability info in table:", availabilityInfo); // Debugging line

  // Determine the maximum number of floors to set the number of rows
  const maxFloors =
    availabilityInfo.length > 0
      ? Math.max(...availabilityInfo.map((info) => info.floors.length))
      : 0;
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
