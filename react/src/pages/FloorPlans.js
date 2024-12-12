import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import StudentAccessOnly from "../Components/StudentAccessOnly";
import "../App.css";

const FloorPlans = ({ adminStatus, adminToggle }) => {
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

  // Function to generate dynamic title based on query parameters
  const generateTitle = () => {
    if (!resCollege && !hall && !floor && !occupancy && !minSquareFootage)
      return "Showing results for all floor plans";

    let title = "Showing results for";

    // No resco, hall, or floor provided
    if (!resCollege && !hall && !floor) {
      title += " floorplans with rooms";
      if (occupancy && minSquareFootage) {
        title += ` of occupancy ${occupancy} and min. sqft. of ${minSquareFootage}`;
        return title;
      } else if (occupancy) {
        title += ` of occupancy ${occupancy}`;
        return title;
      } else {
        title += ` of min. sqft. of ${minSquareFootage}`;
        return title;
      }
    }

    if (resCollege) title += ` ${resCollege} College`;
    if (hall) title += ` ${hall} Hall`;
    if (floor) title += ` Floor ${floor}`;

    if (!occupancy && !minSquareFootage) {
      title += " floorplans";
      return title;
    }

    title += " floorplans with rooms";

    if (occupancy && minSquareFootage) {
      title += ` of occupancy ${occupancy} and min. sqft. of ${minSquareFootage}`;
    } else if (occupancy) {
      title += ` of occupancy ${occupancy}`;
    } else {
      title += ` of min. sqft. of ${minSquareFootage}`;
    }

    return title;
  };

  return !adminStatus || adminToggle ? (
    <div>
      <h1 className="results-page-title">{generateTitle()}</h1>
      {/* <h1 className="res-college-title"> */}
      {/* Adding ternary comparator to handle case where resco isn't provided */}
      {/* {resCollege === null ? "Whitman College" : resCollege} */}
      {/* </h1> */}
      <AvailabilityTable
        availabilityInfo={availabilityInfo}
        occupancy={occupancy || ""}
        minSquareFootage={minSquareFootage || 0}
      />
    </div>
  ) : (
    <StudentAccessOnly />
  );
};

const AvailabilityTable = ({
  availabilityInfo,
  occupancy,
  minSquareFootage,
}) => {
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
        <h3 style={{ textAlign: "center" }}>
          Click <a href="/">here</a> to do another search.
        </h3>
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
    <div>
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
      <h3 style={{ textAlign: "center", fontSize: "1.5rem" }}>
        Click <a href="/">here</a> to do another search.
      </h3>
    </div>
  );
};

export default FloorPlans;
