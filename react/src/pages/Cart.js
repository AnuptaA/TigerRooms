import React, { useState, useEffect } from "react";
import "../App.css";

const Cart = () => {
  const [savedRooms, setSavedRooms] = useState([]);
  const userNetId = "user123"; // Assume this is fetched or passed as a prop

  // Fetch saved rooms for the user
  useEffect(() => {
    console.log("Fetching saved rooms...");
    fetch(`http://127.0.0.1:5000/api/saved_rooms?user_id=${userNetId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched saved rooms:", data);
        setSavedRooms(data.saved_rooms);
      })
      .catch((error) => console.error("Error fetching saved rooms:", error));
  }, [userNetId]);

  // Handle room unsave
  const handleUnsaveRoom = (roomNumber, hall) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this room from your cart?"
    );
    if (!confirmed) return;

    fetch("http://127.0.0.1:5000/api/unsave_room", {
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
        console.log("Room unsaved:", data);
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
          <thead>
            <tr>
              <th>Room</th>
              <th>Total Saves</th>
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
