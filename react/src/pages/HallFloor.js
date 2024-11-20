import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";

const HallFloor = () => {
  console.log("hallfloor route hit");
  const apiUrl = process.env.REACT_APP_API_URL;
  // Retrieve query params from URL using useLocation
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // State for room information and expanded rows
  const [roomInfo, setRoomInfo] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const userNetId = "user123";

  // Get query parameters, defaulting to empty string if not found
  const resCollege = searchParams.get("resco");
  const hall = searchParams.get("hall");
  const floor = searchParams.get("floor");
  const imageSrc = require(`../img/floorplans/${resCollege}_${hall}_${floor}.png`);

  console.log(imageSrc);

  // Fetch room data along with saved status for the user from the backend
  useEffect(() => {
    fetch(
      `${apiUrl}/api/floorplans/hallfloor?netid=${userNetId}&hall=${hall}&floor=${floor}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setRoomInfo(data);
      })
      .catch((error) => console.error("Error fetching room data:", error));
  }, [apiUrl, floor, userNetId]);

  // Toggle row expansion
  const toggleExpandRow = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  // Handle Save/Unsave action
  const handleSaveToggle = (roomNumber, hall, isSaved) => {
    const url = `${apiUrl}/api/${isSaved ? "unsave_room" : "save_room"}`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        netid: userNetId,
        room_number: roomNumber,
        hall: hall,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the saved status and total saves in the roomInfo state
        setRoomInfo((prevRoomInfo) =>
          prevRoomInfo.map((room) =>
            room.name === `${hall} ${roomNumber}`
              ? {
                ...room,
                isSaved: !isSaved,
                total_saves: isSaved
                  ? room.total_saves - 1
                  : room.total_saves + 1,
              }
              : room
          )
        );
      })
      .catch((error) => console.error("Error toggling save status:", error));
  };

  return (
    <div className="floor-plan-flexbox">
      <div>
        <h1 className="floor-plan-title">
          {resCollege + " College, " + hall + " Hall, Floor " + floor}
        </h1>
        <img src={imageSrc} alt="HallMap" className="floor-plan-image" />
        <h3 className="back-link">
          Click{" "}
          <a href="/floorplans" className="back-to-floorplans">
            here
          </a>{" "}
          to return to floor plans list
        </h3>
      </div>
      <div>
        <RoomInfoTable
          roomInfo={roomInfo}
          expandedRows={expandedRows}
          toggleExpandRow={toggleExpandRow}
          handleSaveToggle={handleSaveToggle}
          hallName={hall}
        />
      </div>
    </div>
  );
};

// RoomInfoTable component
const RoomInfoTable = ({
  roomInfo,
  expandedRows,
  toggleExpandRow,
  handleSaveToggle,
  hallName,
}) => {
  return (
    <table border="1" cellPadding="10" className="room-availability-table">
      <thead className="room-info-thead">
        <tr>
          <th className="availability-table-th">Availability Info</th>
        </tr>
      </thead>
      <tbody>
        {roomInfo.map((oneRoomInfo, index) => (
          <React.Fragment key={index}>
            <tr>
              <td
                className="availability-table-td"
                onClick={() => toggleExpandRow(index)}
              >
                <div className="availability">
                  <div
                    style={{
                      width: "1.4vh",
                      height: "1.4vh",
                      backgroundColor:
                        oneRoomInfo.isAvailable === "T" ? "green" : "red",
                      borderRadius:
                        oneRoomInfo.isAvailable === "T" ? "50%" : "0",
                      marginRight: "1.4vh",
                    }}
                  ></div>
                  <strong>{oneRoomInfo.name}</strong>{" "}
                </div>
                <div style={{ userSelect: "none" }}>
                  {expandedRows.includes(index) ? "➖" : "➕"}
                </div>
              </td>
            </tr>
            {expandedRows.includes(index) && (
              <tr>
                <td className="availability-table-td" colSpan="3">
                  <div style={{ padding: "10px", backgroundColor: "#f9f9f9" }}>
                    <strong>{oneRoomInfo.size}</strong> <br />
                    <strong>{oneRoomInfo.occupancy}</strong> <br />
                    <strong>Total Saves: {oneRoomInfo.total_saves}</strong>
                    <br />
                    <button
                      onClick={() =>
                        handleSaveToggle(
                          oneRoomInfo.name.split(" ")[1], // Extract room number from name
                          hallName,
                          oneRoomInfo.isSaved
                        )
                      }
                      style={{
                        marginTop: "10px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      {oneRoomInfo.isSaved ? "Unsave" : "Save"}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td id="availability-key-td">
            <strong>Draw Availability Key</strong>
            <div style={{ display: "block", marginTop: "10px" }}>
              <div
                style={{
                  marginBottom: "5px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "green",
                    borderRadius: "50%",
                    marginRight: "5px",
                  }}
                ></div>
                <span>Available</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "red",
                    marginRight: "5px",
                  }}
                ></div>
                <span>Unavailable</span>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default HallFloor;
