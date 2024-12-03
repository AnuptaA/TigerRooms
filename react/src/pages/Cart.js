import React, { useState, useEffect } from "react";
import "../App.css";

const Cart = ({ username }) => {
  const [savedRooms, setSavedRooms] = useState([]);

  // Fetch saved rooms for the user
  useEffect(() => {
    fetch(`/api/saved_rooms?user_id=${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Sort rooms so available ones come first
        const sortedRooms = data.saved_rooms.sort((a, b) => {
          return b.availability - a.availability;
        });
        setSavedRooms(sortedRooms);
      })
      .catch((error) => console.error("Error fetching saved rooms:", error));
  }, [username]);

  // Handle room unsave
  const handleUnsaveRoom = (roomNumber, hall) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this room from your cart?"
    );
    if (!confirmed) return;

    fetch("/api/unsave_room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        netid: username,
        room_number: roomNumber,
        hall: hall,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setSavedRooms((prevRooms) =>
          prevRooms.filter(
            (room) => !(room.room_number === roomNumber && room.hall === hall)
          )
        );
      })
      .catch((error) => console.error("Error unsaving room:", error));
  };

  // Handle clearing all drawn rooms
  const handleClearDrawnRooms = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all drawn rooms from the cart?"
    );
    if (!confirmed) return;

    fetch("/api/clear_drawn_rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ netid: username }),
    })
      .then((response) => response.json())
      .then(() => {
        setSavedRooms((prevRooms) =>
          prevRooms.filter((room) => room.availability === true)
        );
      })
      .catch((error) => console.error("Error clearing drawn rooms:", error));
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Saved Rooms</h1>
      {savedRooms.length > 0 ? (
        <>
          <table className="saved-rooms-table">
            <thead className="saved-rooms-thead">
              <tr>
                <th>Room</th>
                <th>Total Saves</th>
                <th>Availability</th>
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
                        width: "1vw",
                        height: "1vw",
                        borderRadius: "0.2vw",
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
          <button
            className="clear-drawn-rooms-button"
            onClick={handleClearDrawnRooms}
          >
            Clear All Unavailable (Drawn) Rooms From Cart
          </button>
        </>
      ) : (
        <p className="no-saved-rooms">You haven't saved any rooms yet.</p>
      )}
    </div>
  );
};

export default Cart;
