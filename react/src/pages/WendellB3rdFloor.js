import React, { useState, useEffect } from "react";
import "../App.css";
import image from "../img/floorplans/Wendell_B_Hall_Floor_3.png";

const WendellB3rdFloor = () => {
  // State for room information and expanded rows
  const [roomInfo, setRoomInfo] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  // Fetch room data from the backend
  useEffect(() => {
    console.log("Fetching room data...");
    fetch("http://127.0.0.1:5000/api/floorplans/wendell-b-3rd-floor")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched data:", data); // Debugging line
        setRoomInfo(data);
      })
      .catch((error) => console.error("Error fetching room data:", error));
  }, []);

  // Toggle row expansion
  const toggleExpandRow = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  return (
    <div>
      <h1 className="floor-plan-title">
        Whitman College, Wendell B Hall, Floor 3
      </h1>
      <img src={image} alt="HallMap" className="floor-plan-image" />
      <RoomInfoTable
        roomInfo={roomInfo}
        expandedRows={expandedRows}
        toggleExpandRow={toggleExpandRow}
      />
      <h3 className="back-link">
        Click{" "}
        <a href="/floorplans" className="back-to-floorplans">
          here
        </a>{" "}
        to return to floor plans list
      </h3>
    </div>
  );
};

// RoomInfoTable component
const RoomInfoTable = ({ roomInfo, expandedRows, toggleExpandRow }) => {
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
                  {expandedRows.includes(index) ? "➖" : "➕"}
                </div>
              </td>
            </tr>
            {expandedRows.includes(index) && (
              <tr>
                <td className="availability-table-td" colSpan="3">
                  <div style={{ padding: "10px", backgroundColor: "#f9f9f9" }}>
                    <strong>{oneRoomInfo.size}</strong> <br />{" "}
                    <strong>{oneRoomInfo.occupancy}</strong>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className="availability-table-td">
            <strong>Draw Availability Key</strong>
            <br />
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

export default WendellB3rdFloor;
