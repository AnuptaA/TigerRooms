import React, { useState, useEffect } from "react";
import "../App.css";

const Cart = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [savedRooms, setSavedRooms] = useState([]);
  const userNetId = "user123"; // Assume this is fetched or passed as a prop

  // Fetch saved rooms for the user
  useEffect(() => {
    fetch(`${apiUrl}/api/saved_rooms?user_id=${userNetId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setSavedRooms(data.saved_rooms);
      })
      .catch((error) => console.error("Error fetching saved rooms:", error));
  }, [apiUrl, userNetId]);

  // Handle room unsave
  const handleUnsaveRoom = (roomNumber, hall) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this room from your cart?"
    );
    if (!confirmed) return;

    fetch(`${apiUrl}/api/unsave_room`, {
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
        setSavedRooms((prevRooms) =>
          prevRooms.filter(
            (room) => !(room.room_number === roomNumber && room.hall === hall)
          )
        );
      })
      .catch((error) => console.error("Error unsaving room:", error));
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Saved Rooms</h1>
      {savedRooms.length > 0 ? (
        <table className="saved-rooms-table">
          <thead className="saved-rooms-thead">
            <tr>
              <th>Room</th>
              <th>Total Saves</th>
              <th>Availability</th> {/* New Availability Column */}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {savedRooms.map((room, index) => (
              <tr key={index}>
                <td>{`${room.hall} ${room.room_number}`}</td>
                <td>
                  {room.total_saves !== undefined ? room.total_saves : "N/A"}
                </td>
                <td>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      backgroundColor:
                        room.availability === true ? "green" : "red",
                      margin: "0 auto",
                    }}
                  ></div>
                </td>
                <td>
                  <button
                    className="trash-button"
                    onClick={() =>
                      handleUnsaveRoom(room.room_number, room.hall)
                    }
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-saved-rooms">You haven't saved any rooms yet.</p>
      )}
    </div>
  );
};

export default Cart;
